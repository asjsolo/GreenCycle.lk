import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RecyclingDirectory from "./pages/Recycling";
import Upcycling from "./pages/Upcycling";
import EditUpcycling from "./pages/EditUpcycling";
import DeleteUpcycling from "./pages/DeleteUpcycling";


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RecyclingDirectory />} />
          <Route path="/upcycling" element={<Upcycling />} />
          <Route path="/edit-upcycling" element={<EditUpcycling />} />
          <Route path="/delete-upcycling" element={<DeleteUpcycling />} />
         
        </Routes>
      </div>
    </Router>

  );
}

export default App;
