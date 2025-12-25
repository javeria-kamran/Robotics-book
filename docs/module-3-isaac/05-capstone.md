---
id: isaac-capstone
title: "Module 3 Capstone: The Navigating Humanoid"
description: "Build an autonomous humanoid that navigates using Isaac Sim, Isaac ROS, and Nav2. The halfway point to your final robot."
sidebar_position: 5
module: 3
keywords: [capstone, navigation, Isaac Sim, Isaac ROS, Nav2, autonomous robot]
tags: [module-3, capstone, advanced]
---

# Module 3 Capstone: The Navigating Humanoid

> **TL;DR:** Everything comes together. You'll create an autonomous humanoid in Isaac Sim that uses GPU-accelerated perception to map its environment and Nav2 to navigate. This is the foundation for the final capstone in Module 4.

---

## What You'll Build

An autonomous humanoid robot that can:
- ✅ Generate a map using Visual SLAM
- ✅ Localize itself in the environment
- ✅ Plan and execute paths to goals
- ✅ Avoid obstacles dynamically
- ✅ Use GPU-accelerated perception

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ISAAC SIM                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Humanoid   │  │   Sensors    │  │  Environment │          │
│  │    Robot     │  │  (Camera,    │  │  (Warehouse) │          │
│  │   (USD)      │  │   LiDAR)     │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                 │                                      │
│         └────────┬────────┘                                      │
│                  │                                               │
│           ┌──────▼──────┐                                       │
│           │  ROS 2      │                                       │
│           │  Bridge     │                                       │
│           └──────┬──────┘                                       │
└──────────────────┼──────────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│                      ROS 2 / ISAAC ROS                           │
│                                                                   │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐              │
│  │  cuVSLAM   │   │  NVBlox    │   │   Nav2     │              │
│  │  (SLAM)    │───│  (Mapping) │───│ (Planning) │              │
│  └────────────┘   └────────────┘   └─────┬──────┘              │
│                                          │                       │
│                                   ┌──────▼──────┐               │
│                                   │ Locomotion  │               │
│                                   │   Bridge    │               │
│                                   └──────┬──────┘               │
│                                          │                       │
└──────────────────────────────────────────┼──────────────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │  /cmd_vel   │
                                    └─────────────┘
```

---

## Step 1: Set Up Isaac Sim Environment

### Load the Humanoid

```python
# standalone_python/load_humanoid.py
from omni.isaac.kit import SimulationApp

simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.utils.stage import add_reference_to_stage
from omni.isaac.core.robots import Robot

# Create world
world = World(stage_units_in_meters=1.0)

# Add environment
add_reference_to_stage(
    "omniverse://localhost/NVIDIA/Assets/Isaac/Environments/Simple_Warehouse/warehouse.usd",
    "/World/warehouse"
)

# Add humanoid robot
add_reference_to_stage(
    "omniverse://localhost/NVIDIA/Assets/Isaac/Robots/Unitree/H1/h1.usd",
    "/World/humanoid"
)

# Initialize robot
robot = Robot(prim_path="/World/humanoid", name="h1")
world.scene.add(robot)

# Reset world
world.reset()

# Run simulation
while simulation_app.is_running():
    world.step(render=True)
    
simulation_app.close()
```

### Add Sensors

In Isaac Sim GUI or via script:

```python
from omni.isaac.sensor import Camera, LidarRtx

# Add RGB-D camera
camera = Camera(
    prim_path="/World/humanoid/head_camera",
    resolution=(640, 480),
    frequency=30
)
camera.initialize()

# Add LiDAR
lidar = LidarRtx(
    prim_path="/World/humanoid/lidar",
    rotation_frequency=10,
    fov=(360.0, 30.0),
)
lidar.initialize()
```

---

## Step 2: Enable ROS 2 Bridge

### Action Graph Setup

Create an Action Graph in Isaac Sim:

```
1. Window → Visual Scripting → Action Graph
2. Create graph: /World/ROS2_Graph
3. Add nodes:
   - On Playback Tick
   - ROS2 Publish Clock
   - ROS2 Publish Camera Info
   - ROS2 Publish Image (RGB)
   - ROS2 Publish Depth
   - ROS2 Publish LaserScan
   - ROS2 Publish Odometry
   - ROS2 Subscribe Twist
4. Connect appropriately
```

### Python Graph Creation

```python
import omni.graph.core as og

# Create ROS 2 action graph
(ros_graph, _, _, _) = og.Controller.edit(
    {"graph_path": "/World/ROS2", "evaluator_name": "execution"},
    {
        og.Controller.Keys.CREATE_NODES: [
            ("OnPlaybackTick", "omni.graph.action.OnPlaybackTick"),
            ("PublishClock", "omni.isaac.ros2_bridge.ROS2PublishClock"),
            ("PublishTF", "omni.isaac.ros2_bridge.ROS2PublishTransformTree"),
            ("CameraHelper", "omni.isaac.ros2_bridge.ROS2CameraHelper"),
            ("LidarHelper", "omni.isaac.ros2_bridge.ROS2PublishLaserScan"),
            ("SubscribeTwist", "omni.isaac.ros2_bridge.ROS2SubscribeTwist"),
        ],
        og.Controller.Keys.CONNECT: [
            ("OnPlaybackTick.outputs:tick", "PublishClock.inputs:execIn"),
            ("OnPlaybackTick.outputs:tick", "PublishTF.inputs:execIn"),
            ("OnPlaybackTick.outputs:tick", "CameraHelper.inputs:execIn"),
            ("OnPlaybackTick.outputs:tick", "LidarHelper.inputs:execIn"),
            ("OnPlaybackTick.outputs:tick", "SubscribeTwist.inputs:execIn"),
        ],
        og.Controller.Keys.SET_VALUES: [
            ("CameraHelper.inputs:topicName", "/camera/image_raw"),
            ("LidarHelper.inputs:topicName", "/scan"),
            ("SubscribeTwist.inputs:topicName", "/cmd_vel"),
        ],
    }
)
```

---

## Step 3: Launch Isaac ROS Stack

### Create Launch File

```python
# launch/humanoid_perception.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node, ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    return LaunchDescription([
        # Visual SLAM
        ComposableNodeContainer(
            name='perception_container',
            namespace='',
            package='rclcpp_components',
            executable='component_container_mt',
            composable_node_descriptions=[
                # Visual SLAM
                ComposableNode(
                    package='isaac_ros_visual_slam',
                    plugin='nvidia::isaac_ros::visual_slam::VisualSlamNode',
                    name='visual_slam',
                    parameters=[{
                        'enable_imu_fusion': False,
                        'enable_localization_n_mapping': True,
                        'map_frame': 'map',
                        'odom_frame': 'odom',
                        'base_frame': 'base_link',
                    }],
                    remappings=[
                        ('stereo_camera/left/image', '/camera/image_raw'),
                        ('stereo_camera/left/camera_info', '/camera/camera_info'),
                    ],
                ),
            ],
            output='screen',
        ),
        
        # NVBlox for 3D mapping
        Node(
            package='nvblox_ros',
            executable='nvblox_node',
            name='nvblox_node',
            parameters=[{
                'voxel_size': 0.05,
                'global_frame': 'map',
                'esdf_update_rate_hz': 5.0,
            }],
            remappings=[
                ('depth/image', '/camera/depth'),
                ('depth/camera_info', '/camera/camera_info'),
            ],
            output='screen',
        ),
    ])
```

---

## Step 4: Configure Nav2

### Humanoid-Optimized Parameters

```yaml
# config/humanoid_nav2.yaml
controller_server:
  ros__parameters:
    controller_frequency: 10.0  # Slower for humanoid
    
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      max_vel_x: 0.25           # Walk speed
      max_vel_theta: 0.4        # Turn speed
      min_vel_x: 0.0
      acc_lim_x: 0.5
      decel_lim_x: -0.5
      
      # Critics for humanoid
      critics: ["RotateToGoal", "Oscillation", "BaseObstacle", "GoalAlign", "PathAlign", "PathDist", "GoalDist"]
      
      BaseObstacle.scale: 0.02
      PathAlign.scale: 32.0
      GoalAlign.scale: 24.0
      PathDist.scale: 32.0
      GoalDist.scale: 24.0

planner_server:
  ros__parameters:
    GridBased:
      plugin: "nav2_smac_planner/SmacPlanner2D"
      tolerance: 0.25
      max_planning_time: 5.0

recoveries_server:
  ros__parameters:
    recovery_plugins: ["backup", "wait"]  # No spin for humanoid
    
    backup:
      plugin: "nav2_recoveries/BackUp"
      
    wait:
      plugin: "nav2_recoveries/Wait"
```

---

## Step 5: Create the Navigation Controller

```python
#!/usr/bin/env python3
"""
humanoid_navigator.py
High-level navigation controller for the humanoid.
"""

import rclpy
from rclpy.node import Node
from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped, PoseWithCovarianceStamped
from std_msgs.msg import String
import json

class HumanoidNavigator(Node):
    def __init__(self):
        super().__init__('humanoid_navigator')
        
        # Nav2 interface
        self.navigator = BasicNavigator()
        
        # Goal subscriber (for external commands)
        self.goal_sub = self.create_subscription(
            PoseStamped, '/goal_pose', self.goal_callback, 10
        )
        
        # Status publisher
        self.status_pub = self.create_publisher(String, '/navigation_status', 10)
        
        # Wait for Nav2
        self.get_logger().info('Waiting for Nav2...')
        self.navigator.waitUntilNav2Active()
        self.get_logger().info('Nav2 is active!')
        
        # Status timer
        self.status_timer = self.create_timer(1.0, self.publish_status)
        
        self.current_goal = None

    def goal_callback(self, msg: PoseStamped):
        """Handle new navigation goal."""
        self.current_goal = msg
        self.get_logger().info(
            f'New goal: ({msg.pose.position.x:.2f}, {msg.pose.position.y:.2f})'
        )
        
        # Ensure frame is correct
        if msg.header.frame_id == '':
            msg.header.frame_id = 'map'
        
        # Send to Nav2
        self.navigator.goToPose(msg)

    def publish_status(self):
        """Publish navigation status."""
        status = {
            'is_task_complete': self.navigator.isTaskComplete(),
            'feedback': None
        }
        
        if not self.navigator.isTaskComplete():
            feedback = self.navigator.getFeedback()
            if feedback:
                status['feedback'] = {
                    'distance_remaining': feedback.distance_remaining,
                    'navigation_time': feedback.navigation_time.sec
                }
        
        msg = String()
        msg.data = json.dumps(status)
        self.status_pub.publish(msg)

    def navigate_to(self, x, y, theta=0.0):
        """Programmatic navigation."""
        goal = PoseStamped()
        goal.header.frame_id = 'map'
        goal.header.stamp = self.get_clock().now().to_msg()
        goal.pose.position.x = x
        goal.pose.position.y = y
        goal.pose.orientation.z = np.sin(theta / 2)
        goal.pose.orientation.w = np.cos(theta / 2)
        
        self.navigator.goToPose(goal)
        
        while not self.navigator.isTaskComplete():
            rclpy.spin_once(self, timeout_sec=0.1)
        
        return self.navigator.getResult()

def main(args=None):
    rclpy.init(args=args)
    node = HumanoidNavigator()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Step 6: Run Everything

### Terminal 1: Isaac Sim

```bash
# Launch Isaac Sim with ROS 2 enabled
./isaac-sim.sh --/ros2/enabled=true
```

Load your scene and press Play.

### Terminal 2: Isaac ROS Perception

```bash
ros2 launch my_humanoid_pkg humanoid_perception.launch.py
```

### Terminal 3: Nav2

```bash
ros2 launch nav2_bringup navigation_launch.py \
    params_file:=/path/to/humanoid_nav2.yaml \
    use_sim_time:=true
```

### Terminal 4: Locomotion Bridge

```bash
ros2 run my_humanoid_pkg locomotion_bridge
```

### Terminal 5: Navigation Controller

```bash
ros2 run my_humanoid_pkg humanoid_navigator
```

### Terminal 6: RViz Visualization

```bash
ros2 run rviz2 rviz2 -d /path/to/nav2_default_view.rviz
```

---

## Testing the System

### Send Navigation Goals

In RViz:
1. Click "2D Goal Pose"
2. Click and drag on the map to set goal

Or via command line:

```bash
ros2 topic pub --once /goal_pose geometry_msgs/PoseStamped \
  "{header: {frame_id: 'map'}, pose: {position: {x: 5.0, y: 3.0}, orientation: {w: 1.0}}}"
```

### Verify Behavior

1. Robot should plan a path (visible in RViz)
2. Robot should start moving toward goal
3. Robot should avoid obstacles dynamically
4. Robot should reach goal and stop

---

## What You've Achieved

✅ Isaac Sim simulation with humanoid robot  
✅ ROS 2 sensor bridge (camera, LiDAR)  
✅ GPU-accelerated SLAM (cuVSLAM)  
✅ 3D mapping (NVBlox)  
✅ Path planning and navigation (Nav2)  
✅ Locomotion bridge for humanoid gait  

---

## Challenges to Try

1. **Multi-goal navigation** — Visit multiple waypoints
2. **Dynamic obstacles** — Add moving objects
3. **Autonomous exploration** — Map unknown areas
4. **Recovery behaviors** — Handle getting stuck

---

## Next Module

Your robot can navigate, but it's still dumb. It doesn't understand language or have cognitive abilities. Module 4 brings the AI brain: Vision-Language-Action models.

**→ [Module 4: Vision-Language-Action (VLA)](/docs/module-4-vla)**
