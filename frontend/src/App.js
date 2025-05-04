//App.js
import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import Navbar from "./Components/Common/Navbar"; // Import your Navbar
import Footer from "./Components/Common/Footer";
import "./App.css";

function App() {
  return (
    <div className="App-container">
      {" "}
      {/* Use a div as a container for main layout */}
      {/* Render the Navbar (or other common elements) */}
      <Navbar />
      {/* This is where the content of the matched child route will be rendered */}
      <div className="main-content-area">
        {" "}
        {/* Optional: Wrap Outlet in a div */}
        <Outlet />
      </div>
      {/* Render the Footer */}
      <Footer /> {/* <<< NEW: Include the Footer component */}
    </div>
  );
}

export default App;
