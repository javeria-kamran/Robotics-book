---
description: Nav2 کا استعمال کرتے ہوئے bipedal humanoid robots کے لیے path planning
  اور navigation نافذ کریں۔ سیکھیں کہ wheeled navigation کو legged robots کے مطابق
  کیسے ڈھالنا ہے۔
id: isaac-nav2-humanoid
keywords:
- Nav2
- navigation
- path planning
- humanoid
- bipedal
- locomotion
- ROS 2
module: 3
sidebar_position: 4
tags:
- module-3
- hands-on
- advanced
title: Nav2 for Humanoid Navigation
---

# ہیومنائڈ نیویگیشن کے لیے Nav2

> **TL;DR:** Nav2 ROS 2 کے لیے نیویگیشن اسٹیک ہے۔ یہ سیکشن اسے ہیومنائڈ روبوٹس کے لیے ڈھالتا ہے—جو پہیوں والے روبوٹس کے مقابلے میں زیادہ مشکل ہے کیونکہ ٹانگیں رول نہیں کرتیں، وہ قدم اٹھاتی ہیں۔ ہم پاتھ پلاننگ، آبسٹیکل ایوائیڈنس، اور لوکوموشن انٹرفیس کا احاطہ کریں گے۔

---

## Nav2 کا جائزہ

Nav2 (Navigation 2) ROS 1 نیویگیشن اسٹیک کا جانشین ہے۔ یہ درج ذیل کو سنبھالتا ہے:

-   **Global planning** — A سے B تک کا راستہ تلاش کرنا
-   **Local planning** — حقیقی وقت میں رکاوٹوں سے بچنا
-   **Recovery behaviors** — پھنس جانے پر کیا کرنا ہے
-   **Behavior trees** — نیویگیشن کے رویوں کو منظم کرنا

### آرکیٹیکچر

```
┌─────────────────────────────────────────────────────────────┐
│                         Nav2                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  BT Navigator                          │   │
│  │          (Behavior Tree Orchestration)                 │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────┐  ┌────▼────────┐  ┌─────────────────────┐  │
│  │   Global    │  │   Local     │  │     Recovery        │  │
│  │   Planner   │  │   Planner   │  │     Behaviors       │  │
│  │  (Navfn,    │  │  (DWB,      │  │   (Spin, Backup,   │  │
│  │   Smac)     │  │   TEB)      │  │    Wait)           │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                   │
│  ┌──────▼────────────────▼───────────────────────────────┐  │
│  │                   Costmap 2D                            │  │
│  │        (Global Costmap + Local Costmap)                │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                     │
│                 ┌──────▼──────┐                             │
│                 │ /cmd_vel    │                             │
│                 └─────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ہیومنائڈ چیلنج

Nav2 کو **پہیوں والے روبوٹس** کے لیے ڈیزائن کیا گیا تھا۔ ہیومنائڈز مختلف ہوتے ہیں:

| پہلو | پہیوں والا روبوٹ | ہیومنائڈ |
|--------|---------------|----------|
| حرکت | مسلسل | الگ الگ قدم |
| Velocity control | براہ راست | Gait controller کے ذریعے |
| Footprint | مقررہ | موقف کے ساتھ بدلتا ہے |
| استحکام | ہمیشہ مستحکم | توازن برقرار رکھنا ضروری ہے |
| موڑنا | Differential drive | قدم اٹھا کر موڑنا |

### حل

ہم Nav2 کو تبدیل نہیں کرتے—ہم اسے ڈھالتے ہیں:

1.  **Nav2 کو پاتھ پلاننگ کے لیے استعمال کریں** (کہاں جانا ہے)
2.  **لوکوموشن کے لیے ایک gait controller استعمال کریں** (کیسے حرکت کرنا ہے)
3.  **ایک bridge شامل کریں** Nav2 velocity commands اور gait commands کے درمیان

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Nav2      │       │  Locomotion  │       │    Robot     │
│              │──────▶│   Bridge     │──────▶│    Legs      │
│  /cmd_vel    │       │              │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
      Path              Vel → Gait              Execute
    Planning           Translation              Steps
```

---

## Nav2 سیٹ اپ کرنا

### انسٹالیشن

```bash
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup
```

### بنیادی لانچ

```bash
ros2 launch nav2_bringup navigation_launch.py
```

### پیرامیٹرز فائل

`config/nav2_params.yaml` بنائیں:

```yaml
bt_navigator:
  ros__parameters:
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    
controller_server:
  ros__parameters:
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]
    
    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5
      movement_time_allowance: 10.0
      
    goal_checker:
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25
      stateful: True
      
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      min_vel_x: 0.0
      min_vel_y: 0.0
      max_vel_x: 0.3      # Slower for humanoid
      max_vel_y: 0.0
      max_vel_theta: 0.5  # Slower rotation
      min_speed_xy: 0.0
      max_speed_xy: 0.3
      min_speed_theta: 0.0
      acc_lim_x: 1.0
      acc_lim_y: 0.0
      acc_lim_theta: 1.5
      decel_lim_x: -1.0
      decel_lim_y: 0.0
      decel_lim_theta: -1.5

planner_server:
  ros__parameters:
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_smac_planner/SmacPlannerHybrid"
      tolerance: 0.5
      downsample_costmap: false
      allow_unknown: true
      max_iterations: 1000000
      max_on_approach_iterations: 1000
      max_planning_time: 5.0
      motion_model_for_search: "DUBIN"
      cost_travel_multiplier: 2.0
      minimum_turning_radius: 0.4  # Humanoid turning radius
      
local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      rolling_window: true
      width: 3
      height: 3
      resolution: 0.05
      robot_radius: 0.3
      plugins: ["obstacle_layer", "inflation_layer"]
      
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
        
global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      robot_radius: 0.3
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True
        
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
```

---

## لوکوموشن برج

یہ Node Nav2 velocity commands کو gait commands میں تبدیل کرتا ہے:

```python
#!/usr/bin/env python3
"""
locomotion_bridge.py
Converts cmd_vel to humanoid gait commands.
"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from std_msgs.msg import String
import json

class LocomotionBridge(Node):
    def __init__(self):
        super().__init__('locomotion_bridge')
        
        # Parameters
        self.declare_parameter('max_step_length', 0.15)      # meters
        self.declare_parameter('max_step_width', 0.08)       # meters
        self.declare_parameter('step_frequency', 2.0)        # Hz
        self.declare_parameter('velocity_deadband', 0.05)
        
        self.max_step_length = self.get_parameter('max_step_length').value
        self.max_step_width = self.get_parameter('max_step_width').value
        self.step_frequency = self.get_parameter('step_frequency').value
        self.velocity_deadband = self.get_parameter('velocity_deadband').value
        
        # Subscriber for Nav2 velocity commands
        self.cmd_vel_sub = self.create_subscription(
            Twist, '/cmd_vel', self.cmd_vel_callback, 10
        )
        
        # Publisher for gait commands
        self.gait_pub = self.create_publisher(String, '/gait_command', 10)
        
        # State
        self.current_gait = 'stand'
        
        self.get_logger().info('Locomotion Bridge started')

    def cmd_vel_callback(self, msg: Twist):
        """Convert velocity command to gait command."""
        linear_x = msg.linear.x
        linear_y = msg.linear.y
        angular_z = msg.angular.z
        
        # Apply deadband
        if abs(linear_x) < self.velocity_deadband:
            linear_x = 0.0
        if abs(angular_z) < self.velocity_deadband:
            angular_z = 0.0
        
        # Determine gait mode
        if linear_x == 0.0 and angular_z == 0.0:
            gait_mode = 'stand'
        elif linear_x > 0:
            gait_mode = 'walk_forward'
        elif linear_x < 0:
            gait_mode = 'walk_backward'
        elif abs(angular_z) > 0:
            gait_mode = 'turn_in_place'
        else:
            gait_mode = 'stand'
        
        # Calculate step parameters
        # Map velocity to step length (normalized)
        step_length = min(abs(linear_x) / 0.3, 1.0) * self.max_step_length
        turn_rate = min(abs(angular_z) / 1.0, 1.0)
        turn_direction = 'left' if angular_z > 0 else 'right'
        
        # Create gait command
        gait_command = {
            'mode': gait_mode,
            'step_length': step_length,
            'step_width': self.max_step_width,
            'turn_rate': turn_rate,
            'turn_direction': turn_direction,
            'frequency': self.step_frequency
        }
        
        # Publish
        cmd_msg = String()
        cmd_msg.data = json.dumps(gait_command)
        self.gait_pub.publish(cmd_msg)
        
        # Log state changes
        if gait_mode != self.current_gait:
            self.get_logger().info(f'Gait: {self.current_gait} → {gait_mode}')
            self.current_gait = gait_mode

def main(args=None):
    rclpy.init(args=args)
    node = LocomotionBridge()
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

## ہیومنائڈ کے لیے مخصوص پلانرز

### Step Planner (ایڈوانسڈ)

حقیقی بائی پیڈل پلاننگ کے لیے، ایک **footstep planner** استعمال کرنے پر غور کریں:

```python
class FootstepPlanner:
    """
    Plans individual footstep placements.
    Much more complex than this example!
    """
    
    def plan_steps(self, start_pose, goal_pose, obstacles):
        """Generate a sequence of footsteps."""
        steps = []
        current = start_pose
        
        while not self.at_goal(current, goal_pose):
            # Determine which foot to move
            foot = self.next_foot()
            
            # Calculate next step position
            step_target = self.calculate_step(current, goal_pose, obstacles)
            
            # Check reachability
            if not self.is_reachable(current, step_target):
                # Need intermediate step
                step_target = self.closest_reachable(current, step_target)
            
            steps.append({
                'foot': foot,
                'position': step_target,
                'orientation': self.calculate_orientation(step_target, goal_pose)
            })
            
            current = step_target
        
        return steps
```

### Smac Planner کا استعمال

Smac Planner (State Lattice) ہیومنائڈز کے لیے اچھی طرح کام کرتا ہے:

```yaml
planner_server:
  ros__parameters:
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_smac_planner/SmacPlanner2D"
      tolerance: 0.25
      downsample_costmap: false
      downsampling_factor: 1
      allow_unknown: true
      max_iterations: 1000000
      max_on_approach_iterations: 1000
      max_planning_time: 5.0
```

---

## Isaac ROS کے ساتھ انٹیگریشن

3D costmaps کے لیے NVBlox استعمال کریں:

```yaml
local_costmap:
  local_costmap:
    ros__parameters:
      plugins: ["nvblox_layer", "inflation_layer"]
      
      nvblox_layer:
        plugin: "nvblox::NvbloxCostmapLayer"
        enabled: True
        nvblox_map_slice_topic: /nvblox_node/map_slice
```

---

## مکمل اسٹیک لانچ کرنا

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    nav2_dir = get_package_share_directory('nav2_bringup')
    pkg_dir = get_package_share_directory('my_humanoid_pkg')
    
    return LaunchDescription([
        # Nav2
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(
                os.path.join(nav2_dir, 'launch', 'navigation_launch.py')
            ),
            launch_arguments={
                'params_file': os.path.join(pkg_dir, 'config', 'nav2_params.yaml'),
                'use_sim_time': 'true',
            }.items()
        ),
        
        # Locomotion Bridge
        Node(
            package='my_humanoid_pkg',
            executable='locomotion_bridge',
            name='locomotion_bridge',
            output='screen',
            parameters=[{
                'max_step_length': 0.15,
                'step_frequency': 2.0,
            }]
        ),
    ])
```

---

## نیویگیشن گولز بھیجنا

### کمانڈ لائن

```bash
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose \
  "{pose: {header: {frame_id: 'map'}, pose: {position: {x: 2.0, y: 1.0, z: 0.0}, orientation: {w: 1.0}}}}"
```

### Python

```python
from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped

navigator = BasicNavigator()
navigator.waitUntilNav2Active()

goal = PoseStamped()
goal.header.frame_id = 'map'
goal.pose.position.x = 2.0
goal.pose.position.y = 1.0
goal.pose.orientation.w = 1.0

navigator.goToPose(goal)

while not navigator.isTaskComplete():
    feedback = navigator.getFeedback()
    print(f'Distance remaining: {feedback.distance_remaining:.2f}')

result = navigator.getResult()
print(f'Navigation result: {result}')
```

---

## خلاصہ

-   **Nav2** پاتھ پلاننگ کو سنبھالتا ہے؛ gait controller ٹانگوں کی حرکت کو سنبھالتا ہے
-   velocity کو gait commands میں تبدیل کرنے کے لیے ایک **locomotion bridge** استعمال کریں
-   **Smac Planner** ہیومنائڈ کی رکاوٹوں کے لیے اچھی طرح کام کرتا ہے
-   3D obstacle awareness کے لیے **NVBlox** کے ساتھ انٹیگریٹ کریں
-   ایڈوانسڈ ایپلیکیشنز کے لیے **footstep planning** پر غور کریں

---

## اگلا مرحلہ

ماڈیول 3 کیپ اسٹون کا وقت! آپ ایک خود مختار نیویگیٹنگ ہیومنائڈ بنانے کے لیے Isaac Sim، Isaac ROS، اور Nav2 کو یکجا کریں گے۔

**→ [Module 3 Capstone](/docs/module-3-isaac/05-capstone)**