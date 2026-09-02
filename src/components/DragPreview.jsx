import React from 'react';
import { useTasks } from '../context/TaskContext';
import { getIntegrationIcon } from './Icons';
import './TaskCard.css'; // Reuse card styling for structure

const DragPreview = () => {
  const { tasks, draggedTaskId, dragPosition, dragOffset, dragCardSize, users } = useTasks();

  if (!draggedTaskId) return null;

  const task = tasks.find((t) => t.id === draggedTaskId);
  if (!task) return null;

  const creator = users.find((u) => u.id === task.creatorId) || users[0];
  const assigneeUsers = task.assignees
    .map((aid) => users.find((u) => u.id === aid))
    .filter(Boolean);

  const maxVisibleAssignees = 2;
  const visibleAssignees = assigneeUsers.slice(0, maxVisibleAssignees);
  const remainingCount = task.totalAssigneesCount - visibleAssignees.length;

  const left = dragPosition.x - dragOffset.x;
  const top = dragPosition.y - dragOffset.y;

  return (
    <div
      className="task-card"
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${dragCardSize.width}px`,
        height: `${dragCardSize.height}px`,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'rotate(3deg)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05)',
        borderColor: 'var(--accent-color)',
        opacity: 0.9,
      }}
    >
      {/* Cover Image if present */}
      {task.image && (
        <img
          src={task.image}
          alt=""
          className="task-card-image"
          style={{ height: '120px' }} // Slightly scaled down in preview for aesthetics
        />
      )}

      {/* Main card body */}
      <div className="task-card-body" style={{ padding: '14px' }}>
        <div className="task-card-header">
          {!task.image && creator && (
            <div
              className="task-card-creator-avatar"
              style={{ backgroundColor: creator.color, width: '24px', height: '24px', fontSize: '0.65rem' }}
            >
              {creator.initials}
            </div>
          )}
          <div className="task-card-title-container">
            <span className="task-card-title" style={{ fontSize: '0.88rem' }}>
              {task.title}
            </span>
            <span className="task-card-date" style={{ fontSize: '0.68rem' }}>
              {task.date}
            </span>
          </div>
          {task.priority && (
            <span className={`priority-badge priority-${task.priority}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="task-card-desc" style={{ fontSize: '0.8rem', WebkitLineClamp: 2 }}>
            {task.description}
          </p>
        )}

        {task.progress !== undefined && (
          <div className="task-card-progress" style={{ marginTop: '6px', gap: '3px' }}>
            <div className="task-card-progress-header" style={{ fontSize: '0.65rem' }}>
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="task-card-progress-bar-bg" style={{ height: '3px' }}>
              <div
                className="task-card-progress-bar-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="task-card-footer" style={{ padding: '10px 14px' }}>
        <div className="task-card-integration" style={{ gap: '8px' }}>
          {getIntegrationIcon(task.integration, 16)}
          {task.estimatedTime && (
            <span className="task-card-est-time" style={{ fontSize: '0.65rem', padding: '1px 4px' }} title="Estimated Time">
              ⏱ {task.estimatedTime}
            </span>
          )}
        </div>

        <div className="task-card-assignees">
          {visibleAssignees.map((user) => (
            <div
              key={user.id}
              className="task-card-assignee"
              style={{ backgroundColor: user.color, width: '20px', height: '20px', fontSize: '0.55rem' }}
            >
              {user.initials}
            </div>
          ))}
          {remainingCount > 0 && (
            <div
              className="task-card-assignee counter"
              style={{ width: '20px', height: '20px', fontSize: '0.55rem' }}
            >
              {remainingCount}+
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragPreview;
