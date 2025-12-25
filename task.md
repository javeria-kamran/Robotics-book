# Physical AI & Humanoid Robotics Book - Project Tasks

> **Project Codename:** "Learn to Build a Robot"  
> **Style Reference:** Minimal, dark theme, sharp UI, clean typography

---

## PHASE 0: Project Setup & Cleanup [DONE]

### Task 0.1: Clean Up Existing Files
- [x] Remove all example markdown files in `/docs`
- [x] Remove example blog posts in `/blog`
- [x] Clean up default homepage components
- [x] Remove unnecessary assets from `/static/img`

### Task 0.2: Project Structure Planning
- [x] Create book structure outline (in memory.md)
- [x] Create style guide (in memory.md)
- [x] Create chunking strategy for RAG (in memory.md)

---

## PHASE 1: Design System & Landing Page [DONE]

### Task 1.1: Docusaurus Theme Configuration
- [x] Configure dark mode by default
- [x] Set up custom color palette
- [x] Configure typography
- [x] Set up smooth scroll

### Task 1.2: Custom CSS
- [x] Define CSS variables
- [x] Sharp edges, minimal design
- [x] Blue accent buttons
- [x] Slate/black text colors

### Task 1.3: Landing Page
- [x] Hero section with CTA
- [x] Modules grid (4 cards)
- [x] Tech stack section
- [x] CTA section
- [x] Slim line dividers between sections

---

## PHASE 2: Documentation Structure & Navigation [DONE]

### Task 2.1: Sidebar Configuration
- [x] Define sidebar structure for 4 modules
- [x] Configure collapsible sections

### Task 2.2: Documentation Index
- [x] Create intro page

### Task 2.3: Module Category Pages
- [x] Configure all 4 module categories

---

## PHASE 3: Book Content Creation [DONE]

### Task 3.1: Module 1 - ROS 2
- [x] 01-introduction.md
- [x] 02-nodes-topics-services.md
- [x] 03-python-rclpy.md
- [x] 04-urdf-humanoids.md
- [x] 05-capstone.md

### Task 3.2: Module 2 - Simulation
- [x] 01-introduction.md
- [x] 02-gazebo-physics.md
- [x] 03-unity-rendering.md
- [x] 04-sensors-simulation.md
- [x] 05-capstone.md

### Task 3.3: Module 3 - NVIDIA Isaac
- [x] 01-introduction.md
- [x] 02-isaac-sim.md
- [x] 03-isaac-ros.md
- [x] 04-nav2-humanoid.md
- [x] 05-capstone.md

### Task 3.4: Module 4 - VLA
- [x] 01-introduction.md
- [x] 02-voice-to-action.md
- [x] 03-cognitive-planning.md
- [x] 04-capstone-project.md
- [x] 05-whats-next.md

---

## PHASE 4: Interactive Components [DONE]

### Task 4.1: MDX Components
- [x] Callout component
- [x] TLDRBox component

### Task 4.2: Code Styling
- [x] Syntax highlighting
- [x] Copy button for code blocks

---

## PHASE 5: RAG Preparation [DONE]

### Task 5.1: Content Optimization
- [x] Add frontmatter with id, module fields
- [x] Create metadata.json for each module

### Task 5.2: Chunking Strategy
- [x] Document chunk size recommendations
- [x] Define overlap strategy

---

## PHASE 6: Build & Deploy [DONE]

### Task 6.1: Build Configuration
- [x] Updated package.json with metadata
- [x] GitHub Pages configuration
- [x] SEO meta tags

### Task 6.2: CI/CD
- [x] deploy.yml for GitHub Pages
- [x] ci.yml for PR verification

---

## PHASE 7: RAG Chatbot Integration [DONE]

### Task 7.1: Chatbot UI [DONE]
- [x] Created `/chatbot` page with ChatGPT-like interface
- [x] Streaming text animation
- [x] Thinking/loading states
- [x] Sharp minimal design matching homepage
- [x] Suggestion buttons for common questions
- [x] Sources display for retrieved documents

### Task 7.2: Embedding Pipeline [DONE]
- [x] Created `scripts/embed_content.py` - chunks markdown, generates embeddings
- [x] Uses Gemini `gemini-embedding-001` (768 dimensions)
- [x] Uploads to Qdrant with metadata
- [x] 68 chunks from 23 files embedded

### Task 7.3: Qdrant Vector Database [DONE]
- [x] Qdrant Cloud integration
- [x] Collection with cosine similarity
- [x] Metadata: title, file, module, chunk_index

### Task 7.4: RAG Backend [DONE]
- [x] Created `scripts/api.py` - FastAPI backend
- [x] `/chat` endpoint (JSON response)
- [x] `/chat/stream` endpoint (streaming)
- [x] Uses Gemini `gemini-2.5-flash` for LLM
- [x] ROBO-SAGE system prompt

### Task 7.5: Setup & Verification [DONE]
- [x] Gemini API key configured
- [x] Qdrant Cloud credentials configured
- [x] Created `scripts/.env` with credentials
- [x] Installed Python dependencies
- [x] Ran embedding pipeline - 68 chunks uploaded
- [x] Verified RAG retrieval working (78% match score)
- [x] API server running on http://localhost:8000

---

## PHASE 8: Authentication & Personalization (Bonus Features)

> **Bonus Points:** Up to 150 extra points for implementing these features
> - Auth with Better Auth + Neon: +50 points
> - Content Personalization: +50 points  
> - Urdu Translation: +50 points

### Task 8.1: Auth with Neon PostgreSQL
- [x] Configure Neon PostgreSQL database connection
- [x] Create users table with profile fields
- [x] Create sessions table for auth tokens
- [x] Create signup page with background questions:
  - Software background (beginner/intermediate/advanced)
  - Hardware background (none/hobbyist/professional)
  - Programming languages known
  - Prior robotics experience
- [x] Create signin page
- [x] Store user preferences in Neon database
- [x] Add auth middleware/context provider
- [ ] Add user profile/settings page
- [ ] Migrate to Better Auth library (future)

### Task 8.2: Content Personalization
- [x] Add "Personalize Content" button at chapter start
- [x] Fetch user's background from auth context
- [x] Call Gemini API to rewrite chapter based on user level
- [x] Options: Simplify (beginner) / Standard / Advanced
- [x] Toggle between original and personalized view

### Task 8.3: Urdu Translation
- [x] Add "Translate to Urdu" button at chapter start
- [x] Create translation API endpoint
- [x] Use Gemini for Urdu translation
- [x] Toggle between English and Urdu
- [ ] RTL (right-to-left) CSS improvements for Urdu text
- [ ] Cache translations per chapter

### Task 8.4: User-Specific Book Edits (localStorage)
- [x] Add "Edit for Myself" / "Add Notes" mode
- [x] Create editable text area per chapter
- [x] Save user edits to localStorage (not database - avoids re-vectorization)
- [x] User sees their version, not shared with others
- [ ] Reset to original button
- **Note:** Works for all users (no sign-in required for notes)

---

## All Phases Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup & Cleanup | ✅ Done |
| 1 | Design System & Landing Page | ✅ Done |
| 2 | Documentation Structure | ✅ Done |
| 3 | Book Content Creation | ✅ Done |
| 4 | Interactive Components | ✅ Done |
| 5 | RAG Preparation | ✅ Done |
| 6 | Build & Deploy | ✅ Done |
| 7 | RAG Chatbot Integration | ✅ Done |
| 8 | Auth & Personalization | ✅ Done (core features) |

---

## Running the Project

**Start the backend:**
```bash
cd scripts
python api.py
```

**Start the frontend:**
```bash
npm start
```

**Access:**
- Site: https://how-to-make-humanoid-robot.vercel.app/
- Chatbot: https://how-to-make-humanoid-robot.vercel.app/chatbot
- API: https://physical-ai-humanoid-robotics-course-book-production-dfdc.up.railway.app

---

*Last Updated: December 19, 2025*
