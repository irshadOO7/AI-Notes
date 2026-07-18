#!/usr/bin/env node
/**
 * Smart Notes MCP server — exposes your notes to Cursor via the notes API.
 *
 * Env:
 *   SMART_NOTES_API_URL  (default http://127.0.0.1:8000)
 *   NOTES_EMAIL          login email
 *   NOTES_PASSWORD       login password
 *   NOTES_TOKEN          optional JWT (skips login if set)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = (process.env.SMART_NOTES_API_URL || 'http://127.0.0.1:8000').replace(
  /\/$/,
  ''
);

let cachedToken = process.env.NOTES_TOKEN || null;

function textResult(data) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: 'text', text }] };
}

function errorResult(message) {
  return {
    isError: true,
    content: [{ type: 'text', text: message }],
  };
}

async function login() {
  const email = process.env.NOTES_EMAIL;
  const password = process.env.NOTES_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'Set NOTES_EMAIL and NOTES_PASSWORD (or NOTES_TOKEN) in the MCP server env.'
    );
  }

  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Login failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  return cachedToken;
}

async function getToken() {
  if (cachedToken) return cachedToken;
  return login();
}

async function api(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    cachedToken = null;
    const retryToken = await login();
    const retry = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${retryToken}`,
        ...(options.headers || {}),
      },
    });
    if (!retry.ok) {
      const body = await retry.text();
      throw new Error(`API ${path} failed (${retry.status}): ${body}`);
    }
    if (retry.status === 204) return null;
    return retry.json();
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${body}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const server = new McpServer({
  name: 'smart-notes',
  version: '1.0.0',
});

server.registerTool(
  'list_notes',
  {
    description:
      'List all Smart Notes for the logged-in user (id, title, summary, timestamps).',
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe('Optional case-insensitive filter on title/content/summary'),
    },
  },
  async ({ query }) => {
    try {
      let notes = await api('/notes');
      if (query) {
        const q = query.toLowerCase();
        notes = notes.filter(
          (n) =>
            n.title?.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q) ||
            n.summary?.toLowerCase().includes(q)
        );
      }
      const listing = notes.map((n) => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        updated_at: n.updated_at,
      }));
      return textResult({ count: listing.length, notes: listing });
    } catch (err) {
      return errorResult(err.message);
    }
  }
);

server.registerTool(
  'get_note',
  {
    description: 'Get a single note by id, including full content.',
    inputSchema: {
      note_id: z.string().describe('Note id'),
    },
  },
  async ({ note_id }) => {
    try {
      const note = await api(`/notes/${note_id}`);
      return textResult(note);
    } catch (err) {
      return errorResult(err.message);
    }
  }
);

server.registerTool(
  'create_note',
  {
    description: 'Create a new note. If summary is omitted, the API may generate one.',
    inputSchema: {
      title: z.string().describe('Note title'),
      content: z.string().describe('Note body'),
      summary: z.string().optional().describe('Optional summary'),
    },
  },
  async ({ title, content, summary }) => {
    try {
      const body = { title, content };
      if (summary) body.summary = summary;
      const note = await api('/notes', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return textResult(note);
    } catch (err) {
      return errorResult(err.message);
    }
  }
);

server.registerTool(
  'update_note',
  {
    description: 'Update an existing note by id.',
    inputSchema: {
      note_id: z.string().describe('Note id'),
      title: z.string().optional().describe('New title'),
      content: z.string().optional().describe('New content'),
      summary: z.string().optional().describe('New summary'),
    },
  },
  async ({ note_id, title, content, summary }) => {
    try {
      const body = {};
      if (title !== undefined) body.title = title;
      if (content !== undefined) body.content = content;
      if (summary !== undefined) body.summary = summary;
      const note = await api(`/notes/${note_id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return textResult(note);
    } catch (err) {
      return errorResult(err.message);
    }
  }
);

server.registerTool(
  'delete_note',
  {
    description: 'Delete a note by id.',
    inputSchema: {
      note_id: z.string().describe('Note id'),
    },
  },
  async ({ note_id }) => {
    try {
      await api(`/notes/${note_id}`, { method: 'DELETE' });
      return textResult({ deleted: true, note_id });
    } catch (err) {
      return errorResult(err.message);
    }
  }
);

server.registerTool(
  'whoami',
  {
    description: 'Show the currently authenticated Smart Notes user.',
    inputSchema: {},
  },
  async () => {
    try {
      const me = await api('/me');
      return textResult(me);
    } catch (err) {
      return errorResult(err.message);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Smart Notes MCP server failed:', err);
  process.exit(1);
});
