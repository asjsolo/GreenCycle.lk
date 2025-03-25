import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Upcycling.css";


const Upcycling = () => {

    const [formData, setFormData] = useState({
        projectTitle: "",
        description: "",
        materialsUsed: "",
        instructions: "",
        image: "",
    });

    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.projectTitle || !formData.description || !formData.materialsUsed || !formData.instructions) {
            setError("All fields are required!");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/UpcyclingProjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to submit project');
            
            const data = await response.json();
            console.log('Project saved:', data);
            setFormData({
                projectTitle: "",
                description: "",
                materialsUsed: "",
                instructions: "",
                image: ""
            });
            setError("");
            alert("Project submitted successfully!");
            navigate('/recycling'); // Redirect to directory
        } catch (error) {
            setError("Submission failed. Please try again.");
        }
    };

return (   

    
    <div className="form-container">        
        <h2 className="upcycling-submit-topic">Submit your Upcycling Project</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
            <label>Project Title:</label>
            <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="Enter project title"
                required
            />

            <label>Description:</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project..."
                rows="3"
                required
            />

            <label>Materials Used:</label>
            <textarea
                name="materialsUsed"
                value={formData.materialsUsed}
                onChange={handleChange}
                placeholder="List the materials used..."
                rows="3"
                required
            />

            <label>Instructions:</label>
            <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Provide step-by-step instructions..."
                rows="3"
                required
            />

            <label>Upload Image URL:</label><br />
            <input
                type="text"
                name="image"
                placeholder="Enter Image URL"
                value={formData.image}
                onChange={handleChange}
                className="form-input"
            /><br /><br />


            <button type="submit" className="submit-button">Submit Project</button>
        </form>
    </div>
    
);
};

export default Upcycling;
