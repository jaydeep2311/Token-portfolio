import React, { useEffect, useState } from "react";
import { computePortfolioTotal } from "../store/selectors";
import { useSelector } from "react-redux";
import Menu from "./Menu";
import DonutChart from "./Chart";

const PortfolioCard = () => {
  const items = useSelector((s) => s.portfolio.items);

  const [market, setMarket] = useState({});
  const [total, setTotal] = useState(0);
  const [totalHoldings, setTotalHoldings] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchMarketData(ids) {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
        ","
      )}`
    );
    const data = await response.json();
    const map = {};
    data.forEach((d) => {
      map[d.id] = d;
    });
    setMarket(map);
  }

  useEffect(() => {
    if (!items || !items.length) {
      setMarket({});
      return;
    }
    const ids = items.map((i) => i.id).filter(Boolean);
    const totalHoldingsData = items.reduce((sum, it) => {
      const holdings = Number(it.holdings || 0);
      return sum + holdings;
    }, 0);
    setTotalHoldings(totalHoldingsData);
    fetchMarketData(ids);
  }, [items]);

  // read last refresh timestamp from localStorage
  useEffect(() => {
    function readLast() {
      try {
        const ts = localStorage.getItem("portfolio_last_refresh");
        if (ts) setLastUpdated(Number(ts));
        else setLastUpdated(null);
      } catch (e) {
        console.warn("Failed to read portfolio_last_refresh", e);
        setLastUpdated(null);
      }
    }
    readLast();

    function onRefreshed(e) {
      if (e && e.detail) setLastUpdated(Number(e.detail));
      else readLast();
    }

    window.addEventListener("portfolio:refreshed", onRefreshed);
    const interval = setInterval(readLast, 60000);
    return () => {
      window.removeEventListener("portfolio:refreshed", onRefreshed);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const total = computePortfolioTotal(items, market);
    setTotal(total.toFixed(4));
  }, [market, items]);

  return (
    <div class="frame-4">
      <div class="frame-5">
        <div class="text-wrapper-2">Portfolio Total</div>
        <div class="text-wrapper-3">${total}</div>
        <div class="div-wrapper">
          <div class="text-wrapper-4">
            Last updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
          </div>
        </div>
      </div>
      <div class="frame-6">
        <div class="text-wrapper-2">Portfolio Total</div>
        <div class="frame-7">
          {/* <img
            class="group"
            src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/group.png"
          /> */}
          <DonutChart
            data={items.map((item) => {
              return {
                name: item.name,
                value: item.holdings,
              };
            })}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "baseline",
              marginTop: "15px",
              paddingTop: "10px",
            }}
          >
            <div class="frame-8">
              {items.map((item, i) => (
                <div
                  class={`text-wrapper-${
                    i + 5 > 10 ? ((i + 5) % 10) + 5 : i + 5
                  }`}
                >
                  {item.name}({item.symbol})
                </div>
              ))}
            </div>
            <div class="frame-8">
              {items.map((item) => (
                <div class={`text-wrapper-4`}>
                  {console.log(Number(item.holdings) / totalHoldings)}
                  {((Number(item.holdings) / totalHoldings) * 100).toFixed(2)}%
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
