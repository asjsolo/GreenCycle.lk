//Analytics.jsx
import React from "react";
import "./styles/Analytics.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Analytics({ tasks }) {
  // Group tasks by day
  const data = [
    { day: "Mon", actions: 3 },
    { day: "Tue", actions: 5 },
    { day: "Wed", actions: 2 },
    { day: "Thu", actions: 4 },
    { day: "Fri", actions: 6 },
    { day: "Sat", actions: 3 },
    { day: "Sun", actions: 5 },
  ];

  return (
    <div className="analytics">
      <h3>Weekly Eco Progress 📊</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="actions" fill="#4CAF50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Analytics;
