//import React from "react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Recycling.css";
import upcyclingImage from "../images/Lets.png";
import image2 from "../images/image2.png";
import image3 from "../images/image3.png";
import image4 from "../images/image4.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const RecyclingDirectory = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);



  // Function to search recycling centers by name or location
  const searchRecyclingCenters = async (query) => {
    try {
      const response = await fetch(`http://localhost:5000/RecyclingCenters/search?query=${query}`);
      const data = await response.json();
      if (data.recyclingCenters) {
        setSearchResults(data.recyclingCenters); // Update search results state
      } else {
        setSearchResults([]); // No results found
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]); // Error, set empty results
    }
  };

  //display data fetch from db
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:5000/UpcyclingProjects");
        console.log("Response:", response);
        const data = await response.json();
        console.log("Data", data);
        setProjects(data.upcyclingProjects); // Access the upcyclingProjects array
      } catch (err) {
        console.error("Could not fetch projects:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Handle search input change and search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    searchRecyclingCenters(e.target.value); // Trigger search on change
  };


  // Handle edit upcycling project data
  const handleEdit = (project) => {
    navigate("/edit-upcycling", { state: { project } });
  };

  //Handle delete upcycling project
  const handleDelete = (project) => {
    navigate("/delete-upcycling", { state: { project } });
  };


  //image slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
   
    
    <div className="container">
      <header className="header">
        <h1 className="title">♻️ Recycling Centers</h1>
        
        {/*Search box*/}
        <div className="search-box ">
          <label>Location</label>
          <input
            type="text"
            placeholder="Search recycling centers..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="search-btn" onClick={() => searchRecyclingCenters(searchTerm)}>
            Search
          </button></div>

        {/*Map button*/}
        <div className="header-buttons">
          <button className="map-button">
            View Map
          </button></div>

      </header>


      {/* Display search results for Recycling Centers in a table */}
      <section className="recycling-section">
        {searchResults.length > 0 ? (
          <table className="recycling-table">
            <thead>
              <tr>
                <th>Center Name</th>
                <th>Location</th>
                <th>Contact Number</th>
                <th>Materials Accepted</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((center) => (
                <tr key={center._id}>
                  <td>{center.centerName}</td>
                  <td>{center.location}</td>
                  <td>{center.contactNumber}</td>
                  <td>{center.materialsAccepted.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recycling centers found for "{searchTerm}"</p>
        )}
      </section>

      <Slider {...settings} className="image-carousel">

        <img src={image2} alt="Upcycling Example 2" className="contribute-carousel-image" />
        <img src={image3} alt="Upcycling Example 3" className="contribute-carousel-image" />
        <img src={image4} alt="Upcycling Example 4" className="contribute-carousel-image" />
      </Slider>


      {/* Upcycling Ideas Section */}
      <section className="upcycling-section">
        <h2 className="section-title">Up-Cycling Ideas</h2>
        <p className="upcycling-description">Explore creative ways to reuse plastic and other materials.</p>


        {/* Display Upcycling Projects */}
        <div className="grid-container">
          {projects.map((project) => (
            <div className="card" key={project._id}>{project.image && <img src={project.image} alt={project.projectTitle} className="project-image" />}
              <h3>{project.projectTitle}</h3>
              <p className="decription">{project.description}</p>
              <h4>Needed Materials:</h4>
              <p className="material">{project.materialsUsed}</p>
              <h4>Instructions:</h4>
              <p className="instructions">{project.instructions}</p>
              <div className="button-container">
                <button onClick={() => handleEdit(project)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(project)} className="delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* upcycling project contribution section */}
      <div className="project">
        <h2 className="contribute-title">Contribute your own Up-Cycling Project</h2>

        <img src={upcyclingImage} alt="Upcycling Example 1" className="contribute-carousel-image" />
        <button
          onClick={() => navigate("/upcycling")}
          className="project-button">
          Post a Project
        </button>

      </div>


      <br />

    </div>
  );
};

export default RecyclingDirectory;
