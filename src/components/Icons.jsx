import React from 'react';

// Common SVG props wrapper
const IconWrapper = ({ children, size = 20, className = '', onClick }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon-svg ${className}`}
    onClick={onClick}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {children}
  </svg>
);

// Sidebar / Nav Icons
export const DashboardIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </IconWrapper>
);

export const TasksIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </IconWrapper>
);

export const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

export const BellIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </IconWrapper>
);

export const ChatIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconWrapper>
);

export const SearchIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconWrapper>
);

export const PlusIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

export const OptionsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </IconWrapper>
);

export const EditIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </IconWrapper>
);

export const TrashIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
);

export const CloseIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const MoonIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </IconWrapper>
);

export const SyncIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </IconWrapper>
);

export const ExternalLinkIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </IconWrapper>
);

export const StarIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </IconWrapper>
);

export const GitForkIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
    <path d="M12 12v3" />
  </IconWrapper>
);

export const IssueIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </IconWrapper>
);

export const KeyIcon = (props) => (
  <IconWrapper {...props}>
    <path d="m21 2-2 2m-1.5 1.5L14 9l-4-4-4 4 4 4 3.5-3.5" />
    <circle cx="7.5" cy="16.5" r="5.5" />
  </IconWrapper>
);

export const CheckIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);


// View Switch Icons
export const TableIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
  </IconWrapper>
);

export const ListIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </IconWrapper>
);

export const KanbanIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="4" height="18" rx="1" />
    <rect x="10" y="3" width="4" height="18" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </IconWrapper>
);

// Integration Logo Icons
// These are colored and complex, so we will make them return custom SVGs matching the brand designs.

export const SlackIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523c0-1.393 1.13-2.52 2.522-2.52h2.52v2.52z" fill="#36C5F0" />
    <path d="M6.307 15.165a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.522-2.522v-5.043z" fill="#36C5F0" />
    <path d="M8.829 5.042a2.528 2.528 0 0 1-2.522-2.52A2.528 2.528 0 0 1 8.829 0c1.393 0 2.52 1.13 2.52 2.522v2.52h-2.52z" fill="#2EB67D" />
    <path d="M8.829 6.307a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.52H3.785a2.528 2.528 0 0 1-2.522-2.52 2.528 2.528 0 0 1 2.522-2.522h5.044z" fill="#2EB67D" />
    <path d="M18.958 8.832a2.528 2.528 0 0 1 2.522-2.522 2.528 2.528 0 0 1 2.52 2.522c0 1.393-1.127 2.52-2.52 2.52h-2.522v-2.52z" fill="#ECB22E" />
    <path d="M17.693 8.832a2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52V3.788a2.528 2.528 0 0 1 2.522-2.522 2.528 2.528 0 0 1 2.52 2.522v5.044z" fill="#ECB22E" />
    <path d="M15.173 18.958a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.52c-1.393 0-2.522-1.127-2.522-2.52v-2.522h2.522z" fill="#E01E5A" />
    <path d="M15.173 17.693a2.528 2.528 0 0 1-2.522-2.52 2.528 2.528 0 0 1 2.522-2.52h5.044a2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.52h-5.044z" fill="#E01E5A" />
  </svg>
);

export const GithubIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export const GmailIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335" />
  </svg>
);

export const MicrosoftTeamsIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9v-4.5H7.5V11H9V9.5c0-1.66 1.34-3 3-3h1.5v1.5H12c-.83 0-1.5.67-1.5 1.5V11h3v1.5h-3V17z" fill="#4B53BC" />
  </svg>
);

export const MessengerIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="url(#messenger-grad)"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <defs>
      <linearGradient id="messenger-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0066FF" />
        <stop offset="50%" stopColor="#A100FF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FF0077" />
      </linearGradient>
    </defs>
    <path d="M12 2C6.36 2 2 6.13 2 11.23c0 2.98 1.48 5.63 3.8 7.31V22l3.32-1.82c.9.25 1.86.39 2.88.39 5.64 0 10-4.13 10-9.23C22 6.13 17.64 2 12 2zm1.18 12.38l-2.43-2.6-4.75 2.6 5.22-5.55 2.47 2.6 4.71-2.6-5.22 5.55z" />
  </svg>
);

export const DiscordIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" fill="#5865F2" />
  </svg>
);

// Map name to component helper
export const getIntegrationIcon = (name, size = 18, className = '') => {
  switch (name ? name.toLowerCase() : '') {
    case 'slack':
      return <SlackIcon size={size} className={className} />;
    case 'github':
      return <GithubIcon size={size} className={className} />;
    case 'gmail':
      return <GmailIcon size={size} className={className} />;
    case 'teams':
    case 'microsoft team':
    case 'microsoft teams':
      return <MicrosoftTeamsIcon size={size} className={className} />;
    case 'messenger':
      return <MessengerIcon size={size} className={className} />;
    case 'discord':
      return <DiscordIcon size={size} className={className} />;
    default:
      return null;
  }
};
