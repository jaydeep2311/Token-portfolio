import axios from "axios";

const BASE = "https://api.coingecko.com/api/v3";

export async function fetchTrending() {
  try {
    const res = await axios.get(`${BASE}/search/trending`);
    // Response shape: { coins: [ { item: { ... } }, ... ] }
    if (!res?.data?.coins) return [];

    // Map to a simpler shape consumed by TokenModal
    return res.data.coins.map((c) => {
      const item = c.item || {};
      return {
        id: item.id || item.slug || item.coin_id || item.symbol,
        coin_id: item.coin_id,
        name: item.name || item.symbol,
        symbol: (item.symbol || "").toUpperCase(),
        market_cap_rank: item.market_cap_rank,
        thumb: item.thumb,
        small: item.small,
        large: item.large,
        price_btc: item.price_btc,
      };
    });
  } catch (err) {
    // Log and return empty list on error
    // In a real app you'd want better error handling / retry

    console.error(
      "Failed to fetch trending from CoinGecko:",
      err.message || err
    );
    return [];
  }
}

export async function searchCoins(query) {
  if (!query || !query.toString().trim()) return [];
  try {
    const res = await axios.get(`${BASE}/search`, {
      params: { query: query.toString().trim() },
    });

    // CoinGecko returns { coins: [ ... ] } normally. Some callers expect an array directly.
    const raw = res?.data?.coins ?? res?.data ?? [];

    if (!Array.isArray(raw)) return [];

    return raw.map((item) => {
      // item may already be the coin object, or wrapped under .item in other endpoints
      const c = item.item || item;
      return {
        id: c.id || c.slug || c.api_symbol || c.symbol,
        name: c.name || c.symbol,
        symbol: (c.symbol || "").toUpperCase(),
        api_symbol: c.api_symbol,
        market_cap_rank: c.market_cap_rank,
        thumb: c.thumb,
        large: c.large,
      };
    });
  } catch (err) {
    console.error("CoinGecko search failed:", err.message || err);
    return [];
  }
}

// ids: array of coin ids (CoinGecko id field)
export async function fetchMarketData(ids = []) {
  if (!ids || !ids.length) return [];
  try {
    const params = {
      vs_currency: "usd",
      ids: ids.join(","),
      sparkline: true,
      price_change_percentage: "24h",
    };
    const res = await axios.get(`${BASE}/coins/markets`, { params });
    // returns array with fields: id, symbol, name, current_price, price_change_percentage_24h, sparkline_in_7d
    return res.data || [];
  } catch (err) {
    console.error("fetchMarketData failed:", err.message || err);
    return [];
  }
}
