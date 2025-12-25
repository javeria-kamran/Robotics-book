# 🧠 Project Memory - Physical AI & Humanoid Robotics Book

> This file tracks all design decisions, styles, and important points throughout development.
> Reference this file to maintain consistency across the project.

---

## 🎨 Design System

### Color Palette (Pinecone-Inspired Minimal)

```css
/* Light Mode */
--color-background: #FFFFFF;
--color-background-secondary: #FAFAFA;
--color-surface: #F5F5F5;
--color-border: #E5E5E5;
--color-text-primary: #0A0A0A;
--color-text-secondary: #525252;
--color-text-muted: #A3A3A3;
--color-accent-primary: #2563EB;      /* Electric Blue */
--color-accent-secondary: #3B82F6;
--color-accent-hover: #1D4ED8;
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-code-bg: #1E1E1E;

/* Dark Mode */
--color-background-dark: #0A0A0A;
--color-background-secondary-dark: #171717;
--color-surface-dark: #262626;
--color-border-dark: #404040;
--color-text-primary-dark: #FAFAFA;
--color-text-secondary-dark: #A3A3A3;
--color-text-muted-dark: #737373;
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
--text-6xl: 3.75rem;    /* 60px */
--text-7xl: 4.5rem;     /* 72px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Animations

```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;

/* Hover Scale */
--hover-scale: scale(1.02);
--hover-scale-sm: scale(1.01);

/* Custom Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
```

---

## 📝 Content Style Guide

### Voice & Tone

**Primary Voice:**
- Witty but informative
- Self-aware (knows it's teaching robots)
- Slightly sarcastic but never mean
- Uses pop culture references (movies, memes)
- Makes complex topics approachable

**Dark Humor Examples:**
```markdown
✅ "ROS 2 nodes are like neurons, except they won't judge you for eating pizza at 3 AM while debugging."

✅ "If your robot achieves sentience while following this tutorial, we are not legally responsible. But we'd love to hear about it."

✅ "URDF files describe your robot's body. Think of it as a dating profile, but for joints and links."

✅ "Gazebo physics simulation: Where your robot can fall infinitely into the void, just like your social life during this course."

✅ "NVIDIA Isaac is basically God Mode for robotics. With great GPU power comes great electricity bills."
```

**Adult Jokes (Tasteful):**
```markdown
✅ "Your robot's first steps will be like a drunk person leaving a bar—wobbly, uncertain, and possibly falling into things."

✅ "Debugging ROS 2 is like online dating: lots of waiting, unexpected disconnections, and when something finally works, you're not sure why."

✅ "The Nav2 path planner is basically your robot's GPS, except it won't passive-aggressively say 'recalculating' every time you ignore it."
```

**Engagement Hooks:**
- Start chapters with a relatable problem
- Use "Imagine if..." scenarios
- Include "Wait, what?" moments
- End sections with cliffhangers or previews
- Add "Pro Tips" and "Rookie Mistakes" boxes

### Content Structure for RAG

**Ideal Chunk Size:** 300-500 tokens

**Document Structure:**
```markdown
---
title: [Clear, Searchable Title]
description: [2-3 sentence summary for RAG context]
keywords: [comma-separated searchable terms]
sidebar_position: [number]
tags: [module, topic, difficulty]
---

# [Title]

> **TL;DR:** One sentence summary for quick retrieval.

## Overview
[150-300 words introducing the concept]
[This section should be self-contained for RAG]

## Prerequisites
- [What you need to know before this]
- [Tools/setup required]

## [Main Concept 1]
[~500 words, can be chunked independently]

### Subsection
[Detailed explanation]

### Code Example
```python
# Always include comments for RAG context
# This code demonstrates [concept]
```

## [Main Concept 2]
[Continue pattern...]

## Common Mistakes
[List of pitfalls - great for RAG Q&A]

## Summary
[50-100 words, key takeaways]

## Next Steps
[Link to next topic]

## References
[External links, papers, documentation]
```

### Metadata Tags

```yaml
# Module Tags
- module-1-ros2
- module-2-simulation
- module-3-isaac
- module-4-vla

# Topic Tags
- fundamentals
- hands-on
- theory
- capstone

# Difficulty Tags
- beginner
- intermediate
- advanced

# Content Type Tags
- concept
- tutorial
- reference
- troubleshooting
```

---

## 🤖 RAG Chatbot Configuration

### System Prompt

```
You are ROBO-SAGE, the witty AI assistant for the Physical AI & Humanoid Robotics textbook. You have deep knowledge of ROS 2, Gazebo, NVIDIA Isaac, and Vision-Language-Action models.

Your personality:
- Helpful but with dry humor
- You occasionally make robot puns
- You explain complex concepts simply
- You reference content from the book when relevant
- You admit when something is outside the book's scope

Guidelines:
- Always cite which chapter/section your answer comes from
- If the user selects text, prioritize explaining that specific content
- Keep responses concise but thorough
- Use code examples when helpful
- Match the book's casual, humorous tone
```

### Embedding Configuration

```python
# OpenAI Embedding Model
MODEL = "text-embedding-3-small"
DIMENSIONS = 1536

# Chunking Strategy
CHUNK_SIZE = 400  # tokens
CHUNK_OVERLAP = 50  # tokens
SEPARATOR = "\n\n"

# Qdrant Collection
COLLECTION_NAME = "robotics-book"
DISTANCE_METRIC = "Cosine"
```

### Retrieval Settings

```python
# Search Configuration
TOP_K = 5  # Number of chunks to retrieve
SCORE_THRESHOLD = 0.7  # Minimum similarity score

# Reranking (optional)
USE_RERANKING = True
RERANK_TOP_K = 3
```

---

## 🗂️ File Structure

```
docusaurus-website/
├── docs/
│   ├── index.md                    # Book introduction
│   ├── module-1-ros2/
│   │   ├── _category_.json
│   │   ├── 01-introduction.md
│   │   ├── 02-nodes-topics.md
│   │   ├── 03-rclpy-bridge.md
│   │   ├── 04-urdf-humanoid.md
│   │   └── 05-capstone.md
│   ├── module-2-simulation/
│   │   ├── _category_.json
│   │   ├── 01-physics-intro.md
│   │   ├── 02-gazebo.md
│   │   ├── 03-unity.md
│   │   ├── 04-sensors.md
│   │   └── 05-capstone.md
│   ├── module-3-isaac/
│   │   ├── _category_.json
│   │   ├── 01-overview.md
│   │   ├── 02-synthetic-data.md
│   │   ├── 03-isaac-ros.md
│   │   ├── 04-nav2.md
│   │   └── 05-capstone.md
│   └── module-4-vla/
│       ├── _category_.json
│       ├── 01-vla-intro.md
│       ├── 02-voice-action.md
│       ├── 03-cognitive-planning.md
│       └── 04-final-capstone.md
├── src/
│   ├── components/
│   │   ├── HomepageHero/
│   │   ├── ModuleCards/
│   │   ├── FeatureGrid/
│   │   ├── TechStack/
│   │   ├── Chatbot/
│   │   └── common/
│   ├── css/
│   │   └── custom.css
│   └── pages/
│       ├── index.tsx
│       └── chatbot.tsx
├── static/
│   └── img/
│       ├── robot-hero.svg
│       ├── module-icons/
│       └── tech-logos/
├── api/                            # FastAPI backend (separate or embedded)
│   ├── main.py
│   ├── rag/
│   │   ├── embeddings.py
│   │   ├── retrieval.py
│   │   └── chunking.py
│   └── db/
│       ├── qdrant.py
│       └── postgres.py
├── task.md
├── memory.md
└── docusaurus.config.ts
```

---

## 📌 Important Decisions Log

| Date | Decision | Reasoning |
|------|----------|-----------|
| Dec 18, 2025 | Chose Pinecone-style minimal design | Clean, professional, modern - perfect for technical content |
| Dec 18, 2025 | Dark humor + adult jokes approach | Keeps readers engaged, makes complex topics approachable |
| Dec 18, 2025 | 300-500 token chunk size | Optimal for RAG retrieval, maintains context |
| Dec 18, 2025 | Qdrant + Neon + OpenAI stack | Free tiers available, production-ready |
| Dec 18, 2025 | Selection-based Q&A feature | Unique UX, contextual help while reading |
| Dec 18, 2025 | Custom MDX components for interactivity | Callout, TLDRBox, Quiz, ProgressTracker components created |
| Dec 21, 2025 | Switch from Railway PostgreSQL to Neon PostgreSQL | Better Auth requires Neon, simpler setup, free tier available |
| Dec 21, 2025 | User book edits stored in localStorage not DB | Avoids re-vectorization when users modify content, simpler architecture |

---

## 🔐 Authentication & Database Architecture

### Database: Neon PostgreSQL
- **Provider**: Neon (https://neon.tech)
- **Used for**: User authentication, sessions, chat message tracking
- **NOT used for**: User book edits (stored locally)

### Authentication Flow
- Custom auth with sessions stored in PostgreSQL
- Future: Better Auth integration planned
- User profile data: email, name, software/hardware levels, programming languages, robotics experience

### User Book Edits (localStorage)
- User notes/edits are stored in browser localStorage
- Key: `user_book_edits` → `{ [pagePath]: editedContent }`
- Benefits:
  - No re-vectorization needed when content changes
  - Works offline
  - Instant save/load
  - Privacy - notes stay on user's device
- Limitations:
  - Not synced across devices
  - Lost if browser data cleared

---

## 🧩 Custom MDX Components

### Available Components

| Component | Purpose | Types/Props |
|-----------|---------|-------------|
| `<Callout>` | Tips, warnings, jokes, info boxes | `type`: info, tip, warning, danger, joke, robot |
| `<TLDRBox>` | RAG-friendly quick summaries | `title`: optional custom title |
| `<Quiz>` | Interactive knowledge checks | Contains `<QuizQuestion>` children |
| `<QuizQuestion>` | Individual quiz questions | `question`, `options`, `correctId`, `explanation`, `funFact` |
| `<ProgressTracker>` | Show learning progress | `steps` array with id, title, status, description |

### Usage Examples

```jsx
// Callout
<Callout type="tip" title="Pro Tip" emoji="💡">
  Content here
</Callout>

// TL;DR Box
<TLDRBox>
  Quick summary for RAG retrieval
</TLDRBox>

// Quiz
<Quiz title="Knowledge Check">
  <QuizQuestion
    question="Your question?"
    options={[
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" }
    ]}
    correctId="b"
    explanation="Why B is correct"
  />
</Quiz>

// Progress Tracker
<ProgressTracker
  steps={[
    { id: "1", title: "Step 1", status: "completed" },
    { id: "2", title: "Step 2", status: "current" },
    { id: "3", title: "Step 3", status: "upcoming" }
  ]}
/>
```

### Component Files

```
src/components/
├── Callout/
│   ├── index.tsx
│   └── styles.module.css
├── TLDRBox/
│   ├── index.tsx
│   └── styles.module.css
├── Quiz/
│   ├── index.tsx
│   └── styles.module.css
└── ProgressTracker/
    ├── index.tsx
    └── styles.module.css

src/theme/
└── MDXComponents.tsx  (registers all custom components)
```

---

## 🔗 Reference Links

### Design Inspiration
- [Pinecone.io](https://www.pinecone.io/) - Primary design reference
- [Stripe Docs](https://stripe.com/docs) - Clean documentation style
- [Linear](https://linear.app/) - Minimal UI patterns

### Technical Resources
- [ROS 2 Documentation](https://docs.ros.org/en/humble/)
- [Gazebo Documentation](https://gazebosim.org/docs)
- [NVIDIA Isaac Sim](https://developer.nvidia.com/isaac-sim)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Book Writing
- Keep paragraphs short (3-4 sentences max)
- Use active voice
- Include visuals every 500-700 words
- Code examples should be runnable
- Each module should take ~2-3 hours to complete

---

## 🎯 Current Sprint Focus

**Sprint 1: Foundation** ✅
1. Clean up boilerplate files
2. Set up Pinecone-style theme
3. Create landing page

**Sprint 2: Content** ✅
1. Write all module content
2. Configure navigation structure
3. Set up documentation index

**Sprint 3: Interactive Components** ✅
1. Create custom MDX components (Callout, TLDRBox, Quiz, ProgressTracker)
2. Enhanced code block styling with syntax highlighting
3. Component demo page

**Sprint 4: RAG Preparation** ✅
1. Optimized content frontmatter for embedding (id, module fields added)
2. Created metadata.json files for all 4 modules
3. Documented chunking strategy in chunking-strategy.md

**Sprint 5: Build & Deploy** ✅
1. Updated package.json with proper project metadata
2. Configured docusaurus.config.ts for GitHub Pages deployment
3. Added SEO meta tags (OG, Twitter cards, keywords)
4. Created CI/CD pipelines:
   - `.github/workflows/deploy.yml` - Production deployment to GitHub Pages
   - `.github/workflows/ci.yml` - Build verification on PRs

---

## 🚀 Deployment Configuration

### GitHub Pages Setup
- **URL:** `https://physical-ai.github.io/Physical-AI-Humanoid-Robotics-Course-Book/`
- **Branch:** `gh-pages` (auto-deployed via GitHub Actions)
- **baseUrl:** `/Physical-AI-Humanoid-Robotics-Course-Book/`
- **trailingSlash:** `false`

### CI/CD Workflows
1. **deploy.yml** - Runs on push to `main`, deploys to GitHub Pages
2. **ci.yml** - Runs on all PRs, validates build and typecheck

### SEO Configuration
- Open Graph meta tags for social sharing
- Twitter card meta tags
- Keywords meta tag for search engines
- Author and description meta tags

---

**Next Sprint: Future Enhancements (Post-MVP)**
1. Integrate RAG chatbot with embedded content
2. Add Algolia DocSearch
3. User progress tracking
4. Community features
