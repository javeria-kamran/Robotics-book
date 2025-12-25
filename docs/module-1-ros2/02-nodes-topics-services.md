---
id: ros2-nodes-topics-services
title: "Nodes, Topics, and Services"
description: "The holy trinity of ROS 2 communication. Learn how nodes talk to each other through topics (pub/sub) and services (request/response)."
sidebar_position: 2
module: 1
keywords: [ROS 2 nodes, topics, services, publishers, subscribers, communication]
tags: [module-1, fundamentals, beginner]
---

# Nodes, Topics, and Services

> **TL;DR:** Nodes are individual programs. Topics let nodes broadcast messages (one-to-many). Services let nodes ask questions and get answers (one-to-one). Master these three, and you understand 80% of ROS 2.

---

## The Mental Model

Think of a robot as a **tiny company**:

- **Nodes** = Employees (each doing a specific job)
- **Topics** = Company-wide email lists (broadcast information)
- **Services** = Direct messages (ask someone, get an answer)

An employee (node) might:
- **Publish** camera images to the "camera_feed" email list (topic)
- **Subscribe** to the "motor_commands" list to know when to move
- **Call a service** to ask the planner "Hey, where should I go next?"

---

## Nodes: The Building Blocks

A **node** is a single process that does one thing well. Examples:

| Node | Responsibility |
|------|----------------|
| `camera_driver` | Read from camera, publish images |
| `lidar_driver` | Read from LiDAR, publish point clouds |
| `path_planner` | Compute paths from A to B |
| `motor_controller` | Translate velocity commands to motor signals |
| `safety_monitor` | Watch for collisions, stop everything if needed |

### Why So Many Nodes?

**Modularity, baby.**

If your path planner crashes, your camera keeps working. If you want to swap LiDAR vendors, you just change one node. If you want to run perception on a GPU server and control on the robot... no problem, nodes can run on different machines.

### Creating a Minimal Node (Python)

```python
#!/usr/bin/env python3
"""
minimal_node.py
The "Hello World" of ROS 2 nodes.
"""

import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        # Give your node a name
        super().__init__('minimal_node')
        
        # Log a message (because we need proof of life)
        self.get_logger().info('🤖 I exist! My name is minimal_node.')

def main(args=None):
    # Initialize the ROS 2 Python client library
    rclpy.init(args=args)
    
    # Create our node
    node = MinimalNode()
    
    # Keep the node running until someone kills it (Ctrl+C)
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    
    # Clean up
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

Run it:

```bash
python3 minimal_node.py
```

Output:
```
[INFO] [minimal_node]: 🤖 I exist! My name is minimal_node.
```

Congratulations, you made a node. It does nothing useful, but it *exists*, and in philosophy (and robotics), that's step one.

---

## Topics: Broadcasting Messages

**Topics** use the **publish/subscribe** pattern:

- **Publishers** send messages to a topic
- **Subscribers** receive messages from a topic
- Publishers don't know who's listening
- Subscribers don't know who's publishing

This decoupling is powerful. Your camera node doesn't care if 0 or 100 nodes are watching its feed.

### Message Types

Topics are **typed**. You can't publish images to a topic expecting velocity commands. Common types include:

| Message Type | Contents | Use Case |
|--------------|----------|----------|
| `std_msgs/String` | A string | Debugging, simple commands |
| `sensor_msgs/Image` | Image data | Camera output |
| `sensor_msgs/LaserScan` | LiDAR data | 2D ranging |
| `geometry_msgs/Twist` | Linear + angular velocity | Robot movement |
| `nav_msgs/Odometry` | Position + velocity | Robot state |

### Publisher Example

```python
#!/usr/bin/env python3
"""
talker.py
Publishes a message every second. The classic ROS 2 demo.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Talker(Node):
    def __init__(self):
        super().__init__('talker')
        
        # Create a publisher
        # - Topic name: 'chatter'
        # - Message type: String
        # - Queue size: 10 (buffer for slow subscribers)
        self.publisher = self.create_publisher(String, 'chatter', 10)
        
        # Create a timer to publish every second
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0
        
        self.get_logger().info('Talker node started. Publishing to /chatter')

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello, robots! Message #{self.count}'
        self.publisher.publish(msg)
        self.get_logger().info(f'Published: "{msg.data}"')
        self.count += 1

def main(args=None):
    rclpy.init(args=args)
    node = Talker()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Subscriber Example

```python
#!/usr/bin/env python3
"""
listener.py
Subscribes to messages from the talker.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Listener(Node):
    def __init__(self):
        super().__init__('listener')
        
        # Create a subscription
        self.subscription = self.create_subscription(
            String,           # Message type
            'chatter',        # Topic name
            self.callback,    # Function to call when message arrives
            10                # Queue size
        )
        
        self.get_logger().info('Listener node started. Subscribed to /chatter')

    def callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = Listener()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Try It!

Terminal 1:
```bash
python3 talker.py
```

Terminal 2:
```bash
python3 listener.py
```

Terminal 3 (spy on the topic):
```bash
ros2 topic list        # See all topics
ros2 topic echo /chatter  # See messages in real-time
ros2 topic hz /chatter    # Check publishing rate
```

---

## Services: Request/Response

Sometimes broadcast isn't enough. You need to **ask a question and wait for an answer**.

- "Path planner, give me a route from A to B"
- "Is the gripper currently holding something?"
- "Save the current map to disk"

This is what **services** are for.

### Defining a Service

Services have a **request** type and a **response** type. A simple example:

```python
# Custom service definition (normally in a .srv file)
# AddTwoInts.srv
# ---
# int64 a
# int64 b
# ---
# int64 sum
```

### Service Server Example

```python
#!/usr/bin/env python3
"""
add_two_ints_server.py
A service that adds two integers. Revolutionary stuff.
"""

import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddServer(Node):
    def __init__(self):
        super().__init__('add_two_ints_server')
        
        # Create the service
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_callback
        )
        
        self.get_logger().info('Add Two Ints service ready.')

    def add_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Request: {request.a} + {request.b} = {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)
    node = AddServer()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Service Client Example

```python
#!/usr/bin/env python3
"""
add_two_ints_client.py
Calls the add service and waits for a response.
"""

import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class AddClient(Node):
    def __init__(self):
        super().__init__('add_two_ints_client')
        
        # Create client
        self.client = self.create_client(AddTwoInts, 'add_two_ints')
        
        # Wait for service to be available
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().warn('Waiting for service...')
        
        self.get_logger().info('Service found!')

    def call_add(self, a, b):
        request = AddTwoInts.Request()
        request.a = a
        request.b = b
        
        # Call the service (async, then wait)
        future = self.client.call_async(request)
        rclpy.spin_until_future_complete(self, future)
        
        return future.result().sum

def main(args=None):
    rclpy.init(args=args)
    client = AddClient()
    
    result = client.call_add(40, 2)
    print(f'Result: 40 + 2 = {result}')
    
    client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Quick Reference: CLI Commands

```bash
# Nodes
ros2 node list               # List running nodes
ros2 node info /node_name    # Details about a node

# Topics
ros2 topic list              # List all topics
ros2 topic info /topic_name  # Details about a topic
ros2 topic echo /topic_name  # Print messages in real-time
ros2 topic pub /topic_name std_msgs/String "data: 'hello'"  # Publish manually

# Services
ros2 service list            # List all services
ros2 service type /srv_name  # Get service type
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 5, b: 3}"
```

---

## Common Mistakes (We've All Been There)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Forgetting `rclpy.init()` | Node crashes immediately | Add `rclpy.init(args=args)` at the start |
| Wrong message type | Publisher creates, but no one receives | Check `ros2 topic info` for the expected type |
| Not spinning | Callbacks never fire | Add `rclpy.spin(node)` |
| Topic name typo | "/camera" vs "/Camera" | ROS 2 is case-sensitive! |
| Queue size too small | Messages dropped | Increase queue size for slow subscribers |

---

## Summary

| Concept | Pattern | Use When |
|---------|---------|----------|
| **Node** | Single process | Always. Everything is a node. |
| **Topic** | Pub/Sub | Streaming data (sensors, commands) |
| **Service** | Request/Response | Need an answer back |

---

## Next Up

We've covered how nodes talk. Now let's see how to use **rclpy** (the Python client library) to build more sophisticated agents that can control a robot.

**→ [Python Agents with rclpy](/docs/module-1-ros2/03-python-rclpy)**
