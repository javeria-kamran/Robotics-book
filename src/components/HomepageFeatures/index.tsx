import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

/**
 * HomepageFeatures Component
 * 
 * This component is kept for potential future use but the main landing page
 * features are now integrated directly into src/pages/index.tsx for better
 * control over the Pinecone-style layout.
 * 
 * The landing page includes:
 * - HeroSection
 * - ModulesSection (4 module cards)
 * - FeaturesSection (6 feature cards)
 * - TechStackSection
 * - CtaSection
 */

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'ROS 2 Mastery',
    icon: '🧠',
    description: 'Learn the nervous system of modern robotics.',
  },
  {
    title: 'Simulation First',
    icon: '🌍',
    description: 'Break things virtually before breaking them IRL.',
  },
  {
    title: 'AI-Powered',
    icon: '⚡',
    description: 'NVIDIA Isaac for perception and navigation.',
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <span className={styles.featureIcon}>{icon}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
