import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// PostgreSQL Connection Pool configuration
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'planio',
      port: Number(process.env.PGPORT) || 5432,
      connectionTimeoutMillis: 3000,
    };

export const pool = new Pool(poolConfig);

export let isPgConnected = false;

// Fallback in-memory / JSON store
const defaultInitialState = {
  users: [
    {
      id: 1,
      name: 'Darlene Robertson',
      email: 'darlene@planio.dev',
      password_hash: bcrypt.hashSync('password123', 10),
      avatar_initials: 'DR',
      color: '#3b82f6',
      role: 'UI/UX Designer',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Savannah Nguyen',
      email: 'savannah@planio.dev',
      password_hash: bcrypt.hashSync('password123', 10),
      avatar_initials: 'SN',
      color: '#10b981',
      role: 'Frontend Developer',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Leslie Alexander',
      email: 'leslie@planio.dev',
      password_hash: bcrypt.hashSync('password123', 10),
      avatar_initials: 'LA',
      color: '#f59e0b',
      role: 'Product Manager',
      created_at: new Date().toISOString(),
    }
  ],
  tasks: [
    {
      id: 1,
      ticket_key: 'PLN-101',
      user_id: 1,
      title: 'Implement User Authentication & JWT Flow',
      description: 'Setup Node.js Express backend with PostgreSQL user login, registration, and password hashing.',
      status: 'inprogress',
      priority: 'high',
      progress: 65,
      estimated_time: '8h',
      date_label: '03/02 10:30 AM',
      integration: 'github',
      image_url: null,
      creator_id: '1',
      assignees: [1, 2],
      github_repo: 'octocat/Hello-World',
      github_issue_number: 101,
      github_issue_url: 'https://github.com/octocat/Hello-World/issues/101',
      github_labels: [{ name: 'backend', color: '#3b82f6' }, { name: 'auth', color: '#8b5cf6' }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      ticket_key: 'PLN-102',
      user_id: 2,
      title: 'GitHub Webhook & Commit Linking Pipeline',
      description: 'Automatically link git commit hashes and messages to tickets when pushed to repository.',
      status: 'todo',
      priority: 'high',
      progress: 25,
      estimated_time: '12h',
      date_label: '03/02 11:15 AM',
      integration: 'github',
      image_url: null,
      creator_id: '2',
      assignees: [2],
      github_repo: 'octocat/Hello-World',
      github_issue_number: 102,
      github_issue_url: 'https://github.com/octocat/Hello-World/issues/102',
      github_labels: [{ name: 'git', color: '#10b981' }, { name: 'feature', color: '#f59e0b' }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      ticket_key: 'PLN-103',
      user_id: 1,
      title: 'Design System & Dark Mode Polish',
      description: 'Refine Tailwind and Vanilla CSS variables, glassmorphic header, and responsive card layouts.',
      status: 'done',
      priority: 'medium',
      progress: 100,
      estimated_time: '4h',
      date_label: '03/01 04:20 PM',
      integration: 'github',
      image_url: null,
      creator_id: '1',
      assignees: [1, 3],
      github_repo: 'octocat/Hello-World',
      github_issue_number: 103,
      github_issue_url: 'https://github.com/octocat/Hello-World/issues/103',
      github_labels: [{ name: 'ui', color: '#ec4899' }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  commits: [
    {
      id: 1,
      task_id: 1,
      ticket_key: 'PLN-101',
      commit_hash: '9f8b2a1',
      commit_message: 'PLN-101: Setup express auth router and bcrypt password hashing',
      author_name: 'Darlene Robertson',
      author_email: 'darlene@planio.dev',
      commit_url: 'https://github.com/octocat/Hello-World/commit/9f8b2a1',
      branch: 'main',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      task_id: 1,
      ticket_key: 'PLN-101',
      commit_hash: '3d7e5c8',
      commit_message: 'PLN-101: Add JWT authentication middleware & me endpoint',
      author_name: 'Savannah Nguyen',
      author_email: 'savannah@planio.dev',
      commit_url: 'https://github.com/octocat/Hello-World/commit/3d7e5c8',
      branch: 'feature/auth',
      created_at: new Date().toISOString(),
    }
  ],
  repositories: [
    {
      id: 1,
      user_id: 1,
      owner: 'octocat',
      repo_name: 'Hello-World',
      full_name: 'octocat/Hello-World',
      github_token: '',
      default_branch: 'main',
      created_at: new Date().toISOString(),
    }
  ],
  ticket_counter: 104
};

// Load data store from disk if exists
export let localStore = (() => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading local data store, resetting to default', e);
    }
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultInitialState, null, 2));
  return defaultInitialState;
})();

export const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localStore, null, 2));
  } catch (e) {
    console.error('Failed to save store to file', e);
  }
};

/**
 * Initialize PostgreSQL tables or fallback
 */
export const initDB = async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    const client = await pool.connect();
    isPgConnected = true;
    console.log('✓ Successfully connected to PostgreSQL server!');

    // Initialize Schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_initials VARCHAR(10),
        color VARCHAR(20) DEFAULT '#3b82f6',
        role VARCHAR(100) DEFAULT 'Developer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS repositories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        owner VARCHAR(255) NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        github_token TEXT,
        default_branch VARCHAR(100) DEFAULT 'main',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        ticket_key VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'medium',
        progress INTEGER DEFAULT 0,
        estimated_time VARCHAR(50),
        date_label VARCHAR(100),
        integration VARCHAR(50) DEFAULT 'github',
        image_url TEXT,
        creator_id VARCHAR(50) DEFAULT '1',
        assignees JSONB DEFAULT '["1"]',
        github_repo VARCHAR(255),
        github_issue_number INTEGER,
        github_issue_url TEXT,
        github_labels JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS commits (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        ticket_key VARCHAR(50) NOT NULL,
        commit_hash VARCHAR(100) NOT NULL,
        commit_message TEXT NOT NULL,
        author_name VARCHAR(255),
        author_email VARCHAR(255),
        commit_url TEXT,
        branch VARCHAR(100) DEFAULT 'main',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default admin user if none exists
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    if (Number(usersCount.rows[0].count) === 0) {
      console.log('Seeding initial PostgreSQL users and tasks...');
      for (const u of defaultInitialState.users) {
        await client.query(
          'INSERT INTO users (name, email, password_hash, avatar_initials, color, role) VALUES ($1, $2, $3, $4, $5, $6)',
          [u.name, u.email, u.password_hash, u.avatar_initials, u.color, u.role]
        );
      }

      for (const t of defaultInitialState.tasks) {
        await client.query(
          `INSERT INTO tasks (ticket_key, user_id, title, description, status, priority, progress, estimated_time, date_label, integration, creator_id, assignees, github_repo, github_issue_number, github_issue_url, github_labels)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            t.ticket_key,
            t.user_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.progress,
            t.estimated_time,
            t.date_label,
            t.integration,
            t.creator_id,
            JSON.stringify(t.assignees),
            t.github_repo,
            t.github_issue_number,
            t.github_issue_url,
            JSON.stringify(t.github_labels),
          ]
        );
      }

      for (const c of defaultInitialState.commits) {
        await client.query(
          'INSERT INTO commits (task_id, ticket_key, commit_hash, commit_message, author_name, author_email, commit_url, branch) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [c.task_id, c.ticket_key, c.commit_hash, c.commit_message, c.author_name, c.author_email, c.commit_url, c.branch]
        );
      }
    }

    client.release();
    console.log('✓ PostgreSQL schema and seed data initialized successfully!');
  } catch (error) {
    isPgConnected = false;
    console.warn('⚠️ PostgreSQL connection failed (' + error.message + ').');
    console.log('✓ Operating in persistent local store mode (data/store.json) with full PostgreSQL schema compatibility.');
  }
};
