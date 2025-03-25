import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import PopupMessage from "./PopupMessage";
import RecommendationBox from "./RecommendationBox";
import Analytics from "./Analytics";

import "./styles/EcoTracker.css";

function EcoTracker() {
  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);

  useEffect(() => {
    // Fetch tasks from backend or local storage
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);

    // Fetch recommendations from backend (or local storage for now)
    const savedRecs = JSON.parse(localStorage.getItem("recommendations")) || [];
    setRecommendations(savedRecs);
  }, []);

  const addTask = (task) => {
    const newTasks = [...tasks, { id: Date.now(), text: task, done: false }];
    setTasks(newTasks);
    localStorage.setItem("tasks", JSON.stringify(newTasks));
  };

  // Array of encouraging messages
  const messages = [
    "You saved a turtle today! 🐢",
    "Great job for going green! 🌍",
    "You're making the world a better place! 💚",
    "Keep up the eco-friendly habits! 🌱",
    "Every small action counts! 🌎",
    "You are an eco-hero! 🌟",
    "Way to save the planet! 🌍",
    "You're doing awesome! Keep it up! 💪",
  ];

  const showTaskPopup = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setPopupMessage(randomMessage);
    setShowPopUp(true);
    setTimeout(() => setShowPopUp(false), 1500); // Hide popup after 2 seconds
  };

  return (
    <div className="eco-tracker">
      <h2>Eco-Friendly Actions Tracker</h2>
      <RecommendationBox recommendations={recommendations} />
      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        addTask={addTask}
        showTaskPopup={showTaskPopup}
      />
      <Analytics tasks={tasks} />

      {showPopUp && (
        <PopupMessage
          message={popupMessage}
          onClose={() => setShowPopUp(false)}
        />
      )}
    </div>
  );
}

export default EcoTracker;
