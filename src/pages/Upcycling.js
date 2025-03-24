import React, { useState } from "react";
import "../components/Upcycling.css";

const Upcycling = () => {
    const [formData, setFormData] = useState({
        projectTitle: "",
        description: "",
        materialsUsed: "",
        instructions: "",
        image: null,
    });

    const [error, setError] = useState("");

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle Image Upload
    const handleImageUpload = (e) => {
        setFormData((prevData) => ({ ...prevData, image: e.target.files[0] }));
    };

    // Handle Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.projectTitle || !formData.description || !formData.materialsUsed || !formData.instructions) {
            setError("All fields are required!");
            return;
        }

        console.log("Submitted Data:", formData);
        setError("");
        alert("Your upcycling project has been submitted!");
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
                
                <label>Upload Image:</label><br/>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="form-input" 
                /><br/><br/>
                
                <button type="submit" className="submit-button">Submit Project</button>
            </form>
        </div>
    );
};

export default Upcycling;
