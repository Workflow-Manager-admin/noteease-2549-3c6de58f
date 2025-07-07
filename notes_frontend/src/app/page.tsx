'use client';

import { useEffect, useState } from 'react';

// Types
type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type NoteDraft = {
  title: string;
  content: string;
};

// Storage helper functions
const NOTES_KEY = 'notes_app_notes_v1';

function getNotesFromStorage(): Note[] {
  if (typeof window === 'undefined') return [];
  const json = localStorage.getItem(NOTES_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
function saveNotesToStorage(notes: Note[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// UI Color Palette
const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#14b8a6',
  background: '#fff',
  foreground: '#171717'
};

// PUBLIC_INTERFACE
function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// PUBLIC_INTERFACE
export default function NotesHome() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false); // true: edit/create, false: view
  const [draft, setDraft] = useState<NoteDraft>({ title: '', content: '' });
  const [isNew, setIsNew] = useState<boolean>(false);

  useEffect(() => {
    setNotes(getNotesFromStorage());
  }, []);

  // Save on change
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  // PUBLIC_INTERFACE
  function handleSelectNote(id: string) {
    setEditing(false);
    setIsNew(false);
    setSelectedId(id);
    const note = notes.find((n) => n.id === id);
    setDraft({
      title: note?.title || '',
      content: note?.content || '',
    });
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    setEditing(true);
    setIsNew(true);
    setDraft({ title: '', content: '' });
    setSelectedId(null);
  }

  // PUBLIC_INTERFACE
  function handleEditNote() {
    setEditing(true);
    setIsNew(false);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id: string) {
    if (!confirm('Delete this note?')) return;
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setEditing(false);
      setIsNew(false);
      setDraft({ title: '', content: '' });
    }
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    if (draft.title.trim() === '' && draft.content.trim() === '') return;
    const now = new Date().toISOString();
    if (isNew) {
      const newNote: Note = {
        id: generateId(),
        title: draft.title || 'Untitled',
        content: draft.content,
        createdAt: now,
        updatedAt: now,
      };
      setNotes([newNote, ...notes]);
      setSelectedId(newNote.id);
    } else {
      setNotes(notes.map((n) =>
        n.id === selectedId
          ? { ...n, title: draft.title || 'Untitled', content: draft.content, updatedAt: now }
          : n
      ));
    }
    setEditing(false);
    setIsNew(false);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    if (isNew) {
      setIsNew(false);
      setEditing(false);
      setDraft({ title: '', content: '' });
    } else {
      setEditing(false);
      const note = notes.find((n) => n.id === selectedId);
      setDraft({
        title: note?.title || '',
        content: note?.content || '',
      });
    }
  }

  // UI rendering
  // Header
  const Header = (
    <header
      style={{
        background: COLORS.primary,
        color: '#fff',
        padding: '0 2rem',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        letterSpacing: '0.03em',
        fontSize: 22,
        boxShadow: '0 1px 0 ' + COLORS.secondary + '10',
        zIndex: 2,
      }}
    >
      NoteEase
    </header>
  );

  // Notes Sidebar
  const Sidebar = (
    <aside
      style={{
        background: '#f8fafc',
        width: 265,
        borderRight: '1px solid #e5e7eb',
        padding: '1.2rem 0.2rem',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {notes.length === 0 && (
            <li style={{
              padding: '1.5rem 1rem',
              color: COLORS.secondary,
              fontSize: 14,
              textAlign: 'center'
            }}>No notes yet.</li>
          )}
          {notes.map((note) => (
            <li key={note.id}
              style={{
                background: note.id === selectedId ? COLORS.accent + '18' : 'transparent',
                margin: '0.15rem 0',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.19s'
              }}
              onClick={() => handleSelectNote(note.id)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                justifyContent: 'space-between',
                padding: '0.7rem 1.2rem 0.7rem 1.2rem'
              }}>
                <div style={{
                  flex: 1,
                  fontWeight: note.id === selectedId ? 500 : 400,
                  color: note.id === selectedId ? COLORS.primary : COLORS.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 16
                }}>
                  {note.title || 'Untitled'}
                </div>
                <button
                  title="Delete note"
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#c0392b',
                    cursor: 'pointer',
                    fontSize: 15,
                    padding: 0,
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  tabIndex={-1}
                  aria-label="Delete"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );

  // Main Area for Viewing/Editing Notes
  const Main = (
    <main
      style={{
        flex: 1,
        padding: '2.2rem 2.6rem 1rem 2.6rem',
        background: '#fff'
      }}
    >
      {
        editing ? (
          <div
            style={{
              maxWidth: 620,
              margin: '0 auto',
              background: '#f9fafb',
              borderRadius: 14,
              boxShadow: '0 1px 4px #0001',
              padding: '2rem 2rem 1.5rem 2rem',
            }}
          >
            <input
              type="text"
              placeholder="Title"
              value={draft.title}
              spellCheck={false}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
              style={{
                display: 'block',
                width: '100%',
                fontSize: 22,
                fontWeight: 500,
                marginBottom: 16,
                border: 'none',
                outline: 'none',
                background: 'none',
                borderBottom: '1.5px solid ' + COLORS.accent,
                padding: '0.5rem 0'
              }}
              autoFocus
            />
            <textarea
              placeholder="Type your note here…"
              rows={10}
              value={draft.content}
              spellCheck={false}
              onChange={e => setDraft({ ...draft, content: e.target.value })}
              style={{
                display: 'block',
                width: '100%',
                resize: 'vertical',
                fontSize: 16,
                padding: '0.75rem 0 .5rem 0',
                border: 'none',
                outline: 'none',
                background: 'none',
                color: COLORS.foreground,
                minHeight: 180,
              }}
            />
            <div style={{ marginTop: 20, display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: '#fff',
                  color: COLORS.secondary,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '0.5rem 1.3rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                style={{
                  background: COLORS.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.5rem 1.3rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 1.5px 8px #0001'
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : selectedId ? (
          (() => {
            const note = notes.find(n => n.id === selectedId);
            if (!note) return null;
            return (
              <div
                style={{ maxWidth: 700, margin: '0 auto', minHeight: 200 }}
              >
                <div style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: '.9rem',
                  wordBreak: 'break-word'
                }}>{note.title || 'Untitled'}</div>
                <div style={{
                  fontSize: 16,
                  color: COLORS.secondary + 'ee',
                  marginBottom: '1.7rem'
                }}>
                  Created:&nbsp;{new Date(note.createdAt).toLocaleString()}
                  {note.updatedAt !== note.createdAt && (
                    <> · Updated: {new Date(note.updatedAt).toLocaleString()}</>
                  )}
                </div>
                <div style={{
                  fontSize: 17,
                  color: COLORS.foreground,
                  marginBottom: '2.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {note.content || (
                    <span style={{ color: COLORS.secondary }}>No content…</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleEditNote}
                    style={{
                      background: COLORS.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.5rem 1.3rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      boxShadow: '0 1.5px 8px #0001'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedId)}
                    style={{
                      background: '#fff',
                      color: '#c0392b',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '0.5rem 1.3rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: COLORS.secondary,
              fontSize: 18,
              marginTop: 80
            }}
          >
            Select a note or create a new one to get started.
          </div>
        )
      }
    </main>
  );

  // Floating Action Button for Adding Notes
  const Fab = (
    <button
      title="New note"
      onClick={handleNewNote}
      aria-label="New note"
      style={{
        position: 'fixed',
        right: 36,
        bottom: 38,
        zIndex: 3,
        padding: 0,
        background: COLORS.accent,
        color: '#fff',
        border: 'none',
        width: 58,
        height: 58,
        borderRadius: '50%',
        boxShadow: '0 3px 16px #14b8a655',
        fontSize: 34,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.13s, scale 0.12s',
        cursor: 'pointer',
      }}
      tabIndex={0}
    >
      +
    </button>
  );

  // Layout
  return (
    <div>
      {Header}
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', position: 'relative', background: '#f9fafb' }}>
        {Sidebar}
        {Main}
        {Fab}
      </div>
    </div>
  );
}
