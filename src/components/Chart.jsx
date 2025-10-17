// DonutChart.js
import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

// const data = [
//   { name: "Group A", value: 400 },
//   { name: "Group B", value: 300 },
//   { name: "Group C", value: 300 },
//   { name: "Group D", value: 200 },
//   { name: "Group E", value: 278 },
//   { name: "Group F", value: 189 },
// ];

const COLORS = [
  "#31c49e",
  "#9b8af7",
  "#f86f6f",
  "#6dc8ff",
  "#ffa64d",
  "#53d3e0",
];

const DonutChart = ({ data }) => {
  return (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={90}
        paddingAngle={2}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default DonutChart;
