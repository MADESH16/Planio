import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { EditIcon, getIntegrationIcon, GitForkIcon } from '../Icons';
import './TableView.css';

const TableView = ({ onEditTask }) => {
  const { tasks, users, openTaskDetails } = useTasks();

  const getStatusClass = (status) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'inprogress': return 'status-inprogress';
      case 'inreview': return 'status-inreview';
      case 'done': return 'status-done';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'inprogress': return 'In Progress';
      case 'inreview': return 'In Review';
      case 'done': return 'Done';
      default: return status;
    }
  };

  return (
    <div className="table-view-container fade-in">
      <div className="table-wrapper">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Ticket & Task Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Completion</th>
              <th>Estimated Time</th>
              <th>Assignees</th>
              <th>Due Date</th>
              <th>Integration</th>
              <th style={{ width: '80px', textAlignment: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No tasks found. Create one to get started!
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const assigneeUsers = (task.assignees || [])
                  .map((aid) => users.find((u) => String(u.id) === String(aid)))
                  .filter(Boolean);

                const commitsCount = (task.commits && task.commits.length) || 0;

                return (
                  <tr
                    key={task.id}
                    onClick={() => openTaskDetails(task)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Task Title with Ticket Key */}
                    <td>
                      <div className="table-task-info">
                        {task.image && (
                          <img
                            src={task.image}
                            alt=""
                            className="table-task-img"
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="task-card-ticket-key">{task.ticketKey || 'PLN-101'}</span>
                            <span className="table-task-title">{task.title}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {task.githubIssueNumber && (
                              <a
                                href={task.githubIssueUrl || `https://github.com/${task.githubRepo}/issues/${task.githubIssueNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="task-card-gh-badge"
                                onClick={(e) => e.stopPropagation()}
                                style={{ textDecoration: 'none' }}
                                title={`Open on GitHub (${task.githubRepo})`}
                              >
                                #{task.githubIssueNumber} ↗
                              </a>
                            )}
                            {commitsCount > 0 && (
                              <span className="task-card-commit-badge" title={`${commitsCount} commits`}>
                                <GitForkIcon size={10} />
                                <span>{commitsCount} commit{commitsCount > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            {task.githubRepo && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {task.githubRepo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td>
                      <span className={`table-priority-badge table-priority-${task.priority || 'medium'}`}>
                        {task.priority || 'medium'}
                      </span>
                    </td>

                    {/* Completion Progress Bar */}
                    <td>
                      <div className="table-progress-container">
                        <div className="table-progress-bar-bg">
                          <div
                            className="table-progress-bar-fill"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="table-progress-val">{task.progress || 0}%</span>
                      </div>
                    </td>

                    {/* Estimated Time */}
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {task.estimatedTime ? `⏱ ${task.estimatedTime}` : '-'}
                    </td>

                    {/* Assignees */}
                    <td>
                      <div className="table-assignees">
                        {assigneeUsers.slice(0, 3).map((u) => (
                          <div
                            key={u.id}
                            className="table-assignee-avatar"
                            style={{ backgroundColor: u.color }}
                            title={u.name}
                          >
                            {u.avatar_initials || u.initials || 'U'}
                          </div>
                        ))}
                        {(task.totalAssigneesCount || assigneeUsers.length) > 3 && (
                          <div
                            className="table-assignee-avatar"
                            style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                            title={`${(task.totalAssigneesCount || assigneeUsers.length) - 3} more`}
                          >
                            +{(task.totalAssigneesCount || assigneeUsers.length) - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {task.date}
                    </td>

                    {/* Integration */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getIntegrationIcon(task.integration, 16)}
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {task.integration === 'teams' ? 'Microsoft Team' : task.integration}
                        </span>
                      </div>
                    </td>

                    {/* Edit Action */}
                    <td>
                      <button
                        className="table-btn-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        title="Edit task"
                      >
                        <EditIcon size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableView;
