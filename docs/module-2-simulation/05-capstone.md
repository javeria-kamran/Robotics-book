---
id: simulation-capstone
title: "Module 2 Capstone: Your Virtual Testing Ground"
description: "Build a complete simulation environment for robot testing. Create a world with obstacles, sensors, and a navigating robot."
sidebar_position: 5
module: 2
keywords: [simulation capstone, Gazebo world, robot testing, virtual environment]
tags: [module-2, capstone, hands-on]
---

# Module 2 Capstone: Your Virtual Testing Ground

> **TL;DR:** Time to put your simulation skills to work. You'll build a complete testing environment: a world, a robot with sensors, and a navigation test course. When you're done, you'll have a sandbox where you can break things without consequences.

---

## What You'll Build

A complete simulation setup:
- ✅ Custom Gazebo world (indoor warehouse-style)
- ✅ Robot with LiDAR and camera
- ✅ ROS 2 integration (sensor topics, control)
- ✅ Launch file that starts everything
- ✅ Navigation test course

---

## Project Structure

```
simulation_playground/
├── package.xml
├── CMakeLists.txt
├── worlds/
│   └── warehouse.sdf
├── models/
│   └── robot_with_sensors/
│       ├── model.config
│       └── model.sdf
├── launch/
│   └── simulation.launch.py
├── config/
│   └── bridge_config.yaml
└── rviz/
    └── simulation.rviz
```

---

## Step 1: Create the Package

```bash
cd ~/ros2_ws/src
ros2 pkg create simulation_playground --build-type ament_cmake --dependencies rclpy ros_gz_sim ros_gz_bridge
```

---

## Step 2: The Warehouse World

Create `worlds/warehouse.sdf`:

```xml
<?xml version="1.0" ?>
<sdf version="1.8">
  <world name="warehouse">
    
    <!-- Physics -->
    <physics type="ode">
      <max_step_size>0.004</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>250</real_time_update_rate>
    </physics>
    
    <!-- Plugins -->
    <plugin filename="gz-sim-physics-system" name="gz::sim::systems::Physics"/>
    <plugin filename="gz-sim-user-commands-system" name="gz::sim::systems::UserCommands"/>
    <plugin filename="gz-sim-scene-broadcaster-system" name="gz::sim::systems::SceneBroadcaster"/>
    <plugin filename="gz-sim-sensors-system" name="gz::sim::systems::Sensors">
      <render_engine>ogre2</render_engine>
    </plugin>
    
    <!-- Scene -->
    <scene>
      <ambient>0.6 0.6 0.6 1</ambient>
      <background>0.3 0.3 0.3 1</background>
      <shadows>true</shadows>
    </scene>
    
    <!-- Lighting -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.9 0.9 0.9 1</diffuse>
      <specular>0.3 0.3 0.3 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.5 0.1 -0.9</direction>
    </light>
    
    <!-- Ground -->
    <model name="ground">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>30 30</size>
            </plane>
          </geometry>
          <surface>
            <friction>
              <ode><mu>1</mu><mu2>1</mu2></ode>
            </friction>
          </surface>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>30 30</size>
            </plane>
          </geometry>
          <material>
            <ambient>0.4 0.4 0.4 1</ambient>
            <diffuse>0.5 0.5 0.5 1</diffuse>
          </material>
        </visual>
      </link>
    </model>
    
    <!-- Warehouse Walls -->
    <model name="wall_north">
      <static>true</static>
      <pose>0 10 1.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 3</size></box></geometry>
          <material><ambient>0.6 0.6 0.6 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <model name="wall_south">
      <static>true</static>
      <pose>0 -10 1.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 3</size></box></geometry>
          <material><ambient>0.6 0.6 0.6 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <model name="wall_east">
      <static>true</static>
      <pose>10 0 1.5 0 0 1.5708</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 3</size></box></geometry>
          <material><ambient>0.6 0.6 0.6 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <model name="wall_west">
      <static>true</static>
      <pose>-10 0 1.5 0 0 1.5708</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>20 0.2 3</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>20 0.2 3</size></box></geometry>
          <material><ambient>0.6 0.6 0.6 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <!-- Shelving Units -->
    <model name="shelf_1">
      <static>true</static>
      <pose>-5 0 1 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>4 1 2</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>4 1 2</size></box></geometry>
          <material><ambient>0.4 0.3 0.2 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <model name="shelf_2">
      <static>true</static>
      <pose>5 0 1 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>4 1 2</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>4 1 2</size></box></geometry>
          <material><ambient>0.4 0.3 0.2 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <!-- Random Obstacles -->
    <model name="box_1">
      <pose>2 5 0.4 0 0 0.3</pose>
      <link name="link">
        <inertial>
          <mass>2.0</mass>
          <inertia><ixx>0.03</ixx><iyy>0.03</iyy><izz>0.03</izz></inertia>
        </inertial>
        <collision name="collision">
          <geometry><box><size>0.8 0.8 0.8</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>0.8 0.8 0.8</size></box></geometry>
          <material><ambient>0.8 0.4 0.1 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <model name="cylinder_1">
      <static>true</static>
      <pose>-3 -5 0.75 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><cylinder><radius>0.5</radius><length>1.5</length></cylinder></geometry>
        </collision>
        <visual name="visual">
          <geometry><cylinder><radius>0.5</radius><length>1.5</length></cylinder></geometry>
          <material><ambient>0.3 0.6 0.8 1</ambient></material>
        </visual>
      </link>
    </model>
    
    <!-- Goal Marker -->
    <model name="goal">
      <static>true</static>
      <pose>7 7 0.01 0 0 0</pose>
      <link name="link">
        <visual name="visual">
          <geometry><cylinder><radius>0.5</radius><length>0.02</length></cylinder></geometry>
          <material><ambient>0.1 0.8 0.1 1</ambient></material>
        </visual>
      </link>
    </model>
    
  </world>
</sdf>
```

---

## Step 3: Robot with Sensors

Create `models/robot_with_sensors/model.sdf`:

```xml
<?xml version="1.0"?>
<sdf version="1.8">
  <model name="sensor_bot">
    <pose>0 0 0.15 0 0 0</pose>
    
    <!-- Base Link -->
    <link name="base_link">
      <inertial>
        <mass>5.0</mass>
        <inertia>
          <ixx>0.1</ixx><iyy>0.1</iyy><izz>0.15</izz>
        </inertia>
      </inertial>
      <collision name="collision">
        <geometry><box><size>0.4 0.3 0.15</size></box></geometry>
      </collision>
      <visual name="visual">
        <geometry><box><size>0.4 0.3 0.15</size></box></geometry>
        <material><ambient>0.2 0.4 0.8 1</ambient></material>
      </visual>
    </link>
    
    <!-- Left Wheel -->
    <link name="left_wheel">
      <pose>0 0.175 -0.05 -1.5708 0 0</pose>
      <inertial>
        <mass>0.5</mass>
        <inertia><ixx>0.001</ixx><iyy>0.001</iyy><izz>0.002</izz></inertia>
      </inertial>
      <collision name="collision">
        <geometry><cylinder><radius>0.1</radius><length>0.05</length></cylinder></geometry>
        <surface>
          <friction><ode><mu>1.0</mu><mu2>1.0</mu2></ode></friction>
        </surface>
      </collision>
      <visual name="visual">
        <geometry><cylinder><radius>0.1</radius><length>0.05</length></cylinder></geometry>
        <material><ambient>0.1 0.1 0.1 1</ambient></material>
      </visual>
    </link>
    
    <joint name="left_wheel_joint" type="revolute">
      <parent>base_link</parent>
      <child>left_wheel</child>
      <axis><xyz>0 0 1</xyz></axis>
    </joint>
    
    <!-- Right Wheel -->
    <link name="right_wheel">
      <pose>0 -0.175 -0.05 -1.5708 0 0</pose>
      <inertial>
        <mass>0.5</mass>
        <inertia><ixx>0.001</ixx><iyy>0.001</iyy><izz>0.002</izz></inertia>
      </inertial>
      <collision name="collision">
        <geometry><cylinder><radius>0.1</radius><length>0.05</length></cylinder></geometry>
        <surface>
          <friction><ode><mu>1.0</mu><mu2>1.0</mu2></ode></friction>
        </surface>
      </collision>
      <visual name="visual">
        <geometry><cylinder><radius>0.1</radius><length>0.05</length></cylinder></geometry>
        <material><ambient>0.1 0.1 0.1 1</ambient></material>
      </visual>
    </link>
    
    <joint name="right_wheel_joint" type="revolute">
      <parent>base_link</parent>
      <child>right_wheel</child>
      <axis><xyz>0 0 1</xyz></axis>
    </joint>
    
    <!-- Caster -->
    <link name="caster">
      <pose>-0.15 0 -0.1 0 0 0</pose>
      <inertial>
        <mass>0.1</mass>
        <inertia><ixx>0.0001</ixx><iyy>0.0001</iyy><izz>0.0001</izz></inertia>
      </inertial>
      <collision name="collision">
        <geometry><sphere><radius>0.05</radius></sphere></geometry>
        <surface>
          <friction><ode><mu>0.01</mu><mu2>0.01</mu2></ode></friction>
        </surface>
      </collision>
      <visual name="visual">
        <geometry><sphere><radius>0.05</radius></sphere></geometry>
        <material><ambient>0.3 0.3 0.3 1</ambient></material>
      </visual>
    </link>
    
    <joint name="caster_joint" type="ball">
      <parent>base_link</parent>
      <child>caster</child>
    </joint>
    
    <!-- LiDAR -->
    <link name="lidar_link">
      <pose>0.1 0 0.1 0 0 0</pose>
      <inertial>
        <mass>0.2</mass>
        <inertia><ixx>0.0002</ixx><iyy>0.0002</iyy><izz>0.0002</izz></inertia>
      </inertial>
      <visual name="visual">
        <geometry><cylinder><radius>0.05</radius><length>0.04</length></cylinder></geometry>
        <material><ambient>0.1 0.1 0.1 1</ambient></material>
      </visual>
      <sensor name="lidar" type="gpu_lidar">
        <always_on>true</always_on>
        <update_rate>10</update_rate>
        <visualize>true</visualize>
        <lidar>
          <scan>
            <horizontal>
              <samples>360</samples>
              <resolution>1</resolution>
              <min_angle>-3.14159</min_angle>
              <max_angle>3.14159</max_angle>
            </horizontal>
          </scan>
          <range>
            <min>0.1</min>
            <max>15.0</max>
            <resolution>0.01</resolution>
          </range>
          <noise>
            <type>gaussian</type>
            <mean>0</mean>
            <stddev>0.01</stddev>
          </noise>
        </lidar>
        <topic>scan</topic>
      </sensor>
    </link>
    
    <joint name="lidar_joint" type="fixed">
      <parent>base_link</parent>
      <child>lidar_link</child>
    </joint>
    
    <!-- Camera -->
    <link name="camera_link">
      <pose>0.18 0 0.05 0 0 0</pose>
      <inertial>
        <mass>0.1</mass>
        <inertia><ixx>0.0001</ixx><iyy>0.0001</iyy><izz>0.0001</izz></inertia>
      </inertial>
      <visual name="visual">
        <geometry><box><size>0.02 0.05 0.03</size></box></geometry>
        <material><ambient>0.05 0.05 0.05 1</ambient></material>
      </visual>
      <sensor name="camera" type="camera">
        <always_on>true</always_on>
        <update_rate>30</update_rate>
        <camera>
          <horizontal_fov>1.22</horizontal_fov>
          <image>
            <width>640</width>
            <height>480</height>
            <format>R8G8B8</format>
          </image>
          <clip>
            <near>0.1</near>
            <far>100</far>
          </clip>
        </camera>
        <topic>camera/image_raw</topic>
      </sensor>
    </link>
    
    <joint name="camera_joint" type="fixed">
      <parent>base_link</parent>
      <child>camera_link</child>
    </joint>
    
    <!-- Differential Drive Plugin -->
    <plugin filename="gz-sim-diff-drive-system" name="gz::sim::systems::DiffDrive">
      <left_joint>left_wheel_joint</left_joint>
      <right_joint>right_wheel_joint</right_joint>
      <wheel_separation>0.35</wheel_separation>
      <wheel_radius>0.1</wheel_radius>
      <max_linear_acceleration>1.0</max_linear_acceleration>
      <min_linear_acceleration>-1.0</min_linear_acceleration>
      <max_angular_acceleration>2.0</max_angular_acceleration>
      <min_angular_acceleration>-2.0</min_angular_acceleration>
      <topic>cmd_vel</topic>
      <odom_topic>odom</odom_topic>
      <frame_id>odom</frame_id>
      <child_frame_id>base_link</child_frame_id>
      <odom_publish_frequency>30</odom_publish_frequency>
    </plugin>
    
  </model>
</sdf>
```

---

## Step 4: Launch File

Create `launch/simulation.launch.py`:

```python
#!/usr/bin/env python3

import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import ExecuteProcess, DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    pkg_dir = get_package_share_directory('simulation_playground')
    
    world_file = os.path.join(pkg_dir, 'worlds', 'warehouse.sdf')
    model_path = os.path.join(pkg_dir, 'models')
    
    return LaunchDescription([
        # Set model path
        ExecuteProcess(
            cmd=['export', f'GZ_SIM_RESOURCE_PATH={model_path}'],
            shell=True
        ),
        
        # Start Gazebo
        ExecuteProcess(
            cmd=['gz', 'sim', '-r', world_file],
            output='screen'
        ),
        
        # Spawn robot
        ExecuteProcess(
            cmd=['gz', 'service', '-s', '/world/warehouse/create',
                 '--reqtype', 'gz.msgs.EntityFactory',
                 '--reptype', 'gz.msgs.Boolean',
                 '--timeout', '5000',
                 '--req', f'sdf_filename: "{model_path}/robot_with_sensors/model.sdf" name: "sensor_bot" pose: {{position: {{x: 0, y: 0, z: 0.2}}}}'],
            output='screen'
        ),
        
        # ROS-Gazebo Bridge
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            arguments=[
                '/cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist',
                '/odom@nav_msgs/msg/Odometry@gz.msgs.Odometry',
                '/scan@sensor_msgs/msg/LaserScan@gz.msgs.LaserScan',
                '/camera/image_raw@sensor_msgs/msg/Image@gz.msgs.Image',
            ],
            output='screen'
        ),
        
        # TF for odom -> base_link (if not published by sim)
        Node(
            package='tf2_ros',
            executable='static_transform_publisher',
            arguments=['0', '0', '0', '0', '0', '0', 'base_link', 'lidar_link'],
            output='screen'
        ),
    ])
```

---

## Step 5: Test It!

```bash
# Build
cd ~/ros2_ws
colcon build --packages-select simulation_playground
source install/setup.bash

# Launch simulation
ros2 launch simulation_playground simulation.launch.py
```

In another terminal, drive the robot:

```bash
ros2 run teleop_twist_keyboard teleop_twist_keyboard
```

View sensors in RViz:

```bash
ros2 run rviz2 rviz2
# Add LaserScan display (/scan)
# Add Camera display (/camera/image_raw)
```

---

## Challenge: Navigate to the Goal

Write a node that:
1. Reads LiDAR data to avoid obstacles
2. Moves toward the green goal marker at (7, 7)
3. Stops when reaching the goal

Hint: Use a simple state machine:
- `TURN_TO_GOAL` — Rotate to face the goal
- `MOVE_FORWARD` — Go straight if no obstacle
- `AVOID_OBSTACLE` — Turn away from obstacles
- `GOAL_REACHED` — Stop and celebrate

---

## What You've Learned

✅ Creating Gazebo SDF worlds  
✅ Defining robot models with sensors  
✅ LiDAR and camera simulation  
✅ ROS 2 ↔ Gazebo bridging  
✅ Launch file integration  

---

## Next Module

Your robot can now perceive a virtual world. Time to level up with NVIDIA Isaac—photorealistic simulation, synthetic data, and GPU-accelerated perception.

**→ [Module 3: The AI-Robot Brain (NVIDIA Isaac)](/docs/module-3-isaac)**
