import React from "react";

const Header = () => {
  return (
    <div class="frame">
      <div class="div">
        <img
          class="img"
          src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/frame-6.svg"
        />
        <div class="text-wrapper">Token Portfolio</div>
      </div>
      <div class="frame-2">
        <button class="button">
          <img
            class="img-2"
            src="https://c.animaapp.com/mgrsx9ysK8BVCj/img/wallet.svg"
          />
          <div class="label">Connect Wallet</div>
        </button>
      </div>
    </div>
  );
};

export default Header;
