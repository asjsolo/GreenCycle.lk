import React, { useState } from "react";
import MainLayout from "../../Components/Layout/MainLayout";
import "./PlasticFootprintCalculator.css";

function PlasticFootprintCalculator() {
  const [bottles, setBottles] = useState("");
  const [bags, setBags] = useState("");
  const [straws, setStraws] = useState("");
  const [containers, setContainers] = useState("");
  const [wrappers, setWrappers] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // We'll add the calculation logic here
    console.log("Form submitted");
  };

  return (
    <MainLayout>
      <div className="home-container">
        <div className="container">
          <div className="header">
            <div className="text">Plastic Footprint Calculator</div>
            <div className="underline"></div>
          </div>
          <form onSubmit={handleSubmit} className="inputs">
            <div className="input">
              <label>Bottles:</label>
              <input type="number" name="bottles" value={bottles} onChange={(e) => setBottles(e.target.value)} />
            </div>
            <div className="input">
              <label>Bags:</label>
              <input type="number" name="bags" value={bags} onChange={(e) => setBags(e.target.value)} />
            </div>
            <div className="input">
              <label>Straws:</label>
              <input type="number" name="straws" value={straws} onChange={(e) => setStraws(e.target.value)} />
            </div>
            <div className="input">
              <label>Containers:</label>
              <input type="number" name="containers" value={containers} onChange={(e) => setContainers(e.target.value)} />
            </div>
            <div className="input">
              <label>Wrappers:</label>
              <input type="number" name="wrappers" value={wrappers} onChange={(e) => setWrappers(e.target.value)} />
            </div>
            <div className="submit-container">
              <button type="submit" className="submit">Calculate</button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default PlasticFootprintCalculator;