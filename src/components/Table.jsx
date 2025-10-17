import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import TokenModal from "./TokenModal";
import { fetchMarketData } from "../api/coingecko";
import { updateHoldings, removeToken } from "../store/portfolioSlice";
import Menu from "./Menu";
import { computePortfolioTotal } from "../store/selectors";
import IconButton from "../assets/IconButton.svg";
import CachedIcon from "../assets/cached (1).svg";
import SparklineChart from "./Sparkline";

const Table = () => {
  const [openModal, setOpenModal] = useState(false);
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  const items = useSelector((s) => s.portfolio.items);
  console.log({ items });
  const [market, setMarket] = useState({}); // keyed by id
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openMenu, setOpenMenu] = useState({ id: null, x: 0, y: 0 });
  const [editingRowId, setEditingRowId] = useState(null);
  // store edit values per-row so multiple rows can be edited independently (but we only allow one at a time UI-wise)
  const [editValues, setEditValues] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ensure currentPage remains valid when items change (e.g., removals)
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((items || []).length / itemsPerPage)
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [items.length, currentPage, items]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModal(false);
      }
      // close menu when clicking anywhere
      if (!event.target.closest || !event.target.closest(".icon-button")) {
        setOpenMenu({ id: null, x: 0, y: 0 });
      }
    }

    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  // close floating row menu when clicking outside of it or the icon
  useEffect(() => {
    if (!openMenu.id) return;
    function handleDocClick(e) {
      // if click inside the floating menu or the icon, do nothing
      if (
        e.target &&
        e.target.closest &&
        (e.target.closest(".floating-menu") || e.target.closest(".icon-button"))
      ) {
        return;
      }
      setOpenMenu({ id: null, x: 0, y: 0 });
    }

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [openMenu.id]);

  // fetch prices for portfolio items
  useEffect(() => {
    let mounted = true;
    async function refreshPrices() {
      if (!items || !items.length) {
        setMarket({});
        return;
      }
      try {
        const ids = items.map((i) => i.id).filter(Boolean);
        const data = await fetchMarketData(ids);
        if (!mounted) return;
        const map = {};
        data.forEach((d) => {
          map[d.id] = d;
        });
        setMarket(map);
        // store last refreshed time
        try {
          const ts = Date.now();
          localStorage.setItem("portfolio_last_refresh", String(ts));
          // notify other components immediately that we refreshed
          try {
            window.dispatchEvent(
              new CustomEvent("portfolio:refreshed", { detail: ts })
            );
          } catch (e) {
            console.warn("portfolio:refreshed dispatch failed", e);
          }
        } catch {
          /* ignore storage errors */
        }
      } catch (err) {
        console.error("Failed to load market data:", err);
      }
    }
    // initial load
    refreshPrices();
    // refresh every 60s
    const interval = setInterval(refreshPrices, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [items]);
  const total = computePortfolioTotal(items, market);

  console.log(total, "---total---");
  return (
    <div class="frame-9">
      <div class="frame-10">
        <div class="frame-11">
          <img
            class="star"
            src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/star.svg"
          />
          <div class="text-wrapper-13">Watchlist</div>
        </div>
        <button
          class="button-2"
          style={{ cursor: isRefreshing ? "default" : "pointer" }}
          onClick={async () => {
            if (isRefreshing) return;
            setIsRefreshing(true);
            // call the same refresh logic: trigger a fetch and update last refresh
            const ids = items.map((i) => i.id).filter(Boolean);
            try {
              const data = await fetchMarketData(ids);
              const map = {};
              data.forEach((d) => (map[d.id] = d));
              setMarket(map);
              // write timestamp and notify listeners
              try {
                const ts = Date.now();
                localStorage.setItem("portfolio_last_refresh", String(ts));
                try {
                  window.dispatchEvent(
                    new CustomEvent("portfolio:refreshed", { detail: ts })
                  );
                } catch (e) {
                  console.warn("portfolio:refreshed dispatch failed", e);
                }
              } catch (err) {
                console.warn("Failed to write portfolio_last_refresh", err);
              }
            } catch (err) {
              console.error("Manual refresh failed:", err);
            } finally {
              setIsRefreshing(false);
            }
          }}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: 8 }}
              >
                <g>
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="#888"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.25"
                  />
                  <path fill="#333" d="M14 8a6 6 0 0 1-6 6V12a4 4 0 0 0 4-4h2z">
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from="0 8 8"
                      to="360 8 8"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              </svg>
              <div class="label-2">Refreshing...</div>
            </>
          ) : (
            <>
              <img class="img-2" src={CachedIcon} alt="refresh" />
              <div class="label-2">Refresh Prices</div>
            </>
          )}
        </button>
        <button class="button-3">
          <img
            class="img-2"
            src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/plus-mini.svg"
          />
          <div
            class="label-3"
            onClick={() => {
              setOpenModal(true);
            }}
          >
            Add Token
          </div>
        </button>
      </div>
      <div class="frame-12">
        <div class="table-header">
          <div class="table-cell">
            <div class="label-4">Token</div>
          </div>
          <div class="table-cell">
            <div class="label-4">Price</div>
          </div>
          <div class="table-cell">
            <div class="label-4">24h %</div>
          </div>
          <div class="table-cell">
            <div class="label-4">Sparkline (7d)</div>
          </div>
          <div class="table-cell">
            <div class="label-4">Holdings</div>
          </div>
          <div class="table-cell">
            <div class="label-4">Value</div>
          </div>
        </div>
        <div className="frame-13">
          {items && items.length ? (
            (() => {
              const totalPages = Math.max(
                1,
                Math.ceil(items.length / itemsPerPage)
              );
              // ensure currentPage in range
              const page = Math.min(Math.max(1, currentPage), totalPages);
              const startIndex = (page - 1) * itemsPerPage;
              const pageItems = items.slice(
                startIndex,
                startIndex + itemsPerPage
              );
              return pageItems.map((it) => {
                const m = market[it.id] || {};
                console.log({ it, m });

                const price = m.current_price ?? 0;
                const change24 = m.price_change_percentage_24h ?? 0;
                const holdings = Number(it.holdings || 0);
                console.log({ holdings });
                const value = holdings * price;
                return (
                  <div className="table-row" key={it.id} data-row={it.id}>
                    <div className="frame-14">
                      <div className="file-thumbnails-wrapper">
                        <div className="file-thumbnails">
                          {m && m.image ? (
                            <img
                              src={m.image}
                              alt={it.symbol}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                      <div className="table-cell-2">
                        <p className="p">
                          <span className="span">{it.name} </span>
                          <span className="text-wrapper-14">({it.symbol})</span>
                        </p>
                      </div>
                    </div>
                    <div className="table-cell-2">
                      <div className="label-5">
                        ${price?.toLocaleString?.() ?? price}
                      </div>
                    </div>
                    <div className="table-cell-2">
                      <div className="label-5">
                        {change24 ? `${change24.toFixed(2)}%` : "—"}
                      </div>
                    </div>
                    <div className="table-cell-3">
                      {/* simple sparkline placeholder; you can render a small sparkline chart here using spark array */}
                      {/* {spark ? (
                      <SparklineChart data={it.sparkline_in_7d.price} />
                    ) : null} */}
                      <SparklineChart data={m?.sparkline_in_7d?.price} />
                    </div>
                    <div className="table-cell-2">
                      <div
                        className={
                          editingRowId === it.id ? "three-select-input" : ""
                        }
                      >
                        {editingRowId === it.id ? (
                          <input
                            name="holdings"
                            type="number"
                            className="text-wrapper-15"
                            value={editValues[it.id] ?? it.holdings ?? ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [it.id]: e.target.value,
                              }))
                            }
                            step="any"
                          />
                        ) : (
                          <div className="text-wrapper-15">{holdings}</div>
                        )}
                      </div>
                      {editingRowId === it.id ? (
                        <div className="button-wrapper">
                          <button
                            className="button-4"
                            onClick={() => {
                              // save: only now update redux with the numeric value
                              const val = editValues[it.id];
                              const numeric =
                                val === "" || val == null ? 0 : Number(val);
                              dispatch(
                                updateHoldings({ id: it.id, holdings: numeric })
                              );
                              setEditingRowId(null);
                              setEditValues((prev) => {
                                const next = { ...prev };
                                delete next[it.id];
                                return next;
                              });
                            }}
                          >
                            <div className="label">Save</div>
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="table-cell-2">
                      <div className="label-6">${value.toFixed(2)}</div>
                    </div>
                    <div className="icon-button-wrapper">
                      <div className="icon-button">
                        <img
                          src={IconButton}
                          alt="menu"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setOpenMenu({
                              id: it.id,
                              x: rect.left - 148,
                              y: rect.top + 10,
                            });
                          }}
                        />
                      </div>
                      {openMenu.id === it.id && (
                        <div
                          className="floating-menu"
                          style={{
                            position: "fixed",
                            left: `${openMenu.x}px`,
                            top: `${openMenu.y}px`,
                            transform: "translate(0%, -110%)",
                            zIndex: 9999,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Menu
                            onEdit={() => {
                              // enter edit mode for this row and prefill value
                              setEditingRowId(it.id);
                              setEditValues((prev) => ({
                                ...prev,
                                [it.id]: it.holdings ?? "",
                              }));
                              // small timeout so input exists in DOM then focus
                              setTimeout(() => {
                                const input = document.querySelector(
                                  `[data-row="${it.id}"] input[name='holdings']`
                                );
                                if (input) input.focus();
                              }, 0);
                              setOpenMenu({ id: null, x: 0, y: 0 });
                            }}
                            onRemove={() => {
                              dispatch(removeToken(it.id));
                              setOpenMenu({ id: null, x: 0, y: 0 });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()
          ) : (
            <div>No tokens in watchlist. Add some.</div>
          )}
        </div>
        <div class="table-footer">
          <div className="results">
            {items.length > 0 ? (
              (() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(items.length / itemsPerPage)
                );
                const page = Math.min(Math.max(1, currentPage), totalPages);
                const startIndex = (page - 1) * itemsPerPage + 1;
                const endIndex = Math.min(items.length, page * itemsPerPage);
                return (
                  <div className="text-wrapper-16">
                    Showing {startIndex} - {endIndex} of {items.length} results
                  </div>
                );
              })()
            ) : (
              <div className="text-wrapper-16">0 results</div>
            )}
          </div>
          <div className="pages">
            <button
              className="button-6"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <div className="label-7">Prev</div>
            </button>
            <div
              className="page-numbers"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: "0 8px",
              }}
            >
              {(() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(items.length / itemsPerPage)
                );
                const pages = [];
                for (let i = 1; i <= totalPages; i++) pages.push(i);
                return pages.map((p) => (
                  <button
                    key={p}
                    className={
                      "button-5" + (p === currentPage ? " active" : "")
                    }
                    onClick={() => setCurrentPage(p)}
                    style={p === currentPage ? { fontWeight: "600" } : {}}
                  >
                    <div className="text-wrapper-16">{p}</div>
                  </button>
                ));
              })()}
            </div>
            <button
              className="button-6"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={
                currentPage >=
                Math.max(1, Math.ceil(items.length / itemsPerPage))
              }
            >
              <div className="label-7">Next</div>
            </button>
          </div>
        </div>
      </div>
      {openModal && (
        <TokenModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          modalRef={modalRef}
        />
      )}
    </div>
  );
};

export default Table;
