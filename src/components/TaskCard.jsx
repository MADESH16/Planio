import React from 'react';
import { useTasks } from '../context/TaskContext';
import { getIntegrationIcon, ExternalLinkIcon, GitForkIcon } from './Icons';
import './TaskCard.css';

const TaskCard = ({ task, onClick }) => {
  const {
    draggedTaskId,
    setDraggedTaskId,
    setDragPosition,
    setDragOffset,
    setDragCardSize,
    users,
    openTaskDetails,
  } = useTasks();

  // Find creator details
  const creator = users.find((u) => String(u.id) === String(task.creatorId)) || users[0];

  const handleDragStart = (e) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.effectAllowed = 'move';

    // Measure card coordinates and cursor offsets
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    setDragCardSize({ width: rect.width, height: rect.height });
    setDragPosition({ x: e.clientX, y: e.clientY });

    // Hide default browser dragging ghost shadow
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDrag = (e) => {
    if (e.clientX !== 0 && e.clientY !== 0) {
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  // Open GitHub Issue Link directly
  const handleGitHubClick = (e) => {
    e.stopPropagation();
    if (task.githubIssueUrl) {
      window.open(task.githubIssueUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = (e) => {
    // If click prop was provided, run it or open task details
    if (onClick) {
      onClick();
    } else {
      openTaskDetails(task);
    }
  };

  const commitsCount = (task.commits && task.commits.length) || 0;

  // Find assignee users for this card
  const assigneeUsers = (task.assignees || [])
    .map((aid) => users.find((u) => String(u.id) === String(aid)))
    .filter(Boolean);

  const maxVisibleAssignees = 2;
  const visibleAssignees = assigneeUsers.slice(0, maxVisibleAssignees);
  const remainingCount = (task.totalAssigneesCount || assigneeUsers.length) - visibleAssignees.length;

  return (
    <div
      className={`task-card fade-in ${draggedTaskId === task.id ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
    >
      {/* Cover Image if present */}
      {task.image && (
        <img
          src={task.image}
          alt={`${task.title} cover`}
          className="task-card-image"
          loading="lazy"
        />
      )}

      {/* Main card body */}
      <div className="task-card-body">
        {/* Creator Info & Ticket Key */}
        <div className="task-card-header">
          {!task.image && creator && (
            <div
              className="task-card-creator-avatar"
              style={{ backgroundColor: creator.color }}
            >
              {creator.initials}
            </div>
          )}

          <div className="task-card-title-container">
            <div className="task-card-key-row">
              <span className="task-card-ticket-key">{task.ticketKey || 'PLN-101'}</span>
              <span className="task-card-date">{task.date}</span>
            </div>
            <span className="task-card-title">{task.title}</span>
          </div>

          {task.priority && (
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority}
            </span>
          )}
        </div>

        {/* GitHub Issue Tag & Labels Bar */}
        {(task.githubIssueNumber || commitsCount > 0 || (task.githubLabels && task.githubLabels.length > 0)) && (
          <div className="task-card-gh-bar">
            {task.githubIssueNumber && (
              <button
                type="button"
                className="task-card-gh-badge"
                onClick={handleGitHubClick}
                title={`Open ${task.githubRepo || 'GitHub'} #${task.githubIssueNumber}`}
              >
                <span>#{task.githubIssueNumber}</span>
                <ExternalLinkIcon size={10} />
              </button>
            )}

            {commitsCount > 0 && (
              <span
                className="task-card-commit-badge"
                title={`${commitsCount} commit(s) attached to ${task.ticketKey}`}
              >
                <GitForkIcon size={10} />
                <span>{commitsCount} commit{commitsCount > 1 ? 's' : ''}</span>
              </span>
            )}

            {task.githubLabels?.slice(0, 2).map((lbl, idx) => (
              <span
                key={idx}
                className="task-card-gh-label"
                style={{
                  color: typeof lbl === 'object' && lbl.color ? lbl.color : 'var(--text-secondary)',
                  borderColor: typeof lbl === 'object' && lbl.color ? `${lbl.color}60` : 'var(--border-color)',
                  backgroundColor: typeof lbl === 'object' && lbl.color ? `${lbl.color}15` : 'transparent',
                }}
              >
                {typeof lbl === 'string' ? lbl : lbl.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}

        {/* Progress Bar */}
        {task.progress !== undefined && (
          <div className="task-card-progress">
            <div className="task-card-progress-header">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="task-card-progress-bar-bg">
              <div
                className="task-card-progress-bar-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="task-card-footer">
        {/* Integration Logo & Repo context */}
        <div className="task-card-integration" style={{ gap: '8px' }}>
          {getIntegrationIcon(task.integration, 18)}
          {task.githubRepo && (
            <span
              className="task-card-repo-tag"
              onClick={handleGitHubClick}
              title={`Repository: ${task.githubRepo}`}
            >
              {task.githubRepo.split('/')[1] || task.githubRepo}
            </span>
          )}
          {task.estimatedTime && (
            <span className="task-card-est-time" title="Estimated Time">
              ⏱ {task.estimatedTime}
            </span>
          )}
        </div>

        {/* Assignees */}
        <div className="task-card-assignees">
          {visibleAssignees.map((user) => (
            <div
              key={user.id}
              className="task-card-assignee"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.initials}
            </div>
          ))}
          {remainingCount > 0 && (
            <div
              className="task-card-assignee counter"
              title={`${remainingCount} more assignees`}
            >
              {remainingCount}+
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
