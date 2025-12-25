---
id: vla-capstone
title: "Capstone: The Autonomous Humanoid"
description: "The grand finale. Build an autonomous humanoid that combines everything: ROS 2, simulation, GPU perception, navigation, voice commands, and LLM-based planning."
sidebar_position: 4
module: 4
keywords: [capstone, autonomous robot, VLA, integration, final project]
tags: [module-4, capstone, advanced]
---

# Capstone: The Autonomous Humanoid

> **TL;DR:** Four modules. Dozens of concepts. One robot. This capstone integrates everything you've learned into an autonomous humanoid that can understand voice commands, perceive its environment, reason about tasks, and execute complex actions. This is the final boss.

---

## What You're Building

An autonomous humanoid robot that can:

| Capability | Source Module |
|------------|---------------|
| ✅ ROS 2 communication | Module 1 |
| ✅ Physics simulation | Module 2 |
| ✅ GPU-accelerated perception | Module 3 |
| ✅ Autonomous navigation | Module 3 |
| ✅ Voice command understanding | Module 4 |
| ✅ LLM-based task planning | Module 4 |
| ✅ Object manipulation | NEW |

---

## The Complete Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE AUTONOMOUS HUMANOID                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                           COGNITIVE LAYER                                ││
│  │                                                                          ││
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                ││
│  │   │   Whisper   │───▶│ LLM Planner │───▶│Task Executor│                ││
│  │   │  (Speech)   │    │  (GPT-4)    │    │  (Sequencer)│                ││
│  │   └─────────────┘    └─────────────┘    └──────┬──────┘                ││
│  │                                                │                         ││
│  └────────────────────────────────────────────────┼─────────────────────────┘│
│                                                   │                          │
│  ┌────────────────────────────────────────────────┼─────────────────────────┐│
│  │                        PERCEPTION LAYER        │                         ││
│  │                                                │                         ││
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────▼─────┐                   ││
│  │   │   cuVSLAM   │    │   NVBlox    │    │ Object    │                   ││
│  │   │  (Mapping)  │    │  (3D Map)   │    │ Detection │                   ││
│  │   └──────┬──────┘    └──────┬──────┘    └─────┬─────┘                   ││
│  │          │                  │                 │                          ││
│  └──────────┼──────────────────┼─────────────────┼──────────────────────────┘│
│             │                  │                 │                           │
│  ┌──────────┼──────────────────┼─────────────────┼──────────────────────────┐│
│  │          │     NAVIGATION   │     LAYER       │                          ││
│  │          │                  │                 │                          ││
│  │          └───────────┬──────┘                 │                          ││
│  │                      ▼                        │                          ││
│  │              ┌─────────────┐          ┌───────▼───────┐                 ││
│  │              │    Nav2     │          │  Manipulation │                 ││
│  │              │  (Planning) │          │   Controller  │                 ││
│  │              └──────┬──────┘          └───────┬───────┘                 ││
│  │                     │                         │                          ││
│  └─────────────────────┼─────────────────────────┼──────────────────────────┘│
│                        │                         │                           │
│  ┌─────────────────────┼─────────────────────────┼──────────────────────────┐│
│  │                     │    MOTOR LAYER          │                          ││
│  │                     ▼                         ▼                          ││
│  │              ┌─────────────┐          ┌─────────────┐                   ││
│  │              │ Locomotion  │          │    Arm      │                   ││
│  │              │  Controller │          │ Controller  │                   ││
│  │              └─────────────┘          └─────────────┘                   ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│                          ┌─────────────────┐                                │
│                          │   ISAAC SIM     │                                │
│                          │   (Physics)     │                                │
│                          └─────────────────┘                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
autonomous_humanoid/
├── config/
│   ├── nav2_params.yaml
│   ├── robot_params.yaml
│   └── perception_params.yaml
├── launch/
│   ├── simulation.launch.py
│   ├── perception.launch.py
│   ├── navigation.launch.py
│   └── full_system.launch.py
├── src/
│   ├── speech_recognition_node.py
│   ├── llm_planner_node.py
│   ├── task_executor_node.py
│   ├── world_state_node.py
│   ├── manipulation_node.py
│   └── locomotion_bridge.py
├── models/
│   └── (Whisper, object detection weights)
├── CMakeLists.txt
└── package.xml
```

---

## Step 1: World State Manager

Central hub for robot knowledge:

```python
#!/usr/bin/env python3
"""
world_state_node.py
Aggregates all perception into unified world state.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped, PoseWithCovarianceStamped
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection3DArray
import json
import numpy as np

class WorldStateNode(Node):
    def __init__(self):
        super().__init__('world_state')
        
        # State storage
        self.state = {
            'robot': {
                'location': None,
                'holding': None,
                'battery': 100,
            },
            'objects': {},
            'locations': {
                'kitchen': {'x': 5.0, 'y': 3.0},
                'living_room': {'x': 2.0, 'y': 1.0},
                'charging_station': {'x': 0.0, 'y': 0.0},
            },
            'people': [],
        }
        
        # Subscribers
        self.pose_sub = self.create_subscription(
            PoseWithCovarianceStamped, '/amcl_pose', 
            self.pose_callback, 10
        )
        
        self.detections_sub = self.create_subscription(
            Detection3DArray, '/detections',
            self.detections_callback, 10
        )
        
        # Publisher
        self.state_pub = self.create_publisher(String, '/world_state', 10)
        
        # Timer
        self.timer = self.create_timer(0.5, self.publish_state)
        
        self.get_logger().info('World State Manager ready!')
    
    def pose_callback(self, msg):
        """Update robot pose."""
        self.state['robot']['location'] = {
            'x': msg.pose.pose.position.x,
            'y': msg.pose.pose.position.y,
            'theta': self.quaternion_to_yaw(msg.pose.pose.orientation)
        }
        
        # Determine named location
        for name, pos in self.state['locations'].items():
            dist = np.sqrt(
                (pos['x'] - msg.pose.pose.position.x)**2 +
                (pos['y'] - msg.pose.pose.position.y)**2
            )
            if dist < 1.0:
                self.state['robot']['current_room'] = name
                break
    
    def detections_callback(self, msg):
        """Update detected objects."""
        for detection in msg.detections:
            obj_id = detection.results[0].hypothesis.class_id
            obj_name = self.id_to_name(obj_id)
            
            self.state['objects'][obj_name] = {
                'position': {
                    'x': detection.bbox.center.position.x,
                    'y': detection.bbox.center.position.y,
                    'z': detection.bbox.center.position.z,
                },
                'confidence': detection.results[0].hypothesis.score,
                'last_seen': self.get_clock().now().to_msg().sec
            }
    
    def id_to_name(self, class_id):
        """Map detection ID to object name."""
        names = {
            0: 'cup', 1: 'bottle', 2: 'book', 3: 'phone',
            4: 'remote', 5: 'apple', 6: 'banana'
        }
        return names.get(class_id, f'object_{class_id}')
    
    def quaternion_to_yaw(self, q):
        """Convert quaternion to yaw angle."""
        siny_cosp = 2 * (q.w * q.z + q.x * q.y)
        cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z)
        return np.arctan2(siny_cosp, cosy_cosp)
    
    def publish_state(self):
        """Publish current world state."""
        msg = String()
        msg.data = json.dumps(self.state)
        self.state_pub.publish(msg)
    
    def get_summary(self):
        """Get human-readable summary."""
        robot = self.state['robot']
        room = robot.get('current_room', 'unknown')
        holding = robot.get('holding', 'nothing')
        objects = list(self.state['objects'].keys())
        
        return f"""Robot is in {room}, holding {holding}.
Visible objects: {', '.join(objects) if objects else 'none'}"""

def main(args=None):
    rclpy.init(args=args)
    node = WorldStateNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Step 2: Task Executor

Runs action sequences from the planner:

```python
#!/usr/bin/env python3
"""
task_executor_node.py
Executes task plans from the LLM planner.
"""

import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
from nav2_msgs.action import NavigateToPose
import json
import time

class TaskExecutorNode(Node):
    def __init__(self):
        super().__init__('task_executor')
        
        # Action clients
        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        
        # Subscribers
        self.plan_sub = self.create_subscription(
            String, '/task_plan', self.plan_callback, 10
        )
        
        self.world_state_sub = self.create_subscription(
            String, '/world_state', self.world_state_callback, 10
        )
        
        # Publishers
        self.status_pub = self.create_publisher(String, '/task_status', 10)
        self.speak_pub = self.create_publisher(String, '/speak', 10)
        self.grasp_pub = self.create_publisher(String, '/grasp_command', 10)
        
        # State
        self.world_state = {}
        self.current_task = None
        self.is_executing = False
        
        # Location map
        self.locations = {
            'kitchen': (5.0, 3.0, 0.0),
            'living room': (2.0, 1.0, 0.0),
            'bedroom': (8.0, 2.0, 0.0),
            'bathroom': (6.0, 6.0, 1.57),
        }
        
        self.get_logger().info('Task Executor ready!')
    
    def world_state_callback(self, msg):
        """Update world state."""
        self.world_state = json.loads(msg.data)
    
    def plan_callback(self, msg):
        """Execute incoming task plan."""
        if self.is_executing:
            self.get_logger().warn('Already executing a task!')
            return
        
        plan = json.loads(msg.data)
        self.execute_plan(plan)
    
    def execute_plan(self, plan):
        """Execute all steps in the plan."""
        self.is_executing = True
        self.current_task = plan.get('task', 'unknown')
        
        self.publish_status('started', f"Starting: {self.current_task}")
        
        steps = plan.get('steps', [])
        
        for i, step in enumerate(steps):
            self.publish_status('in_progress', 
                f"Step {i+1}/{len(steps)}: {step['action']}")
            
            success = self.execute_step(step)
            
            if not success:
                self.publish_status('failed', 
                    f"Failed at step {i+1}: {step['action']}")
                break
        else:
            self.publish_status('completed', 
                f"Completed: {self.current_task}")
        
        self.is_executing = False
    
    def execute_step(self, step):
        """Execute a single action step."""
        action = step['action']
        target = step.get('target', '')
        params = step.get('params', {})
        
        handlers = {
            'navigate': self.handle_navigate,
            'look': self.handle_look,
            'grasp': self.handle_grasp,
            'place': self.handle_place,
            'speak': self.handle_speak,
            'wait': self.handle_wait,
        }
        
        handler = handlers.get(action)
        if handler:
            return handler(target, params)
        else:
            self.get_logger().warn(f'Unknown action: {action}')
            return False
    
    def handle_navigate(self, target, params):
        """Navigate to target location."""
        # Check if it's a named location
        if target.lower() in self.locations:
            x, y, theta = self.locations[target.lower()]
        elif target in self.world_state.get('objects', {}):
            obj = self.world_state['objects'][target]
            x = obj['position']['x']
            y = obj['position']['y']
            theta = 0.0
        else:
            self.get_logger().error(f'Unknown location: {target}')
            return False
        
        # Create goal
        goal = NavigateToPose.Goal()
        goal.pose.header.frame_id = 'map'
        goal.pose.header.stamp = self.get_clock().now().to_msg()
        goal.pose.pose.position.x = x
        goal.pose.pose.position.y = y
        goal.pose.pose.orientation.w = 1.0
        
        # Send goal
        self.nav_client.wait_for_server()
        future = self.nav_client.send_goal_async(goal)
        rclpy.spin_until_future_complete(self, future)
        
        goal_handle = future.result()
        if not goal_handle.accepted:
            return False
        
        # Wait for result
        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future)
        
        return True
    
    def handle_look(self, target, params):
        """Look at target (head movement)."""
        # Publish look command
        msg = String()
        msg.data = json.dumps({'target': target})
        # self.look_pub.publish(msg)
        time.sleep(1.0)  # Simulate head movement
        return True
    
    def handle_grasp(self, target, params):
        """Grasp an object."""
        msg = String()
        msg.data = json.dumps({
            'action': 'grasp',
            'object': target
        })
        self.grasp_pub.publish(msg)
        time.sleep(3.0)  # Simulate grasp time
        
        # Update state
        self.world_state['robot']['holding'] = target
        return True
    
    def handle_place(self, target, params):
        """Place held object."""
        msg = String()
        msg.data = json.dumps({
            'action': 'place',
            'location': target
        })
        self.grasp_pub.publish(msg)
        time.sleep(2.0)
        
        self.world_state['robot']['holding'] = None
        return True
    
    def handle_speak(self, message, params):
        """Speak to user."""
        msg = String()
        msg.data = message
        self.speak_pub.publish(msg)
        return True
    
    def handle_wait(self, duration, params):
        """Wait for specified time."""
        seconds = float(duration) if duration else params.get('seconds', 1)
        time.sleep(seconds)
        return True
    
    def publish_status(self, status, message):
        """Publish task status."""
        msg = String()
        msg.data = json.dumps({
            'task': self.current_task,
            'status': status,
            'message': message
        })
        self.status_pub.publish(msg)
        self.get_logger().info(f'[{status}] {message}')

def main(args=None):
    rclpy.init(args=args)
    node = TaskExecutorNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Step 3: Main Launch File

```python
# launch/full_system.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    pkg_dir = get_package_share_directory('autonomous_humanoid')
    
    return LaunchDescription([
        # === PERCEPTION ===
        # World State Manager
        Node(
            package='autonomous_humanoid',
            executable='world_state_node',
            name='world_state',
            output='screen',
        ),
        
        # === COGNITIVE ===
        # Speech Recognition
        Node(
            package='autonomous_humanoid',
            executable='speech_recognition_node',
            name='speech_recognition',
            output='screen',
            parameters=[{
                'model_name': 'small',
                'continuous_mode': True,
                'wake_word': 'hey robot',
            }],
        ),
        
        # LLM Planner
        Node(
            package='autonomous_humanoid',
            executable='llm_planner_node',
            name='llm_planner',
            output='screen',
            parameters=[{
                'model': 'gpt-4',
                'temperature': 0.0,
            }],
        ),
        
        # Task Executor
        Node(
            package='autonomous_humanoid',
            executable='task_executor_node',
            name='task_executor',
            output='screen',
        ),
        
        # === NAVIGATION ===
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(
                os.path.join(pkg_dir, 'launch', 'navigation.launch.py')
            )
        ),
        
        # Locomotion Bridge
        Node(
            package='autonomous_humanoid',
            executable='locomotion_bridge',
            name='locomotion_bridge',
            output='screen',
        ),
    ])
```

---

## Step 4: Demo Script

```python
#!/usr/bin/env python3
"""
demo.py
Interactive demo of the autonomous humanoid.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import json

class DemoNode(Node):
    def __init__(self):
        super().__init__('demo')
        
        # Publishers
        self.command_pub = self.create_publisher(
            String, '/voice_command', 10
        )
        
        # Subscribers
        self.status_sub = self.create_subscription(
            String, '/task_status', self.status_callback, 10
        )
        
    def status_callback(self, msg):
        """Print status updates."""
        status = json.loads(msg.data)
        print(f"  [{status['status']}] {status['message']}")
    
    def send_command(self, command):
        """Send a voice command."""
        print(f"\n🎤 Command: \"{command}\"")
        print("-" * 40)
        
        msg = String()
        msg.data = command
        self.command_pub.publish(msg)

def main():
    rclpy.init()
    node = DemoNode()
    
    print("=" * 50)
    print("  AUTONOMOUS HUMANOID DEMO")
    print("=" * 50)
    print("\nExample commands:")
    print("  - Bring me the water bottle")
    print("  - Go to the kitchen")
    print("  - Find my phone")
    print("  - What can you see?")
    print("\nType 'quit' to exit.\n")
    
    import threading
    spin_thread = threading.Thread(target=rclpy.spin, args=(node,))
    spin_thread.start()
    
    try:
        while True:
            command = input("\n🤖 Enter command: ").strip()
            
            if command.lower() == 'quit':
                break
            
            if command:
                node.send_command(command)
            
    except KeyboardInterrupt:
        pass
    
    rclpy.shutdown()
    spin_thread.join()

if __name__ == '__main__':
    main()
```

---

## Running the Full System

### Terminal 1: Isaac Sim

```bash
./isaac-sim.sh
# Load your humanoid scene and press Play
```

### Terminal 2: Full System Launch

```bash
ros2 launch autonomous_humanoid full_system.launch.py
```

### Terminal 3: Demo

```bash
ros2 run autonomous_humanoid demo
```

---

## Example Interaction

```
🤖 Enter command: Hey robot, bring me the red cup

🎤 Command: "bring me the red cup"
----------------------------------------
  [started] Starting: bring me the red cup
  [in_progress] Step 1/5: look
  [in_progress] Step 2/5: navigate
  [in_progress] Step 3/5: grasp
  [in_progress] Step 4/5: navigate
  [in_progress] Step 5/5: speak
  [completed] Completed: bring me the red cup

🤖 Enter command: _
```

---

## Challenges to Extend

| Challenge | Difficulty | Skills |
|-----------|------------|--------|
| Multi-object manipulation | ⭐⭐ | Arm control |
| Dynamic obstacle avoidance | ⭐⭐ | Real-time planning |
| Multi-room mapping | ⭐⭐⭐ | SLAM |
| Human following | ⭐⭐⭐ | People tracking |
| Collaborative tasks | ⭐⭐⭐⭐ | Multi-agent |
| Continuous learning | ⭐⭐⭐⭐⭐ | Online learning |

---

## You Did It! 🎉

You've built an autonomous humanoid robot that:

- ✅ Understands natural language commands
- ✅ Perceives its environment with GPU acceleration
- ✅ Reasons about tasks using LLMs
- ✅ Plans and executes complex behaviors
- ✅ Navigates autonomously
- ✅ Interacts with objects

**This is the state of the art in physical AI.**

---

## What's Next?

The future is being written right now:

**→ [What's Next: The Future of Physical AI](/docs/module-4-vla/05-whats-next)**
