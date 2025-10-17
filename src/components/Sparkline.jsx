import React from "react";
import { LineChart, Line } from "recharts";

const SparklineChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Format for recharts
  const formattedData = data.map((price, index) => ({ index, price }));

  // Determine color based on trend
  const isUp = data[data.length - 1] > data[0];
  const strokeColor = isUp ? "#16c784" : "#ea3943"; // green or red

  return (
    <LineChart width={120} height={40} data={formattedData}>
      <Line
        type="monotone"
        dataKey="price"
        stroke={strokeColor}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );
};

export default SparklineChart;
