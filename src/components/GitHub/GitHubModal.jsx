import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { parseGitHubRepoInput } from '../../services/githubService';
import {
  GithubIcon,
  CloseIcon,
  SyncIcon,
  ExternalLinkIcon,
  StarIcon,
  GitForkIcon,
  IssueIcon,
  KeyIcon,
  CheckIcon,
} from '../Icons';
import './GitHubModal.css';

const PRESET_REPOS = [
  { name: 'octocat/Hello-World', desc: 'Sample beginner repo with starter issues' },
  { name: 'shadcn-ui/ui', desc: 'Modern UI component library' },
  { name: 'facebook/react', desc: 'The library for web and native user interfaces' },
  { name: 'tailwindlabs/tailwindcss', desc: 'Utility-first CSS framework' },
  { name: 'vitejs/vite', desc: 'Next Generation Frontend Tooling' },
];

const GitHubModal = () => {
  const {
    isGitHubModalOpen,
    setIsGitHubModalOpen,
    linkedRepo,
    linkRepository,
    disconnectRepository,
    importGitHubIssues,
    syncGitHubTasks,
    isSyncingGitHub,
    githubToken,
    setGithubToken,
    lastSyncTime,
    showToast,
  } = useTasks();

  const [activeTab, setActiveTab] = useState('connect'); // 'connect', 'token', 'settings'
  const [repoInput, setRepoInput] = useState('');
  const [tokenInput, setTokenInput] = useState(githubToken);
  const [showToken, setShowToken] = useState(false);
  const [importState, setImportState] = useState('all'); // 'open', 'all'
  const [importCount, setImportCount] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  if (!isGitHubModalOpen) return null;

  const handleLinkSubmit = async (e) => {
    e?.preventDefault();
    const parsed = parseGitHubRepoInput(repoInput);
    if (!parsed) {
      showToast('Please enter a valid "owner/repo" or GitHub URL (e.g. facebook/react)', 'error');
      return;
    }

    setIsLoading(true);
    const res = await linkRepository(parsed.owner, parsed.repo, tokenInput);
    setIsLoading(false);
    if (res.success) {
      setRepoInput('');
    }
  };

  const handlePresetSelect = async (presetFullName) => {
    const parsed = parseGitHubRepoInput(presetFullName);
    if (!parsed) return;
    setRepoInput(presetFullName);
    setIsLoading(true);
    await linkRepository(parsed.owner, parsed.repo, tokenInput);
    setIsLoading(false);
  };

  const handleSaveToken = () => {
    setGithubToken(tokenInput.trim());
    showToast('Personal Access Token saved successfully!', 'success');
  };

  const handleImport = async () => {
    await importGitHubIssues({
      state: importState,
      perPage: Number(importCount),
    });
  };

  return (
    <div className="gh-modal-overlay" onClick={() => setIsGitHubModalOpen(false)}>
      <div
        className="gh-modal-dialog fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="gh-modal-header">
          <div className="gh-modal-header-left">
            <div className="gh-modal-icon-badge">
              <GithubIcon size={24} />
            </div>
            <div>
              <h3 className="gh-modal-title">GitHub Repository Link</h3>
              <p className="gh-modal-subtitle">
                Connect your repository to sync issues, create tasks, and manage workflows.
              </p>
            </div>
          </div>
          <button
            className="gh-modal-btn-close"
            onClick={() => setIsGitHubModalOpen(false)}
            title="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="gh-modal-tabs">
          <button
            className={`gh-tab-btn ${activeTab === 'connect' ? 'active' : ''}`}
            onClick={() => setActiveTab('connect')}
          >
            Repository
          </button>
          <button
            className={`gh-tab-btn ${activeTab === 'token' ? 'active' : ''}`}
            onClick={() => setActiveTab('token')}
          >
            <KeyIcon size={14} />
            <span>Access Token (PAT)</span>
            {githubToken && <span className="gh-token-indicator">✓</span>}
          </button>
          <button
            className={`gh-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Import Options
          </button>
        </div>

        {/* Modal Body */}
        <div className="gh-modal-body">
          {/* TAB 1: Connect & Overview */}
          {activeTab === 'connect' && (
            <div className="gh-tab-content">
              {/* If Repository is already Linked */}
              {linkedRepo ? (
                <div className="gh-connected-card fade-in">
                  <div className="gh-connected-card-header">
                    <div className="gh-connected-repo-info">
                      <div className="gh-status-dot active" />
                      <div>
                        <div className="gh-connected-name-row">
                          <h4 className="gh-connected-name">{linkedRepo.fullName}</h4>
                          {linkedRepo.isPrivate && (
                            <span className="gh-badge-private">Private</span>
                          )}
                          <a
                            href={linkedRepo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gh-link-external"
                            title="Open repository on GitHub"
                          >
                            <ExternalLinkIcon size={14} />
                          </a>
                        </div>
                        <p className="gh-connected-desc">{linkedRepo.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Repository Statistics Grid */}
                  <div className="gh-stats-grid">
                    <div className="gh-stat-item">
                      <div className="gh-stat-label">
                        <StarIcon size={14} />
                        <span>Stars</span>
                      </div>
                      <span className="gh-stat-val">{linkedRepo.stars.toLocaleString()}</span>
                    </div>

                    <div className="gh-stat-item">
                      <div className="gh-stat-label">
                        <GitForkIcon size={14} />
                        <span>Forks</span>
                      </div>
                      <span className="gh-stat-val">{linkedRepo.forks.toLocaleString()}</span>
                    </div>

                    <div className="gh-stat-item">
                      <div className="gh-stat-label">
                        <IssueIcon size={14} />
                        <span>Open Issues</span>
                      </div>
                      <span className="gh-stat-val">{linkedRepo.openIssuesCount.toLocaleString()}</span>
                    </div>

                    <div className="gh-stat-item">
                      <div className="gh-stat-label">
                        <span>Language</span>
                      </div>
                      <span className="gh-stat-val">{linkedRepo.language || 'Code'}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="gh-actions-row">
                    <button
                      className="btn-gh-primary"
                      onClick={handleImport}
                      disabled={isSyncingGitHub}
                    >
                      <SyncIcon size={16} className={isSyncingGitHub ? 'spin' : ''} />
                      <span>{isSyncingGitHub ? 'Importing Issues...' : 'Import Issues to Board'}</span>
                    </button>

                    <button
                      className="btn-gh-secondary"
                      onClick={() => syncGitHubTasks()}
                      disabled={isSyncingGitHub}
                    >
                      <SyncIcon size={14} className={isSyncingGitHub ? 'spin' : ''} />
                      <span>Sync Remote Changes</span>
                    </button>

                    <button
                      className="btn-gh-danger"
                      onClick={disconnectRepository}
                      title="Disconnect from this repository"
                    >
                      Disconnect
                    </button>
                  </div>

                  {lastSyncTime && (
                    <div className="gh-last-sync-text">
                      Last synchronized at {lastSyncTime}
                    </div>
                  )}
                </div>
              ) : (
                /* When No Repo is Linked */
                <div className="gh-unconnected-banner">
                  <p className="gh-unconnected-text">
                    Enter any public or private GitHub repository URL or identifier (e.g. <code>facebook/react</code>) to sync issues directly as interactive Kanban cards.
                  </p>
                </div>
              )}

              {/* Link New / Change Repo Input */}
              <form onSubmit={handleLinkSubmit} className="gh-input-group-container">
                <label className="gh-input-label">
                  {linkedRepo ? 'Switch or Link Another Repository' : 'Repository URL or Name'}
                </label>
                <div className="gh-input-row">
                  <div className="gh-input-wrapper">
                    <GithubIcon size={18} className="gh-input-icon" />
                    <input
                      type="text"
                      className="gh-text-input"
                      placeholder="e.g. owner/repo or https://github.com/owner/repo"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-gh-primary"
                    disabled={isLoading || !repoInput.trim()}
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </form>

              {/* Quick Presets */}
              <div className="gh-presets-section">
                <label className="gh-input-label">Quick Connect Presets</label>
                <div className="gh-presets-list">
                  {PRESET_REPOS.map((preset) => (
                    <div
                      key={preset.name}
                      className="gh-preset-card"
                      onClick={() => handlePresetSelect(preset.name)}
                    >
                      <div className="gh-preset-header">
                        <span className="gh-preset-name">{preset.name}</span>
                        {linkedRepo?.fullName.toLowerCase() === preset.name.toLowerCase() && (
                          <span className="gh-preset-connected-tag">Active</span>
                        )}
                      </div>
                      <span className="gh-preset-desc">{preset.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Token Settings */}
          {activeTab === 'token' && (
            <div className="gh-tab-content fade-in">
              <div className="gh-token-info-box">
                <h4 className="gh-info-title">Why use a Personal Access Token?</h4>
                <ul className="gh-info-list">
                  <li><strong>Create real issues on GitHub</strong> directly from Planio tasks</li>
                  <li><strong>Access private repositories</strong> securely</li>
                  <li><strong>Increase API rate limits</strong> from 60 requests/hour to 5,000 requests/hour</li>
                </ul>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Planio%20Task%20Manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gh-token-link"
                >
                  Generate a Token on GitHub (with <code>repo</code> scope) &rarr;
                </a>
              </div>

              <div className="gh-input-group-container">
                <label className="gh-input-label">GitHub Personal Access Token (PAT)</label>
                <div className="gh-input-row">
                  <div className="gh-input-wrapper">
                    <KeyIcon size={18} className="gh-input-icon" />
                    <input
                      type={showToken ? 'text' : 'password'}
                      className="gh-text-input"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="gh-btn-toggle-show"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn-gh-primary"
                    onClick={handleSaveToken}
                  >
                    Save Token
                  </button>
                </div>
                <span className="gh-token-note">
                  Tokens are stored exclusively in your local browser storage. They are never sent to third-party servers.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: Import Options */}
          {activeTab === 'settings' && (
            <div className="gh-tab-content fade-in">
              <div className="gh-settings-grid">
                <div className="gh-setting-item">
                  <label className="gh-input-label">Issues State to Import</label>
                  <select
                    className="gh-select"
                    value={importState}
                    onChange={(e) => setImportState(e.target.value)}
                  >
                    <option value="all">All Issues (Open & Closed)</option>
                    <option value="open">Open Issues Only (To Do & In Progress)</option>
                    <option value="closed">Closed Issues Only (Done)</option>
                  </select>
                </div>

                <div className="gh-setting-item">
                  <label className="gh-input-label">Maximum Issues to Fetch</label>
                  <select
                    className="gh-select"
                    value={importCount}
                    onChange={(e) => setImportCount(e.target.value)}
                  >
                    <option value="10">10 Issues</option>
                    <option value="30">30 Issues (Recommended)</option>
                    <option value="50">50 Issues</option>
                    <option value="100">100 Issues</option>
                  </select>
                </div>
              </div>

              <div className="gh-setting-help">
                <p>
                  Planio maps GitHub issues to board columns intelligently:
                </p>
                <div className="gh-mapping-list">
                  <div><strong>Open Issues</strong> &rarr; Placed into <em>To Do</em> or <em>In Progress</em></div>
                  <div><strong>Closed Issues</strong> &rarr; Placed into <em>Done</em></div>
                  <div><strong>Labels (e.g. bug, high-priority)</strong> &rarr; Priority & Tags</div>
                  <div><strong>Pull Requests</strong> &rarr; Placed into <em>In Review</em></div>
                </div>
              </div>

              {linkedRepo && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn-gh-primary"
                    onClick={handleImport}
                    disabled={isSyncingGitHub}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <SyncIcon size={16} className={isSyncingGitHub ? 'spin' : ''} />
                    <span>Fetch & Import Now ({importCount} issues)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="gh-modal-footer">
          <div className="gh-footer-status">
            <span className={`gh-status-indicator ${linkedRepo ? 'online' : 'offline'}`} />
            <span>
              {linkedRepo
                ? `Linked to ${linkedRepo.fullName}`
                : 'No repository currently linked'}
            </span>
          </div>
          <button
            type="button"
            className="btn-gh-done"
            onClick={() => setIsGitHubModalOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubModal;
