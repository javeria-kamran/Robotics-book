import React, { ReactNode } from 'react';
import styles from './styles.module.css';

interface TLDRBoxProps {
  children: ReactNode;
  title?: string;
}

export default function TLDRBox({
  children,
  title = "TL;DR",
}: TLDRBoxProps) {
  return (
    <div className={styles.tldrBox}>
      <div className={styles.header}>
        <span className={styles.icon}>⚡</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.badge}>Quick Summary</span>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
