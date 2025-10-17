import React, { useMemo, useEffect, useContext } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useAccount, useEnsName } from "wagmi";
import { ToastContext } from "../components/Toast";

const shortAddress = (addr = "") =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

const Header = () => {
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // wagmi hooks
  const { address, isConnected } = useAccount({
    // optional callbacks if you want immediate side-effects:
    // onConnect({ address, connector }) { console.log("connected", address); },
    // onDisconnect() { console.log("disconnected"); }
  });

  // resolve ENS name (if any)
  const { data: ensName } = useEnsName({
    address,
    enabled: Boolean(address),
    // you can add cacheTime / staleTime options depending on wagmi version
  });
  console.log(
    useEnsName({
      address,
    })
  );

  // decide what to show as the display name
  const displayName = useMemo(() => {
    if (!isConnected) return null;
    return ensName ?? shortAddress(address);
  }, [isConnected, ensName, address]);
  console.log({ isConnected, address, ensName });

  const toast = useContext(ToastContext);

  useEffect(() => {
    if (isConnected && toast && toast.add) {
      toast.add(`Wallet connected: ${shortAddress(address)}`, {
        type: "success",
      });
    }
  }, [isConnected, address, toast]);

  return (
    <div className="frame">
      <div className="div">
        <img
          className="img"
          src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/frame-6.svg"
          alt="logo"
        />
        <div className="text-wrapper">Token Portfolio</div>
      </div>

      <div className="frame-2">
        <button
          className="button"
          onClick={() => {
            if (openConnectModal) openConnectModal();
            else console.warn("openConnectModal is not available");
          }}
        >
          <img
            className="img-2"
            src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/wallet.svg"
            alt="wallet"
          />
          <div className="label">
            {isConnected ? displayName : "Connect Wallet"}
          </div>
        </button>
        {isConnected && (
          <button
            className="button"
            onClick={() => {
              if (disconnect) disconnect();
            }}
          >
            <div className="label">disconnect</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
