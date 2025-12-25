---
id: ros2-python-rclpy
title: "Python Agents with rclpy"
description: "Build Python-based robot agents using rclpy. Learn to bridge AI models and controllers to ROS 2 systems."
sidebar_position: 3
module: 1
keywords: [rclpy, Python, ROS 2, robot agents, executors, callbacks, async]
tags: [module-1, hands-on, intermediate]
---

# Python Agents with rclpy

> **TL;DR:** rclpy is your Python gateway to ROS 2. This section teaches you how to build sophisticated agents that combine AI logic with robot control—because your neural network is useless if it can't make a robot move.

---

## Why Python for Robotics?

Let's address the elephant in the room: **C++ is faster**.

But Python is:
- **Faster to develop** (3x-10x depending on who you ask)
- **Better for AI/ML** (PyTorch, TensorFlow, etc.)
- **Good enough** for most high-level logic
- **Actually readable** at 3 AM when debugging

The industry pattern? **C++ for low-level drivers and real-time control**, **Python for everything else**.

Your camera driver? C++. Your path planner that calls it every 100ms? Python is fine. Your LLM-based cognitive agent? Definitely Python.

---

## rclpy Fundamentals

`rclpy` is the official ROS 2 Python client library. Let's go deeper than "hello world."

### The Execution Model

ROS 2 nodes are **event-driven**. You register callbacks, then spin:

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        
        # Register things that should trigger callbacks
        self.create_subscription(...)
        self.create_timer(...)
        self.create_service(...)

def main():
    rclpy.init()
    node = MyNode()
    
    # Process events forever (or until Ctrl+C)
    rclpy.spin(node)
    
    rclpy.shutdown()
```

When you call `rclpy.spin(node)`, the library:
1. Checks for incoming messages on subscriptions
2. Checks for timer expirations
3. Checks for service requests
4. Calls your callbacks when events occur
5. Repeats forever

---

## Building a Practical Agent

Let's build something more useful: a robot that moves when you tell it to, but stops if it detects an obstacle.

### The Architecture

```
┌─────────────────────────────────────────────────┐
│                  AgentNode                      │
│                                                 │
│  Subscriptions:                                 │
│    - /scan (LaserScan) → check for obstacles   │
│    - /goal (PoseStamped) → where to go         │
│                                                 │
│  Publishers:                                    │
│    - /cmd_vel (Twist) → movement commands      │
│                                                 │
│  Timers:                                        │
│    - 10 Hz → decision loop                      │
└─────────────────────────────────────────────────┘
```

### The Code

```python
#!/usr/bin/env python3
"""
reactive_agent.py
A simple reactive agent that navigates while avoiding obstacles.
"""

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped
from sensor_msgs.msg import LaserScan
import numpy as np

class ReactiveAgent(Node):
    def __init__(self):
        super().__init__('reactive_agent')
        
        # State variables
        self.latest_scan = None
        self.current_goal = None
        self.obstacle_threshold = 0.5  # meters
        
        # Subscriptions
        self.scan_sub = self.create_subscription(
            LaserScan, '/scan', self.scan_callback, 10
        )
        self.goal_sub = self.create_subscription(
            PoseStamped, '/goal', self.goal_callback, 10
        )
        
        # Publisher for velocity commands
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        
        # Decision loop timer (10 Hz)
        self.decision_timer = self.create_timer(0.1, self.decision_loop)
        
        self.get_logger().info('🤖 Reactive Agent initialized')

    def scan_callback(self, msg: LaserScan):
        """Store latest LiDAR scan for obstacle detection."""
        self.latest_scan = msg

    def goal_callback(self, msg: PoseStamped):
        """Receive a new navigation goal."""
        self.current_goal = msg
        self.get_logger().info(f'New goal received: ({msg.pose.position.x:.2f}, {msg.pose.position.y:.2f})')

    def check_for_obstacle(self) -> bool:
        """Check if there's an obstacle in front of the robot."""
        if self.latest_scan is None:
            return False
        
        # Check the front 60 degrees of the LiDAR
        ranges = np.array(self.latest_scan.ranges)
        n_ranges = len(ranges)
        front_indices = range(n_ranges // 3, 2 * n_ranges // 3)
        front_ranges = ranges[list(front_indices)]
        
        # Filter out invalid readings
        valid_ranges = front_ranges[~np.isinf(front_ranges) & ~np.isnan(front_ranges)]
        
        if len(valid_ranges) == 0:
            return False
        
        min_distance = np.min(valid_ranges)
        return min_distance < self.obstacle_threshold

    def decision_loop(self):
        """Main decision loop - runs at 10 Hz."""
        cmd = Twist()
        
        if self.current_goal is None:
            # No goal, just chill
            self.cmd_pub.publish(cmd)
            return
        
        if self.check_for_obstacle():
            # STOP! Obstacle detected
            cmd.linear.x = 0.0
            cmd.angular.z = 0.5  # Turn to avoid
            self.get_logger().warn('⚠️ Obstacle detected! Turning...')
        else:
            # All clear, move forward
            cmd.linear.x = 0.3  # m/s
            cmd.angular.z = 0.0
        
        self.cmd_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    agent = ReactiveAgent()
    
    try:
        rclpy.spin(agent)
    except KeyboardInterrupt:
        # Stop the robot before shutting down
        stop_cmd = Twist()
        agent.cmd_pub.publish(stop_cmd)
    
    agent.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Advanced Patterns

### Multi-Threaded Executors

By default, ROS 2 processes callbacks sequentially. If one callback is slow, everything else waits.

```python
from rclpy.executors import MultiThreadedExecutor

def main():
    rclpy.init()
    
    node = ReactiveAgent()
    
    # Use multiple threads for callbacks
    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(node)
    
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    
    rclpy.shutdown()
```

⚠️ **Warning:** Multi-threading means you need to think about thread safety. Use locks if callbacks modify shared state.

### Callback Groups

Control which callbacks can run in parallel:

```python
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup, ReentrantCallbackGroup

class SmartAgent(Node):
    def __init__(self):
        super().__init__('smart_agent')
        
        # These callbacks will never run simultaneously
        self.safety_group = MutuallyExclusiveCallbackGroup()
        
        # These can run in parallel
        self.sensor_group = ReentrantCallbackGroup()
        
        self.scan_sub = self.create_subscription(
            LaserScan, '/scan', self.scan_callback, 10,
            callback_group=self.sensor_group
        )
        
        self.estop_sub = self.create_subscription(
            Bool, '/emergency_stop', self.estop_callback, 10,
            callback_group=self.safety_group
        )
```

---

## Integrating AI Models

Here's where it gets fun. Let's add an AI component:

```python
#!/usr/bin/env python3
"""
ai_agent.py
An agent that uses a neural network for decision making.
"""

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from geometry_msgs.msg import Twist
from cv_bridge import CvBridge
import torch
import numpy as np

class AIAgent(Node):
    def __init__(self):
        super().__init__('ai_agent')
        
        # Load your fancy AI model
        self.model = self.load_model()
        self.bridge = CvBridge()
        
        # Subscribe to camera
        self.image_sub = self.create_subscription(
            Image, '/camera/rgb/image_raw', self.image_callback, 10
        )
        
        # Publish commands
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        
        self.get_logger().info('🧠 AI Agent loaded and ready')

    def load_model(self):
        """Load a pretrained model."""
        # Example: Load a simple policy network
        # In practice, this could be any PyTorch/TensorFlow model
        model = torch.nn.Sequential(
            torch.nn.Conv2d(3, 16, 3, padding=1),
            torch.nn.ReLU(),
            torch.nn.AdaptiveAvgPool2d((8, 8)),
            torch.nn.Flatten(),
            torch.nn.Linear(16 * 8 * 8, 64),
            torch.nn.ReLU(),
            torch.nn.Linear(64, 2)  # [linear_vel, angular_vel]
        )
        model.eval()
        return model

    def image_callback(self, msg: Image):
        """Process camera image through AI model."""
        # Convert ROS Image to OpenCV
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'rgb8')
        
        # Preprocess for model
        tensor = torch.from_numpy(cv_image).float()
        tensor = tensor.permute(2, 0, 1).unsqueeze(0) / 255.0
        
        # Run inference
        with torch.no_grad():
            output = self.model(tensor)
        
        # Convert to velocity command
        cmd = Twist()
        cmd.linear.x = float(torch.tanh(output[0, 0])) * 0.5
        cmd.angular.z = float(torch.tanh(output[0, 1])) * 1.0
        
        self.cmd_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    node = AIAgent()
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

## Debugging Tips

### ros2 topic echo

See what's being published in real-time:

```bash
ros2 topic echo /cmd_vel
```

### ros2 run with verbose logging

```bash
ros2 run my_package my_node --ros-args --log-level debug
```

### rqt_graph

Visualize the node/topic graph:

```bash
ros2 run rqt_graph rqt_graph
```

---

## Common Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| Callback not firing | Forgot to spin | Add `rclpy.spin(node)` |
| Old data from sensor | Not checking timestamp | Compare `msg.header.stamp` with current time |
| Robot not responding | Wrong topic name | Use `ros2 topic list` to check |
| Slow inference blocking | Single-threaded executor | Use `MultiThreadedExecutor` |
| Memory leak | Not destroying node | Always call `node.destroy_node()` |

---

## Summary

You now know how to:

1. Build Python nodes with rclpy
2. Process sensor data in callbacks
3. Publish commands to control robots
4. Use multi-threading for performance
5. Integrate AI models into the ROS 2 pipeline

---

## Next Up

Your agent needs to know what the robot looks like. Time to describe your robot's body with **URDF**—Unified Robot Description Format (a.k.a. "XML that describes joints and links").

**→ [URDF for Humanoids](/docs/module-1-ros2/04-urdf-humanoids)**
