import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <span className={styles.badge}>Physical AI Curriculum</span>
        <h1 className={styles.title}>
          Build robots that <span className={styles.accent}>actually work</span>
        </h1>
        <p className={styles.subtitle}>
          Master ROS 2, simulation, NVIDIA Isaac, and Vision-Language-Action models.
          From middleware to autonomous humanoids.
        </p>
        <div className={styles.actions}>
          <Link to="/docs" className={styles.primaryBtn}>
            Start Learning
          </Link>
          <Link to="/docs" className={styles.secondaryBtn}>
            View Curriculum
          </Link>
        </div>
      </div>
    </section>
  );
}

interface ModuleProps {
  num: string;
  title: string;
  desc: string;
  href: string;
}

function ModuleCard({ num, title, desc, href }: ModuleProps) {
  return (
    <Link to={href} className={styles.moduleCard}>
      <span className={styles.moduleNum}>{num}</span>
      <h3 className={styles.moduleTitle}>{title}</h3>
      <p className={styles.moduleDesc}>{desc}</p>
      <span className={styles.moduleArrow}>→</span>
    </Link>
  );
}

function ModulesSection() {
  const modules: ModuleProps[] = [
    {
      num: '01',
      title: 'ROS 2 Fundamentals',
      desc: 'Nodes, topics, services. The nervous system of every modern robot.',
      href: '/docs/module-1-ros2',
    },
    {
      num: '02',
      title: 'Simulation',
      desc: 'Gazebo and Unity. Break things virtually before breaking them physically.',
      href: '/docs/module-2-simulation',
    },
    {
      num: '03',
      title: 'NVIDIA Isaac',
      desc: 'GPU-accelerated perception, navigation, and photorealistic simulation.',
      href: '/docs/module-3-isaac',
    },
    {
      num: '04',
      title: 'Vision-Language-Action',
      desc: 'LLMs meet robotics. Natural language to physical action.',
      href: '/docs/module-4-vla',
    },
  ];

  return (
    <section className={styles.modules}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Curriculum</span>
        <h2 className={styles.sectionTitle}>Four modules to mastery</h2>
      </div>
      <div className={styles.moduleGrid}>
        {modules.map((m) => (
          <ModuleCard key={m.num} {...m} />
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  const stack = [
    'ROS 2 Humble',
    'Gazebo',
    'Unity',
    'Isaac Sim',
    'Isaac ROS',
    'Nav2',
    'OpenAI Whisper',
    'Vision Transformers',
  ];

  return (
    <section className={styles.stack}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Tech Stack</span>
        <h2 className={styles.sectionTitle}>Industry-standard tools</h2>
        <p className={styles.sectionSubtitle}>
          The same technologies powering Boston Dynamics, Tesla Bot, and Figure AI.
        </p>
      </div>
      <div className={styles.stackGrid}>
        {stack.map((item) => (
          <div key={item} className={styles.stackItem}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className={styles.cta}>
      <h2 className={styles.ctaTitle}>Ready to build?</h2>
      <p className={styles.ctaSubtitle}>
        Start with Module 1 or jump to whatever interests you.
      </p>
      <Link to="/docs" className={styles.primaryBtn}>
        Get Started
      </Link>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="Master Physical AI with ROS 2, Gazebo, NVIDIA Isaac, and VLA models.">
      <main className={styles.main}>
        <HeroSection />
        <div className={styles.divider} />
        <ModulesSection />
        <div className={styles.divider} />
        <StackSection />
        <div className={styles.divider} />
        <CtaSection />
      </main>
    </Layout>
  );
}
