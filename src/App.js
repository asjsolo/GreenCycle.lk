import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RecyclingDirectory from "./pages/Recycling";
import Upcycling from "./pages/Upcycling";


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RecyclingDirectory />} /> 
          <Route path="/upcycling" element={<Upcycling />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
