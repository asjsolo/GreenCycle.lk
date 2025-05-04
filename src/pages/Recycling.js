import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../components/Recycling.css";
import upcyclingImage from "../images/Lets.png";
import image2 from "../images/image2.png";
import image3 from "../images/image3.png";
import image4 from "../images/image4.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper to wait for images to load in a container
function waitForImagesToLoad(container) {
  const images = container.querySelectorAll('img');
  const promises = [];
  images.forEach(img => {
    if (!img.complete) {
      promises.push(new Promise(resolve => {
        img.onload = img.onerror = resolve;
      }));
    }
  });
  return Promise.all(promises);
}

const RecyclingDirectory = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Fetch recycling centers by name or location
  const searchRecyclingCenters = async (query) => {
    try {
      const response = await fetch(`http://localhost:5000/RecyclingCenters/search?query=${query}`);
      const data = await response.json();
      if (data.recyclingCenters) {
        setSearchResults(data.recyclingCenters);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    }
  };

  // Fetch upcycling projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/UpcyclingProjects");
        const data = await response.json();
        setProjects(data.upcyclingProjects);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    searchRecyclingCenters(e.target.value);
  };

  // Handle edit project
  const handleEdit = (project) => {
    navigate("/edit-upcycling", { state: { project } });
  };

  // Handle delete project
  const handleDelete = (project) => {
    navigate("/delete-upcycling", { state: { project } });
  };

  // PDF generation using jsPDF's html() for best results
  const handleDownloadAllProjectsPDF = async () => {
    const input = document.getElementById('all-projects-summary');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
  
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    // Get image dimensions
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
    let heightLeft = imgHeight;
    let position = 0;
  
    // Add the first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  
    // Add more pages if necessary
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  
    pdf.save('All-Upcycling-Projects-Report.pdf');
  };
  
  // Image slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">♻️ Recycling Centers</h1>
        {/* Search box */}
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
          </button>
        </div>
        {/* Map button */}
        <div className="header-buttons">
          <button className="map-button" onClick={() => navigate("/recycling-map")}>
            View Map
          </button>
        </div>
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

      {/* Image slider */}
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
            <div className="card" key={project._id}>
              {project.image && <img src={project.image} alt={project.projectTitle} className="project-image" />}
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




      {/* Download PDF Button */}
      <div className="report">
        <h2 className="contribute-title">Review Submitted Project Reports</h2>
        <button
          onClick={handleDownloadAllProjectsPDF}
          className="project-button">
          Download All Projects Report
        </button>
      </div>

      {/* Hidden summary section for PDF */}
      <div
        id="all-projects-summary"
        className="hidden-for-pdf"
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>All Upcycling Projects Summary</h2>
        {projects.map((project, idx) => (
          <div
            key={project._id}
            style={{
              border: "1px solid #ccc",
              margin: "15px 0",
              padding: "10px",
              borderRadius: "8px",
              background: "#fafafa"
            }}
          >
            <h3 style={{ marginBottom: "8px" }}>{idx + 1}. {project.projectTitle}</h3>
            <p className="justified-text"><strong>Description:</strong> {project.description}</p>
            <p className="justified-text"><strong>Materials Used:</strong> {project.materialsUsed}</p>
            <p className="justified-text"><strong>Instructions:</strong> {project.instructions}</p>
            {project.image && (
              <img
                src={project.image}
                alt={project.projectTitle}
                className="project-summary-image"
              />
            )}
          </div>
        ))}
      </div>




      <br />
    </div>
  );
};

export default RecyclingDirectory;
