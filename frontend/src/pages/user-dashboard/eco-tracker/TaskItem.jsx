import React from "react";

function TaskItem({ task, toggleTask, showTaskPopup }) {
  const handleCheck = () => {
    toggleTask(task.id);
    if (!task.done) {
      showTaskPopup(); // Show popup with the message
    }
  };

  return (
    <div className="task-item">
      <input type="checkbox" checked={task.done} onChange={handleCheck} />
      <span>{task.text}</span>
    </div>
  );
}

export default TaskItem;
