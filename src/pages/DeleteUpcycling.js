import React from "react";
import { useNavigate, useLocation } from "react-router-dom";


const DeleteUpcycling = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const project = location.state?.project;

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/UpcyclingProjects/${project._id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Project deleted successfully!");
                navigate("/", { state: { refresh: true } });
            } else {
                alert("Failed to delete project.");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("An error occurred.");
        }
    };

    return (
        <div className="delete-confirmation">
            <h2>Delete Project</h2>
            <p>Are you sure you want to delete "{project?.projectTitle}"?</p>
            <div className="button-group">
                <button onClick={() => navigate(-1)} className="cancel-btn">
                    Cancel
                </button>
                <button onClick={handleDelete} className="delete-btn">
                    Confirm Delete
                </button>
            </div>
        </div>
    );
};

export default DeleteUpcycling;
