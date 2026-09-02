import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { EditIcon, getIntegrationIcon, GitForkIcon } from '../Icons';
import './ListView.css';

const ListView = ({ onEditTask }) => {
  const { tasks, users, openTaskDetails } = useTasks();

  const groups = [
    { id: 'todo', title: 'To Do', colorVar: '--color-todo' },
    { id: 'inprogress', title: 'In Progress', colorVar: '--color-inprogress' },
    { id: 'inreview', title: 'In Review', colorVar: '--color-inreview' },
    { id: 'done', title: 'Done', colorVar: '--color-done' },
  ];

  return (
    <div className="list-view-container fade-in">
      {groups.map((group) => {
        const groupTasks = tasks.filter((task) => task.status === group.id);
        const countLabel = groupTasks.length < 10 ? `0${groupTasks.length}` : groupTasks.length;

        return (
          <div key={group.id} className="list-group">
            {/* Group Header */}
            <div className="list-group-header">
              <span
                className="list-group-dot"
                style={{ backgroundColor: `var(${group.colorVar})` }}
              />
              <span className="list-group-title">{group.title}</span>
              <span className="list-group-count">({countLabel})</span>
            </div>

            {/* Group Items */}
            <div className="list-items">
              {groupTasks.length === 0 ? (
                <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                  No tasks in this stage.
                </div>
              ) : (
                groupTasks.map((task) => {
                  const assigneeUsers = (task.assignees || [])
                    .map((aid) => users.find((u) => String(u.id) === String(aid)))
                    .filter(Boolean);

                  const commitsCount = (task.commits && task.commits.length) || 0;

                  return (
                    <div
                      key={task.id}
                      className="list-item-card"
                      onClick={() => openTaskDetails(task)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Left: Cover small thumbnail and Text details */}
                      <div className="list-item-left">
                        {task.image && (
                          <img
                            src={task.image}
                            alt=""
                            className="list-item-image"
                          />
                        )}
                        <div className="list-item-text-info">
                          <h4 className="list-item-title">
                            <span className="task-card-ticket-key" style={{ marginRight: '6px' }}>
                              {task.ticketKey || 'PLN-101'}
                            </span>
                            {task.title}

                            {task.githubIssueNumber && (
                              <a
                                href={task.githubIssueUrl || `https://github.com/${task.githubRepo}/issues/${task.githubIssueNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="task-card-gh-badge"
                                onClick={(e) => e.stopPropagation()}
                                style={{ textDecoration: 'none', marginLeft: '6px' }}
                                title={`Open #${task.githubIssueNumber} on GitHub`}
                              >
                                #{task.githubIssueNumber} ↗
                              </a>
                            )}

                            {commitsCount > 0 && (
                              <span className="task-card-commit-badge" style={{ marginLeft: '6px' }}>
                                <GitForkIcon size={10} />
                                <span>{commitsCount} commit{commitsCount > 1 ? 's' : ''}</span>
                              </span>
                            )}

                            {task.priority && (
                              <span className={`list-priority-badge list-priority-${task.priority}`}>
                                {task.priority}
                              </span>
                            )}
                          </h4>

                          {task.description && (
                            <p className="list-item-desc">{task.description}</p>
                          )}

                          {task.githubLabels && task.githubLabels.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                              {task.githubLabels.slice(0, 3).map((lbl, idx) => (
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
                        </div>
                      </div>

                      {/* Right: Date, Integration, Assignees, Edit */}
                      <div className="list-item-right">
                        {/* Due Date */}
                        <div className="list-item-date">{task.date}</div>

                        {/* Integration */}
                        <div className="list-item-integration">
                          {getIntegrationIcon(task.integration, 16)}
                          <span style={{ textTransform: 'capitalize' }}>
                            {task.integration === 'teams' ? 'Microsoft Team' : task.integration}
                          </span>
                        </div>

                        {/* Completion Progress Bar */}
                        {task.progress !== undefined && (
                          <div className="list-item-progress-container" title="Progress Completion">
                            <div className="list-item-progress-bar-bg">
                              <div
                                className="list-item-progress-bar-fill"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="list-item-progress-val">{task.progress}%</span>
                          </div>
                        )}

                        {/* Estimated Time */}
                        {task.estimatedTime && (
                          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', width: '70px' }}>
                            ⏱ {task.estimatedTime}
                          </div>
                        )}

                        {/* Assignees */}
                        <div className="list-item-assignees">
                          {assigneeUsers.slice(0, 3).map((u) => (
                            <div
                              key={u.id}
                              className="list-item-assignee-avatar"
                              style={{ backgroundColor: u.color }}
                              title={u.name}
                            >
                              {u.avatar_initials || u.initials || 'U'}
                            </div>
                          ))}
                          {(task.totalAssigneesCount || assigneeUsers.length) > 3 && (
                            <div
                              className="list-item-assignee-avatar"
                              style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                              title={`${(task.totalAssigneesCount || assigneeUsers.length) - 3} more`}
                            >
                              +{(task.totalAssigneesCount || assigneeUsers.length) - 3}
                            </div>
                          )}
                        </div>

                        {/* Edit Button */}
                        <button
                          className="list-item-btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          title="Edit task"
                        >
                          <EditIcon size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
