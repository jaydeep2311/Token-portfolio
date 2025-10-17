import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrending, searchCoins } from "../api/coingecko";
import { addToken } from "../store/portfolioSlice";
import CheckCircle from "../assets/check_circle.svg";
import { ToastContext } from "../components/Toast";
import { useContext } from "react";

const fallbackTokens = [
  { name: "Not Coin", symbol: "NOT", icon: "🪙" },
  { name: "Ethereum", symbol: "ETH", icon: "💠" },
  { name: "Hyperliquid", symbol: "HYPE", icon: "🌈" },
  { name: "PinLink", symbol: "PIN", icon: "📍" },
  { name: "Stader", symbol: "SD", icon: "📊" },
];

export default function TokenModal({ modalRef, setOpenModal }) {
  // stored items from redux (watchlist)
  const storedItems = useSelector((s) => s.portfolio.items || []);
  // allow multi-select by storing selected ids; initialize with items already in watchlist
  const [selectedIds, setSelectedIds] = useState(() =>
    (storedItems || []).map((s) => s.id)
  );
  const dispatch = useDispatch();
  const toast = useContext(ToastContext);
  const [tokens, setTokens] = useState(fallbackTokens);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchTrending();
      if (!mounted) return;
      if (data && data.length) {
        // transform to modal-friendly tokens (use thumb or small as icon)
        const mapped = data.map((t) => ({
          id: t.id,
          name: t.name || t.symbol,
          symbol: t.symbol || "",
          icon: t.small || t.thumb || "🪙",
          raw: t,
        }));
        setTokens(mapped);
      } else {
        setTokens(fallbackTokens);
        if (!data || data.length === 0) {
          setError("No trending data available");
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // debounce search
  useEffect(() => {
    let mounted = true;
    let timer = null;

    // if empty query, fetch trending again and update the list
    if (!query || !query.trim()) {
      setError(null);
      setLoading(true);

      (async () => {
        try {
          const data = await fetchTrending();
          if (!mounted) return;
          if (data && data.length) {
            const mapped = data.map((t) => ({
              id: t.id,
              name: t.name || t.symbol,
              symbol: t.symbol || "",
              icon: t.small || t.thumb || "🪙",
              raw: t,
            }));
            setTokens(mapped);
            setError(null);
          } else {
            setTokens(fallbackTokens);
            setError("No trending data available");
          }
        } catch (_err) {
          if (!mounted) return;
          console.error("Trending reload failed:", _err);
          setTokens(fallbackTokens);
          setError("Failed to reload trending");
        } finally {
          if (mounted) setLoading(false);
        }
      })();

      return () => {
        mounted = false;
        if (timer) clearTimeout(timer);
      };
    }

    setLoading(true);
    setError(null);

    timer = setTimeout(async () => {
      try {
        const results = await searchCoins(query);
        if (!mounted) return;
        if (results && results.length) {
          const mapped = results.map((t) => ({
            id: t.id,
            name: t.name || t.symbol,
            symbol: t.symbol || "",
            icon: t.thumb || t.large || "🪙",
            raw: t,
          }));
          setTokens(mapped);
        } else {
          setTokens([]);
          setError("No results for your search");
        }
      } catch (_err) {
        if (!mounted) return;
        console.error("Search error:", _err);
        setError("Search failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }, 350); // 350ms debounce

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="modal-overlay">
      <div className="token-modal" ref={modalRef}>
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search tokens (e.g., ETH, SOL)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="trending-label">Trending</div>

        <div className="token-list">
          {loading && <div className="loading">Loading trending...</div>}
          {!loading && error && (
            <div className="error">{error} — showing fallback list</div>
          )}

          {!loading &&
            tokens.map((token, i) => {
              const isSelected =
                selectedIds.includes(token.id) ||
                Boolean(storedItems.find((s) => s.id === token.id));
              return (
                <label
                  key={token.id || i}
                  className="token-item"
                  onClick={(e) => {
                    e.preventDefault();
                    // toggle selection
                    setSelectedIds((prev) =>
                      prev.includes(token.id)
                        ? prev.filter((id) => id !== token.id)
                        : [...prev, token.id]
                    );
                  }}
                >
                  <div className="token-left">
                    <div className="token-icon">
                      {token.icon &&
                      token.icon.startsWith &&
                      token.icon.startsWith("http") ? (
                        <img
                          src={token.icon}
                          alt={token.symbol}
                          style={{ width: 28, height: 28, borderRadius: 14 }}
                        />
                      ) : (
                        token.icon
                      )}
                    </div>
                    <div className="token-info">
                      <div className="token-name">{token.name}</div>
                      <div className="token-symbol">{token.symbol}</div>
                    </div>
                  </div>
                  <div
                    className="token-select"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {/* star icon only for selected items */}
                    {isSelected ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                          fill="#A9E851"
                        />
                      </svg>
                    ) : (
                      <div style={{ width: 14, height: 14 }} />
                    )}

                    {isSelected ? (
                      <img src={CheckCircle} alt="selected" />
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="6.25"
                          stroke="#A1A1AA"
                          strokeWidth="1.5"
                          fill="transparent"
                        />
                      </svg>
                    )}
                  </div>
                </label>
              );
            })}
        </div>

        <div className="modal-footer">
          <button
            className="wishlist-btn"
            disabled={!selectedIds.length}
            onClick={() => {
              if (!selectedIds.length) return;
              // add all selected tokens (skip duplicates in reducer)
              const selectedTokens = tokens.filter((t) =>
                selectedIds.includes(t.id)
              );
              selectedTokens.forEach((tok) => {
                if (tok && tok.id) {
                  dispatch(
                    addToken({ id: tok.id, name: tok.name, symbol: tok.symbol })
                  );
                }
              });
              if (toast && toast.add) {
                toast.add(
                  `${selectedTokens.length} token(s) added to watchlist`,
                  { type: "success" }
                );
              }
              if (typeof setOpenModal === "function") setOpenModal(false);
            }}
          >
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
