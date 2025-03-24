import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const EditUpcycling = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editingProject = location.state?.project || null; // Get project from navigation state

    const [formData, setFormData] = useState({
        projectTitle: "",
        description: "",
        materialsUsed: "",
        instructions: "",
        image: "",
    });

    // Load project details into the form
    useEffect(() => {
        if (editingProject) {
            setFormData(editingProject);
        }
    }, [editingProject]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/UpcyclingProjects/${editingProject._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Project updated successfully!");
                navigate("/recycling-directory"); // Redirect to the directory page
            } else {
                alert("Failed to update project.");
            }
        } catch (error) {
            console.error("Error updating project:", error);
            alert("An error occurred.");
        }
    };

    return (
        <div className="edit-upcycling-form">
            <h2>Edit Upcycling Project</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    placeholder="Project Title"
                    required
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                />
                <textarea
                    name="materialsUsed"
                    value={formData.materialsUsed}
                    onChange={handleChange}
                    placeholder="Materials Used"
                    required
                />
                <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Instructions"
                    required
                />
                <button type="submit">Update Project</button>
            </form>
        </div>
    );
};

export default EditUpcycling;
