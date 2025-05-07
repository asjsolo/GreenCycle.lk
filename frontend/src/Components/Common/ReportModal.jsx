//ADDED PDF REPORT GENERATOR
// frontend/Components/Common/ReportModal.jsx
import React, { useRef } from "react"; // Import useRef
import "./ReportModal.css";
//import html2canvas from "html2canvas"; // Import html2canvas
import jsPDF from "jspdf"; // Import jsPDF

function ReportModal({ reportData, onClose }) {
  // Use useRef to get a reference to the modal content element
  const reportContentRef = useRef(null);

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

  // --- NEW: Handle Export to PDF Button Click (Direct PDF Generation) ---
  const handleExportPdf = () => {
    // No longer async
    console.log("Generating PDF directly with jsPDF..."); // Debug log

    // Create a new jsPDF instance
    const pdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for units, 'a4' for page size

    // Set initial position and font styles
    let yPos = 20; // Starting vertical position from the top margin
    const margin = 20; // Horizontal margin
    const lineHeight = 7; // Vertical space between lines
    const largeHeadingSize = 18;
    const sectionHeadingSize = 14;
    const bodyTextSize = 10;
    const listTextSize = 9;

    // Function to add text and update y position
    const addText = (text, x, size, style = "normal", weight = "normal") => {
      pdf.setFont("helvetica", style, weight); // Set font family, style, weight
      pdf.setFontSize(size);
      pdf.text(text, x, yPos);
      yPos += lineHeight; // Move down for the next line
    };

    // Function to add a section heading
    const addSectionHeading = (text) => {
      yPos += lineHeight * 0.5; // Add some space before heading
      addText(text, margin, sectionHeadingSize, "normal", "bold"); // Bold heading
      yPos += lineHeight * 0.5; // Add space after heading
    };

    // Function to check if a new page is needed
    const checkNewPage = () => {
      // Roughly check if content will overflow the page height (A4 is ~297mm)
      // Adjust 280 based on your top/bottom margins and footer space if any
      if (yPos > 280) {
        pdf.addPage();
        yPos = 20; // Reset y position for the new page (top margin)
      }
    };

    // --- Add Report Content ---

    // Title
    pdf.setFont("helvetica", "bold"); // Set font for title
    pdf.setFontSize(largeHeadingSize);
    pdf.text("Weekly Eco Report", margin, yPos);
    yPos += lineHeight * 2; // More space after title

    // Report Period
    checkNewPage();
    addSectionHeading("Report Period:");
    addText(
      `${startDateFormatted} - ${endDateFormatted}`,
      margin,
      bodyTextSize
    );
    yPos += lineHeight; // Space after this section

    // Summary
    checkNewPage();
    addSectionHeading("Summary:");
    addText(
      `Total completed actions last week: ${
        summary?.totalCompletedActionsLastWeek || 0
      }`,
      margin,
      bodyTextSize
    );
    // Add other summary items if needed, using addText

    yPos += lineHeight; // Space after this section

    // Eco-Score Trend
    if (ecoScoreTrend) {
      checkNewPage();
      addSectionHeading("Eco-Score Trend (This Week vs Last Week):");
      addText(
        `Completed actions this week: ${ecoScoreTrend.thisWeekCount}`,
        margin,
        bodyTextSize
      );
      addText(
        `Completed actions last week: ${ecoScoreTrend.lastWeekCount}`,
        margin,
        bodyTextSize
      );

      let trendText = `${ecoScoreTrend.percentageChange}% `;
      if (ecoScoreTrend.trendDirection === "up") {
        trendText += "Increase";
        // Optional: Change text color for trend (more complex in jsPDF, requires adding text in parts or using specific plugins)
      } else if (ecoScoreTrend.trendDirection === "down") {
        trendText += "Decrease";
      } else {
        trendText += "(No Change)";
      }
      trendText += " this week";

      addText(trendText, margin, bodyTextSize, "normal", "bold"); // Display trend text, maybe bold
      yPos += lineHeight; // Space after this section
    }

    // Completed Actions List
    checkNewPage();
    addSectionHeading("Completed Actions:");
    if (completedActions && completedActions.length > 0) {
      completedActions.forEach((action) => {
        checkNewPage(); // Check page before adding each list item
        addText(
          `- ${action.text} (${new Date(
            action.createdAt
          ).toLocaleDateString()})`,
          margin + 5,
          listTextSize
        ); // Indent list items slightly
      });
    } else {
      addText("No actions completed during this period.", margin, bodyTextSize);
    }
    yPos += lineHeight; // Space after this section

    // New Achievements List
    checkNewPage();
    addSectionHeading("New Achievements Earned:");
    if (newAchievements && newAchievements.length > 0) {
      newAchievements.forEach((ach) => {
        checkNewPage(); // Check page before adding each list item
        addText(
          `- ${ach.name} (${new Date(ach.earnedDate).toLocaleDateString()})`,
          margin + 5,
          listTextSize
        ); // Indent list items slightly
      });
    } else {
      addText(
        "No new achievements earned during this period.",
        margin,
        bodyTextSize
      );
    }
    yPos += lineHeight; // Space after this section

    // Add more report sections here using the helper functions

    // Save the PDF file
    pdf.save(`weekly-report-${startDateFormatted}-${endDateFormatted}.pdf`);

    console.log("PDF generated successfully."); // Debug log
  };

  return (
    // Modal Overlay
    <div className="report-modal-overlay" onClick={onClose}>
      {" "}
      {/* Click overlay to close */}
      {/* Modal Content (prevent clicks inside from closing modal) */}
      <div
        className="report-modal-content"
        ref={reportContentRef} // Attach the ref here
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
          {/* NEW: Export to PDF Button */}
          <button
            className="export-pdf-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={handleExportPdf} // Trigger the export function
          >
            Export to PDF
          </button>
          {/* Close Button */}
          <button
            className="close-modal-button bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
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
