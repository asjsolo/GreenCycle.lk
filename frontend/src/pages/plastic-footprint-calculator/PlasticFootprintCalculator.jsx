import React, { useState } from "react";
import MainLayout from "../../Components/Layout/MainLayout";
import "./PlasticFootprintCalculator.css";


function PlasticFootprintCalculator() {
    const [bottles, setBottles] = useState("");
    const [bags, setBags] = useState("");
    const [straws, setStraws] = useState("");
    const [containers, setContainers] = useState("");
    const [wrappers, setWrappers] = useState("");
    const [result, setResult] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [calculationPerformed, setCalculationPerformed] = useState(false); // ADD THIS STATE

    const handleCalculate = async () => {
        // Handle empty input fields and parse to integers
        const bottlesValue = bottles === "" ? 0 : parseInt(bottles);
        const bagsValue = bags === "" ? 0 : parseInt(bags);
        const strawsValue = straws === "" ? 0 : parseInt(straws);
        const containersValue = containers === "" ? 0 : parseInt(containers);
        const wrappersValue = wrappers === "" ? 0 : parseInt(wrappers);

        // Input Validation
        if (
            isNaN(bottlesValue) ||
            isNaN(bagsValue) ||
            isNaN(strawsValue) ||
            isNaN(containersValue) ||
            isNaN(wrappersValue)
        ) {
            console.error("Invalid input values");
            return; // Stop execution if any input is invalid
        }

        try {
            const response = await fetch("http://localhost:4000/api/footprint/calculate", {
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

            if (response.ok) {
                const data = await response.json();
                setResult(data);
                setCalculationPerformed(true); // SET THIS TO TRUE ON SUCCESS
                   // --- Save data to local storage ---
                   const historyEntry = {
                    timestamp: new Date().toISOString(),
                    bottles: bottlesValue,
                    bags: bagsValue,
                    straws: strawsValue,
                    containers: containersValue,
                    wrappers: wrappersValue,
                    carbonFootprint: data.carbonFootprint,
                    ecoScore: data.points,
                };

                // Get existing history from local storage
                const storedHistory = localStorage.getItem('plasticUsageHistory');
                const historyArray = storedHistory ? JSON.parse(storedHistory) : [];

                // Add the new entry to the history array
                historyArray.push(historyEntry);

                // Store the updated history back in local storage
                localStorage.setItem('plasticUsageHistory', JSON.stringify(historyArray));
                // --- End of saving to local storage ---
            } else {
                console.error("Calculation failed");
                setCalculationPerformed(false); // Reset if calculation fails
            }
        } catch (error) {
            console.error("Error:", error);
            setCalculationPerformed(false); // Reset on error
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCalculate();
    };

    const handleInputChange = (setState) => (e) => {
        const newValue = parseInt(e.target.value);
        setState(newValue < 0 ? "0" : e.target.value);
    };

    return (
        <MainLayout>
            <div className="plastic-calculator-home-container">
                <div className="plastic-calculator-container">
                    <div className="plastic-calculator-header">
                        <div className="plastic-calculator-text">Plastic Footprint Calculator</div>
                        <div className="plastic-calculator-underline"></div>
                    </div>
                    <form onSubmit={handleSubmit} className="inputs">
                        <div className="plastic-calculator-input">
                            <label>Bottles:</label>
                            <input type="number" name="bottles" value={bottles} onChange={handleInputChange(setBottles)} />
                        </div>
                        <div className="plastic-calculator-input">
                            <label>Bags:</label>
                            <input type="number" name="bags" value={bags} onChange={handleInputChange(setBags)} />
                        </div>
                        <div className="plastic-calculator-input">
                            <label>Straws:</label>
                            <input type="number" name="straws" value={straws} onChange={handleInputChange(setStraws)} />
                        </div>
                        <div className="plastic-calculator-input">
                            <label>Containers:</label>
                            <input type="number" name="containers" value={containers} onChange={handleInputChange(setContainers)} />
                        </div>
                        <div className="plastic-calculator-input">
                            <label>Wrappers:</label>
                            <input type="number" name="wrappers" value={wrappers} onChange={handleInputChange(setWrappers)} />
                        </div>
                        <div className="plastic-calculator-submit-container">
                            <button type="submit" className="plastic-calculator-submit">Calculate</button>
                        </div>
                    </form>

                    {result !== null && (
                        <div className="plastic-calculator-result-container">
                            <p>Carbon Footprint: {result.carbonFootprint.toFixed(2)} kg CO2e</p>
                            <p>
                                Eco Score: {result.points} / 100
                            </p>
                            <p className="plastic-calculator-score-explanation">
                                Higher score means a lower plastic footprint and better environmental impact.
                            </p>
                            <button className="plastic-calculator-learn-more-button" onClick={() => setShowBreakdown(true)}>Learn More</button>
                            
                        </div>
                    )}

                    {showBreakdown && (
                        <div className="plastic-calculator-breakdown-modal">
                            <h2>Understanding Your Eco Score</h2>
                            <p>Your Eco Score is calculated based on your estimated daily usage of common single-use plastic items.</p>
                            <p>Here's a breakdown of your estimated carbon footprint from these items:</p>
                            <ul>
                                <li>Bottles: {bottles === "" ? 0 : bottles} x 0.1 kg CO2e = {((bottles === "" ? 0 : bottles) * 0.1).toFixed(2)} kg CO2e</li>
                                <li>Bags: {bags === "" ? 0 : bags} x 0.05 kg CO2e = {((bags === "" ? 0 : bags) * 0.05).toFixed(2)} kg CO2e</li>
                                <li>Straws: {straws === "" ? 0 : straws} x 0.01 kg CO2e = {((straws === "" ? 0 : straws) * 0.01).toFixed(2)} kg CO2e</li>
                                <li>Containers: {containers === "" ? 0 : containers} x 0.2 kg CO2e = {((containers === "" ? 0 : containers) * 0.2).toFixed(2)} kg CO2e</li>
                                <li>Wrappers: {wrappers === "" ? 0 : wrappers} x 0.03 kg CO2e = {((wrappers === "" ? 0 : wrappers) * 0.03).toFixed(2)} kg CO2e</li>
                            </ul>
                            <p><strong>Your Total Estimated Carbon Footprint: {result !== null ? result.carbonFootprint.toFixed(2) : "0.00"} kg CO2e</strong></p>

                            <div className="plastic-calculator-eco-score-explanation">
                                <h3>Your Eco Score: {result !== null ? result.points : "0"} / 100</h3>
                                <p>This score represents your environmental impact from the plastic items you entered, on a scale of 0 to 100.</p>
                                {result && result.points > 20 ? (
                                    <>
                                        <p>A <strong>higher score</strong> (closer to 100) means a <strong>lower estimated plastic footprint</strong> and therefore a <strong>better environmental performance</strong> compared to a defined higher usage baseline.</p>
                                        <p>A <strong>lower score</strong> indicates a <strong>higher estimated plastic footprint</strong>, suggesting more opportunities to reduce your impact.</p>
                                        <p>Keep track of your score and strive for a higher number by reducing your daily consumption of these plastic items!</p>
                                    </>
                                ) : (
                                    <>
                                        <p>Your current score suggests a higher plastic footprint. Here are some things you might consider to reduce your impact:</p>
                                        <ul>
                                            {bottles > 15 && <li>Try to reduce your use of single-use plastic bottles. Consider reusable water bottles.</li>}
                                            {bags > 40 && <li>Opt for reusable shopping bags instead of single-use plastic bags.</li>}
                                            {straws > 80 && <li>Decline single-use plastic straws. If needed, use reusable alternatives.</li>}
                                            {containers > 8 && <li>Use reusable food containers instead of disposable ones.</li>}
                                            {wrappers > 25 && <li>Look for products with less packaging or reusable wrapping options.</li>}
                                        </ul>
                                        <p>Even small changes can make a big difference over time. Keep trying!</p>
                                    </>
                                )}
                            </div>

                            <button className="plastic-calculator-close-button" onClick={() => setShowBreakdown(false)}>Close</button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default PlasticFootprintCalculator;