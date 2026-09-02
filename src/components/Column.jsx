import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from './TaskCard';
import { PlusIcon, OptionsIcon } from './Icons';
import './Column.css';

const Column = ({ id, title, colorVar, tasks, onEditTask, onAddTask }) => {
  const { moveTask, draggedTaskId } = useTasks();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (draggedTaskId) {
      moveTask(draggedTaskId, id);
    }
  };

  // Format count to match design, e.g. "03" instead of "3"
  const formattedCount = tasks.length < 10 ? `0${tasks.length}` : tasks.length;

  return (
    <div className="column">
      {/* Column Header */}
      <div className="column-header">
        <div className="column-title-container">
          <span
            className="column-dot"
            style={{ backgroundColor: `var(${colorVar})` }}
          />
          <span className="column-title">{title}</span>
          <span className="column-count">({formattedCount})</span>
        </div>
        <div className="column-header-actions">
          <button
            className="column-btn"
            onClick={() => onAddTask(id)}
            title={`Add task to ${title}`}
          >
            <PlusIcon size={16} />
          </button>
          <button className="column-btn" title="Options">
            <OptionsIcon size={16} />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        className={`tasks-list ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onEditTask(task)} />
        ))}
      </div>
    </div>
  );
};

export default Column;
