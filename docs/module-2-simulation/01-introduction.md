---
id: simulation-introduction
title: "Why Simulate? (A Love Letter to Breaking Things Virtually)"
description: "Introduction to robotics simulation. Learn why simulation is essential, when to use it, and how it saves time, money, and robots."
sidebar_position: 1
module: 2
keywords: [robotics simulation, Gazebo, Unity, digital twin, sim-to-real, physics simulation]
tags: [module-2, fundamentals, beginner]
---

# Why Simulate? (A Love Letter to Breaking Things Virtually)

> **TL;DR:** Simulation lets you break robots without breaking your budget. It's cheaper, faster, and safer than real hardware. Plus, you can reset the universe with a button click.

---

## The Cost of Reality

Let's do some math:

| Item | Cost | Time to Replace |
|------|------|-----------------|
| Servo motor (broken by crash) | $50-500 | 1-2 weeks shipping |
| Robot arm (bent by collision) | $2,000-50,000 | 1-3 months |
| Development robot (totaled) | $20,000-500,000 | 3-12 months |
| Engineer's sanity | Priceless | Never fully recovers |

Now imagine running 10,000 training episodes where your robot learns by trial and error. That's 10,000 opportunities for:
- Crashing into walls
- Falling over
- Dropping expensive objects
- Making expensive mechanical noises that "don't sound right"

**Simulation cost per crash:** $0.00  
**Real-world cost per crash:** 💸

---

## The Digital Twin Philosophy

A **digital twin** is a virtual replica of your robot and its environment. The idea:

1. Build your robot in simulation
2. Train it, test it, break it (safely)
3. Transfer to real hardware
4. Profit (or at least not go bankrupt)

```
┌─────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT CYCLE                       │
│                                                              │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│   │  Design  │ ──▶  │ Simulate │ ──▶  │   Real   │         │
│   │  (CAD)   │      │  (Test)  │      │ Hardware │         │
│   └──────────┘      └────┬─────┘      └──────────┘         │
│                          │                                  │
│                    ┌─────▼─────┐                           │
│                    │  Iterate  │                           │
│                    │  (Fast!)  │                           │
│                    └───────────┘                           │
│                                                             │
│   Time in simulation: Hours                                 │
│   Time with hardware: Weeks                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## What Simulation Gives You

### 🔁 Repeatability

Same initial conditions, every time. Debug an edge case? Just reload the exact scenario.

### ⚡ Speed

Run at 10x real-time. Train for "1000 hours" in one night.

### 🛡️ Safety

Your robot can:
- Fall off cliffs ✅
- Walk into fire ✅
- Punch walls at full speed ✅

No one gets hurt. No equipment gets destroyed.

### 📊 Perfect Ground Truth

In simulation, you *know* exactly where the robot is. In real life, you're guessing based on noisy sensors.

### 🌍 Impossible Scenarios

Test on Mars, underwater, in a volcano, during an earthquake... all from your laptop.

---

## The Simulators We'll Use

### Gazebo (Ignition)

**Best for:** ROS 2 integration, physics accuracy, academic research

- Open-source
- Native ROS 2 support
- Good physics (ODE, Bullet, DART)
- Decent graphics

```bash
# Quick start
gz sim shapes.sdf
```

### Unity (with Unity Robotics Hub)

**Best for:** Beautiful visuals, complex environments, game-engine features

- Photorealistic rendering
- Huge asset ecosystem
- C# scripting
- ROS 2 via ROS-TCP-Connector

### NVIDIA Isaac Sim

**Best for:** AI training, synthetic data generation, industrial applications

- Best graphics (Omniverse)
- Domain randomization built-in
- GPU-accelerated physics
- Native ROS 2 support

We'll cover Isaac Sim in Module 3. For now, let's focus on Gazebo and Unity.

---

## The Sim-to-Real Gap (The Hard Part)

Here's the uncomfortable truth: **simulation is not reality**.

Things that don't transfer perfectly:
- **Friction** — Rubber on concrete is... complicated
- **Motor dynamics** — Real motors have delays, backlash, heat
- **Sensor noise** — Real cameras have blur, lighting issues
- **Physics edge cases** — Soft contacts, deformable objects

### Strategies to Bridge the Gap

| Technique | Description |
|-----------|-------------|
| **Domain Randomization** | Randomly vary textures, lighting, physics parameters. If it works in 1000 variations, it probably works in reality. |
| **System Identification** | Measure your real robot's properties and match them in sim. |
| **Progressive Transfer** | Train in sim → fine-tune on real hardware → iterate. |
| **Physics-Accurate Sim** | Use simulators with validated physics (NVIDIA PhysX, MuJoCo). |

---

## When NOT to Simulate

Simulation isn't always the answer:

- **Simple integration tests** — Just run on real hardware
- **Contact-rich manipulation** — Sim physics still struggles here
- **Highly custom hardware** — Creating accurate sim models takes time
- **Final validation** — Always test on real hardware before deployment

The rule: **Simulate early and often, but always validate on real.**

---

## Setting Up Gazebo

### Installation (Ubuntu 22.04 + ROS 2 Humble)

```bash
# Gazebo Fortress (LTS version)
sudo apt update
sudo apt install ros-humble-ros-gz

# Verify
gz sim --version
```

### Your First Simulation

```bash
# Start Gazebo with a sample world
gz sim shapes.sdf
```

You should see a window with some geometric shapes. Congratulations, you're simulating!

---

## What We'll Cover in This Module

1. **Gazebo Fundamentals** — Physics, worlds, models
2. **Unity for Robotics** — High-fidelity rendering, ROS 2 bridge
3. **Sensor Simulation** — LiDAR, cameras, IMUs
4. **Capstone** — Build a complete simulation environment for your robot

---

## The Mindset Shift

Stop thinking of simulation as "practice." Think of it as:

- Your **development environment** (where you write and test code)
- Your **training ground** (where AI learns without consequences)
- Your **testing lab** (where you verify before deployment)

Real hardware is for **validation and deployment**, not development.

---

## Next Up

Time to get our hands dirty with Gazebo. We'll simulate physics, gravity, and the inevitable moment when your robot face-plants.

**→ [Physics Simulation with Gazebo](/docs/module-2-simulation/02-gazebo-physics)**
