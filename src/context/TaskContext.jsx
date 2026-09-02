import React, { createContext, useState, useEffect, useContext } from 'react';
import { mockTasks, mockUsers } from '../utils/mockData';
import { api } from '../services/api';
import {
  fetchRepoDetails,
  fetchRepoIssues,
  createGitHubIssue,
  mapGitHubIssueToTask,
} from '../services/githubService';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Tasks state
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('protasks_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tasks from localStorage', e);
      }
    }
    return mockTasks.map((t, idx) => ({
      ...t,
      ticketKey: t.ticketKey || `PLN-${100 + idx + 1}`,
      commits: t.commits || [],
    }));
  });

  const [users, setUsers] = useState(mockUsers);
  const [currentView, setCurrentView] = useState('kanban'); // 'kanban', 'table', 'list'
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragCardSize, setDragCardSize] = useState({ width: 0, height: 0 });

  // Details Modal
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);

  // GitHub Integration States
  const [linkedRepo, setLinkedRepo] = useState(() => {
    const saved = localStorage.getItem('planio_linked_repo');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse linkedRepo from localStorage', e);
      }
    }
    return {
      id: 1296269,
      owner: 'MADESH16',
      repo: 'Planio',
      fullName: 'MADESH16/Planio',
      description: 'Fullstack Task Management with GitHub & PostgreSQL integration',
      stars: 12,
      forks: 4,
      openIssuesCount: 48,
      language: 'JavaScript',
      htmlUrl: 'https://github.com/MADESH16/Planio',
      defaultBranch: 'main',
      isPrivate: false,
    };
  });

  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('planio_github_token') || '';
  });

  const [savedRepos, setSavedRepos] = useState(() => {
    const saved = localStorage.getItem('planio_saved_repos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse savedRepos from localStorage', e);
      }
    }
    return [
      { owner: 'MADESH16', repo: 'Planio', fullName: 'MADESH16/Planio' },
      { owner: 'octocat', repo: 'Hello-World', fullName: 'octocat/Hello-World' },
      { owner: 'facebook', repo: 'react', fullName: 'facebook/react' },
      { owner: 'shadcn-ui', repo: 'ui', fullName: 'shadcn-ui/ui' },
    ];
  });

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load from backend on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const remoteTasks = await api.getTasks();
        if (remoteTasks && remoteTasks.length > 0) {
          setTasks(remoteTasks);
        }
        const remoteUsers = await api.getUsers();
        if (remoteUsers && remoteUsers.length > 0) {
          setUsers(remoteUsers);
        }
      } catch (e) {
        console.warn('Backend sync deferred, utilizing local storage cache.');
      }
    };
    loadBackendData();
  }, []);

  // Sync tasks with localStorage
  useEffect(() => {
    localStorage.setItem('protasks_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync linkedRepo with localStorage
  useEffect(() => {
    if (linkedRepo) {
      localStorage.setItem('planio_linked_repo', JSON.stringify(linkedRepo));
    } else {
      localStorage.removeItem('planio_linked_repo');
    }
  }, [linkedRepo]);

  // Sync githubToken with localStorage
  useEffect(() => {
    if (githubToken) {
      localStorage.setItem('planio_github_token', githubToken);
    } else {
      localStorage.removeItem('planio_github_token');
    }
  }, [githubToken]);

  // Sync savedRepos with localStorage
  useEffect(() => {
    localStorage.setItem('planio_saved_repos', JSON.stringify(savedRepos));
  }, [savedRepos]);

  // Global drag listener
  useEffect(() => {
    if (draggedTaskId) {
      const handleGlobalDragOver = (e) => {
        setDragPosition({ x: e.clientX, y: e.clientY });
      };

      window.addEventListener('dragover', handleGlobalDragOver);
      return () => {
        window.removeEventListener('dragover', handleGlobalDragOver);
      };
    }
  }, [draggedTaskId]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const openTaskDetails = (task) => {
    setSelectedTaskForDetails(task);
  };

  const closeTaskDetails = () => {
    setSelectedTaskForDetails(null);
  };

  /**
   * Connect and link a new GitHub repository
   */
  const linkRepository = async (owner, repo, token = githubToken) => {
    setIsSyncingGitHub(true);
    try {
      const repoData = await fetchRepoDetails(owner, repo, token);
      setLinkedRepo(repoData);

      setSavedRepos((prev) => {
        const exists = prev.some((r) => r.fullName.toLowerCase() === repoData.fullName.toLowerCase());
        if (!exists) {
          return [{ owner: repoData.owner, repo: repoData.repo, fullName: repoData.fullName }, ...prev];
        }
        return prev;
      });

      showToast(`Connected to repository ${repoData.fullName}!`, 'success');
      return { success: true, repo: repoData };
    } catch (error) {
      console.error('Failed to link repository', error);
      showToast(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  /**
   * Disconnect current repository
   */
  const disconnectRepository = () => {
    const prev = linkedRepo?.fullName;
    setLinkedRepo(null);
    showToast(`Disconnected from repository ${prev || ''}`, 'info');
  };

  /**
   * Import issues from GitHub repository as tasks
   */
  const importGitHubIssues = async (options = {}) => {
    if (!linkedRepo) {
      showToast('No GitHub repository linked. Please link a repository first.', 'error');
      return { success: false, count: 0 };
    }

    setIsSyncingGitHub(true);
    try {
      const rawIssues = await fetchRepoIssues(
        linkedRepo.owner,
        linkedRepo.repo,
        githubToken,
        options
      );

      if (!rawIssues || rawIssues.length === 0) {
        showToast('No issues found in this repository.', 'info');
        return { success: true, count: 0 };
      }

      const newTasksFromGitHub = rawIssues.map((issue, idx) => {
        const mapped = mapGitHubIssueToTask(issue, linkedRepo.fullName);
        return {
          ...mapped,
          ticketKey: `PLN-${issue.number || 100 + idx}`,
          commits: [],
        };
      });

      setTasks((prevTasks) => {
        const existingMap = new Map();
        prevTasks.forEach((t) => {
          if (t.githubRepo && t.githubIssueNumber) {
            existingMap.set(`${t.githubRepo}#${t.githubIssueNumber}`, t);
          }
        });

        const updatedOrNewMap = new Map();
        newTasksFromGitHub.forEach((newTask) => {
          const key = `${newTask.githubRepo}#${newTask.githubIssueNumber}`;
          const existing = existingMap.get(key);
          if (existing) {
            updatedOrNewMap.set(key, {
              ...existing,
              title: newTask.title,
              description: newTask.description || existing.description,
              githubState: newTask.githubState,
              githubLabels: newTask.githubLabels,
              githubCommentsCount: newTask.githubCommentsCount,
              githubIssueUrl: newTask.githubIssueUrl,
            });
          } else {
            updatedOrNewMap.set(key, newTask);
          }
        });

        const unaffectedTasks = prevTasks.filter((t) => {
          if (!t.githubRepo || !t.githubIssueNumber) return true;
          return !updatedOrNewMap.has(`${t.githubRepo}#${t.githubIssueNumber}`);
        });

        return [...Array.from(updatedOrNewMap.values()), ...unaffectedTasks];
      });

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      showToast(`Successfully imported ${newTasksFromGitHub.length} issues from ${linkedRepo.fullName}!`, 'success');
      return { success: true, count: newTasksFromGitHub.length };
    } catch (error) {
      console.error('Error importing GitHub issues', error);
      showToast(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  /**
   * Sync all existing GitHub-linked tasks with latest remote data
   */
  const syncGitHubTasks = async () => {
    if (!linkedRepo) {
      showToast('Please link a GitHub repository to sync tasks.', 'info');
      return;
    }
    return importGitHubIssues({ state: 'all', perPage: 50 });
  };

  /**
   * Add a new task with automatic ticket key generation
   */
  const addTask = async (taskData) => {
    let githubIssueNumber = taskData.githubIssueNumber || null;
    let githubIssueUrl = taskData.githubIssueUrl || null;
    let githubRepo = taskData.githubRepo || (linkedRepo ? linkedRepo.fullName : null);

    if (taskData.createOnGitHub && linkedRepo) {
      try {
        if (githubToken) {
          const createdIssue = await createGitHubIssue(
            linkedRepo.owner,
            linkedRepo.repo,
            githubToken,
            {
              title: taskData.title,
              description: taskData.description,
              labels: taskData.githubLabels?.map((l) => (typeof l === 'string' ? l : l.name)) || [],
            }
          );
          githubIssueNumber = createdIssue.number;
          githubIssueUrl = createdIssue.html_url;
          githubRepo = linkedRepo.fullName;
          showToast(`Created GitHub Issue #${createdIssue.number} on ${linkedRepo.fullName}!`, 'success');
        } else {
          githubIssueNumber = Math.floor(100 + Math.random() * 900);
          githubIssueUrl = `https://github.com/${linkedRepo.fullName}/issues/${githubIssueNumber}`;
          showToast(`Task linked to ${linkedRepo.fullName} #${githubIssueNumber}`, 'info');
        }
      } catch (err) {
        console.error('Failed to create issue on GitHub', err);
        showToast(`Could not create remote issue (${err.message}). Saved locally.`, 'warning');
      }
    }

    // Try backend API creation
    try {
      const serverTask = await api.createTask({
        ...taskData,
        githubRepo: taskData.integration === 'github' ? (taskData.githubRepo || githubRepo) : null,
        githubIssueNumber: taskData.integration === 'github' ? githubIssueNumber : null,
        githubIssueUrl: taskData.integration === 'github' ? githubIssueUrl : null,
      });

      if (serverTask) {
        setTasks((prev) => [serverTask, ...prev]);
        showToast(`Created ticket ${serverTask.ticketKey}!`, 'success');
        return serverTask;
      }
    } catch (e) {
      console.warn('Backend create failed, fallback to local task creation', e);
    }

    // Local creation fallback
    const nextNum = tasks.length + 101;
    const newTask = {
      id: `t_${Date.now()}`,
      ticketKey: `PLN-${nextNum}`,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      date: taskData.date || new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      integration: taskData.integration || 'github',
      creatorId: taskData.creatorId || '1',
      assignees: taskData.assignees && taskData.assignees.length > 0 ? taskData.assignees : ['1'],
      image: taskData.image || null,
      totalAssigneesCount: taskData.assignees ? taskData.assignees.length : 1,
      priority: taskData.priority || 'medium',
      progress: taskData.progress !== undefined ? Number(taskData.progress) : 0,
      estimatedTime: taskData.estimatedTime || '',
      githubRepo: taskData.integration === 'github' ? (taskData.githubRepo || githubRepo) : null,
      githubIssueNumber: taskData.integration === 'github' ? githubIssueNumber : null,
      githubIssueUrl: taskData.integration === 'github' ? githubIssueUrl : null,
      githubState: taskData.githubState || 'open',
      githubLabels: taskData.githubLabels || [],
      githubCommentsCount: taskData.githubCommentsCount || 0,
      commits: [],
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Created ticket ${newTask.ticketKey}!`, 'success');
    return newTask;
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      await api.updateTask(taskId, updatedData);
    } catch (e) {
      console.warn('Backend update failed, applying locally', e);
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updatedData,
              totalAssigneesCount: updatedData.assignees
                ? updatedData.assignees.length
                : task.totalAssigneesCount,
            }
          : task
      )
    );

    if (selectedTaskForDetails && selectedTaskForDetails.id === taskId) {
      setSelectedTaskForDetails((prev) => ({ ...prev, ...updatedData }));
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
    } catch (e) {
      console.warn('Backend delete failed, applying locally', e);
    }
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTaskForDetails && selectedTaskForDetails.id === taskId) {
      setSelectedTaskForDetails(null);
    }
  };

  const moveTask = async (taskId, targetStatus) => {
    const updatedProgress = targetStatus === 'done' ? 100 : targetStatus === 'inreview' ? 80 : targetStatus === 'inprogress' ? 50 : 0;
    const patch = { status: targetStatus, progress: updatedProgress };

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: targetStatus,
            progress: task.progress === 0 || task.progress === 100 ? updatedProgress : task.progress,
            githubState: targetStatus === 'done' ? 'closed' : 'open',
          };
        }
        return task;
      })
    );
    setDraggedTaskId(null);

    try {
      await api.updateTask(taskId, patch);
    } catch (e) {
      // ignore
    }
  };

  /**
   * Link a Git commit to a task/ticket
   */
  const addCommitToTask = async (taskId, commitData) => {
    try {
      const newCommit = await api.linkCommit({
        taskId,
        ...commitData,
      });

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId || task.ticketKey === commitData.ticketKey) {
            const existingCommits = task.commits || [];
            return {
              ...task,
              commits: [newCommit, ...existingCommits],
            };
          }
          return task;
        })
      );

      if (selectedTaskForDetails && (selectedTaskForDetails.id === taskId || selectedTaskForDetails.ticketKey === commitData.ticketKey)) {
        setSelectedTaskForDetails((prev) => ({
          ...prev,
          commits: [newCommit, ...(prev.commits || [])],
        }));
      }

      return { success: true, commit: newCommit };
    } catch (err) {
      console.error('Failed to link commit', err);
      // Local fallback
      const localCommit = {
        id: Date.now(),
        task_id: taskId,
        ticket_key: commitData.ticketKey,
        commit_hash: commitData.commitHash.slice(0, 7),
        commit_message: commitData.commitMessage,
        author_name: commitData.authorName || 'Developer',
        branch: commitData.branch || 'main',
        commit_url: commitData.commitUrl,
        created_at: new Date().toISOString(),
      };

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId || task.ticketKey === commitData.ticketKey) {
            return {
              ...task,
              commits: [localCommit, ...(task.commits || [])],
            };
          }
          return task;
        })
      );

      if (selectedTaskForDetails) {
        setSelectedTaskForDetails((prev) => ({
          ...prev,
          commits: [localCommit, ...(prev.commits || [])],
        }));
      }

      return { success: true, commit: localCommit };
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        users,
        currentView,
        setCurrentView,
        draggedTaskId,
        setDraggedTaskId,
        dragPosition,
        setDragPosition,
        dragOffset,
        setDragOffset,
        dragCardSize,
        setDragCardSize,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addCommitToTask,
        selectedTaskForDetails,
        openTaskDetails,
        closeTaskDetails,
        // GitHub Features
        linkedRepo,
        setLinkedRepo,
        githubToken,
        setGithubToken,
        savedRepos,
        setSavedRepos,
        isGitHubModalOpen,
        setIsGitHubModalOpen,
        isSyncingGitHub,
        lastSyncTime,
        linkRepository,
        disconnectRepository,
        importGitHubIssues,
        syncGitHubTasks,
        toastMessage,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className={`global-toast toast-${toastMessage.type} fade-in`}>
          <div className="toast-icon">
            {toastMessage.type === 'success' && '✓'}
            {toastMessage.type === 'error' && '✕'}
            {toastMessage.type === 'warning' && '⚠'}
            {toastMessage.type === 'info' && 'ℹ'}
          </div>
          <span className="toast-text">{toastMessage.message}</span>
        </div>
      )}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
