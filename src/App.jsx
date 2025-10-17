import "./App.css";
import "./global.css";
import "./style.css";
import "./index.css";
import "./responsive.css";
import { createBrowserRouter } from "react-router";
import React from "react";
import { RouterProvider } from "react-router/dom";
import HomePage from "./pages/home-page";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "5b5be02be1aebe67c979b18a39ceaa07",
  chains: [mainnet, polygon, optimism, arbitrum, base],
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {/* Your App */}
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
