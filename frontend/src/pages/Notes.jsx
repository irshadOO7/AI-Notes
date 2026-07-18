import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import './Notes.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summarySource, setSummarySource] = useState('');

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.getNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleGenerateSummary = async () => {
    if (!title.trim() && !content.trim()) return;
    setSuggesting(true);
    try {
      const data = await api.summarize(title, content);
      setSummary(data.summary);
      setSummarySource(data.source);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to generate summary');
    } finally {
      setSuggesting(false);
    }
  };

  const resetEditor = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setSummary('');
    setSummarySource('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (selectedNote) {
        await api.updateNote(selectedNote.id, { title, content, summary });
      } else {
        await api.createNote({ title, content, summary });
      }
      await loadNotes();
      resetEditor();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSummary(note.summary || '');
    setSummarySource('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.deleteNote(id);
      if (selectedNote?.id === id) resetEditor();
      await loadNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="notes-app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-icon">✦</span>
          <h1>Smart Notes</h1>
        </div>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="notes-layout">
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h2>My Notes</h2>
            <button className="btn-primary btn-sm" onClick={resetEditor}>+ New</button>
          </div>
          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="empty-state">No notes yet. Create your first one!</p>
          ) : (
            <ul className="notes-list">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
                  onClick={() => handleSelect(note)}
                >
                  <h3>{note.title}</h3>
                  <p className="note-preview">{note.summary || note.content}</p>
                  <span className="note-date">{formatDate(note.updated_at)}</span>
                  <button
                    className="btn-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="note-editor">
          <div className="editor-header">
            <h2>{selectedNote ? 'Edit Note' : 'New Note'}</h2>
          </div>
          <input
            className="title-input"
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="content-input"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
          />
          <div className="summary-section">
            <div className="summary-header">
              <h3>AI Summary</h3>
              {suggesting && <span className="badge suggesting">Generating...</span>}
              {!suggesting && summarySource && (
                <span className={`badge ${summarySource}`}>
                  {summarySource === 'ollama' ? 'Ollama LLM' : 'Auto fallback'}
                </span>
              )}
              <button
                type="button"
                className="btn-generate"
                onClick={handleGenerateSummary}
                disabled={suggesting || (!title.trim() && !content.trim())}
              >
                {suggesting ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <div className="summary-box">
              {summary || (suggesting ? 'Thinking...' : 'Click Generate to create an AI summary')}
            </div>
          </div>
          <div className="editor-actions">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? 'Saving...' : selectedNote ? 'Update Note' : 'Save Note'}
            </button>
            {selectedNote && (
              <button className="btn-ghost" onClick={resetEditor}>Cancel</button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
