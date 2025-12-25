---
id: simulation-gazebo-physics
title: "Physics Simulation with Gazebo"
description: "Learn to simulate physics, gravity, and collisions in Gazebo. Build worlds where your robot can fail safely."
sidebar_position: 2
module: 2
keywords: [Gazebo, physics simulation, SDF, robot simulation, collisions, ROS 2]
tags: [module-2, hands-on, intermediate]
---

# Physics Simulation with Gazebo

> **TL;DR:** Gazebo is an open-source robot simulator with physics, sensors, and ROS 2 integration. This section teaches you to build worlds, spawn robots, and simulate the laws of physics that make your robot fall over.

---

## Meet Gazebo (The New One)

Gazebo has been rewritten. The new version (previously "Ignition Gazebo," now just "Gazebo") is:

- **Modular** — Use only what you need
- **Modern** — Written in C++17, better architecture
- **ROS 2 native** — No more bridges and hacks

### Version Confusion (A Rant)

| Name | Status | Notes |
|------|--------|-------|
| Gazebo Classic (1-11) | Legacy | The old one. Still widely used. |
| Ignition Gazebo | Renamed | Was the new one. Now just "Gazebo." |
| Gazebo Harmonic | Current | Latest LTS (2024+) |
| Gazebo Fortress | LTS | Pairs with ROS 2 Humble |

**Use Gazebo Fortress** if you're on ROS 2 Humble. The naming is confusing, but the software is solid.

---

## SDF: The World Description Format

While URDF describes robots, **SDF** (Simulation Description Format) describes entire simulation worlds.

SDF can define:
- Robots (with more features than URDF)
- Static objects (buildings, terrain)
- Lights and atmosphere
- Physics parameters
- Plugins and sensors

### Basic SDF Structure

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="my_world">
    
    <!-- Physics configuration -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
    </physics>
    
    <!-- Sunlight -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
    </light>
    
    <!-- Ground plane -->
    <model name="ground">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.3 0.3 0.3 1</ambient>
          </material>
        </visual>
      </link>
    </model>
    
  </world>
</sdf>
```

---

## Creating a Robot-Friendly World

Let's build a world with:
- Ground plane
- Walls (obstacles)
- Ramps (to test climbing)
- Objects to interact with

### Save as `robot_world.sdf`:

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="robot_world">
    
    <!-- Physics -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <ode>
        <solver>
          <type>quick</type>
          <iters>50</iters>
        </solver>
      </ode>
    </physics>
    
    <!-- Scene settings -->
    <scene>
      <ambient>0.4 0.4 0.4 1</ambient>
      <background>0.7 0.7 0.7 1</background>
      <shadows>true</shadows>
    </scene>
    
    <!-- Sun -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.9 0.9 0.9 1</diffuse>
      <specular>0.1 0.1 0.1 1</specular>
    </light>
    
    <!-- Ground -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>50 50</size>
            </plane>
          </geometry>
          <surface>
            <friction>
              <ode>
                <mu>1.0</mu>
                <mu2>1.0</mu2>
              </ode>
            </friction>
          </surface>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>50 50</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.5 0.5 0.5 1</ambient>
          </material>
        </visual>
      </link>
    </model>
    
    <!-- Obstacle Box -->
    <model name="obstacle_1">
      <static>true</static>
      <pose>3 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
          <material>
            <ambient>0.8 0.2 0.2 1</ambient>
          </material>
        </visual>
      </link>
    </model>
    
    <!-- Ramp -->
    <model name="ramp">
      <static>true</static>
      <pose>-3 0 0.25 0 0.2 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>2 1 0.1</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>2 1 0.1</size>
            </box>
          </geometry>
          <material>
            <ambient>0.2 0.8 0.2 1</ambient>
          </material>
        </visual>
      </link>
    </model>
    
    <!-- Movable object (for manipulation) -->
    <model name="pickup_cube">
      <pose>2 2 0.15 0 0 0</pose>
      <link name="link">
        <inertial>
          <mass>0.5</mass>
          <inertia>
            <ixx>0.004</ixx>
            <iyy>0.004</iyy>
            <izz>0.004</izz>
          </inertia>
        </inertial>
        <collision name="collision">
          <geometry>
            <box>
              <size>0.3 0.3 0.3</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>0.3 0.3 0.3</size>
            </box>
          </geometry>
          <material>
            <ambient>0.2 0.2 0.8 1</ambient>
          </material>
        </visual>
      </link>
    </model>
    
  </world>
</sdf>
```

### Run It

```bash
gz sim robot_world.sdf
```

---

## Spawning Your Robot

You can include a URDF robot in your SDF world, but Gazebo prefers SDF models. The bridge:

### Option 1: Convert URDF to SDF

```bash
# Converts URDF to SDF
gz sdf -p my_robot.urdf > my_robot.sdf
```

### Option 2: Use ros_gz_sim

The `ros_gz_sim` package provides ROS 2 nodes for spawning robots:

```bash
# Spawn a robot from a URDF file
ros2 run ros_gz_sim create \
  -name my_robot \
  -file /path/to/my_robot.urdf \
  -x 0 -y 0 -z 0.5
```

### Option 3: Launch File Integration

```python
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, ExecuteProcess
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
import os

def generate_launch_description():
    # Start Gazebo
    gazebo = ExecuteProcess(
        cmd=['gz', 'sim', '-r', 'robot_world.sdf'],
        output='screen'
    )
    
    # Spawn robot
    spawn_robot = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=[
            '-name', 'my_robot',
            '-topic', 'robot_description',
            '-x', '0', '-y', '0', '-z', '0.5'
        ],
        output='screen'
    )
    
    return LaunchDescription([
        gazebo,
        spawn_robot,
    ])
```

---

## Understanding Physics Parameters

### Time Step

```xml
<max_step_size>0.001</max_step_size>  <!-- 1ms steps -->
```

- Smaller = more accurate, slower
- Larger = faster, less accurate
- Default (0.001) is usually good

### Real-Time Factor

```xml
<real_time_factor>1.0</real_time_factor>
```

- 1.0 = real-time
- 2.0 = 2x speed
- 0.5 = half speed (for debugging)

### Solver Iterations

```xml
<ode>
  <solver>
    <iters>50</iters>  <!-- More iterations = more accurate -->
  </solver>
</ode>
```

---

## ROS 2 Integration

### Bridges

The `ros_gz_bridge` forwards messages between ROS 2 and Gazebo:

```bash
ros2 run ros_gz_bridge parameter_bridge \
  /cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist \
  /scan@sensor_msgs/msg/LaserScan@gz.msgs.LaserScan
```

### Launch File Bridge

```python
bridge = Node(
    package='ros_gz_bridge',
    executable='parameter_bridge',
    arguments=[
        '/cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist',
        '/odom@nav_msgs/msg/Odometry@gz.msgs.Odometry',
    ],
    output='screen'
)
```

---

## Controlling Your Robot

Add a differential drive plugin to your robot:

```xml
<plugin filename="libgz-sim-diff-drive-system.so" name="gz::sim::systems::DiffDrive">
  <left_joint>left_wheel_joint</left_joint>
  <right_joint>right_wheel_joint</right_joint>
  <wheel_separation>0.4</wheel_separation>
  <wheel_radius>0.08</wheel_radius>
  <topic>cmd_vel</topic>
  <odom_topic>odom</odom_topic>
  <frame_id>odom</frame_id>
  <child_frame_id>base_link</child_frame_id>
</plugin>
```

Now your teleop from Module 1 will work in simulation!

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Robot falls through floor | Collision not defined | Add `<collision>` to all links |
| Robot explodes on spawn | Inertia too small | Increase inertia values |
| Robot doesn't move | Plugin not loaded | Check plugin filename and parameters |
| Simulation is slow | Too many objects/sensors | Reduce complexity, increase step size |
| Physics looks wrong | Wrong friction/mass | Tune surface parameters |

---

## Performance Tips

1. **Use simple collision shapes** — Boxes instead of mesh collisions
2. **Reduce sensor frequencies** — 10 Hz is often enough
3. **Disable shadows** if you don't need them
4. **Use headless mode** for training: `gz sim -s world.sdf`

---

## Summary

- **SDF** describes simulation worlds (ground, objects, physics)
- **Gazebo** provides the physics engine and rendering
- **ros_gz packages** bridge ROS 2 and Gazebo
- Tune **physics parameters** for accuracy vs. speed
- Always verify **collision and inertia** properties

---

## Next Up

Gazebo is great for physics, but what if you want photorealistic graphics? Unity brings game-engine quality to robotics simulation.

**→ [High-Fidelity Simulation with Unity](/docs/module-2-simulation/03-unity-rendering)**
