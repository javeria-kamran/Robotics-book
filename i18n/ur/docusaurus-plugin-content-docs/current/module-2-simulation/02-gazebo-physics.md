---
description: Gazebo میں فزکس، گریویٹی، اور ٹکراؤ کو سمیولیٹ کرنا سیکھیں۔ ایسی دنیا
  بنائیں جہاں آپ کا روبوٹ محفوظ طریقے سے ناکام ہو سکے۔
id: simulation-gazebo-physics
keywords:
- Gazebo
- physics simulation
- SDF
- robot simulation
- collisions
- ROS 2
module: 2
sidebar_position: 2
tags:
- module-2
- hands-on
- intermediate
title: Gazebo کے ساتھ Physics Simulation
---

# Gazebo کے ساتھ فزکس سمولیشن

> **TL;DR:** Gazebo ایک اوپن سورس روبوٹ سمیلیٹر ہے جس میں فزکس، سینسرز اور ROS 2 انٹیگریشن شامل ہے۔ یہ سیکشن آپ کو دنیا بنانے، روبوٹس کو اسپان کرنے، اور فزکس کے قوانین کو سمولیٹ کرنے کا طریقہ سکھاتا ہے جو آپ کے روبوٹ کو گرنے کا سبب بنتے ہیں۔

---

## Gazebo سے ملیں (نیا والا)

Gazebo کو دوبارہ لکھا گیا ہے۔ نیا ورژن (پہلے "Ignition Gazebo" کہلاتا تھا، اب صرف "Gazebo") ہے:

- **Modular** — صرف وہی استعمال کریں جس کی آپ کو ضرورت ہے
- **Modern** — C++17 میں لکھا گیا، بہتر آرکیٹیکچر
- **ROS 2 native** — مزید Bridges اور Hacks نہیں

### ورژن کی الجھن (ایک شکوہ)

| نام | حیثیت | نوٹس |
|------|--------|-------|
| Gazebo Classic (1-11) | Legacy | پرانا والا۔ اب بھی وسیع پیمانے پر استعمال ہوتا ہے۔ |
| Ignition Gazebo | Renamed | نیا والا تھا۔ اب صرف "Gazebo" ہے۔ |
| Gazebo Harmonic | Current | تازہ ترین LTS (2024+) |
| Gazebo Fortress | LTS | ROS 2 Humble کے ساتھ جوڑا بناتا ہے |

اگر آپ ROS 2 Humble پر ہیں تو **Gazebo Fortress استعمال کریں**۔ نام الجھن کا شکار ہے، لیکن سافٹ ویئر ٹھوس ہے۔

---

## SDF: ورلڈ ڈسکرپشن فارمیٹ

جبکہ URDF روبوٹس کو بیان کرتا ہے، **SDF** (Simulation Description Format) پورے سمولیشن ورلڈز کو بیان کرتا ہے۔

SDF تعریف کر سکتا ہے:
- روبوٹس (URDF سے زیادہ خصوصیات کے ساتھ)
- Static objects (عمارتیں، علاقہ)
- Lights اور atmosphere
- Physics parameters
- Plugins اور sensors

### بنیادی SDF ڈھانچہ

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

## روبوٹ کے لیے دوستانہ دنیا بنانا

آئیے ایک ایسی دنیا بنائیں جس میں یہ شامل ہوں:
- Ground plane
- Walls (رکاوٹیں)
- Ramps (چڑھنے کی جانچ کے لیے)
- Objects جن کے ساتھ تعامل کیا جا سکے

### `robot_world.sdf` کے طور پر محفوظ کریں:

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

### اسے چلائیں

```bash
gz sim robot_world.sdf
```

---

## اپنے روبوٹ کو اسپان کرنا

آپ اپنے SDF ورلڈ میں ایک URDF روبوٹ شامل کر سکتے ہیں، لیکن Gazebo SDF ماڈلز کو ترجیح دیتا ہے۔ یہ ہے Bridge:

### آپشن 1: URDF کو SDF میں تبدیل کریں

```bash
# Converts URDF to SDF
gz sdf -p my_robot.urdf > my_robot.sdf
```

### آپشن 2: ros_gz_sim استعمال کریں

`ros_gz_sim` پیکیج روبوٹس کو اسپان کرنے کے لیے ROS 2 Nodes فراہم کرتا ہے:

```bash
# Spawn a robot from a URDF file
ros2 run ros_gz_sim create \
  -name my_robot \
  -file /path/to/my_robot.urdf \
  -x 0 -y 0 -z 0.5
```

### آپشن 3: لانچ فائل انٹیگریشن

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

## فزکس پیرامیٹرز کو سمجھنا

### ٹائم اسٹیپ

```xml
<max_step_size>0.001</max_step_size>  <!-- 1ms steps -->
```

- چھوٹا = زیادہ درست، سست
- بڑا = تیز، کم درست
- ڈیفالٹ (0.001) عام طور پر اچھا ہوتا ہے

### ریئل ٹائم فیکٹر

```xml
<real_time_factor>1.0</real_time_factor>
```

- 1.0 = ریئل ٹائم
- 2.0 = 2x رفتار
- 0.5 = آدھی رفتار (ڈیبگنگ کے لیے)

### سالور ایٹریشنز

```xml
<ode>
  <solver>
    <iters>50</iters>  <!-- More iterations = more accurate -->
  </solver>
</ode>
```

---

## ROS 2 انٹیگریشن

### Bridges

`ros_gz_bridge` ROS 2 اور Gazebo کے درمیان پیغامات کو آگے بڑھاتا ہے:

```bash
ros2 run ros_gz_bridge parameter_bridge \
  /cmd_vel@geometry_msgs/msg/Twist@gz.msgs.Twist \
  /scan@sensor_msgs/msg/LaserScan@gz.msgs.LaserScan
```

### لانچ فائل Bridge

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

## اپنے روبوٹ کو کنٹرول کرنا

اپنے روبوٹ میں ایک differential drive plugin شامل کریں:

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

اب آپ کا Module 1 سے teleop سمولیشن میں کام کرے گا!

---

## عام مسائل

| مسئلہ | وجہ | حل |
|-------|-------|----------|
| روبوٹ فرش سے گر جاتا ہے | Collision کی تعریف نہیں کی گئی | تمام Links میں `<collision>` شامل کریں |
| روبوٹ اسپان ہونے پر پھٹ جاتا ہے | Inertia بہت کم ہے | Inertia کی قدریں بڑھائیں |
| روبوٹ حرکت نہیں کرتا | Plugin لوڈ نہیں ہوا | Plugin filename اور parameters چیک کریں |
| سمولیشن سست ہے | بہت زیادہ Objects/Sensors | پیچیدگی کم کریں، step size بڑھائیں |
| فزکس غلط لگتی ہے | غلط friction/mass | Surface parameters کو ٹیون کریں |

---

## کارکردگی کے نکات

1.  **سادہ collision shapes استعمال کریں** — Mesh collisions کے بجائے Boxes
2.  **Sensor frequencies کم کریں** — 10 Hz اکثر کافی ہوتا ہے
3.  اگر آپ کو Shadows کی ضرورت نہیں ہے تو **انہیں غیر فعال کریں**
4.  ٹریننگ کے لیے **headless mode استعمال کریں**: `gz sim -s world.sdf`

---

## خلاصہ

-   **SDF** سمولیشن ورلڈز (ground، objects، physics) کو بیان کرتا ہے
-   **Gazebo** فزکس انجن اور رینڈرنگ فراہم کرتا ہے
-   **ros_gz packages** ROS 2 اور Gazebo کے درمیان Bridge کا کام کرتے ہیں
-   درستگی بمقابلہ رفتار کے لیے **physics parameters** کو ٹیون کریں
-   ہمیشہ **collision اور inertia** کی خصوصیات کی تصدیق کریں

---

## اگلا کیا ہے

Gazebo فزکس کے لیے بہترین ہے، لیکن اگر آپ photorealistic گرافکس چاہتے ہیں تو کیا ہوگا؟ Unity روبوٹکس سمولیشن میں گیم انجن کی کوالٹی لاتا ہے۔

**→ [Unity کے ساتھ ہائی فائیڈیلٹی سمولیشن](/docs/module-2-simulation/03-unity-rendering)**