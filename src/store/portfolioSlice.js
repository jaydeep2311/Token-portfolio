import { createSlice } from "@reduxjs/toolkit";

const LOCAL_KEY = "portfolio_watchlist_v1";

const initialState = {
  // items: [{ id, name, symbol, holdings }]
  items: JSON.parse(localStorage.getItem(LOCAL_KEY) || "null") || [],
  total: 0,
};

const slice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    addToken(state, action) {
      const token = action.payload;
      // avoid duplicates by id
      if (!state.items.find((t) => t.id === token.id)) {
        state.items.push({ ...token, holdings: token.holdings ?? 0 });
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items));
      }
    },
    removeToken(state, action) {
      const id = action.payload;
      state.items = state.items.filter((t) => t.id !== id);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items));
    },
    updateHoldings(state, action) {
      const { id, holdings } = action.payload;
      const t = state.items.find((x) => x.id === id);
      if (t) {
        t.holdings = holdings;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items));
      }
    },
    setItems(state, action) {
      state.items = action.payload || [];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items));
    },
  },
});

export const { addToken, removeToken, updateHoldings, setItems } =
  slice.actions;
export default slice.reducer;
