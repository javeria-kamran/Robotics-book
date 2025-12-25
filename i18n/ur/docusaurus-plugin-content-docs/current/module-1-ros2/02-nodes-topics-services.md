---
description: ROS 2 کمیونیکیشن کے تین بنیادی ستون۔ جانیں کہ Nodes Topics (pub/sub)
  اور Services (request/response) کے ذریعے ایک دوسرے سے کیسے بات چیت کرتے ہیں۔
id: ros2-nodes-topics-services
keywords:
- ROS 2 nodes
- topics
- services
- publishers
- subscribers
- communication
module: 1
sidebar_position: 2
tags:
- module-1
- fundamentals
- beginner
title: Nodes، Topics اور Services
---

# Nodes, Topics, and Services

> **TL;DR:** Nodes انفرادی پروگرامز ہیں۔ Topics Nodes کو پیغامات نشر کرنے دیتے ہیں (ایک سے کئی تک)۔ Services Nodes کو سوال پوچھنے اور جواب حاصل کرنے دیتے ہیں (ایک سے ایک تک)۔ ان تینوں میں مہارت حاصل کریں، اور آپ ROS 2 کا 80% سمجھ جائیں گے۔

---

## ذہنی ماڈل (The Mental Model)

ایک روبوٹ کو ایک **چھوٹی کمپنی** کے طور پر سوچیں:

- **Nodes** = ملازمین (ہر ایک مخصوص کام کر رہا ہے)
- **Topics** = کمپنی بھر کی ای میل لسٹیں (معلومات نشر کرنا)
- **Services** = براہ راست پیغامات (کسی سے پوچھیں، جواب حاصل کریں)

ایک ملازم (Node) یہ کر سکتا ہے:
- "camera_feed" ای میل لسٹ (Topic) پر کیمرے کی تصاویر **Publish** کر سکتا ہے۔
- "motor_commands" لسٹ کو **Subscribe** کر سکتا ہے تاکہ معلوم ہو کہ کب حرکت کرنی ہے۔
- Planner سے پوچھنے کے لیے ایک **Service Call** کر سکتا ہے کہ "ارے، مجھے اگلی منزل کہاں جانا چاہیے؟"

---

## Nodes: بنیادی اجزاء (The Building Blocks)

ایک **Node** ایک واحد پروسیس ہے جو ایک کام اچھی طرح کرتا ہے۔ مثالیں:

| Node | ذمہ داری (Responsibility) |
|------|--------------------------|
| `camera_driver` | کیمرے سے پڑھنا، تصاویر Publish کرنا |
| `lidar_driver` | LiDAR سے پڑھنا، Point Clouds Publish کرنا |
| `path_planner` | A سے B تک راستے کا حساب لگانا |
| `motor_controller` | Velocity Commands کو Motor Signals میں تبدیل کرنا |
| `safety_monitor` | تصادم کی نگرانی کرنا، ضرورت پڑنے پر سب کچھ روک دینا |

### اتنے سارے Nodes کیوں؟

**Modularity، پیارے۔**

اگر آپ کا Path Planner کریش ہو جاتا ہے، تو آپ کا کیمرہ کام کرتا رہتا ہے۔ اگر آپ LiDAR وینڈرز کو تبدیل کرنا چاہتے ہیں، تو آپ صرف ایک Node تبدیل کرتے ہیں۔ اگر آپ GPU سرور پر Perception چلانا چاہتے ہیں اور روبوٹ پر Control کرنا چاہتے ہیں... کوئی مسئلہ نہیں، Nodes مختلف مشینوں پر چل سکتے ہیں۔

### ایک Minimal Node بنانا (Python)

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

اسے چلائیں:

```bash
python3 minimal_node.py
```

آؤٹ پٹ:
```
[INFO] [minimal_node]: 🤖 I exist! My name is minimal_node.
```

مبارک ہو، آپ نے ایک Node بنایا۔ یہ کوئی مفید کام نہیں کرتا، لیکن یہ *موجود* ہے، اور فلسفے (اور روبوٹکس) میں، یہ پہلا قدم ہے۔

---

## Topics: پیغامات نشر کرنا (Broadcasting Messages)

**Topics** **Publish/Subscribe** پیٹرن استعمال کرتے ہیں:

- **Publishers** ایک Topic پر پیغامات بھیجتے ہیں۔
- **Subscribers** ایک Topic سے پیغامات وصول کرتے ہیں۔
- Publishers کو معلوم نہیں ہوتا کہ کون سن رہا ہے۔
- Subscribers کو معلوم نہیں ہوتا کہ کون Publish کر رہا ہے۔

یہ Decoupling بہت طاقتور ہے۔ آپ کے کیمرہ Node کو اس بات کی پرواہ نہیں ہوتی کہ 0 یا 100 Nodes اس کی فیڈ دیکھ رہے ہیں۔

### Message Types

Topics **Typed** ہوتے ہیں۔ آپ Velocity Commands کی توقع رکھنے والے Topic پر تصاویر Publish نہیں کر سکتے۔ عام Types میں شامل ہیں:

| Message Type | مواد (Contents) | استعمال کا کیس (Use Case) |
|--------------|-----------------|--------------------------|
| `std_msgs/String` | ایک String | Debugging، سادہ Commands |
| `sensor_msgs/Image` | تصویری ڈیٹا | کیمرہ آؤٹ پٹ |
| `sensor_msgs/LaserScan` | LiDAR ڈیٹا | 2D Ranging |
| `geometry_msgs/Twist` | Linear + Angular Velocity | روبوٹ کی حرکت |
| `nav_msgs/Odometry` | Position + Velocity | روبوٹ کی حالت |

### Publisher کی مثال

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

### Subscriber کی مثال

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

### اسے آزمائیں!

ٹرمینل 1:
```bash
python3 talker.py
```

ٹرمینل 2:
```bash
python3 listener.py
```

ٹرمینل 3 (Topic پر جاسوسی کریں):
```bash
ros2 topic list        # تمام Topics دیکھیں
ros2 topic echo /chatter  # پیغامات حقیقی وقت میں دیکھیں
ros2 topic hz /chatter    # Publishing Rate چیک کریں
```

---

## Services: درخواست/جواب (Request/Response)

بعض اوقات نشر کرنا کافی نہیں ہوتا۔ آپ کو **ایک سوال پوچھنے اور جواب کا انتظار کرنے** کی ضرورت ہوتی ہے۔

- "Path Planner، مجھے A سے B تک کا راستہ دیں"
- "کیا Gripper فی الحال کچھ پکڑے ہوئے ہے؟"
- "موجودہ Map کو ڈسک میں محفوظ کریں"

یہی وہ مقصد ہے جس کے لیے **Services** ہیں۔

### ایک Service کی تعریف کرنا

Services میں ایک **Request** Type اور ایک **Response** Type ہوتا ہے۔ ایک سادہ مثال:

```python
# Custom service definition (normally in a .srv file)
# AddTwoInts.srv
# ---
# int64 a
# int64 b
# ---
# int64 sum
```

### Service Server کی مثال

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

### Service Client کی مثال

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

## فوری حوالہ: CLI Commands

```bash
# Nodes
ros2 node list               # چلنے والے Nodes کی فہرست
ros2 node info /node_name    # ایک Node کے بارے میں تفصیلات

# Topics
ros2 topic list              # تمام Topics کی فہرست
ros2 topic info /topic_name  # ایک Topic کے بارے میں تفصیلات
ros2 topic echo /topic_name  # پیغامات حقیقی وقت میں پرنٹ کریں
ros2 topic pub /topic_name std_msgs/String "data: 'hello'"  # دستی طور پر Publish کریں

# Services
ros2 service list            # تمام Services کی فہرست
ros2 service type /srv_name  # Service Type حاصل کریں
ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts "{a: 5, b: 3}"
```

---

## عام غلطیاں (ہم سب وہاں سے گزر چکے ہیں)

| غلطی (Mistake) | علامت (Symptom) | درستگی (Fix) |
|-----------------|-----------------|--------------|
| `rclpy.init()` بھول جانا | Node فوراً کریش ہو جاتا ہے | شروع میں `rclpy.init(args=args)` شامل کریں |
| غلط Message Type | Publisher بناتا ہے، لیکن کوئی وصول نہیں کرتا | متوقع Type کے لیے `ros2 topic info` چیک کریں |
| Spin نہ کرنا | Callbacks کبھی فائر نہیں ہوتے | `rclpy.spin(node)` شامل کریں |
| Topic نام کی ٹائپو | "/camera" بمقابلہ "/Camera" | ROS 2 Case-Sensitive ہے! |
| Queue Size بہت چھوٹی | پیغامات ڈراپ ہو جاتے ہیں | سست Subscribers کے لیے Queue Size بڑھائیں |

---

## خلاصہ (Summary)

| تصور (Concept) | پیٹرن (Pattern) | کب استعمال کریں (Use When) |
|-----------------|-----------------|----------------------------|
| **Node** | واحد پروسیس | ہمیشہ۔ ہر چیز ایک Node ہے۔ |
| **Topic** | Pub/Sub | ڈیٹا کو سٹریم کرنا (Sensors، Commands) |
| **Service** | Request/Response | جب جواب کی ضرورت ہو |

---

## اگلا کیا (Next Up)

ہم نے دیکھا کہ Nodes کیسے بات کرتے ہیں۔ اب دیکھتے ہیں کہ روبوٹ کو کنٹرول کرنے والے مزید جدید ایجنٹس بنانے کے لیے **rclpy** (Python Client Library) کا استعمال کیسے کیا جائے۔

**→ [Python Agents with rclpy](/docs/module-1-ros2/03-python-rclpy)**