import { pool, isPgConnected, localStore, saveStore } from '../config/db.js';

/**
 * @route POST /api/webhooks/github
 * Handles GitHub push webhook events and links commit messages containing ticket keys (e.g. PLN-101)
 */
export const handleGitHubPushWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const commits = payload.commits || [];
    const repository = payload.repository || {};
    const ref = payload.ref || 'refs/heads/main';
    const branch = ref.replace('refs/heads/', '');

    if (!Array.isArray(commits) || commits.length === 0) {
      return res.json({ success: true, message: 'No commits in payload to process', linkedCount: 0 });
    }

    const linkedCommits = [];
    const TICKET_REGEX = /\b([A-Z]{2,6}-\d+)\b/gi;

    for (const commit of commits) {
      const message = commit.message || '';
      const matches = message.match(TICKET_REGEX);

      if (matches && matches.length > 0) {
        // Unique ticket keys found in commit message
        const ticketKeys = [...new Set(matches.map((m) => m.toUpperCase()))];

        for (const ticketKey of ticketKeys) {
          const shortHash = (commit.id || commit.hash || String(Date.now())).slice(0, 7);
          const authorName = commit.author?.name || commit.committer?.name || 'Git Author';
          const authorEmail = commit.author?.email || commit.committer?.email || 'dev@github.com';
          const commitUrl = commit.url || (repository.html_url ? `${repository.html_url}/commit/${commit.id}` : null);

          // Check if commit mentions closing / fixing the ticket
          const isClosing = /fix(es|ed)?|close(s|d)?|resolve(s|d)?/i.test(message);

          if (isPgConnected) {
            // Find task
            const taskRes = await pool.query('SELECT id, status, progress FROM tasks WHERE ticket_key = $1', [ticketKey]);
            const taskId = taskRes.rows.length > 0 ? taskRes.rows[0].id : null;

            // Insert commit record
            await pool.query(
              `INSERT INTO commits (task_id, ticket_key, commit_hash, commit_message, author_name, author_email, commit_url, branch)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [taskId, ticketKey, shortHash, message, authorName, authorEmail, commitUrl, branch]
            );

            // Auto-advance task status if commit closes it
            if (taskId && isClosing) {
              await pool.query('UPDATE tasks SET status = $1, progress = 100, updated_at = NOW() WHERE id = $2', ['done', taskId]);
            }
          } else {
            const task = localStore.tasks.find((t) => t.ticket_key === ticketKey);
            const taskId = task ? task.id : null;

            const newCommit = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              task_id: taskId,
              ticket_key: ticketKey,
              commit_hash: shortHash,
              commit_message: message,
              author_name: authorName,
              author_email: authorEmail,
              commit_url: commitUrl,
              branch,
              created_at: commit.timestamp || new Date().toISOString(),
            };

            localStore.commits.push(newCommit);

            if (task && isClosing) {
              task.status = 'done';
              task.progress = 100;
              task.updated_at = new Date().toISOString();
            }

            saveStore();
          }

          linkedCommits.push({ ticketKey, commitHash: shortHash, message });
        }
      }
    }

    return res.json({
      success: true,
      message: `Successfully processed ${commits.length} commit(s), linked ${linkedCommits.length} ticket reference(s).`,
      linkedCommits,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: 'Failed to process webhook', error: err.message });
  }
};
