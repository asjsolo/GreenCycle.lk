// frontend/Components/Common/ReportModal.jsx
import React from "react";
import "./ReportModal.css"; // Create this CSS file for styling

function ReportModal({ reportData, onClose }) {
  if (!reportData) {
    return null; // Don't render the modal if no report data
  }

  // Destructure data from the reportData prop
  const {
    reportPeriod,
    summary,
    completedActions,
    newAchievements,
    ecoScoreTrend,
  } = reportData;

  // Format dates for display
  const options = { year: "numeric", month: "long", day: "numeric" };
  const startDateFormatted = reportPeriod?.startDate
    ? new Date(reportPeriod.startDate).toLocaleDateString(undefined, options)
    : "N/A";
  const endDateFormatted = reportPeriod?.endDate
    ? new Date(reportPeriod.endDate).toLocaleDateString(undefined, options)
    : "N/A";

  return (
    // Modal Overlay
    <div className="report-modal-overlay" onClick={onClose}>
      {" "}
      {/* Click overlay to close */}
      {/* Modal Content (prevent clicks inside from closing modal) */}
      <div
        className="report-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {/* Stop click propagation */}
        <div className="modal-header">
          <h2>Weekly Eco Report</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>{" "}
          {/* Close button */}
        </div>
        <div className="modal-body">
          {/* Report Period */}
          <div className="report-section mb-4">
            <h3 className="text-lg font-semibold mb-2">Report Period:</h3>
            <p>
              {startDateFormatted} - {endDateFormatted}
            </p>
          </div>

          {/* Summary */}
          <div className="report-section mb-4">
            <h3 className="text-lg font-semibold mb-2">Summary:</h3>
            <p>
              Total completed actions last week:{" "}
              <strong>{summary?.totalCompletedActionsLastWeek || 0}</strong>
            </p>
            {/* Add other summary items if you implement them */}
            {/* {summary?.actionsByCategory && (
                             <div>
                                 <p>Breakdown by Category:</p>
                                  <ul>
                                      {summary.actionsByCategory.map(cat => (
                                           <li key={cat._id}>{cat._id || 'Uncategorized'}: {cat.count}</li>
                                      ))}
                                  </ul>
                             </div>
                         )} */}
          </div>

          {/* Eco-Score Trend (Last week vs Week before) */}
          {ecoScoreTrend && (
            <div className="report-section mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Eco-Score Trend (This Week vs Last Week):
              </h3>
              <p>
                Completed actions this week:{" "}
                <strong>{ecoScoreTrend.thisWeekCount}</strong>
              </p>
              <p>
                Completed actions last week:{" "}
                <strong>{ecoScoreTrend.lastWeekCount}</strong>
              </p>
              <p
                className={`font-bold ${
                  ecoScoreTrend.trendDirection === "up"
                    ? "text-green-600"
                    : ecoScoreTrend.trendDirection === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {ecoScoreTrend.percentageChange}%
                {ecoScoreTrend.trendDirection === "up" && " Increase"}
                {ecoScoreTrend.trendDirection === "down" && " Decrease"}
                {ecoScoreTrend.trendDirection === "same" && " (No Change)"}
              </p>
            </div>
          )}

          {/* Completed Actions List */}
          <div className="report-section mb-4">
            <h3 className="text-lg font-semibold mb-2">Completed Actions:</h3>
            {completedActions && completedActions.length > 0 ? (
              <ul>
                {completedActions.map((action) => (
                  <li key={action._id} className="text-sm text-gray-700">
                    - {action.text} (
                    {new Date(action.createdAt).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm">
                No actions completed during this period.
              </p>
            )}
          </div>

          {/* New Achievements List */}
          <div className="report-section">
            <h3 className="text-lg font-semibold mb-2">
              New Achievements Earned:
            </h3>
            {newAchievements && newAchievements.length > 0 ? (
              <ul>
                {newAchievements.map((ach) => (
                  <li key={ach._id} className="text-sm text-gray-700">
                    - {ach.name} (
                    {new Date(ach.earnedDate).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm">
                No new achievements earned during this period.
              </p>
            )}
          </div>

          {/* Add more report sections here */}
        </div>
        {/* Optional: Modal Footer */}
        <div className="modal-footer">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
