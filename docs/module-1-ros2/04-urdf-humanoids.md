---
id: ros2-urdf-humanoids
title: "URDF for Humanoids"
description: "Learn to describe robot geometry with URDF (Unified Robot Description Format). Build a humanoid robot model from scratch."
sidebar_position: 4
module: 1
keywords: [URDF, robot description, joints, links, humanoid, robot model, Xacro]
tags: [module-1, hands-on, intermediate]
---

# URDF for Humanoids

> **TL;DR:** URDF is XML that describes your robot's body—links (rigid parts) and joints (connections between parts). It's like a dating profile, but for robots. "Single bipedal humanoid, 6 DOF arms, looking for a simulation environment."

---

## What is URDF?

**URDF** = Unified Robot Description Format

It's an XML schema that describes:
- **Links** — Rigid body parts (torso, head, arm segments)
- **Joints** — How links connect and move (revolute, prismatic, fixed)
- **Visual geometry** — What the robot looks like (meshes, primitives)
- **Collision geometry** — What the physics engine uses (usually simplified)
- **Inertial properties** — Mass, center of gravity, moments of inertia

### Why XML? (Yes, Really)

"But it's 2024! Why XML?"

Because:
1. It's human-readable (debatable)
2. Every robotics tool supports it (Gazebo, RViz, MoveIt, Isaac)
3. Switching now would break 15 years of tools
4. We all just cope differently

---

## The Building Blocks

### Links

A **link** is a rigid body. It has:
- A name
- Visual representation (what you see)
- Collision representation (what physics uses)
- Inertial properties (mass, inertia)

```xml
<link name="torso">
  <!-- What you see in the viewer -->
  <visual>
    <geometry>
      <box size="0.4 0.3 0.6"/>
    </geometry>
    <material name="grey">
      <color rgba="0.5 0.5 0.5 1.0"/>
    </material>
  </visual>
  
  <!-- What the physics engine collides -->
  <collision>
    <geometry>
      <box size="0.4 0.3 0.6"/>
    </geometry>
  </collision>
  
  <!-- Physical properties -->
  <inertial>
    <mass value="15.0"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <inertia ixx="0.5" ixy="0" ixz="0" iyy="0.5" iyz="0" izz="0.3"/>
  </inertial>
</link>
```

### Joints

A **joint** connects two links and defines how they move relative to each other.

| Joint Type | Motion | Example |
|------------|--------|---------|
| `revolute` | Rotation with limits | Elbow, knee |
| `continuous` | Rotation, no limits | Wheel |
| `prismatic` | Linear slide | Lift actuator |
| `fixed` | No motion | Camera mount |

```xml
<joint name="shoulder_pitch" type="revolute">
  <parent link="torso"/>
  <child link="upper_arm"/>
  <origin xyz="0.2 0 0.25" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>  <!-- Rotate around Y axis -->
  <limit lower="-1.57" upper="1.57" effort="100" velocity="2.0"/>
</joint>
```

---

## Building a Simple Humanoid

Let's build a minimal humanoid: torso, head, and one arm.

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  
  <!-- ========== BASE LINK ========== -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.3 0.1"/>
      </geometry>
      <material name="dark_grey">
        <color rgba="0.3 0.3 0.3 1.0"/>
      </material>
    </visual>
  </link>
  
  <!-- ========== TORSO ========== -->
  <link name="torso">
    <visual>
      <origin xyz="0 0 0.3" rpy="0 0 0"/>
      <geometry>
        <box size="0.35 0.25 0.5"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.4 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.3" rpy="0 0 0"/>
      <geometry>
        <box size="0.35 0.25 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="20.0"/>
      <origin xyz="0 0 0.3"/>
      <inertia ixx="1.0" ixy="0" ixz="0" iyy="1.0" iyz="0" izz="0.5"/>
    </inertial>
  </link>
  
  <joint name="base_to_torso" type="fixed">
    <parent link="base_link"/>
    <child link="torso"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
  </joint>
  
  <!-- ========== HEAD ========== -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
      <material name="silver">
        <color rgba="0.8 0.8 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="3.0"/>
      <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.02"/>
    </inertial>
  </link>
  
  <joint name="neck" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.65" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>  <!-- Rotate around Z (yaw) -->
    <limit lower="-1.0" upper="1.0" effort="20" velocity="1.0"/>
  </joint>
  
  <!-- ========== RIGHT ARM ========== -->
  
  <!-- Upper Arm -->
  <link name="right_upper_arm">
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <inertial>
      <mass value="2.0"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.005"/>
    </inertial>
  </link>
  
  <joint name="right_shoulder_pitch" type="revolute">
    <parent link="torso"/>
    <child link="right_upper_arm"/>
    <origin xyz="-0.2 0 0.5" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-2.0" upper="2.0" effort="50" velocity="2.0"/>
  </joint>
  
  <!-- Lower Arm -->
  <link name="right_lower_arm">
    <visual>
      <origin xyz="0 0 -0.125"/>
      <geometry>
        <cylinder radius="0.04" length="0.25"/>
      </geometry>
      <material name="silver"/>
    </visual>
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.125"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.003"/>
    </inertial>
  </link>
  
  <joint name="right_elbow" type="revolute">
    <parent link="right_upper_arm"/>
    <child link="right_lower_arm"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.5" effort="30" velocity="2.5"/>
  </joint>
  
  <!-- Hand (simplified) -->
  <link name="right_hand">
    <visual>
      <geometry>
        <box size="0.08 0.05 0.12"/>
      </geometry>
      <material name="dark_grey"/>
    </visual>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>
  
  <joint name="right_wrist" type="fixed">
    <parent link="right_lower_arm"/>
    <child link="right_hand"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
  </joint>
  
</robot>
```

---

## Visualizing Your Robot

### RViz

```bash
# First, run the robot state publisher
ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:="$(cat simple_humanoid.urdf)"

# Then open RViz
ros2 run rviz2 rviz2
# Add RobotModel display, set Fixed Frame to "base_link"
```

### Joint State Publisher GUI

Move joints interactively:

```bash
ros2 run joint_state_publisher_gui joint_state_publisher_gui
```

---

## Xacro: Because Raw XML is Pain

**Xacro** = XML Macros

It adds:
- Variables (properties)
- Macros (reusable chunks)
- Math expressions
- File includes

### Before Xacro (Don't Do This)

```xml
<!-- Copy-paste hell for left arm... -->
<link name="left_upper_arm"><!-- same as right but mirrored --></link>
<link name="left_lower_arm"><!-- same as right but mirrored --></link>
<!-- Repeat for every symmetric part -->
```

### After Xacro (Much Better)

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid">
  
  <!-- Properties -->
  <xacro:property name="arm_radius" value="0.05"/>
  <xacro:property name="upper_arm_length" value="0.3"/>
  
  <!-- Macro for arm -->
  <xacro:macro name="arm" params="side reflect">
    <link name="${side}_upper_arm">
      <visual>
        <origin xyz="0 0 ${-upper_arm_length/2}"/>
        <geometry>
          <cylinder radius="${arm_radius}" length="${upper_arm_length}"/>
        </geometry>
      </visual>
    </link>
    
    <joint name="${side}_shoulder" type="revolute">
      <parent link="torso"/>
      <child link="${side}_upper_arm"/>
      <origin xyz="${reflect * 0.2} 0 0.5"/>
      <axis xyz="0 1 0"/>
      <limit lower="-2.0" upper="2.0" effort="50" velocity="2.0"/>
    </joint>
  </xacro:macro>
  
  <!-- Use the macro for both arms -->
  <xacro:arm side="right" reflect="-1"/>
  <xacro:arm side="left" reflect="1"/>
  
</robot>
```

### Processing Xacro

```bash
xacro humanoid.urdf.xacro > humanoid.urdf
```

---

## Inertia Calculations

Getting inertia wrong = your robot flips out in simulation.

### Common Shapes

**Box (a × b × c, mass m):**
```
Ixx = m/12 * (b² + c²)
Iyy = m/12 * (a² + c²)  
Izz = m/12 * (a² + b²)
```

**Cylinder (radius r, height h, mass m):**
```
Ixx = Iyy = m/12 * (3r² + h²)
Izz = m/2 * r²
```

**Sphere (radius r, mass m):**
```
Ixx = Iyy = Izz = 2/5 * m * r²
```

### Pro Tip: Use MeshLab

For complex meshes, import your STL into MeshLab:
`Filters → Quality Measure → Compute Geometric Measures`

It gives you volume, center of mass, and inertia tensor.

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Inertia too small | Robot explodes in sim | Increase inertia values |
| Missing collision | Objects pass through | Add `<collision>` elements |
| Wrong joint axis | Arm bends sideways | Check `<axis>` direction |
| Origin confusion | Parts in wrong place | Remember: origin is relative to parent |
| Units mismatch | Giant or tiny robot | URDF uses meters and kilograms |

---

## Full Humanoid Example

For a complete 28-DOF humanoid, check out:
- [Robotis OP3](https://github.com/ROBOTIS-GIT/ROBOTIS-OP3)
- [Nao Robot URDF](https://github.com/ros-naoqi/nao_robot)
- [Boston Dynamics Spot (unofficial)](https://github.com/chvmp/spot_ros)

---

## Summary

- URDF describes robot geometry in XML
- **Links** are rigid bodies with visual, collision, and inertial properties
- **Joints** define how links move relative to each other
- **Xacro** makes URDF maintainable with macros and variables
- Get your **inertia values right** or watch your robot explode

---

## Next Up

Time for the Module 1 capstone! You'll combine everything—nodes, topics, and URDF—to build a working robot system.

**→ [Module 1 Capstone Project](/docs/module-1-ros2/05-capstone)**
