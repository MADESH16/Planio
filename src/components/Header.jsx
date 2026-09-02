import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  PlusIcon,
  SearchIcon,
  ChatIcon,
  BellIcon,
  TableIcon,
  ListIcon,
  KanbanIcon,
  GithubIcon,
  SyncIcon,
} from './Icons';
import './Header.css';

const Header = ({ onCreateTask }) => {
  const {
    currentView,
    setCurrentView,
    users,
    linkedRepo,
    isSyncingGitHub,
    syncGitHubTasks,
    setIsGitHubModalOpen,
  } = useTasks();

  const { user, logout, openAuthModal } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const views = [
    { id: 'table', label: 'Table', icon: <TableIcon size={16} /> },
    { id: 'list', label: 'List View', icon: <ListIcon size={16} /> },
    { id: 'kanban', label: 'Kanban', icon: <KanbanIcon size={16} /> },
  ];

  // Get first 5 users to display in the header overlap list
  const visibleUsers = users.slice(0, 5);

  const handleSyncClick = (e) => {
    e.stopPropagation();
    syncGitHubTasks();
  };

  return (
    <header className="header">
      {/* Top Section */}
      <div className="header-top">
        <div className="header-title-container">
          <h1 className="header-title">Tasks</h1>
        </div>

        <div className="header-actions">
          {/* GitHub Repository Quick Widget */}
          <div
            className="gh-header-widget"
            onClick={() => setIsGitHubModalOpen(true)}
            title={linkedRepo ? `Connected to ${linkedRepo.fullName} - Click to manage` : 'Click to connect GitHub Repository'}
          >
            <div className="gh-header-widget-main">
              <GithubIcon size={18} />
              <div className="gh-header-widget-text">
                <span className="gh-widget-status-dot" />
                <span className="gh-widget-repo-name">
                  {linkedRepo ? linkedRepo.fullName : 'Link GitHub Repo'}
                </span>
              </div>
            </div>

            {linkedRepo && (
              <button
                type="button"
                className="gh-header-sync-btn"
                onClick={handleSyncClick}
                disabled={isSyncingGitHub}
                title="Synchronize tasks with GitHub"
              >
                <SyncIcon size={14} className={isSyncingGitHub ? 'spin' : ''} />
              </button>
            )}
          </div>

          {/* Create Task Button */}
          <button className="btn-create" onClick={onCreateTask}>
            <PlusIcon size={18} />
            <span>Create Task</span>
          </button>

          {/* Search, Chat, Notifications */}
          <div className="header-icons">
            <button className="header-icon-btn" aria-label="Search">
              <SearchIcon size={20} />
            </button>
            <button className="header-icon-btn" aria-label="Chat">
              <ChatIcon size={20} />
            </button>
            <button className="header-icon-btn" aria-label="Notifications">
              <BellIcon size={20} />
            </button>
          </div>

          {/* User Profile Avatar with Dropdown */}
          <div className="profile-menu-container">
            {user ? (
              <div
                className="profile-avatar"
                style={{ backgroundColor: user.color || '#3b82f6' }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title={`${user.name} (${user.role || 'Member'}) - Click for options`}
              >
                {user.avatar_initials || user.name?.slice(0, 2).toUpperCase() || 'DR'}
              </div>
            ) : (
              <button
                type="button"
                className="btn-header-login"
                onClick={() => openAuthModal('login')}
              >
                Sign In
              </button>
            )}

            {showProfileMenu && user && (
              <div className="profile-dropdown-menu fade-in" onClick={() => setShowProfileMenu(false)}>
                <div className="profile-dropdown-header">
                  <span className="profile-dropdown-name">{user.name}</span>
                  <span className="profile-dropdown-email">{user.email}</span>
                  <span className="profile-dropdown-role">{user.role || 'Developer'}</span>
                </div>
                <div className="profile-dropdown-divider" />
                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => openAuthModal('login')}
                >
                  Switch / Switch Account
                </button>
                <button
                  type="button"
                  className="profile-dropdown-item logout"
                  onClick={logout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="header-bottom">
        {/* View Switch Tabs */}
        <div className="view-tabs">
          {views.map((view) => (
            <button
              key={view.id}
              className={`view-tab ${currentView === view.id ? 'active' : ''}`}
              onClick={() => setCurrentView(view.id)}
            >
              {view.icon}
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Team Members list */}
        <div className="members-container">
          <div className="avatars-list">
            {visibleUsers.map((u) => (
              <div
                key={u.id}
                className="member-avatar"
                style={{ backgroundColor: u.color }}
                title={`${u.name} - ${u.role}`}
              >
                {u.avatar_initials || u.initials || 'U'}
              </div>
            ))}
            <div className="member-avatar counter" title="42 more members">
              42+
            </div>
          </div>
          <button className="btn-add-member" title="Add member" onClick={() => openAuthModal('register')}>
            <PlusIcon size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
