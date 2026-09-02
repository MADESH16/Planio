/**
 * GitHub API Service for Planio
 * Handles communication with GitHub REST API v3
 */

// Helper to parse repo string or URL into owner and repo name
export const parseGitHubRepoInput = (input) => {
  if (!input) return null;
  const trimmed = input.trim();

  // Check if full URL: https://github.com/owner/repo or github.com/owner/repo
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, ''),
      fullName: `${urlMatch[1]}/${urlMatch[2].replace(/\.git$/, '')}`,
    };
  }

  // Check if owner/repo format
  const parts = trimmed.split('/');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return {
      owner: parts[0].trim(),
      repo: parts[1].trim().replace(/\.git$/, ''),
      fullName: `${parts[0].trim()}/${parts[1].trim().replace(/\.git$/, '')}`,
    };
  }

  return null;
};

// Helper to construct request headers
const getHeaders = (token) => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
};

/**
 * Fetch GitHub Repository Details
 */
export const fetchRepoDetails = async (owner, repo, token = '') => {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found or is private (a Personal Access Token may be required).`);
    } else if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Please provide a Personal Access Token in Settings to get 5,000 requests/hour.');
      }
      throw new Error('Access forbidden. Please check your GitHub Personal Access Token.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    owner: data.owner?.login || owner,
    repo: data.name || repo,
    fullName: data.full_name || `${owner}/${repo}`,
    description: data.description || 'No description provided.',
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    openIssuesCount: data.open_issues_count || 0,
    language: data.language || 'Unknown',
    htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    defaultBranch: data.default_branch || 'main',
    isPrivate: data.private || false,
    updatedAt: data.updated_at,
  };
};

/**
 * Fetch Issues for a Repository
 */
export const fetchRepoIssues = async (owner, repo, token = '', options = {}) => {
  const state = options.state || 'all'; // 'open', 'closed', 'all'
  const perPage = options.perPage || 30;
  const sort = options.sort || 'updated'; // 'created', 'updated', 'comments'
  const direction = options.direction || 'desc';

  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&sort=${sort}&direction=${direction}`;
  const response = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit reached. Add a Personal Access Token for full access.');
    }
    throw new Error(`Failed to fetch issues: ${response.statusText}`);
  }

  const issues = await response.json();
  return issues;
};

/**
 * Create an issue on GitHub
 */
export const createGitHubIssue = async (owner, repo, token, issueData) => {
  if (!token) {
    throw new Error('A GitHub Personal Access Token is required to create issues directly via the GitHub API.');
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: issueData.title,
      body: issueData.description || '',
      labels: issueData.labels || [],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create GitHub issue: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Maps a GitHub Issue object into a Planio Task object
 */
export const mapGitHubIssueToTask = (issue, repoFullName) => {
  const isPr = Boolean(issue.pull_request);
  const isClosed = issue.state === 'closed';

  // Determine priority based on labels
  const labelNames = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name).toLowerCase());
  let priority = 'medium';
  if (labelNames.some((l) => l.includes('urgent') || l.includes('critical') || l.includes('high') || l.includes('p0') || l.includes('p1'))) {
    priority = 'high';
  } else if (labelNames.some((l) => l.includes('low') || l.includes('minor') || l.includes('p3') || l.includes('trivial'))) {
    priority = 'low';
  }

  // Determine column status
  let status = 'todo';
  if (isClosed) {
    status = 'done';
  } else if (labelNames.some((l) => l.includes('progress') || l.includes('wip') || l.includes('working'))) {
    status = 'inprogress';
  } else if (labelNames.some((l) => l.includes('review') || l.includes('qa') || l.includes('testing') || isPr)) {
    status = 'inreview';
  }

  // Format creation date
  const dateObj = new Date(issue.created_at || Date.now());
  const formattedDate = dateObj.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate rough progress based on status
  let progress = 0;
  if (status === 'done') progress = 100;
  else if (status === 'inreview') progress = 80;
  else if (status === 'inprogress') progress = 45;

  return {
    id: `gh_${repoFullName.replace('/', '_')}_${issue.number}`,
    title: issue.title || `Issue #${issue.number}`,
    description: issue.body ? (issue.body.length > 300 ? issue.body.slice(0, 300) + '...' : issue.body) : 'No description provided.',
    status,
    date: formattedDate,
    integration: 'github',
    creatorId: 'u1',
    assignees: ['u1'],
    image: null,
    totalAssigneesCount: issue.assignees?.length || 1,
    priority,
    progress,
    estimatedTime: labelNames.some((l) => l.includes('quick')) ? '2h' : '1d',
    // GitHub specific metadata
    githubRepo: repoFullName,
    githubIssueNumber: issue.number,
    githubIssueUrl: issue.html_url || `https://github.com/${repoFullName}/issues/${issue.number}`,
    githubState: issue.state,
    githubLabels: (issue.labels || []).map((l) => ({
      name: typeof l === 'string' ? l : l.name,
      color: typeof l === 'object' && l.color ? `#${l.color}` : '#6b7280',
    })),
    githubAuthor: issue.user?.login || 'github-user',
    githubCommentsCount: issue.comments || 0,
    isPullRequest: isPr,
  };
};

/**
 * Generate a prefilled GitHub issue URL when token isn't available for direct POST
 */
export const getPrefilledGitHubIssueUrl = (owner, repo, title, body = '', labels = []) => {
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (body) params.append('body', body);
  if (labels && labels.length > 0) params.append('labels', labels.join(','));
  return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`;
};
