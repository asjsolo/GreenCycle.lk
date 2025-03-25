import React, { useState } from "react";
import TaskItem from "./TaskItem";
import "./styles/TaskList.css";

function TaskList({ tasks, setTasks, addTask, showTaskPopup }) {
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      addTask(newTask); // Call addTask function
      setNewTask(""); // Clear input field
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div className="task-list">
      <h3>Your Eco-Friendly To-Do List ✅</h3>

      {/* Task Input Field */}
      <div className="task-input">
        <input
          type="text"
          placeholder="Enter a new eco-friendly action..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      {/* Task Items */}
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          toggleTask={toggleTask}
          showTaskPopup={showTaskPopup}
        />
      ))}
    </div>
  );
}

export default TaskList;
