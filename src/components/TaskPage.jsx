import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  PlusIcon,
  GithubIcon,
  ExternalLinkIcon,
  CheckIcon,
} from './Icons';
import './TaskPage.css';

const AVAILABLE_GITHUB_LABELS = [
  { name: 'bug', color: '#ef4444' },
  { name: 'enhancement', color: '#3b82f6' },
  { name: 'feature', color: '#10b981' },
  { name: 'documentation', color: '#8b5cf6' },
  { name: 'urgent', color: '#f59e0b' },
  { name: 'help wanted', color: '#ec4899' },
];

const TaskPage = ({ taskToEdit = null, defaultColumnId = 'todo', onCancel }) => {
  const {
    addTask,
    updateTask,
    deleteTask,
    users,
    linkedRepo,
    setIsGitHubModalOpen,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [integration, setIntegration] = useState('github');
  const [assignees, setAssignees] = useState(['u1']);
  const [image, setImage] = useState(null);
  const [date, setDate] = useState('');

  // GitHub Specific States
  const [createOnGitHub, setCreateOnGitHub] = useState(false);
  const [githubIssueNumber, setGithubIssueNumber] = useState('');
  const [githubIssueUrl, setGithubIssueUrl] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
      setPriority(taskToEdit.priority || 'medium');
      setProgress(taskToEdit.progress !== undefined ? taskToEdit.progress : 0);
      setEstimatedTime(taskToEdit.estimatedTime || '');
      setIntegration(taskToEdit.integration || 'github');
      setAssignees(taskToEdit.assignees || ['u1']);
      setImage(taskToEdit.image || null);
      setDate(taskToEdit.date || '');
      setGithubIssueNumber(taskToEdit.githubIssueNumber ? String(taskToEdit.githubIssueNumber) : '');
      setGithubIssueUrl(taskToEdit.githubIssueUrl || '');
      setSelectedLabels(taskToEdit.githubLabels?.map((l) => (typeof l === 'string' ? l : l.name)) || []);
      setCreateOnGitHub(false);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultColumnId);
      setPriority('medium');
      setProgress(0);
      setEstimatedTime('');
      setIntegration('github');
      setAssignees(['u1']);
      setImage(null);
      setGithubIssueNumber('');
      setGithubIssueUrl('');
      setSelectedLabels(['enhancement']);
      setCreateOnGitHub(Boolean(linkedRepo));
      // Default formatted date
      const now = new Date();
      setDate(
        now.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    }
  }, [taskToEdit, defaultColumnId, linkedRepo]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAssigneeChange = (userId) => {
    setAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleGitHubLabel = (labelName) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const taskData = {
      title,
      description,
      status,
      priority,
      progress: Number(progress),
      estimatedTime,
      integration,
      assignees,
      image,
      date,
      creatorId: taskToEdit ? taskToEdit.creatorId : 'u1',
      // GitHub properties
      createOnGitHub: !taskToEdit && createOnGitHub && integration === 'github',
      githubRepo: integration === 'github' ? (taskToEdit?.githubRepo || (linkedRepo ? linkedRepo.fullName : null)) : null,
      githubIssueNumber: githubIssueNumber ? Number(githubIssueNumber) : undefined,
      githubIssueUrl: githubIssueUrl || undefined,
      githubLabels: selectedLabels.map((name) => {
        const found = AVAILABLE_GITHUB_LABELS.find((l) => l.name === name);
        return { name, color: found ? found.color : '#6b7280' };
      }),
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      await addTask(taskData);
    }

    setIsSubmitting(false);
    onCancel();
  };

  const handleDelete = () => {
    if (taskToEdit) {
      if (window.confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskToEdit.id);
        onCancel();
      }
    }
  };

  return (
    <div className="task-page-container">
      {/* Page Header (Toolbar actions embedded) */}
      <div className="task-page-header">
        <div className="task-page-header-left">
          <button type="button" className="btn-back" onClick={onCancel}>
            &larr; Back
          </button>
          <h2 className="task-page-title">
            {taskToEdit ? 'Edit Task details' : 'Create Task'}
          </h2>
        </div>
        <div className="header-actions">
          {taskToEdit && (
            <button
              type="button"
              className="btn-delete"
              onClick={handleDelete}
            >
              Delete Task
            </button>
          )}
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : taskToEdit
              ? 'Save Changes'
              : 'Create Task'}
          </button>
        </div>
      </div>

      {/* Modern Two-column Split Layout Grid */}
      <div className="task-editor-layout">
        {/* Left main panel: Content */}
        <div className="editor-main-panel">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Subject / Title</label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '1.15rem', fontWeight: '700', padding: '14px 18px' }}
              placeholder="e.g. Implement user authentication or Fix API route"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-input"
              style={{ minHeight: '180px', resize: 'vertical', lineHeight: '1.6' }}
              placeholder="Write detailed notes, acceptance criteria, or deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* GitHub Integration Box (when integration === 'github') */}
          {integration === 'github' && (
            <div className="task-gh-integration-box fade-in">
              <div className="task-gh-box-header">
                <div className="task-gh-box-title">
                  <GithubIcon size={20} />
                  <span>GitHub Repository Connection</span>
                </div>
                {linkedRepo ? (
                  <button
                    type="button"
                    className="task-gh-btn-switch"
                    onClick={() => setIsGitHubModalOpen(true)}
                  >
                    Change Repo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="task-gh-btn-connect"
                    onClick={() => setIsGitHubModalOpen(true)}
                  >
                    Connect Repository
                  </button>
                )}
              </div>

              {linkedRepo ? (
                <div className="task-gh-box-body">
                  <div className="task-gh-repo-info">
                    <span className="task-gh-repo-label">Target Repo:</span>
                    <span className="task-gh-repo-pill">🐙 {linkedRepo.fullName}</span>
                    {githubIssueUrl && (
                      <a
                        href={githubIssueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="task-gh-link-issue"
                        title="Open Issue on GitHub"
                      >
                        Issue #{githubIssueNumber}
                        <ExternalLinkIcon size={12} />
                      </a>
                    )}
                  </div>

                  {/* If creating a new task, give option to sync as GitHub Issue */}
                  {!taskToEdit && (
                    <label className="task-gh-checkbox-label">
                      <input
                        type="checkbox"
                        checked={createOnGitHub}
                        onChange={(e) => setCreateOnGitHub(e.target.checked)}
                      />
                      <span>
                        Automatically create and link issue on <strong>{linkedRepo.fullName}</strong>
                      </span>
                    </label>
                  )}

                  {/* GitHub Labels selector */}
                  <div className="task-gh-labels-section">
                    <label className="task-gh-section-label">GitHub Issue Labels</label>
                    <div className="task-gh-labels-list">
                      {AVAILABLE_GITHUB_LABELS.map((lbl) => {
                        const isSelected = selectedLabels.includes(lbl.name);
                        return (
                          <button
                            key={lbl.name}
                            type="button"
                            className={`task-gh-label-tag ${isSelected ? 'selected' : ''}`}
                            style={{
                              borderColor: isSelected ? lbl.color : 'var(--border-color)',
                              backgroundColor: isSelected ? `${lbl.color}20` : 'var(--bg-app)',
                              color: isSelected ? lbl.color : 'var(--text-secondary)',
                            }}
                            onClick={() => toggleGitHubLabel(lbl.name)}
                          >
                            {isSelected && <CheckIcon size={12} />}
                            <span>{lbl.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="task-gh-no-repo">
                  <p>No repository linked yet. Connect a GitHub repository to sync tasks with GitHub issues.</p>
                </div>
              )}
            </div>
          )}

          {/* Cover Image Upload */}
          <div className="form-group">
            <label className="form-label">Cover Banner Image</label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageChange}
            />

            {image ? (
              <div className="image-preview-container">
                <img
                  src={image}
                  alt="Task cover"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                  title="Remove cover banner"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div
                className="image-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">
                  <PlusIcon size={32} />
                </div>
                <p className="upload-text">
                  Drag and drop or <span>click to upload</span> cover image banner
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar panel: Metadata Settings */}
        <div className="editor-sidebar-panel">
          {/* Status Select */}
          <div className="form-group">
            <label className="form-label">Status Stage</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="inreview">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority Select Buttons */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-selector">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`priority-select-btn ${p} ${priority === p ? 'active' : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Completion Progress Slider */}
          <div className="form-group progress-slider-container">
            <div className="progress-slider-header">
              <label className="form-label" style={{ margin: '0' }}>Completion Progress</label>
              <span>{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              className="progress-range-input"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>

          {/* Est Time & Integration Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estimated Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 16h, 3d"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Integration Channel</label>
              <select
                className="form-input"
                value={integration}
                onChange={(e) => setIntegration(e.target.value)}
              >
                <option value="github">GitHub</option>
                <option value="slack">Slack</option>
                <option value="gmail">Gmail</option>
                <option value="teams">Microsoft Teams</option>
                <option value="messenger">Messenger</option>
                <option value="discord">Discord</option>
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label">Scheduled Date / Time</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 02/22 09:33 AM"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Assignees Checks */}
          <div className="form-group">
            <label className="form-label">Assignee Team Members</label>
            <div className="assignees-list-grid">
              {users.map((user) => (
                <label key={user.id} className="assignee-checkbox-label">
                  <input
                    type="checkbox"
                    checked={assignees.includes(user.id)}
                    onChange={() => handleAssigneeChange(user.id)}
                  />
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: user.color,
                      display: 'inline-block',
                    }}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
