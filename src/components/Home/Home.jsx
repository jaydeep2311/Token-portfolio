import React from "react";
import Header from "../Header";
import PortfolioCard from "../PortfolioCard";
import Table from "../Table";
import TokenModal from "../TokenModal";

const Home = () => {
  return (
    <div class="home-full-view">
      <Header />
      <div class="frame-3">
        <PortfolioCard />
        <Table />
      </div>
    </div>
  );
};

export default Home;
