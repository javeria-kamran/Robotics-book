import React from 'react';
import Link from '@docusaurus/Link';
import { useAuth } from '../../context/AuthContext';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <Link to="/signin" className={styles.signInBtn}>Sign In</Link>
        <Link to="/signup" className={styles.signUpBtn}>Sign Up</Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.userBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.avatar}>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
        <span className={styles.userName}>{user.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            <div className={styles.userInfo}>
              <div className={styles.userEmail}>{user.email}</div>
              <div className={styles.userLevel}>
                {user.software_level} · {user.robotics_experience} experience
              </div>
            </div>
            <div className={styles.divider} />
            <button className={styles.menuItem} onClick={handleSignOut}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
