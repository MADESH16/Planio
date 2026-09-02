import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  CloseIcon,
  ExternalLinkIcon,
  PlusIcon,
  GitForkIcon,
  GithubIcon,
  CheckIcon,
  EditIcon,
  SyncIcon,
} from './Icons';
import './TaskDetailsModal.css';

const TaskDetailsModal = ({ task, onClose, onEditTask }) => {
  const { tasks, addCommitToTask, syncCommits, isSyncingCommits, showToast, users } = useTasks();
  const { user } = useAuth();

  const [commitHash, setCommitHash] = useState('');
  const [commitMessage, setCommitMessage] = useState(task ? `${task.ticketKey || 'PLN-101'}: ` : '');
  const [branch, setBranch] = useState('main');
  const [isAddingCommit, setIsAddingCommit] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!task) return null;

  const liveTask = (tasks && tasks.find((t) => t.id === task?.id || t.ticketKey === task?.ticketKey)) || task;
  const commits = liveTask.commits || [];
  const creator = users.find((u) => String(u.id) === String(liveTask.creatorId)) || users[0];

  const handleCopyKey = () => {
    if (task.ticketKey) {
      navigator.clipboard.writeText(task.ticketKey);
      setCopiedKey(true);
      showToast(`Copied ${task.ticketKey} to clipboard!`, 'info');
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleAddCommit = async (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    const hash = commitHash.trim() || Math.random().toString(16).substring(2, 9);
    const commitUrl = task.githubRepo ? `https://github.com/${task.githubRepo}/commit/${hash}` : null;

    const res = await addCommitToTask(task.id, {
      ticketKey: task.ticketKey,
      commitHash: hash,
      commitMessage: commitMessage.trim(),
      authorName: user ? user.name : 'Developer',
      authorEmail: user ? user.email : 'dev@planio.dev',
      branch,
      commitUrl,
    });

    if (res.success) {
      setCommitHash('');
      setCommitMessage(`${task.ticketKey || 'PLN-101'}: `);
      setIsAddingCommit(false);
      showToast(`Commit #${hash.slice(0, 7)} attached to ${task.ticketKey}!`, 'success');
    } else {
      showToast(res.error || 'Failed to attach commit', 'error');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'todo': return 'badge-todo';
      case 'inprogress': return 'badge-inprogress';
      case 'inreview': return 'badge-inreview';
      case 'done': return 'badge-done';
      default: return '';
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        className="task-modal-dialog fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal-header">
          <div className="task-modal-header-left">
            {/* Ticket Key Badge */}
            <div className="task-modal-ticket-pill" onClick={handleCopyKey} title="Click to copy ticket key">
              <span className="task-modal-ticket-key">{task.ticketKey || 'PLN-101'}</span>
              <span className="task-modal-copy-icon">{copiedKey ? '✓' : '⧉'}</span>
            </div>

            <span className={`badge ${getStatusClass(task.status)}`} style={{ textTransform: 'uppercase' }}>
              {task.status}
            </span>

            {task.priority && (
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority}
              </span>
            )}
          </div>

          <div className="task-modal-header-right">
            <button
              type="button"
              className="task-modal-btn-edit"
              onClick={() => {
                onClose();
                onEditTask(task);
              }}
              title="Edit Task"
            >
              <EditIcon size={16} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="task-modal-btn-close"
              onClick={onClose}
              title="Close"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="task-modal-body">
          {/* Title & Description */}
          <div className="task-modal-main-info">
            <h2 className="task-modal-title">{task.title}</h2>
            {task.description ? (
              <p className="task-modal-desc">{task.description}</p>
            ) : (
              <p className="task-modal-desc empty">No description provided for this ticket.</p>
            )}
          </div>

          {/* GitHub Connection Banner */}
          {(task.githubRepo || task.githubIssueNumber) && (
            <div className="task-modal-gh-bar">
              <div className="task-modal-gh-left">
                <GithubIcon size={18} />
                <span className="task-modal-gh-repo">{task.githubRepo || 'GitHub Linked'}</span>
                {task.githubIssueNumber && (
                  <a
                    href={task.githubIssueUrl || `https://github.com/${task.githubRepo}/issues/${task.githubIssueNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="task-modal-gh-issue-link"
                  >
                    Issue #{task.githubIssueNumber}
                    <ExternalLinkIcon size={12} />
                  </a>
                )}
              </div>

              {task.githubLabels && task.githubLabels.length > 0 && (
                <div className="task-modal-gh-labels">
                  {task.githubLabels.map((lbl, idx) => (
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
          )}

          {/* Meta Details Grid */}
          <div className="task-modal-meta-grid">
            <div className="task-modal-meta-item">
              <span className="meta-label">Created By</span>
              <div className="meta-user">
                <div
                  className="meta-avatar"
                  style={{ backgroundColor: creator?.color || '#3b82f6' }}
                >
                  {creator?.initials || 'DR'}
                </div>
                <span>{creator?.name || 'Darlene Robertson'}</span>
              </div>
            </div>

            <div className="task-modal-meta-item">
              <span className="meta-label">Due / Scheduled</span>
              <span className="meta-val">{task.date || 'No date'}</span>
            </div>

            <div className="task-modal-meta-item">
              <span className="meta-label">Est. Time</span>
              <span className="meta-val">{task.estimatedTime ? `⏱ ${task.estimatedTime}` : 'None'}</span>
            </div>

            <div className="task-modal-meta-item">
              <span className="meta-label">Progress</span>
              <div className="meta-progress">
                <div className="meta-progress-bar-bg">
                  <div
                    className="meta-progress-bar-fill"
                    style={{ width: `${task.progress || 0}%` }}
                  />
                </div>
                <span>{task.progress || 0}%</span>
              </div>
            </div>
          </div>

          {/* LINKED GIT COMMITS SECTION */}
          <div className="task-modal-commits-section">
            <div className="commits-header">
              <div className="commits-title-box">
                <GitForkIcon size={18} />
                <h4 className="commits-title">
                  Linked Git Commits ({commits.length})
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-sync-git-cmd"
                  onClick={() => syncCommits(false)}
                  disabled={isSyncingCommits}
                  title="Sync commits from Git repository"
                >
                  <SyncIcon size={13} className={isSyncingCommits ? 'spin' : ''} />
                  <span>{isSyncingCommits ? 'Syncing...' : 'Sync Commits'}</span>
                </button>
                <button
                  type="button"
                  className="btn-add-commit-toggle"
                  onClick={() => setIsAddingCommit(!isAddingCommit)}
                >
                  <PlusIcon size={14} />
                  <span>{isAddingCommit ? 'Cancel' : 'Link Commit'}</span>
                </button>
              </div>
            </div>

            {/* Add Commit Form */}
            {isAddingCommit && (
              <form onSubmit={handleAddCommit} className="add-commit-form fade-in">
                <div className="commit-form-row">
                  <div className="commit-form-group">
                    <label className="commit-label">Commit Hash (SHA)</label>
                    <input
                      type="text"
                      className="commit-input"
                      placeholder="e.g. 9f8b2a1 (or leave blank to generate)"
                      value={commitHash}
                      onChange={(e) => setCommitHash(e.target.value)}
                    />
                  </div>
                  <div className="commit-form-group" style={{ maxWidth: '140px' }}>
                    <label className="commit-label">Branch</label>
                    <input
                      type="text"
                      className="commit-input"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="commit-form-group">
                  <label className="commit-label">Commit Message</label>
                  <input
                    type="text"
                    className="commit-input"
                    placeholder="e.g. PLN-101: Add authentication controller"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="commit-form-actions">
                  <button type="submit" className="btn-commit-submit">
                    Attach Commit to {task.ticketKey}
                  </button>
                </div>
              </form>
            )}

            {/* Commits List */}
            {commits.length === 0 ? (
              <div className="commits-empty-state">
                <p>No commits linked to <strong>{task.ticketKey}</strong> yet.</p>
                <span className="commits-hint">
                  Include <code>{task.ticketKey}</code> in your git commit message (e.g. <code>git commit -m "{task.ticketKey}: message"</code>) to link automatically.
                </span>
              </div>
            ) : (
              <div className="commits-list">
                {commits.map((commit, idx) => (
                  <div key={commit.id || idx} className="commit-card fade-in">
                    <div className="commit-card-left">
                      <div className="commit-hash-badge">
                        <code>{commit.commit_hash || commit.commitHash}</code>
                      </div>
                      <div className="commit-details">
                        <span className="commit-msg">{commit.commit_message || commit.commitMessage}</span>
                        <div className="commit-meta">
                          <span className="commit-author">👤 {commit.author_name || commit.authorName}</span>
                          <span className="commit-branch">🌿 {commit.branch || 'main'}</span>
                        </div>
                      </div>
                    </div>

                    {(commit.commit_url || commit.commitUrl) && (
                      <a
                        href={commit.commit_url || commit.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="commit-link-external"
                        title="View commit on GitHub"
                      >
                        <ExternalLinkIcon size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
