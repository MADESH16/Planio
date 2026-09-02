import { pool, isPgConnected, localStore, saveStore } from '../config/db.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Find git root directory
const findGitRoot = () => {
  let dir = process.cwd();
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
};

/**
 * Core function to scan git log and GitHub API for ticket commits
 */
export const runCommitSync = async (repoFullName = 'MADESH16/Planio') => {
  const newlySynced = [];
  const TICKET_REGEX = /\b([A-Z]{2,6}-\d+)\b/gi;
  const gitDir = findGitRoot();

  // 1. Scan local Git history
  try {
    const { stdout } = await execAsync('git log -n 100 --format="%H|%h|%an|%ae|%aI|%s"', { cwd: gitDir });
    const lines = stdout.split('\n').filter(Boolean);

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length < 6) continue;
      const fullHash = parts[0].trim();
      const shortHash = parts[1].trim();
      const authorName = parts[2].trim();
      const authorEmail = parts[3].trim();
      const dateIso = parts[4].trim();
      const message = parts.slice(5).join('|').trim();

      const matches = message.match(TICKET_REGEX);
      if (!matches || matches.length === 0) continue;

      const ticketKeys = [...new Set(matches.map((m) => m.toUpperCase()))];

      for (const ticketKey of ticketKeys) {
        const isClosing = /fix(es|ed)?|close(s|d)?|resolve(s|d)?/i.test(message);
        const commitUrl = `https://github.com/${repoFullName}/commit/${shortHash}`;

        if (isPgConnected) {
          const existing = await pool.query(
            'SELECT id FROM commits WHERE (commit_hash = $1 OR commit_hash = $2) AND ticket_key = $3',
            [shortHash, fullHash, ticketKey]
          );

          if (existing.rows.length === 0) {
            const taskRes = await pool.query('SELECT id FROM tasks WHERE ticket_key = $1', [ticketKey]);
            const taskId = taskRes.rows.length > 0 ? taskRes.rows[0].id : null;

            const insertRes = await pool.query(
              `INSERT INTO commits (task_id, ticket_key, commit_hash, commit_message, author_name, author_email, commit_url, branch, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               RETURNING *`,
              [taskId, ticketKey, shortHash, message, authorName, authorEmail, commitUrl, 'main', dateIso]
            );

            if (taskId && isClosing) {
              await pool.query('UPDATE tasks SET status = $1, progress = 100, updated_at = NOW() WHERE id = $2', ['done', taskId]);
            }

            newlySynced.push(insertRes.rows[0]);
          }
        } else {
          const alreadyExists = localStore.commits.some(
            (c) => (c.commit_hash === shortHash || c.commit_hash === fullHash) && c.ticket_key === ticketKey
          );

          if (!alreadyExists) {
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
              branch: 'main',
              created_at: dateIso || new Date().toISOString(),
            };

            localStore.commits.unshift(newCommit);

            if (task && isClosing) {
              task.status = 'done';
              task.progress = 100;
              task.updated_at = new Date().toISOString();
            }

            newlySynced.push(newCommit);
          }
        }
      }
    }

    if (!isPgConnected && newlySynced.length > 0) {
      saveStore();
    }
  } catch (gitErr) {
    console.warn('Local git log scan note:', gitErr.message);
  }

  // 2. Scan remote GitHub commits if available
  if (repoFullName) {
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${repoFullName}/commits?per_page=30`, {
        headers: {
          'User-Agent': 'Planio-App',
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (ghRes.ok) {
        const ghCommits = await ghRes.json();
        for (const item of ghCommits) {
          const sha = item.sha;
          const shortSha = sha.slice(0, 7);
          const msg = item.commit?.message || '';
          const author = item.commit?.author?.name || item.author?.login || 'Git Author';
          const email = item.commit?.author?.email || 'dev@planio.dev';
          const dateStr = item.commit?.author?.date || new Date().toISOString();
          const htmlUrl = item.html_url || `https://github.com/${repoFullName}/commit/${shortSha}`;

          const matches = msg.match(TICKET_REGEX);
          if (!matches) continue;

          const ticketKeys = [...new Set(matches.map((m) => m.toUpperCase()))];
          for (const ticketKey of ticketKeys) {
            const isClosing = /fix(es|ed)?|close(s|d)?|resolve(s|d)?/i.test(msg);

            if (isPgConnected) {
              const existing = await pool.query(
                'SELECT id FROM commits WHERE (commit_hash = $1 OR commit_hash = $2) AND ticket_key = $3',
                [shortSha, sha, ticketKey]
              );
              if (existing.rows.length === 0) {
                const taskRes = await pool.query('SELECT id FROM tasks WHERE ticket_key = $1', [ticketKey]);
                const taskId = taskRes.rows.length > 0 ? taskRes.rows[0].id : null;
                const insertRes = await pool.query(
                  `INSERT INTO commits (task_id, ticket_key, commit_hash, commit_message, author_name, author_email, commit_url, branch, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                   RETURNING *`,
                  [taskId, ticketKey, shortSha, msg, author, email, htmlUrl, 'main', dateStr]
                );
                if (taskId && isClosing) {
                  await pool.query('UPDATE tasks SET status = $1, progress = 100, updated_at = NOW() WHERE id = $2', ['done', taskId]);
                }
                newlySynced.push(insertRes.rows[0]);
              }
            } else {
              const alreadyExists = localStore.commits.some(
                (c) => (c.commit_hash === shortSha || c.commit_hash === sha) && c.ticket_key === ticketKey
              );
              if (!alreadyExists) {
                const task = localStore.tasks.find((t) => t.ticket_key === ticketKey);
                const taskId = task ? task.id : null;
                const newCommit = {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  task_id: taskId,
                  ticket_key: ticketKey,
                  commit_hash: shortSha,
                  commit_message: msg,
                  author_name: author,
                  author_email: email,
                  commit_url: htmlUrl,
                  branch: 'main',
                  created_at: dateStr,
                };
                localStore.commits.unshift(newCommit);
                if (task && isClosing) {
                  task.status = 'done';
                  task.progress = 100;
                  task.updated_at = new Date().toISOString();
                }
                newlySynced.push(newCommit);
              }
            }
          }
        }
        if (!isPgConnected && newlySynced.length > 0) {
          saveStore();
        }
      }
    } catch (ghErr) {
      console.warn('GitHub API sync note:', ghErr.message);
    }
  }

  return newlySynced;
};

/**
 * @route POST /api/commits/sync
 * @route GET /api/commits/sync
 * Synchronize commits from local Git history and GitHub repository
 */
export const syncCommits = async (req, res) => {
  try {
    const repoFullName = req.body?.repoFullName || req.query?.repo || 'MADESH16/Planio';
    const newlySynced = await runCommitSync(repoFullName);

    const allCommits = isPgConnected
      ? (await pool.query('SELECT * FROM commits ORDER BY id DESC')).rows
      : localStore.commits;

    return res.json({
      success: true,
      message: `Successfully synchronized ${newlySynced.length} new commit(s) matching tickets.`,
      newCount: newlySynced.length,
      syncedCommits: newlySynced,
      totalCommits: allCommits.length,
      commits: allCommits,
    });
  } catch (err) {
    console.error('Sync commits route error:', err);
    return res.status(500).json({ success: false, message: 'Failed to sync commits', error: err.message });
  }
};

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
    const finalCommitUrl = commitUrl || `https://github.com/MADESH16/Planio/commit/${shortHash}`;

    if (isPgConnected) {
      const result = await pool.query(
        `INSERT INTO commits (task_id, ticket_key, commit_hash, commit_message, author_name, author_email, commit_url, branch)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [targetTaskId, targetTicketKey, shortHash, commitMessage, authorName, authorEmail, finalCommitUrl, branch]
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
        commit_url: finalCommitUrl,
        branch,
        created_at: new Date().toISOString(),
      };

      localStore.commits.unshift(newCommit);
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
