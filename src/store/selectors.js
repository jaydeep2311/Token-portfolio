// src/store/selectors.js (new file or inside a utils place)
export function computePortfolioTotal(items = [], marketById = {}) {
  // items: [{id, holdings, ...}]
  // marketById: { [id]: { current_price, ... } }
  return items.reduce((sum, it) => {
    const price = marketById[it.id]?.current_price ?? 0;
    const holdings = Number(it.holdings || 0);
    return sum + holdings * price;
  }, 0);
}
