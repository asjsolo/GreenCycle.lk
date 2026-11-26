// frontend/pages/user-dashboard/analytics/AnalyticsPage.jsx
import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../../context/AuthContext"; // Adjust path
import "./AnalyticsPage.css";

// --- Import Charting Libraries ---
import { Bar, Doughnut } from "react-chartjs-2"; // Import Doughnut
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"; // Import ArcElement for Doughnut

// --- Register Chart.js Components ---
// Register all necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
); // Register ArcElement

function AnalyticsPage() {
  // Existing state for weekly completed actions
  const [weeklyData, setWeeklyData] = useState([]);

  // --- NEW State for Category Breakdown Data ---
  const [categoryData, setCategoryData] = useState([]); // State to hold category counts

  // Use a single loading and error state for the entire page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);

  // --- Fetch All Analytics Data in a Single useEffect ---
  // This useEffect will fetch both weekly and category data concurrently
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) {
        setLoading(false);
        setError("User not authenticated.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("AnalyticsPage: Fetching all analytics data...");

        // Fetch Weekly Completed Actions Data
        const weeklyResponse = await fetch(
          "/api/dashboard/analytics/weekly-completed-actions",
          {
            // Ensure this endpoint is correct
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        // Fetch Category Breakdown Data
        const categoryResponse = await fetch(
          "/api/dashboard/analytics/category-breakdown",
          {
            // Use the new backend endpoint
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        // Check responses
        if (!weeklyResponse.ok || !categoryResponse.ok) {
          // Handle authentication errors specifically
          if (
            weeklyResponse.status === 401 ||
            weeklyResponse.status === 403 ||
            categoryResponse.status === 401 ||
            categoryResponse.status === 403
          ) {
            console.error("AnalyticsPage: Fetch data failed due to auth.");
            setError("Authentication required to view analytics.");
          } else {
            // Handle other errors
            const weeklyErrorText = !weeklyResponse.ok
              ? await weeklyResponse.text()
              : "";
            const categoryErrorText = !categoryResponse.ok
              ? await categoryResponse.text()
              : "";
            console.error("AnalyticsPage: Fetch data failed.", {
              weeklyStatus: weeklyResponse.status,
              weeklyError: weeklyErrorText,
              categoryStatus: categoryResponse.status,
              categoryError: categoryErrorText,
            });
            setError("Failed to load analytics data. Please try again.");
          }
          // Set loading to false and return early on error
          setLoading(false);
          return;
        }

        // Process successful responses
        const weeklyData = await weeklyResponse.json();
        const categoryData = await categoryResponse.json();

        console.log(
          "AnalyticsPage: Successfully fetched weekly data:",
          weeklyData
        );
        console.log(
          "AnalyticsPage: Successfully fetched category data:",
          categoryData
        );

        setWeeklyData(weeklyData);
        setCategoryData(categoryData);
      } catch (err) {
        console.error("AnalyticsPage: Error during analytics data fetch:", err);
        setError(
          "Failed to load analytics data. An unexpected error occurred."
        );
      } finally {
        setLoading(false); // Set loading to false after all fetches complete
        console.log("AnalyticsPage: Analytics data fetch finished.");
      }
    };

    // Only fetch if user is available
    if (user) {
      fetchAnalyticsData();
    } else {
      // If user is not available initially, stop loading and set error
      setLoading(false);
      setError("User not authenticated.");
    }
  }, [user]); // Depend on user

  // --- Prepare Data for Weekly Chart (Existing Logic - Ensure correct) ---
  // This function should take raw data [{ _id: dateString, count: N }, ...]
  // and return { labels: [], datasets: [...] } for the Bar chart.
  const prepareWeeklyChartData = (rawData) => {
    const dataMap = new Map(rawData.map((item) => [item._id, item.count]));
    const today = new Date();
    // Assuming getStartOfWeekLocal is defined elsewhere or you have a helper
    const startOfThisWeek = getStartOfWeekLocal(today);

    const labels = [];
    const dataValues = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfThisWeek);
      currentDate.setDate(startOfThisWeek.getDate() + i);

      const dateString = currentDate.toISOString().split("T")[0]; // UTC YYYY-MM-DD
      const dayLabel = currentDate.toLocaleDateString("en-US", {
        weekday: "short",
      }); // Local short weekday name

      labels.push(dayLabel);
      dataValues.push(dataMap.get(dateString) || 0);
    }

    // --- Data structure for Chart.js ---
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Completed Actions",
          data: dataValues,
          backgroundColor: "rgba(75, 192, 192, 0.8)", // Example bar color
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
    return chartData;
  };

  // Helper function to calculate the start of the week (Monday Local Time)
  // Include this helper function if it's not imported or defined elsewhere
  const getStartOfWeekLocal = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const processedWeeklyChartData = prepareWeeklyChartData(weeklyData);

  // --- Chart Options for Weekly Bar Chart (Existing Logic - Ensure correct) ---
  const weeklyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Eco Actions Completed This Week",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += context.raw + " actions";
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Day of the Week",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Actions",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // --- NEW: Prepare Data for Category Doughnut Chart ---
  // This function takes raw category data [{ _id: categoryName, count: N }, ...]
  // and returns { labels: [], datasets: [...] } for the Doughnut chart.
  const prepareCategoryChartData = (rawData) => {
    const labels = rawData.map((item) => item._id || "Uncategorized"); // Category names
    const dataValues = rawData.map((item) => item.count); // Counts

    // Define a set of colors for the segments
    // Add more colors if you have more categories
    const backgroundColors = [
      "rgba(255, 99, 132, 0.8)", // Red (Reduce?)
      "rgba(54, 162, 235, 0.8)", // Blue (Reuse?)
      "rgba(255, 206, 86, 0.8)", // Yellow (Recycle?)
      "rgba(75, 192, 192, 0.8)", // Green (Cleanup?)
      "rgba(153, 102, 255, 0.8)", // Purple (Sustainable Alternatives?)
      "rgba(255, 159, 64, 0.8)", // Orange (Awareness/Education?)
      "rgba(201, 203, 207, 0.8)", // Grey (Community/Advocacy or General?)
    ];

    const borderColors = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(201, 203, 207, 1)",
    ];

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: dataValues,
          // Use enough colors for the number of categories
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
    return chartData;
  };

  const processedCategoryChartData = prepareCategoryChartData(categoryData);

  // --- NEW: Chart Options for Category Doughnut Chart ---
  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right", // Position legend on the right
      },
      title: {
        display: true,
        text: "Completed Actions by Category", // Chart Title
      },
      tooltip: {
        // Tooltip when hovering over segments
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`; // Display Category: Count (Percentage%)
          },
        },
      },
    },
    // Doughnut specific options
    cutout: "70%", // Size of the hole in the center (makes it a Doughnut)
  };

  // --- Render Logic ---
  // Use the combined loading and error states
  if (loading) {
    return <div className="p-6 text-center">Loading analytics data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error loading analytics data: {error}
      </div>
    );
  }

  // Check if we have data to display charts
  // Check if there's any data point > 0 for weekly chart
  const hasWeeklyChartData =
    processedWeeklyChartData &&
    processedWeeklyChartData.labels &&
    processedWeeklyChartData.labels.some(
      (label, index) => processedWeeklyChartData.datasets[0].data[index] > 0
    );
  // Check if there's any category with count > 0 for category chart
  const hasCategoryChartData =
    processedCategoryChartData &&
    processedCategoryChartData.labels &&
    processedCategoryChartData.labels.length > 0 &&
    processedCategoryChartData.datasets[0].data.some((count) => count > 0);

  return (
    <div className="analytics-page p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Your Eco Analytics</h2>
      {/* Eco-Score Trend Section (Placeholder for now - can integrate real data later) */}
      <div className="eco-score-trend mb-6">
        <h3 className="text-lg font-semibold">Eco-Score Trend</h3>
        <p className="text-gray-700">
          {/* You will fetch and display the trend data here */}
          Your eco-score trend data will appear here. (e.g., Increased by 15%
          this week)
        </p>
      </div>
      {/* --- NEW: Layout container for charts --- */}
      <div className="charts-layout-container">
        {/* Weekly Completed Actions Chart Section */}
        <div className="weekly-completed-chart">
          {" "}
          {/* Add margin-bottom */}
          <h3 className="text-lg font-semibold">Completed Actions This Week</h3>
          {hasWeeklyChartData ? (
            <div className="chart-container" style={{ height: "300px" }}>
              <Bar
                data={processedWeeklyChartData}
                options={weeklyChartOptions}
              />
            </div>
          ) : (
            <p className="text-gray-500">
              No completed actions data available for this week yet.
            </p>
          )}
        </div>

        {/* --- NEW: Completed Actions by Category Chart Section --- */}
        <div className="category-breakdown-chart">
          <h3 className="text-lg font-semibold">
            Completed Actions by Category
          </h3>

          {hasCategoryChartData ? (
            <div className="chart-container" style={{ height: "300px" }}>
              {" "}
              {/* Use the same container class */}
              {/* Render the Doughnut chart */}
              <Doughnut
                data={processedCategoryChartData}
                options={categoryChartOptions}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No completed actions with categories available yet.
            </p>
          )}
        </div>
      </div>{" "}
      {/* --- End Layout container --- */}
      {/* Add other analytics sections here */}
    </div>
  );
}

// Helper function (Include this if it's not defined or imported elsewhere)
const getStartOfWeekLocal = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default AnalyticsPage;
