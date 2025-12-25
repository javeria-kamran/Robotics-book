import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../../context/AuthContext';
import styles from './DocPageActions.module.css';

// Helper functions for localStorage-based user edits
const EDITS_STORAGE_KEY = 'user_book_edits';

function getUserEdits(): Record<string, string> {
  try {
    const stored = localStorage.getItem(EDITS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveUserEdit(pagePath: string, content: string): void {
  const edits = getUserEdits();
  edits[pagePath] = content;
  localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(edits));
}

function getUserEditForPage(pagePath: string): string | null {
  const edits = getUserEdits();
  return edits[pagePath] || null;
}

interface DocPageActionsProps {
  content: string;
  pagePath: string;
}

export default function DocPageActions({ content, pagePath }: DocPageActionsProps) {
  const { user, token } = useAuth();
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [userEdit, setUserEdit] = useState<string | null>(null);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user's saved edit for this page from localStorage
  useEffect(() => {
    if (pagePath) {
      const savedEdit = getUserEditForPage(pagePath);
      if (savedEdit) {
        setUserEdit(savedEdit);
      }
    }
  }, [pagePath]);

  const handlePersonalize = async () => {
    if (!user) {
      setError('Please sign in to personalize content');
      return;
    }

    setIsPersonalizing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          user_level: user.software_level || 'beginner',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to personalize content');
      }

      const data = await response.json();
      setPersonalizedContent(data.content);
      setShowPersonalized(true);
      setShowTranslated(false);
    } catch (err: any) {
      setError(err.message || 'Failed to personalize');
    } finally {
      setIsPersonalizing(false);
    }
  };

  const handleTranslate = async () => {
    if (!user) {
      setError('Please sign in to translate content');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          target_language: 'urdu',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate content');
      }

      const data = await response.json();
      setTranslatedContent(data.content);
      setShowTranslated(true);
      setShowPersonalized(false);
    } catch (err: any) {
      setError(err.message || 'Failed to translate');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShowOriginal = () => {
    setShowPersonalized(false);
    setShowTranslated(false);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    // Editing is available for all users since it's stored locally
    setEditText(userEdit || content);
    setIsEditing(true);
    setShowPersonalized(false);
    setShowTranslated(false);
  };

  const handleSaveEdit = () => {
    setError(null);
    setSaveSuccess(false);

    try {
      // Save to localStorage
      saveUserEdit(pagePath, editText);
      setUserEdit(editText);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        {/* Personalize/Translate require sign-in, but Notes work locally */}
        {!user ? (
          <>
            <p className={styles.signInPrompt}>
              <a href="/signin">Sign in</a> to personalize content or translate to Urdu
            </p>
            <button
              className={`${styles.actionBtn} ${styles.editBtn} ${isEditing ? styles.active : ''}`}
              onClick={isEditing ? handleCancelEdit : handleStartEdit}
            >
              {isEditing ? (
                '✕ Cancel'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {userEdit ? 'Edit Notes' : 'Add Notes'}
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.actionBtn} ${showPersonalized ? styles.active : ''}`}
              onClick={showPersonalized ? handleShowOriginal : handlePersonalize}
              disabled={isPersonalizing || isTranslating || isEditing}
            >
              {isPersonalizing ? (
                <span className={styles.spinner} />
              ) : showPersonalized ? (
                '← Original'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Personalize for {user.software_level}
                </>
              )}
            </button>
            
            <button
              className={`${styles.actionBtn} ${showTranslated ? styles.active : ''}`}
              onClick={showTranslated ? handleShowOriginal : handleTranslate}
              disabled={isPersonalizing || isTranslating || isEditing}
            >
              {isTranslating ? (
                <span className={styles.spinner} />
              ) : showTranslated ? (
                '← English'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                  </svg>
                  اردو میں ترجمہ
                </>
              )}
            </button>

            <button
              className={`${styles.actionBtn} ${styles.editBtn} ${isEditing ? styles.active : ''}`}
              onClick={isEditing ? handleCancelEdit : handleStartEdit}
              disabled={isPersonalizing || isTranslating}
            >
              {isEditing ? (
                '✕ Cancel'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {userEdit ? 'Edit Notes' : 'Add Notes'}
                </>
              )}
            </button>
          </>
        )}
      </div>

      {saveSuccess && <div className={styles.success}>Notes saved successfully!</div>}
      {error && <div className={styles.error}>{error}</div>}

      {isEditing && (
        <div className={styles.editContainer}>
          <div className={styles.contentHeader}>Your Personal Notes</div>
          <textarea
            className={styles.editTextarea}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Add your personal notes, annotations, or modifications to this chapter..."
            rows={10}
          />
          <div className={styles.editActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSaveEdit}
            >
              Save Notes
            </button>
          </div>
        </div>
      )}

      {userEdit && !isEditing && (
        <div className={styles.userNotes}>
          <div className={styles.notesHeader}>
            <span>Your Notes</span>
            <button className={styles.editNotesBtn} onClick={handleStartEdit}>Edit</button>
          </div>
          <div className={styles.notesBody}>{userEdit}</div>
        </div>
      )}

      {(showPersonalized || showTranslated) && (
        <div className={styles.modifiedContent}>
          <div className={styles.contentHeader}>
            {showPersonalized ? `Personalized for ${user?.software_level} level` : 'اردو ترجمہ'}
          </div>
          <div 
            className={styles.contentBody}
            dangerouslySetInnerHTML={{ 
              __html: (showPersonalized ? personalizedContent : translatedContent) || '' 
            }}
          />
        </div>
      )}
    </div>
  );
}
