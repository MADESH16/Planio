import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import {
  DashboardIcon,
  TasksIcon,
  SettingsIcon,
  MoonIcon,
  getIntegrationIcon
} from './Icons';
import './Sidebar.css';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    tasks,
    linkedRepo,
    setIsGitHubModalOpen
  } = useTasks();

  const githubTaskCount = tasks.filter((t) => t.integration === 'github').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <TasksIcon size={18} />, active: true },
  ];

  const messageItems = [
    { id: 'teams', label: 'Microsoft Team', icon: getIntegrationIcon('teams') },
    { id: 'slack', label: 'Slack', icon: getIntegrationIcon('slack') },
    {
      id: 'github',
      label: 'GitHub',
      icon: getIntegrationIcon('github'),
      badge: githubTaskCount > 0 ? githubTaskCount : (linkedRepo ? 'Live' : undefined),
      isGitHub: true,
    },
    { id: 'messenger', label: 'Messenger', icon: getIntegrationIcon('messenger') },
    { id: 'gmail', label: 'Gmail', icon: getIntegrationIcon('gmail') },
    { id: 'discord', label: 'Discord', icon: getIntegrationIcon('discord') },
  ];

  const handleItemClick = (item) => {
    if (item.isGitHub) {
      setIsGitHubModalOpen(true);
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="logo-container">
        <div className="logo-icon">
          <div className="logo-logo">
            <span className="logo-line" />
            <span className="logo-line" />
            <span className="logo-line" />
          </div>
        </div>
        <span className="logo-text">ProTasks</span>
      </div>

      {/* Menu Section */}
      <div className="section">
        <h4 className="section-title">Menu</h4>
        <div className="menu-list">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${item.active ? 'active' : ''}`}
            >
              <div className="menu-item-left">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages & Integrations Section */}
      <div className="section">
        <h4 className="section-title">Integrations & Channels</h4>
        <div className="menu-list">
          {messageItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${item.isGitHub ? 'clickable' : ''}`}
              onClick={() => handleItemClick(item)}
              title={item.isGitHub ? 'Click to open GitHub Repository Manager' : undefined}
              style={item.isGitHub ? { cursor: 'pointer' } : undefined}
            >
              <div className="menu-item-left">
                <span style={{ display: 'flex', width: '20px', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && <span className="badge">{item.badge}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <div
          className="menu-item clickable"
          onClick={() => setIsGitHubModalOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Manage Integrations & Settings"
        >
          <div className="menu-item-left">
            <SettingsIcon size={18} />
            <span>Settings</span>
          </div>
        </div>
        <div className="toggle-container">
          <div className="menu-item-left" style={{ color: 'var(--text-secondary)' }}>
            <MoonIcon size={18} />
            <span>Dark Mode</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="slider" />
          </label>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
