import React from 'react';
import { useTasks } from '../context/TaskContext';
import Column from './Column';
import './Board.css';

const Board = ({ onEditTask, onAddTask }) => {
  const { tasks } = useTasks();

  const columns = [
    { id: 'todo', title: 'To Do', colorVar: '--color-todo' },
    { id: 'inprogress', title: 'In Progress', colorVar: '--color-inprogress' },
    { id: 'inreview', title: 'In Review', colorVar: '--color-inreview' },
    { id: 'done', title: 'Done', colorVar: '--color-done' },
  ];

  return (
    <div className="board-container">
      {columns.map((column) => {
        // Filter tasks for this column status
        const columnTasks = tasks.filter((task) => task.status === column.id);

        return (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            colorVar={column.colorVar}
            tasks={columnTasks}
            onEditTask={onEditTask}
            onAddTask={onAddTask}
          />
        );
      })}
    </div>
  );
};

export default Board;
