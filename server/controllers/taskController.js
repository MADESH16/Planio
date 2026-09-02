import { pool, isPgConnected, localStore, saveStore } from '../config/db.js';

/**
 * Helper to generate next unique Ticket Key (e.g. PLN-104)
 */
const getNextTicketKey = async (prefix = 'PLN') => {
  if (isPgConnected) {
    const result = await pool.query('SELECT ticket_key FROM tasks ORDER BY id DESC LIMIT 1');
    if (result.rows.length > 0 && result.rows[0].ticket_key) {
      const match = result.rows[0].ticket_key.match(/\d+/);
      if (match) {
        const nextNum = parseInt(match[0], 10) + 1;
        return `${prefix}-${nextNum}`;
      }
    }
    return `${prefix}-101`;
  } else {
    localStore.ticket_counter = (localStore.ticket_counter || 100) + 1;
    saveStore();
    return `${prefix}-${localStore.ticket_counter}`;
  }
};

/**
 * @route GET /api/tasks
 */
export const getTasks = async (req, res) => {
  try {
    if (isPgConnected) {
      const tasksResult = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
      const commitsResult = await pool.query('SELECT * FROM commits ORDER BY id DESC');

      const tasks = tasksResult.rows.map((task) => {
        const taskCommits = commitsResult.rows.filter(
          (c) => c.task_id === task.id || c.ticket_key === task.ticket_key
        );
        return {
          id: task.id,
          ticketKey: task.ticket_key,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          estimatedTime: task.estimated_time,
          date: task.date_label,
          integration: task.integration,
          image: task.image_url,
          creatorId: task.creator_id,
          assignees: Array.isArray(task.assignees) ? task.assignees : JSON.parse(task.assignees || '[]'),
          totalAssigneesCount: Array.isArray(task.assignees) ? task.assignees.length : 1,
          githubRepo: task.github_repo,
          githubIssueNumber: task.github_issue_number,
          githubIssueUrl: task.github_issue_url,
          githubLabels: Array.isArray(task.github_labels) ? task.github_labels : JSON.parse(task.github_labels || '[]'),
          commits: taskCommits,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
        };
      });

      return res.json({ success: true, tasks });
    } else {
      const tasks = localStore.tasks.map((task) => {
        const taskCommits = localStore.commits.filter(
          (c) => c.task_id === task.id || c.ticket_key === task.ticket_key
        );
        return {
          id: task.id,
          ticketKey: task.ticket_key,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          estimatedTime: task.estimated_time,
          date: task.date_label,
          integration: task.integration,
          image: task.image_url,
          creatorId: task.creator_id,
          assignees: task.assignees || ['1'],
          totalAssigneesCount: task.assignees ? task.assignees.length : 1,
          githubRepo: task.github_repo,
          githubIssueNumber: task.github_issue_number,
          githubIssueUrl: task.github_issue_url,
          githubLabels: task.github_labels || [],
          commits: taskCommits,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
        };
      });

      return res.json({ success: true, tasks });
    }
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks', error: err.message });
  }
};

/**
 * @route POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      progress = 0,
      estimatedTime = '',
      date = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      integration = 'github',
      image = null,
      assignees = ['1'],
      creatorId = req.user ? String(req.user.id) : '1',
      githubRepo = null,
      githubIssueNumber = null,
      githubIssueUrl = null,
      githubLabels = [],
      ticketKey: customTicketKey,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const ticketKey = customTicketKey || (await getNextTicketKey('PLN'));
    const userId = req.user ? req.user.id : null;

    if (isPgConnected) {
      const result = await pool.query(
        `INSERT INTO tasks (
          ticket_key, user_id, title, description, status, priority, progress,
          estimated_time, date_label, integration, image_url, creator_id,
          assignees, github_repo, github_issue_number, github_issue_url, github_labels
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          ticketKey,
          userId,
          title.trim(),
          description,
          status,
          priority,
          Number(progress),
          estimatedTime,
          date,
          integration,
          image,
          creatorId,
          JSON.stringify(assignees),
          githubRepo,
          githubIssueNumber ? Number(githubIssueNumber) : null,
          githubIssueUrl,
          JSON.stringify(githubLabels),
        ]
      );

      const row = result.rows[0];
      const newTask = {
        id: row.id,
        ticketKey: row.ticket_key,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        progress: row.progress,
        estimatedTime: row.estimated_time,
        date: row.date_label,
        integration: row.integration,
        image: row.image_url,
        creatorId: row.creator_id,
        assignees: Array.isArray(row.assignees) ? row.assignees : JSON.parse(row.assignees || '[]'),
        githubRepo: row.github_repo,
        githubIssueNumber: row.github_issue_number,
        githubIssueUrl: row.github_issue_url,
        githubLabels: Array.isArray(row.github_labels) ? row.github_labels : JSON.parse(row.github_labels || '[]'),
        commits: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      return res.status(201).json({ success: true, task: newTask });
    } else {
      const newId = Date.now();
      const newTask = {
        id: newId,
        ticket_key: ticketKey,
        user_id: userId,
        title: title.trim(),
        description,
        status,
        priority,
        progress: Number(progress),
        estimated_time: estimatedTime,
        date_label: date,
        integration,
        image_url: image,
        creator_id: creatorId,
        assignees,
        github_repo: githubRepo,
        github_issue_number: githubIssueNumber ? Number(githubIssueNumber) : null,
        github_issue_url: githubIssueUrl,
        github_labels: githubLabels,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStore.tasks.unshift(newTask);
      saveStore();

      return res.status(201).json({
        success: true,
        task: {
          ...newTask,
          ticketKey: newTask.ticket_key,
          image: newTask.image_url,
          date: newTask.date_label,
          estimatedTime: newTask.estimated_time,
          commits: [],
        },
      });
    }
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ success: false, message: 'Failed to create task', error: err.message });
  }
};

/**
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isPgConnected) {
      const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const current = existing.rows[0];
      const updated = {
        title: updates.title !== undefined ? updates.title : current.title,
        description: updates.description !== undefined ? updates.description : current.description,
        status: updates.status !== undefined ? updates.status : current.status,
        priority: updates.priority !== undefined ? updates.priority : current.priority,
        progress: updates.progress !== undefined ? Number(updates.progress) : current.progress,
        estimated_time: updates.estimatedTime !== undefined ? updates.estimatedTime : current.estimated_time,
        date_label: updates.date !== undefined ? updates.date : current.date_label,
        integration: updates.integration !== undefined ? updates.integration : current.integration,
        image_url: updates.image !== undefined ? updates.image : current.image_url,
        assignees: updates.assignees !== undefined ? JSON.stringify(updates.assignees) : current.assignees,
        github_repo: updates.githubRepo !== undefined ? updates.githubRepo : current.github_repo,
        github_issue_number: updates.githubIssueNumber !== undefined ? updates.githubIssueNumber : current.github_issue_number,
        github_issue_url: updates.githubIssueUrl !== undefined ? updates.githubIssueUrl : current.github_issue_url,
        github_labels: updates.githubLabels !== undefined ? JSON.stringify(updates.githubLabels) : current.github_labels,
      };

      const result = await pool.query(
        `UPDATE tasks SET
          title = $1, description = $2, status = $3, priority = $4, progress = $5,
          estimated_time = $6, date_label = $7, integration = $8, image_url = $9,
          assignees = $10, github_repo = $11, github_issue_number = $12,
          github_issue_url = $13, github_labels = $14, updated_at = NOW()
        WHERE id = $15 RETURNING *`,
        [
          updated.title,
          updated.description,
          updated.status,
          updated.priority,
          updated.progress,
          updated.estimated_time,
          updated.date_label,
          updated.integration,
          updated.image_url,
          updated.assignees,
          updated.github_repo,
          updated.github_issue_number,
          updated.github_issue_url,
          updated.github_labels,
          id,
        ]
      );

      const row = result.rows[0];
      return res.json({ success: true, task: row });
    } else {
      const idx = localStore.tasks.findIndex((t) => String(t.id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      localStore.tasks[idx] = {
        ...localStore.tasks[idx],
        ...updates,
        image_url: updates.image !== undefined ? updates.image : localStore.tasks[idx].image_url,
        date_label: updates.date !== undefined ? updates.date : localStore.tasks[idx].date_label,
        estimated_time: updates.estimatedTime !== undefined ? updates.estimatedTime : localStore.tasks[idx].estimated_time,
        updated_at: new Date().toISOString(),
      };
      saveStore();

      return res.json({ success: true, task: localStore.tasks[idx] });
    }
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ success: false, message: 'Failed to update task', error: err.message });
  }
};

/**
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (isPgConnected) {
      await pool.query('DELETE FROM commits WHERE task_id = $1', [id]);
      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    } else {
      localStore.tasks = localStore.tasks.filter((t) => String(t.id) !== String(id));
      localStore.commits = localStore.commits.filter((c) => String(c.task_id) !== String(id));
      saveStore();
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete task', error: err.message });
  }
};
