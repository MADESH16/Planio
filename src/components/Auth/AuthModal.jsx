import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { CloseIcon, KeyIcon } from '../Icons';
import './AuthModal.css';

const DEMO_ACCOUNTS = [
  { name: 'Darlene Robertson', email: 'darlene@planio.dev', role: 'UI/UX Designer', color: '#3b82f6' },
  { name: 'Savannah Nguyen', email: 'savannah@planio.dev', role: 'Frontend Developer', color: '#10b981' },
  { name: 'Leslie Alexander', email: 'leslie@planio.dev', role: 'Product Manager', color: '#f59e0b' },
];

const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
    backendOnline,
  } = useAuth();
  const { showToast } = useTasks();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (authMode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Failed to sign in.');
      } else {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        setEmail('');
        setPassword('');
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const res = await register({ name, email, password, role });
      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      } else {
        showToast(`Account created! Welcome to Planio, ${res.user.name}!`, 'success');
        setName('');
        setEmail('');
        setPassword('');
      }
    }

    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail) => {
    setError(null);
    setLoading(true);
    const res = await login(demoEmail, 'password123');
    setLoading(false);
    if (res.success) {
      showToast(`Signed in as ${res.user.name}!`, 'success');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div
        className="auth-modal-dialog fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-title-box">
            <div className="auth-logo-badge">
              <span className="auth-logo-dot" />
            </div>
            <div>
              <h3 className="auth-modal-title">
                {authMode === 'login' ? 'Sign in to ProTasks' : 'Create an Account'}
              </h3>
              <p className="auth-modal-subtitle">
                {authMode === 'login'
                  ? 'Access your tasks, tickets, and linked Git repositories'
                  : 'Start managing development tasks with PostgreSQL & Git integration'}
              </p>
            </div>
          </div>
          <button
            className="auth-btn-close"
            onClick={() => setIsAuthModalOpen(false)}
            title="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div className="auth-modal-body">
          {error && (
            <div className="auth-error-banner fade-in">
              <span>✕ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {authMode === 'register' && (
              <>
                <div className="auth-form-group">
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">Team Role</label>
                  <select
                    className="auth-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Fullstack Engineer">Fullstack Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="QA Engineer">QA Engineer</option>
                  </select>
                </div>
              </>
            )}

            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
            >
              {loading
                ? 'Authenticating...'
                : authMode === 'login'
                ? 'Sign In to Account'
                : 'Create Account & Continue'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          {authMode === 'login' && (
            <div className="auth-demo-section">
              <span className="auth-demo-divider">Or quick sign in with team demo accounts</span>
              <div className="auth-demo-grid">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    className="auth-demo-card"
                    onClick={() => handleDemoLogin(acc.email)}
                    disabled={loading}
                  >
                    <div
                      className="auth-demo-avatar"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="auth-demo-info">
                      <span className="auth-demo-name">{acc.name}</span>
                      <span className="auth-demo-role">{acc.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="auth-modal-footer">
          <div className="auth-backend-status">
            <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
            <span>
              {backendOnline ? 'Node.js & PostgreSQL Backend: Connected (Port 5000)' : 'Running in Offline Mode'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
