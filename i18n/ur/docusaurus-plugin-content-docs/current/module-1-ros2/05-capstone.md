---
description: Build a complete ROS 2 robot system from scratch. Create a robot, make
  it move, and control it with Python.
id: ros2-capstone
keywords:
- ROS 2 capstone
- robot project
- hands-on
- complete system
module: 1
sidebar_position: 5
tags:
- module-1
- capstone
- hands-on
title: 'ماڈیول 1 سنگ میل: آپ کا پہلا Robot System'
---

# ماڈیول 1 کیپ اسٹون: آپ کا پہلا روبوٹ سسٹم

> **TL;DR:** اب سب کچھ ایک ساتھ کرنے کا وقت ہے۔ آپ ایک مکمل ROS 2 package بنائیں گے جس میں ایک URDF robot، ایک controller node، اور ایک keyboard teleop interface شامل ہوگا۔ آخر تک، آپ کے پاس ایک فعال روبوٹ ہوگا جسے آپ چلا سکیں گے۔

---

## آپ کیا بنائیں گے

ایک **differential drive robot** جس میں شامل ہوگا:
- ✅ URDF description (body, wheels, sensors)
- ✅ Python teleop node (keyboard control)
- ✅ Robot state publisher (TF broadcasting)
- ✅ ہر چیز کو شروع کرنے کے لیے Launch file

یہ ہر روبوٹ پروجیکٹ کی بنیاد ہے جو آپ بنائیں گے۔

---

## پروجیکٹ کا ڈھانچہ

```
my_robot_pkg/
├── package.xml
├── setup.py
├── setup.cfg
├── resource/
│   └── my_robot_pkg
├── my_robot_pkg/
│   ├── __init__.py
│   └── teleop_keyboard.py
├── urdf/
│   └── my_robot.urdf.xacro
├── launch/
│   └── robot.launch.py
└── config/
    └── robot_params.yaml
```

---

## مرحلہ 1: Package بنائیں

```bash
cd ~/ros2_ws/src
ros2 pkg create my_robot_pkg --build-type ament_python --dependencies rclpy geometry_msgs sensor_msgs
```

---

## مرحلہ 2: روبوٹ کا URDF

`urdf/my_robot.urdf.xacro` بنائیں:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="my_robot">

  <!-- ========== PROPERTIES ========== -->
  <xacro:property name="base_width" value="0.3"/>
  <xacro:property name="base_length" value="0.4"/>
  <xacro:property name="base_height" value="0.15"/>
  <xacro:property name="wheel_radius" value="0.08"/>
  <xacro:property name="wheel_width" value="0.04"/>
  <xacro:property name="wheel_offset_y" value="${base_width/2 + wheel_width/2}"/>

  <!-- ========== MATERIALS ========== -->
  <material name="blue">
    <color rgba="0.2 0.4 0.8 1.0"/>
  </material>
  <material name="grey">
    <color rgba="0.4 0.4 0.4 1.0"/>
  </material>
  <material name="black">
    <color rgba="0.1 0.1 0.1 1.0"/>
  </material>

  <!-- ========== BASE FOOTPRINT ========== -->
  <link name="base_footprint"/>

  <!-- ========== BASE LINK ========== -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.05" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <joint name="base_joint" type="fixed">
    <parent link="base_footprint"/>
    <child link="base_link"/>
    <origin xyz="0 0 ${wheel_radius + base_height/2}" rpy="0 0 0"/>
  </joint>

  <!-- ========== WHEEL MACRO ========== -->
  <xacro:macro name="wheel" params="prefix y_offset">
    <link name="${prefix}_wheel">
      <visual>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <origin rpy="${pi/2} 0 0"/>
        <material name="black"/>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <origin rpy="${pi/2} 0 0"/>
      </collision>
      <inertial>
        <mass value="0.5"/>
        <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.002"/>
      </inertial>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${prefix}_wheel"/>
      <origin xyz="0 ${y_offset} ${-base_height/2}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
    </joint>
  </xacro:macro>

  <!-- Create both wheels -->
  <xacro:wheel prefix="left" y_offset="${wheel_offset_y}"/>
  <xacro:wheel prefix="right" y_offset="${-wheel_offset_y}"/>

  <!-- ========== CASTER WHEEL ========== -->
  <link name="caster">
    <visual>
      <geometry>
        <sphere radius="0.04"/>
      </geometry>
      <material name="grey"/>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.04"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.1"/>
      <inertia ixx="0.0001" ixy="0" ixz="0" iyy="0.0001" iyz="0" izz="0.0001"/>
    </inertial>
  </link>

  <joint name="caster_joint" type="fixed">
    <parent link="base_link"/>
    <child link="caster"/>
    <origin xyz="${-base_length/2 + 0.05} 0 ${-base_height/2 - 0.04}" rpy="0 0 0"/>
  </joint>

  <!-- ========== LIDAR ========== -->
  <link name="lidar_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.04"/>
      </geometry>
      <material name="grey"/>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.04"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.0002" ixy="0" ixz="0" iyy="0.0002" iyz="0" izz="0.0002"/>
    </inertial>
  </link>

  <joint name="lidar_joint" type="fixed">
    <parent link="base_link"/>
    <child link="lidar_link"/>
    <origin xyz="0 0 ${base_height/2 + 0.03}" rpy="0 0 0"/>
  </joint>

</robot>
```

---

## مرحلہ 3: Keyboard Teleop Node

`my_robot_pkg/teleop_keyboard.py` بنائیں:

```python
#!/usr/bin/env python3
"""
teleop_keyboard.py
Drive your robot with WASD keys. Like a video game, but nerdier.
"""

import sys
import termios
import tty
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

# Key bindings
MOVE_BINDINGS = {
    'w': (1.0, 0.0),   # Forward
    's': (-1.0, 0.0),  # Backward
    'a': (0.0, 1.0),   # Turn left
    'd': (0.0, -1.0),  # Turn right
    'q': (1.0, 1.0),   # Forward + left
    'e': (1.0, -1.0),  # Forward + right
    ' ': (0.0, 0.0),   # Stop
}

class TeleopKeyboard(Node):
    def __init__(self):
        super().__init__('teleop_keyboard')
        
        # Parameters
        self.declare_parameter('linear_speed', 0.5)
        self.declare_parameter('angular_speed', 1.0)
        self.declare_parameter('topic', 'cmd_vel')
        
        self.linear_speed = self.get_parameter('linear_speed').value
        self.angular_speed = self.get_parameter('angular_speed').value
        topic = self.get_parameter('topic').value
        
        # Publisher
        self.publisher = self.create_publisher(Twist, topic, 10)
        
        # Terminal settings
        self.settings = termios.tcgetattr(sys.stdin)
        
        self.get_logger().info(f'''
╔══════════════════════════════════════╗
║       ROBOT KEYBOARD TELEOP          ║
╠══════════════════════════════════════╣
║   W - Forward      S - Backward      ║
║   A - Turn Left    D - Turn Right    ║
║   Q - Fwd+Left     E - Fwd+Right     ║
║   SPACE - Stop                       ║
║   CTRL+C - Quit                      ║
╠══════════════════════════════════════╣
║   Speed: {self.linear_speed:.1f} m/s | {self.angular_speed:.1f} rad/s       ║
╚══════════════════════════════════════╝
        ''')

    def get_key(self):
        """Get a single keypress."""
        tty.setraw(sys.stdin.fileno())
        key = sys.stdin.read(1)
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.settings)
        return key

    def run(self):
        """Main teleop loop."""
        try:
            while rclpy.ok():
                key = self.get_key()
                
                if key == '\x03':  # CTRL+C
                    break
                
                if key in MOVE_BINDINGS:
                    linear, angular = MOVE_BINDINGS[key]
                    
                    msg = Twist()
                    msg.linear.x = linear * self.linear_speed
                    msg.angular.z = angular * self.angular_speed
                    
                    self.publisher.publish(msg)
                    
                    if linear == 0 and angular == 0:
                        self.get_logger().info('⏹️  STOP')
                    else:
                        self.get_logger().info(f'🚗 Linear: {msg.linear.x:.2f} | Angular: {msg.angular.z:.2f}')
                
        except Exception as e:
            self.get_logger().error(f'Error: {e}')
        
        finally:
            # Stop the robot
            msg = Twist()
            self.publisher.publish(msg)
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.settings)

def main(args=None):
    rclpy.init(args=args)
    node = TeleopKeyboard()
    
    try:
        node.run()
    except KeyboardInterrupt:
        pass
    
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## مرحلہ 4: Launch File

`launch/robot.launch.py` بنائیں:

```python
#!/usr/bin/env python3
"""
robot.launch.py
Launch the complete robot system.
"""

import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, Command
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue

def generate_launch_description():
    # Get package path
    pkg_path = get_package_share_directory('my_robot_pkg')
    
    # URDF file path
    urdf_path = os.path.join(pkg_path, 'urdf', 'my_robot.urdf.xacro')
    
    # Process xacro
    robot_description = ParameterValue(
        Command(['xacro ', urdf_path]),
        value_type=str
    )
    
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')
    
    return LaunchDescription([
        # Declare arguments
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='false',
            description='Use simulation clock'
        ),
        
        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            output='screen',
            parameters=[{
                'robot_description': robot_description,
                'use_sim_time': use_sim_time,
            }]
        ),
        
        # Joint State Publisher GUI (for testing)
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            name='joint_state_publisher_gui',
            output='screen',
        ),
        
        # RViz
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            output='screen',
            arguments=['-d', os.path.join(pkg_path, 'config', 'robot.rviz')],
        ),
    ])
```

---

## مرحلہ 5: سیٹ اپ اور Build

`setup.py` کو اپ ڈیٹ کریں:

```python
from setuptools import setup
import os
from glob import glob

package_name = 'my_robot_pkg'

setup(
    name=package_name,
    version='0.1.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        (os.path.join('share', package_name, 'urdf'), glob('urdf/*')),
        (os.path.join('share', package_name, 'launch'), glob('launch/*')),
        (os.path.join('share', package_name, 'config'), glob('config/*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='you@email.com',
    description='My first robot package',
    license='MIT',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'teleop_keyboard = my_robot_pkg.teleop_keyboard:main',
        ],
    },
)
```

اسے Build کریں:

```bash
cd ~/ros2_ws
colcon build --packages-select my_robot_pkg
source install/setup.bash
```

---

## مرحلہ 6: سب کچھ چلائیں

ٹرمینل 1 - روبوٹ کو لانچ کریں:
```bash
ros2 launch my_robot_pkg robot.launch.py
```

ٹرمینل 2 - teleop چلائیں:
```bash
ros2 run my_robot_pkg teleop_keyboard
```

---

## چیلنج ایکسٹینشنز

ایک بار جب بنیادی سسٹم کام کرنے لگے، تو یہ کوشش کریں:

### 🔹 آسان: رفتار کنٹرولز شامل کریں
- رفتار بڑھانے کے لیے `+` دبائیں۔
- رفتار کم کرنے کے لیے `-` دبائیں۔

### 🔹 درمیانہ: کیمرہ شامل کریں
- URDF میں ایک camera link شامل کریں۔
- جعلی image data شائع کریں۔

### 🔹 مشکل: Odometry شامل کریں
- ایک odometry node بنائیں۔
- `/odom` topic پر شائع کریں۔
- `odom → base_link` transform کو براڈکاسٹ کریں۔

---

## آپ نے کیا سیکھا

✅ ROS 2 Python packages بنانا
✅ Xacro کے ساتھ URDF لکھنا
✅ velocity commands شائع کرنا
✅ launch files بنانا
✅ robot_state_publisher کا استعمال کرنا

---

## اگلا ماڈیول

آپ کا روبوٹ موجود ہے، لیکن صرف آپ کے تصور میں (اور شاید RViz میں)۔ اب وقت ہے اسے ایک **simulated world** میں رکھنے کا جہاں فزکس واقعی اہمیت رکھتی ہے۔

**→ [Module 2: The Digital Twin (Simulation)](/docs/module-2-simulation)**