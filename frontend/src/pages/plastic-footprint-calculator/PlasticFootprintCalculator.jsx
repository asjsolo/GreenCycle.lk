// frontend/pages/plastic-footprint-calculator/PlasticFootprintCalculator.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import MainLayout from "../../Components/Layout/MainLayout";
import "./PlasticFootprintCalculator.css";
import AuthContext from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Import the notification hook
import { useAchievementNotification } from "../../context/AchievementNotificationContext";

// --- Import Recharts Components ---
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function PlasticFootprintCalculator() {
  const { user, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Get the notification context function ---
  const { showAchievementNotification } = useAchievementNotification();

  // --- State for Tab Management ---
  const [activeTab, setActiveTab] = useState("calculate"); // Default active tab
  const tabs = ["calculate", "history", "limit", "reports"]; // List of tabs

  const [bottles, setBottles] = useState("");
  const [bags, setBags] = useState("");
  const [straws, setStraws] = useState("");
  const [containers, setContainers] = useState("");
  const [wrappers, setWrappers] = useState("");
  const [result, setResult] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [calculationPerformed, setCalculationPerformed] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  // --- State for History Data ---
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // --- State for Monthly Limit and Current Usage ---
  const [monthlyLimit, setMonthlyLimit] = useState(null);
  const [currentMonthlyUsage, setCurrentMonthlyUsage] = useState(0);
  const [limitInput, setLimitInput] = useState("");
  const [setLimitLoading, setSetLimitLoading] = useState(false);
  const [setLimitError, setSetLimitError] = useState(null);

  // --- State for Report Generation ---
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  // --- Define Fetch Footprint History Function ---
  const fetchHistory = useCallback(async () => {
    if (!isLoggedIn) {
      setHistoryLoading(false);
      setHistory([]);
      setHistoryError(null);
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError(null);
      console.log("PlasticFootprintCalculator: Fetching footprint history...");

      const response = await fetch("/api/footprint/history", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error(
            "PlasticFootprintCalculator: Fetch history failed due to auth."
          );
          setHistoryError("Authentication required to view history.");
        } else {
          const errorData = await response.json();
          console.error(
            "PlasticFootprintCalculator: Fetch history failed.",
            response.status,
            errorData.message
          );
          setHistoryError(errorData.message || "Failed to load history.");
        }
        setHistory([]);
      } else {
        const data = await response.json();
        console.log(
          "PlasticFootprintCalculator: Successfully fetched history:",
          data
        );
        if (data.success && data.history) {
          // Sort history by date descending for chart and display
          const sortedHistory = data.history.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          setHistory(sortedHistory);
        } else {
          setHistoryError(data.message || "Failed to load history data.");
          setHistory([]);
        }
      }
    } catch (err) {
      console.error("PlasticFootprintCalculator: Error fetching history:", err);
      setHistoryError("Failed to load history. An unexpected error occurred.");
      setHistory([]);
    } finally {
      setHistoryLoading(false);
      console.log("PlasticFootprintCalculator: History fetch finished.");
    }
  }, [isLoggedIn]);

  // --- Define Fetch User Plastic Data Function ---
  const fetchUserPlasticData = useCallback(async () => {
    if (!isLoggedIn) {
      setMonthlyLimit(null);
      setCurrentMonthlyUsage(0);
      setLimitInput("");
      return;
    }

    try {
      console.log(
        "PlasticFootprintCalculator: Fetching user plastic data (limit & usage)..."
      );
      const response = await fetch("/api/user/plastic-data", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error(
            "PlasticFootprintCalculator: Fetch plastic data failed due to auth."
          );
        } else {
          const errorData = await response.json();
          console.error(
            "PlasticFootprintCalculator: Fetch plastic data failed.",
            response.status,
            errorData.message
          );
        }
        setMonthlyLimit(null);
        setCurrentMonthlyUsage(0);
        setLimitInput("");
      } else {
        const data = await response.json();
        console.log(
          "PlasticFootprintCalculator: Successfully fetched user plastic data:",
          data
        );
        if (data.success) {
          setMonthlyLimit(data.monthlyLimit);
          // Assuming backend sends current monthly usage carbon footprint
          setCurrentMonthlyUsage(
            data.currentMonthlyUsage?.carbonFootprint || 0
          );
          setLimitInput(
            data.monthlyLimit !== null ? String(data.monthlyLimit) : ""
          );
        } else {
          console.error(
            "PlasticFootprintCalculator: Failed to fetch user plastic data:",
            data.message
          );
          setMonthlyLimit(null);
          setCurrentMonthlyUsage(0);
          setLimitInput("");
        }
      }
    } catch (err) {
      console.error(
        "PlasticFootprintCalculator: Error fetching user plastic data:",
        err
      );
      setMonthlyLimit(null);
      setCurrentMonthlyUsage(0);
      setLimitInput("");
    }
  }, [isLoggedIn]);

  // --- useEffect to Fetch History AND User Plastic Data on Component Load ---
  useEffect(() => {
    fetchHistory();
    fetchUserPlasticData();
  }, [fetchHistory, fetchUserPlasticData]);

  // --- Handle Setting Monthly Limit ---
  const handleSetLimit = async () => {
    setSetLimitLoading(true);
    setSetLimitError(null);

    const limitValue = limitInput === "" ? null : parseFloat(limitInput);

    if (limitValue !== null && (isNaN(limitValue) || limitValue < 0)) {
      setSetLimitError(
        "Invalid limit value. Please enter a non-negative number or leave empty."
      );
      setSetLimitLoading(false);
      return;
    }

    console.log("Attempting to set monthly limit to:", limitValue);

    try {
      const response = await fetch("/api/user/set-monthly-limit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ monthlyPlasticLimit: limitValue }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Monthly limit set successfully:", data);
        setMonthlyLimit(data.monthlyLimit);
        setSetLimitError(null);
        // Refresh current monthly usage after setting limit, in case it wasn't fetched recently
        fetchUserPlasticData();
      } else {
        console.error(
          "Failed to set monthly limit:",
          response.status,
          data.message
        );
        setSetLimitError(data.message || "Failed to set monthly limit.");
      }
    } catch (err) {
      console.error("Error setting monthly limit:", err);
      setSetLimitError("An error occurred while setting the limit.");
    } finally {
      setSetLimitLoading(false);
    }
  };

  const handleCalculate = async () => {
    setResult(null);
    setCalculationPerformed(false);
    setSaveStatus(null);
    setSaveMessage("");

    const bottlesValue = bottles === "" ? 0 : parseInt(bottles);
    const bagsValue = bags === "" ? 0 : parseInt(bags);
    const strawsValue = straws === "" ? 0 : parseInt(straws);
    const containersValue = containers === "" ? 0 : parseInt(containers);
    const wrappersValue = wrappers === "" ? 0 : parseInt(wrappers);

    if (
      isNaN(bottlesValue) ||
      isNaN(bagsValue) ||
      isNaN(strawsValue) ||
      isNaN(containersValue) ||
      isNaN(wrappersValue) ||
      bottlesValue < 0 ||
      bagsValue < 0 ||
      strawsValue < 0 ||
      containersValue < 0 ||
      wrappersValue < 0
    ) {
      console.error("Invalid input values. Please enter non-negative numbers.");
      alert("Invalid input. Please enter non-negative numbers.");
      return;
    }

    try {
      const calculateResponse = await fetch("/api/footprint/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bottles: bottlesValue,
          bags: bagsValue,
          straws: strawsValue,
          containers: containersValue,
          wrappers: wrappersValue,
        }),
      });

      if (!calculateResponse.ok) {
        const errorData = await calculateResponse.json();
        throw new Error(errorData.message || "Calculation failed");
      }

      const calculationData = await calculateResponse.json();
      console.log("Calculation successful:", calculationData);
      setResult(calculationData);
      setCalculationPerformed(true);

      // --- Track Calculator Usage After Successful Calculation ---
      if (isLoggedIn) {
        console.log(
          "User is logged in, attempting to track calculator usage..."
        );
        try {
          const trackResponse = await fetch(
            "/api/user/track-calculator-usage",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          if (!trackResponse.ok) {
            const errorData = await trackResponse.json();
            console.error(
              "Failed to track calculator usage:",
              trackResponse.status,
              errorData.message
            );
          } else {
            const trackData = await trackResponse.json();
            console.log(
              "Calculator usage tracked successfully:",
              trackData.calculatorUsesCount
            );

            // --- Check for awarded achievements and show notification ---
            if (
              trackData.awardedAchievements &&
              trackData.awardedAchievements.length > 0
            ) {
              console.log(
                "Calculator usage tracking awarded achievements:",
                trackData.awardedAchievements
              );
              // Call the context function with the array of achievements
              showAchievementNotification(trackData.awardedAchievements);
            }
            // --- End Achievement Notification Logic ---
          }
        } catch (trackError) {
          console.error("Error tracking calculator usage:", trackError);
        }
      } else {
        console.log("User not logged in, skipping calculator usage tracking.");
      }
      // --- End Tracking Logic ---

      if (isLoggedIn) {
        setSaveStatus("saving");
        setSaveMessage("Saving usage record...");
        console.log("User is logged in, attempting to save usage record...");

        try {
          const saveResponse = await fetch("/api/footprint/save-usage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              bottles: bottlesValue,
              bags: bagsValue,
              straws: strawsValue,
              containers: containersValue,
              wrappers: wrappersValue,
              carbonFootprint: calculationData.carbonFootprint,
              points: calculationData.points,
            }),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Failed to save usage record");
          }

          const saveData = await saveResponse.json();
          console.log("Usage record saved successfully:", saveData);
          setSaveStatus("success");
          setSaveMessage(
            saveData.message || "Usage record saved successfully!"
          );

          // Refresh history and user plastic data after saving
          fetchHistory();
          fetchUserPlasticData();
        } catch (saveError) {
          console.error("Error saving usage record:", saveError);
          setSaveStatus("error");
          setSaveMessage(saveError.message || "Failed to save usage record.");
        }
      } else {
        console.log("User not logged in, skipping save to database.");
        setSaveStatus("info");
        setSaveMessage("Log in to save your usage history.");
      }

      // Local Storage History (Optional, but good for non-logged in users or redundancy)
      const historyEntry = {
        timestamp: new Date().toISOString(),
        bottles: bottlesValue,
        bags: bagsValue,
        straws: strawsValue,
        containers: containersValue,
        wrappers: wrappersValue,
        carbonFootprint: calculationData.carbonFootprint,
        ecoScore: calculationData.points,
      };

      const storedHistory = localStorage.getItem("plasticUsageHistory");
      const historyArray = storedHistory ? JSON.parse(storedHistory) : [];

      historyArray.push(historyEntry);

      localStorage.setItem("plasticUsageHistory", JSON.stringify(historyArray));
      console.log("Calculation saved to local storage history.");
    } catch (error) {
      console.error("Error during calculation or saving:", error);
      alert(error.message || "An error occurred during calculation.");
      setCalculationPerformed(false);
      setSaveStatus("error");
      setSaveMessage(error.message || "An error occurred.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCalculate();
  };

  const handleInputChange = (setState) => (e) => {
    const newValue = e.target.value;
    if (
      newValue === "" ||
      (/^\d+$/.test(newValue) && parseInt(newValue) >= 0)
    ) {
      setState(newValue);
    }
  };

  // --- Prepare Data for Chart ---
  const prepareChartData = (historyData) => {
    // Ensure historyData is sorted by date before mapping if not already
    const sortedData = [...historyData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sortedData.map((record) => ({
      // Use a better date format for the chart if needed, e.g., 'MM/DD/YYYY'
      date: new Date(record.date).toLocaleDateString(),
      carbonFootprint: record.carbonFootprint,
      ecoScore: record.points,
    }));
  };

  // Only prepare chart data if history is loaded and not empty
  const chartData =
    history && history.length > 0 ? prepareChartData(history) : [];

  // --- Check if current usage exceeds limit ---
  const isLimitExceeded =
    monthlyLimit !== null && currentMonthlyUsage > monthlyLimit;

  // --- Function to navigate to Eco Action Tracker and potentially pre-fill action ---
  const handleAddActionFromTip = (tipText) => {
    // --- Fix: Ensure the path matches your React Router setup exactly ---
    navigate("/dashboard/ecoActionTracker", {
      // Corrected path
      state: { suggestedActionText: tipText },
    });
  };

  // --- Handle Generate Report ---
  const handleGenerateReport = async () => {
    // Set loading state
    setReportLoading(true);
    setReportError(null); // Clear previous errors

    try {
      console.log("Attempting to fetch plastic usage report data...");

      // --- Use fetch to get the blob data ---
      const response = await fetch("/api/footprint/report", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent for authentication
      });

      // Check if the response is OK (status 200-299)
      if (!response.ok) {
        // Attempt to read error message from backend if it's JSON
        let errorMessage = `Failed to generate report (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          // Handle specific backend errors, e.g., no history found (404)
          if (response.status === 404) {
            setReportError("No history found to generate a report.");
            console.error("Report generation failed: No history.");
            return; // Exit the function
          }
        } catch (jsonError) {
          // If response is not JSON, use the status text or a generic message
          console.error("Failed to parse error response as JSON:", jsonError);
          // Fallback to status text if available, otherwise generic message
          errorMessage =
            response.statusText ||
            `Failed to generate report (Status: ${response.status})`;
        }
        setReportError(errorMessage);
        console.error(
          "Report generation failed:",
          response.status,
          errorMessage
        );
        return; // Exit the function on non-OK response
      }

      // Get the response as a Blob
      const blob = await response.blob();
      console.log("Successfully fetched report data as blob.");

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor tag
      const a = document.createElement("a");
      a.href = url;
      // Set the download attribute to suggest a filename
      a.download = "plastic_usage_report.pdf"; // You can make this dynamic if needed
      a.style.display = "none"; // Hide the anchor tag
      document.body.appendChild(a);

      // Programmatically click the anchor tag to trigger download
      a.click();
      console.log("Download triggered via temporary anchor tag.");

      // Clean up the temporary URL and anchor tag after a short delay
      // Use a timeout to ensure the download is initiated before revoking the URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url); // Release the object URL
        document.body.removeChild(a); // Remove the anchor tag
        console.log("Cleaned up temporary download elements.");
      }, 100); // A small delay (e.g., 100ms) is usually sufficient
    } catch (err) {
      // This catch block handles network errors or errors during blob processing
      console.error("Error during report generation fetch or download:", err);
      setReportError(
        "An error occurred while generating or downloading the report."
      );
    } finally {
      // Reset loading state regardless of success or failure
      setReportLoading(false);
      console.log("Report generation process finished.");
    }
  };

  return (
    <MainLayout>
      <div className="plastic-calculator-home-container">
        <div className="plastic-calculator-container">
          <div className="plastic-calculator-header">
            <div className="plastic-calculator-text">
              Plastic Footprint Calculator
            </div>
            <div className="plastic-calculator-underline"></div>
          </div>

          {/* --- NEW: Tab Navigation --- */}
          <div className="plastic-calculator-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                {/* Capitalize first letter */}
              </button>
            ))}
          </div>
          {/* --- End Tab Navigation --- */}

          {/* --- Tab Content Area --- */}
          <div className="plastic-calculator-tab-content">
            {/* --- Calculate Tab Content --- */}
            {activeTab === "calculate" && (
              <div className="tab-panel calculate-panel">
                {/* Form */}
                <form onSubmit={handleSubmit} className="inputs">
                  <div className="plastic-calculator-input">
                    <label htmlFor="bottles">Bottles:</label>
                    <input
                      type="number"
                      id="bottles"
                      name="bottles"
                      value={bottles}
                      onChange={handleInputChange(setBottles)}
                      min="0"
                    />
                  </div>
                  <div className="plastic-calculator-input">
                    <label htmlFor="bags">Bags:</label>
                    <input
                      type="number"
                      id="bags"
                      name="bags"
                      value={bags}
                      onChange={handleInputChange(setBags)}
                      min="0"
                    />
                  </div>
                  <div className="plastic-calculator-input">
                    <label htmlFor="straws">Straws:</label>
                    <input
                      type="number"
                      id="straws"
                      name="straws"
                      value={straws}
                      onChange={handleInputChange(setStraws)}
                      min="0"
                    />
                  </div>
                  <div className="plastic-calculator-input">
                    <label htmlFor="containers">Containers:</label>
                    <input
                      type="number"
                      id="containers"
                      name="containers"
                      value={containers}
                      onChange={handleInputChange(setContainers)}
                      min="0"
                    />
                  </div>
                  <div className="plastic-calculator-input">
                    <label htmlFor="wrappers">Wrappers:</label>
                    <input
                      type="number"
                      id="wrappers"
                      name="wrappers"
                      value={wrappers}
                      onChange={handleInputChange(setWrappers)}
                      min="0"
                    />
                  </div>
                  {/* Submit Button */}
                  <div className="plastic-calculator-submit-container">
                    <button type="submit" className="plastic-calculator-submit">
                      Calculate
                    </button>
                  </div>
                </form>

                {/* Display Save Status Message */}
                {saveStatus && (
                  <div className={`save-status-message ${saveStatus}`}>
                    {saveMessage}
                  </div>
                )}

                {/* Calculation Result Display */}
                {result !== null && (
                  <div className="plastic-calculator-result-container">
                    <p>
                      Carbon Footprint: {result.carbonFootprint.toFixed(2)} kg
                      CO2e
                    </p>
                    <p>Eco Score: {result.points} / 100</p>
                    <p className="plastic-calculator-score-explanation">
                      Higher score means a lower plastic footprint and better
                      environmental impact.
                    </p>
                    {/* Learn More and History Buttons */}
                    <button
                      className="plastic-calculator-learn-more-button"
                      onClick={() => setShowBreakdown(true)}
                    >
                      Learn More
                    </button>
                    {/* Optional: Add a View History button */}
                    {/* <button className="plastic-calculator-view-history-button" onClick={handleViewHistory}>
                                View History
                             </button> */}
                  </div>
                )}
              </div>
            )}

            {/* --- History Tab Content --- */}
            {activeTab === "history" && (
              <div className="tab-panel history-panel">
                {/* Plastic Usage History Section */}
                {isLoggedIn ? (
                  <div className="plastic-calculator-history-section">
                    <h3>Your Usage History</h3>

                    {historyLoading && <p>Loading history...</p>}
                    {historyError && (
                      <p className="text-red-500">
                        Error loading history: {historyError}
                      </p>
                    )}

                    {!historyLoading &&
                      !historyError &&
                      history.length === 0 && (
                        <p>
                          No usage history found yet. Calculate your footprint
                          to save your first record!
                        </p>
                      )}

                    {!historyLoading && !historyError && history.length > 0 && (
                      <>
                        <div className="history-chart-container">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={chartData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#ccc"
                              />
                              <XAxis dataKey="date" stroke="#001e1d" />
                              <YAxis stroke="#001e1d" />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="carbonFootprint"
                                stroke="#f9bc60"
                                activeDot={{ r: 8 }}
                                name="Carbon Footprint (kg CO2e)"
                              />
                              <Line
                                type="monotone"
                                dataKey="ecoScore"
                                stroke="#9dc1b6"
                                activeDot={{ r: 8 }}
                                name="Eco Score (/100)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Optional: Display history list here */}
                        {/* <ul>
                                    {history.map(record => (
                                        <li key={record._id}>
                                            {new Date(record.date).toLocaleDateString()}: {record.carbonFootprint.toFixed(2)} kg CO2e
                                        </li>
                                    ))}
                                </ul> */}
                      </>
                    )}
                  </div>
                ) : (
                  <p>Log in to view your plastic usage history.</p>
                )}
              </div>
            )}

            {/* --- Monthly Limit Tab Content --- */}
            {activeTab === "limit" && (
              <div className="tab-panel limit-panel">
                {/* Monthly Limit Section */}
                {isLoggedIn ? (
                  <div className="plastic-calculator-limit-section">
                    <h3>Monthly Plastic Limit (Carbon Footprint)</h3>

                    {/* Display current limit and usage */}
                    <div className="limit-status">
                      <p>
                        Your current monthly limit:{" "}
                        <strong>
                          {monthlyLimit !== null
                            ? `${monthlyLimit.toFixed(2)} kg CO2e`
                            : "Not set"}
                        </strong>
                      </p>
                      <p className={isLimitExceeded ? "usage-exceeded" : ""}>
                        Your current usage this month:{" "}
                        <strong>
                          {currentMonthlyUsage.toFixed(2)} kg CO2e
                        </strong>
                      </p>
                      {/* Display alert if limit exceeded */}
                      {isLimitExceeded && (
                        <p className="limit-alert">
                          You have exceeded your monthly plastic limit!
                        </p>
                      )}
                    </div>

                    {/* Form to set/update limit */}
                    <div className="set-limit-form">
                      <label htmlFor="monthlyLimitInput">
                        Set New Monthly Limit (kg CO2e):
                      </label>
                      <div className="limit-input-group">
                        <input
                          type="number"
                          id="monthlyLimitInput"
                          value={limitInput}
                          onChange={(e) => setLimitInput(e.target.value)}
                          min="0"
                          placeholder="Enter limit or leave empty to remove"
                          disabled={setLimitLoading}
                        />
                        <button
                          onClick={handleSetLimit}
                          disabled={setLimitLoading}
                        >
                          {setLimitLoading ? "Saving..." : "Set Limit"}
                        </button>
                      </div>
                      {/* Display set limit error message */}
                      {setLimitError && (
                        <p className="set-limit-error">{setLimitError}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>Log in to set and track your monthly plastic limit.</p>
                )}
              </div>
            )}

            {/* --- Reports Tab Content --- */}
            {activeTab === "reports" && (
              <div className="tab-panel reports-panel">
                {/* Report Generation Section */}
                {isLoggedIn && history.length > 0 ? ( // Only show if logged in and has history
                  <div className="plastic-calculator-report-section">
                    <h3>Generate Report</h3>
                    <p>Download a PDF report of your plastic usage history.</p>
                    <button
                      className="plastic-calculator-report-button"
                      onClick={handleGenerateReport}
                      disabled={reportLoading}
                    >
                      {reportLoading ? "Generating..." : "Download Report"}
                    </button>
                    {reportError && (
                      <p className="plastic-calculator-report-error">
                        {reportError}
                      </p>
                    )}
                  </div>
                ) : isLoggedIn && history.length === 0 ? (
                  <p>Calculate your footprint first to generate a report.</p>
                ) : (
                  <p>
                    Log in to generate reports of your plastic usage history.
                  </p>
                )}
              </div>
            )}
          </div>
          {/* --- End Tab Content Area --- */}

          {/* Breakdown Modal (Remains outside tab content, triggered from Calculate tab) */}
          {showBreakdown && (
            <div className="plastic-calculator-breakdown-modal">
              <h2>Understanding Your Eco Score</h2>
              <p>
                Here's a breakdown of your estimated carbon footprint from these
                items:
              </p>
              <ul>
                <li>
                  Bottles: {bottles === "" ? 0 : bottles} x 0.1 kg CO2e ={" "}
                  {((bottles === "" ? 0 : bottles) * 0.1).toFixed(2)} kg CO2e
                </li>
                <li>
                  Bags: {bags === "" ? 0 : bags} x 0.05 kg CO2e ={" "}
                  {((bags === "" ? 0 : bags) * 0.05).toFixed(2)} kg CO2e
                </li>
                <li>
                  Straws: {straws === "" ? 0 : straws} x 0.01 kg CO2e ={" "}
                  {((straws === "" ? 0 : straws) * 0.01).toFixed(2)} kg CO2e
                </li>
                <li>
                  Containers: {containers === "" ? 0 : containers} x 0.2 kg CO2e
                  = {((containers === "" ? 0 : containers) * 0.2).toFixed(2)} kg
                  CO2e
                </li>
                <li>
                  Wrappers: {wrappers === "" ? 0 : wrappers} x 0.03 kg CO2e ={" "}
                  {((wrappers === "" ? 0 : wrappers) * 0.03).toFixed(2)} kg CO2e
                </li>
              </ul>
              <p className="estimation-note">
                {" "}
                {/* Add a CSS class for styling */}* These carbon footprint
                values are simplified estimations based on average lifecycle
                data for typical single-use plastic items. Actual impacts can
                vary based on material, size, production, and disposal methods.
              </p>
              <p>
                <strong>
                  Your Total Estimated Carbon Footprint:{" "}
                  {result !== null ? result.carbonFootprint.toFixed(2) : "0.00"}{" "}
                  kg CO2e
                </strong>
              </p>

              <div className="plastic-calculator-eco-score-explanation">
                <h3>
                  Your Eco Score: {result !== null ? result.points : "0"} / 100
                </h3>
                <p>
                  Your Eco Score provides a simple way to understand the
                  environmental impact of the plastic items you used, on a scale
                  of 0 to 100.
                </p>
                <p>
                  It's calculated by comparing your estimated carbon footprint
                  from these items to a **baseline** representing a typical
                  higher level of consumption for the same items.
                  {/* Optionally, you can add the baseline quantities here */}
                  {/* For example: "For this calculator, the baseline represents using approximately 10 bottles, 10 bags, 10 straws, 10 containers, and 10 wrappers." */}
                </p>
                <p>
                  A score of 100 means your estimated footprint is 0 for the
                  items entered. A score of 0 means your estimated footprint is
                  equal to or higher than the baseline. A score between 0 and
                  100 indicates your footprint is lower than the baseline.
                </p>

                {result && result.points > 80 ? (
                  <p>
                    That's a great score! You have a relatively low plastic
                    footprint. Keep up the excellent work! Here are some
                    specific tips and alternatives related to the items you
                    used:
                  </p>
                ) : result && result.points > 40 ? (
                  <p>
                    Your score is good, but there's still room for improvement.
                    Here are some specific tips and alternatives related to the
                    items you used:
                  </p>
                ) : (
                  <p>
                    Your current score suggests a higher plastic footprint. Here
                    are some specific tips and alternatives to help you reduce
                    your impact:
                  </p>
                )}

                <ul>
                  {/* Update the buttons to use handleAddActionFromTip */}
                  {parseInt(bottles) > 0 && (
                    <li>
                      Reduce plastic bottle use. Instead, carry a{" "}
                      <strong>reusable water bottle</strong>.
                      {isLoggedIn && (
                        <button
                          className="add-action-from-tip-button"
                          onClick={() =>
                            handleAddActionFromTip(
                              "Use a reusable water bottle"
                            )
                          }
                        >
                          Add as Action
                        </button>
                      )}
                    </li>
                  )}
                  {parseInt(bags) > 0 && (
                    <li>
                      Reduce single-use plastic bags. Use{" "}
                      <strong>reusable shopping bags</strong> instead.
                      {isLoggedIn && (
                        <button
                          className="add-action-from-tip-button"
                          onClick={() =>
                            handleAddActionFromTip("Use reusable shopping bags")
                          }
                        >
                          Add as Action
                        </button>
                      )}
                    </li>
                  )}
                  {parseInt(straws) > 0 && (
                    <li>
                      Avoid plastic straws. Carry a{" "}
                      <strong>reusable straw (metal, bamboo, glass)</strong> or
                      simply go without.
                      {isLoggedIn && (
                        <button
                          className="add-action-from-tip-button"
                          onClick={() =>
                            handleAddActionFromTip("Avoid plastic straws")
                          }
                        >
                          Add as Action
                        </button>
                      )}
                    </li>
                  )}
                  {parseInt(containers) > 0 && (
                    <li>
                      Reduce disposable plastic containers. Pack lunches or
                      leftovers in <strong>reusable food containers</strong>.
                      {isLoggedIn && (
                        <button
                          className="add-action-from-tip-button"
                          onClick={() =>
                            handleAddActionFromTip(
                              "Use reusable food containers"
                            )
                          }
                        >
                          Add as Action
                        </button>
                      )}
                    </li>
                  )}
                  {parseInt(wrappers) > 0 && (
                    <li>
                      Choose products with minimal or plastic-free packaging.
                      Consider buying in bulk or using{" "}
                      <strong>reusable wraps (like beeswax wraps)</strong>.
                      {isLoggedIn && (
                        <button
                          className="add-action-from-tip-button"
                          onClick={() =>
                            handleAddActionFromTip(
                              "Choose products with less plastic packaging"
                            )
                          }
                        >
                          Add as Action
                        </button>
                      )}
                    </li>
                  )}
                  {parseInt(bottles) <= 0 &&
                    parseInt(bags) <= 0 &&
                    parseInt(straws) <= 0 &&
                    parseInt(containers) <= 0 &&
                    parseInt(wrappers) <= 0 && (
                      <li>
                        Keep up the great work! Continue minimizing your
                        single-use plastic consumption.
                      </li>
                    )}
                </ul>

                {result && result.points > 20 && (
                  <p>
                    A <strong>higher score</strong> (closer to 100) means a{" "}
                    <strong>lower estimated plastic footprint</strong> and
                    therefore a{" "}
                    <strong>better environmental performance</strong> compared
                    to a defined higher usage baseline.
                  </p>
                )}
                {result && result.points <= 20 && (
                  <p>
                    A <strong>lower score</strong> indicates a{" "}
                    <strong>higher estimated plastic footprint</strong>,
                    suggesting more opportunities to reduce your impact.
                  </p>
                )}
                <p>
                  Keep track of your score and strive for a higher number by
                  reducing your daily consumption of these plastic items!
                </p>
              </div>

              <button
                className="plastic-calculator-close-button"
                onClick={() => setShowBreakdown(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default PlasticFootprintCalculator;
