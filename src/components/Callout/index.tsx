import React, { ReactNode } from 'react';
import styles from './styles.module.css';

type CalloutType = 'info' | 'tip' | 'warning' | 'danger' | 'joke' | 'robot';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  emoji?: string;
}

const defaultEmojis: Record<CalloutType, string> = {
  info: 'i',
  tip: '*',
  warning: '!',
  danger: 'x',
  joke: '~',
  robot: '>',
};

const defaultTitles: Record<CalloutType, string> = {
  info: 'Good to Know',
  tip: 'Pro Tip',
  warning: 'Watch Out',
  danger: 'Danger Zone',
  joke: 'Robot Humor',
  robot: 'From the Robot',
};

export default function Callout({
  type = 'info',
  title,
  children,
  emoji,
}: CalloutProps) {
  const displayEmoji = emoji || defaultEmojis[type];
  const displayTitle = title || defaultTitles[type];

  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      <div className={styles.header}>
        <span className={styles.emoji}>{displayEmoji}</span>
        <span className={styles.title}>{displayTitle}</span>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
