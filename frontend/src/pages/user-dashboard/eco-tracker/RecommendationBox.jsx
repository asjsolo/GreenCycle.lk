//RecommendationBox.jsx
import React from "react";

function RecommendationBox({ recommendations }) {
  return (
    <div className="recommendation-box">
      <h3>Today's Eco-Friendly Suggestions 🌱</h3>
      {recommendations.length === 0 ? (
        <p>No new suggestions today.</p>
      ) : (
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecommendationBox;
