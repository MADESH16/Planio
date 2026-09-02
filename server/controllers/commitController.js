import { pool, isPgConnected, localStore, saveStore } from '../config/db.js';

/**
 * @route POST /api/commits
 * Manually attach a commit to a ticket/task
 */
export const linkCommit = async (req, res) => {
  try {
    const {
      taskId,
      ticketKey,
      commitHash,
      commitMessage,
      authorName = req.user ? req.user.name : 'Git Developer',
      authorEmail = req.user ? req.user.email : 'dev@planio.dev',
      commitUrl = null,
      branch = 'main',
    } = req.body;

    if (!commitHash || !commitMessage) {
      return res.status(400).json({ success: false, message: 'Commit hash and message are required.' });
    }

    let targetTaskId = taskId;
    let targetTicketKey = ticketKey;

    // Resolve task ID from ticket key if not provided
    if (!targetTaskId && targetTicketKey) {
      if (isPgConnected) {
        const t = await pool.query('SELECT id, ticket_key FROM tasks WHERE ticket_key = $1', [targetTicketKey]);
        if (t.rows.length > 0) {
          targetTaskId = t.rows[0].id;
        }
      } else {
        const t = localStore.tasks.find((task) => task.ticket_key === targetTicketKey);
        if (t) {
          targetTaskId = t.id;
        }
      }
    }

    // Resolve ticket key from task ID if not provided
    if (!targetTicketKey && targetTaskId) {
      if (isPgConnected) {
        const t = await pool.query('SELECT id, ticket_key FROM tasks WHERE id = $1', [targetTaskId]);
        if (t.rows.length > 0) {
          targetTicketKey = t.rows[0].ticket_key;
        }
      } else {
        const t = localStore.tasks.find((task) => String(task.id) === String(targetTaskId));
        if (t) {
          targetTicketKey = t.ticket_key;
        }
      }
    }

    if (!targetTicketKey) {
      targetTicketKey = 'PLN-101';
    }

    const shortHash = commitHash.length > 7 ? commitHash.slice(0, 7) : commitHash;

    if (isPgConnected) {
      const result = await pool.query(
        `INSERT INTO commits (task_id, ticket_key, commit_hash, commit_message, author_name, author_email, commit_url, branch)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [targetTaskId, targetTicketKey, shortHash, commitMessage, authorName, authorEmail, commitUrl, branch]
      );

      return res.status(201).json({ success: true, commit: result.rows[0] });
    } else {
      const newCommit = {
        id: Date.now(),
        task_id: targetTaskId,
        ticket_key: targetTicketKey,
        commit_hash: shortHash,
        commit_message: commitMessage,
        author_name: authorName,
        author_email: authorEmail,
        commit_url: commitUrl,
        branch,
        created_at: new Date().toISOString(),
      };

      localStore.commits.push(newCommit);
      saveStore();

      return res.status(201).json({ success: true, commit: newCommit });
    }
  } catch (err) {
    console.error('Link commit error:', err);
    res.status(500).json({ success: false, message: 'Failed to link commit', error: err.message });
  }
};

/**
 * @route GET /api/commits/task/:taskId
 */
export const getTaskCommits = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (isPgConnected) {
      const result = await pool.query(
        'SELECT * FROM commits WHERE task_id = $1 OR ticket_key = $1 ORDER BY id DESC',
        [taskId]
      );
      return res.json({ success: true, commits: result.rows });
    } else {
      const commits = localStore.commits.filter(
        (c) => String(c.task_id) === String(taskId) || c.ticket_key === taskId
      );
      return res.json({ success: true, commits });
    }
  } catch (err) {
    console.error('Get task commits error:', err);
    res.status(500).json({ success: false, message: 'Failed to get commits' });
  }
};
