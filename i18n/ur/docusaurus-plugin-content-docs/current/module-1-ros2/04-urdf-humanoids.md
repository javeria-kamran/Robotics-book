---
description: URDF (Unified Robot Description Format) کے ساتھ روبوٹ کی جیومیٹری کو
  بیان کرنا سیکھیں۔ بالکل شروع سے ایک ہیومنائیڈ روبوٹ ماڈل بنائیں۔
id: ros2-urdf-humanoids
keywords:
- URDF
- robot description
- joints
- links
- humanoid
- robot model
- Xacro
module: 1
sidebar_position: 4
tags:
- module-1
- hands-on
- intermediate
title: URDF برائے Humanoids
---

# ہیومنائیڈز کے لیے URDF

> **TL;DR:** URDF ایک XML ہے جو آپ کے روبوٹ کے جسم کو بیان کرتا ہے—یعنی اس کے Links (سخت حصے) اور Joints (حصوں کے درمیان کنکشنز)۔ یہ روبوٹس کے لیے ایک ڈیٹنگ پروفائل کی طرح ہے۔ "ایک اکیلا دو پاؤں والا ہیومنائیڈ، 6 DOF بازوؤں والا، ایک simulation environment کی تلاش میں ہے۔"

---

## URDF کیا ہے؟

**URDF** = Unified Robot Description Format

یہ ایک XML schema ہے جو بیان کرتا ہے:
- **Links** — سخت جسمانی حصے (دھڑ، سر، بازو کے حصے)
- **Joints** — Links کیسے جڑتے اور حرکت کرتے ہیں (revolute, prismatic, fixed)
- **Visual geometry** — روبوٹ کیسا دکھتا ہے (meshes, primitives)
- **Collision geometry** — جو physics engine استعمال کرتا ہے (عام طور پر سادہ)
- **Inertial properties** — Mass، مرکزِ ثقل (center of gravity)، اور inertia کے لمحات (moments of inertia)

### XML کیوں؟ (ہاں، واقعی)

"لیکن یہ 2024 ہے! XML کیوں؟"

کیونکہ:
1. یہ انسان کے پڑھنے کے قابل ہے (قابل بحث)
2. ہر robotics tool اسے سپورٹ کرتا ہے (Gazebo, RViz, MoveIt, Isaac)
3. اب سوئچ کرنے سے 15 سال کے ٹولز ٹوٹ جائیں گے
4. ہم سب بس مختلف طریقے سے گزارا کرتے ہیں

---

## بنیادی اجزاء

### Links

ایک **link** ایک سخت جسم ہے۔ اس میں ہوتا ہے:
- ایک نام
- بصری نمائندگی (جو آپ دیکھتے ہیں)
- تصادم کی نمائندگی (جو physics استعمال کرتا ہے)
- Inertial properties (mass, inertia)

```xml
<link name="torso">
  <!-- What you see in the viewer -->
  <visual>
    <geometry>
      <box size="0.4 0.3 0.6"/>
    </geometry>
    <material name="grey">
      <color rgba="0.5 0.5 0.5 1.0"/>
    </material>
  </visual>
  
  <!-- What the physics engine collides -->
  <collision>
    <geometry>
      <box size="0.4 0.3 0.6"/>
    </geometry>
  </collision>
  
  <!-- Physical properties -->
  <inertial>
    <mass value="15.0"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <inertia ixx="0.5" ixy="0" ixz="0" iyy="0.5" iyz="0" izz="0.3"/>
  </inertial>
</link>
```

### Joints

ایک **joint** دو Links کو جوڑتا ہے اور یہ بیان کرتا ہے کہ وہ ایک دوسرے کے نسبت کیسے حرکت کرتے ہیں۔

| Joint Type | Motion | Example |
|------------|--------|---------|
| `revolute` | Rotation with limits | Elbow, knee |
| `continuous` | Rotation, no limits | Wheel |
| `prismatic` | Linear slide | Lift actuator |
| `fixed` | No motion | Camera mount |

```xml
<joint name="shoulder_pitch" type="revolute">
  <parent link="torso"/>
  <child link="upper_arm"/>
  <origin xyz="0.2 0 0.25" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>  <!-- Rotate around Y axis -->
  <limit lower="-1.57" upper="1.57" effort="100" velocity="2.0"/>
</joint>
```

---

## ایک سادہ ہیومنائیڈ بنانا

آئیے ایک کم سے کم ہیومنائیڈ بنائیں: دھڑ، سر، اور ایک بازو۔

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  
  <!-- ========== BASE LINK ========== -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.3 0.1"/>
      </geometry>
      <material name="dark_grey">
        <color rgba="0.3 0.3 0.3 1.0"/>
      </material>
    </visual>
  </link>
  
  <!-- ========== TORSO ========== -->
  <link name="torso">
    <visual>
      <origin xyz="0 0 0.3" rpy="0 0 0"/>
      <geometry>
        <box size="0.35 0.25 0.5"/>
      </geometry>
      <material name="blue">
        <color rgba="0.2 0.4 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.3" rpy="0 0 0"/>
      <geometry>
        <box size="0.35 0.25 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="20.0"/>
      <origin xyz="0 0 0.3"/>
      <inertia ixx="1.0" ixy="0" ixz="0" iyy="1.0" iyz="0" izz="0.5"/>
    </inertial>
  </link>
  
  <joint name="base_to_torso" type="fixed">
    <parent link="base_link"/>
    <child link="torso"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
  </joint>
  
  <!-- ========== HEAD ========== -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
      <material name="silver">
        <color rgba="0.8 0.8 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.12"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="3.0"/>
      <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.02"/>
    </inertial>
  </link>
  
  <joint name="neck" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.65" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>  <!-- Rotate around Z (yaw) -->
    <limit lower="-1.0" upper="1.0" effort="20" velocity="1.0"/>
  </joint>
  
  <!-- ========== RIGHT ARM ========== -->
  
  <!-- Upper Arm -->
  <link name="right_upper_arm">
    <visual>
      <origin xyz="0 0 -0.15"/>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <inertial>
      <mass value="2.0"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.02" ixy="0" ixz="0" iyy="0.02" iyz="0" izz="0.005"/>
    </inertial>
  </link>
  
  <joint name="right_shoulder_pitch" type="revolute">
    <parent link="torso"/>
    <child link="right_upper_arm"/>
    <origin xyz="-0.2 0 0.5" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-2.0" upper="2.0" effort="50" velocity="2.0"/>
  </joint>
  
  <!-- Lower Arm -->
  <link name="right_lower_arm">
    <visual>
      <origin xyz="0 0 -0.125"/>
      <geometry>
        <cylinder radius="0.04" length="0.25"/>
      </geometry>
      <material name="silver"/>
    </visual>
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.125"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.003"/>
    </inertial>
  </link>
  
  <joint name="right_elbow" type="revolute">
    <parent link="right_upper_arm"/>
    <child link="right_lower_arm"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.5" effort="30" velocity="2.5"/>
  </joint>
  
  <!-- Hand (simplified) -->
  <link name="right_hand">
    <visual>
      <geometry>
        <box size="0.08 0.05 0.12"/>
      </geometry>
      <material name="dark_grey"/>
    </visual>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>
  
  <joint name="right_wrist" type="fixed">
    <parent link="right_lower_arm"/>
    <child link="right_hand"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
  </joint>
  
</robot>
```

---

## اپنے روبوٹ کو دیکھنا (Visualizing)

### RViz

```bash
# First, run the robot state publisher
ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:="$(cat simple_humanoid.urdf)"

# Then open RViz
ros2 run rviz2 rviz2
# Add RobotModel display, set Fixed Frame to "base_link"
```

### Joint State Publisher GUI

Joints کو interactively حرکت دیں:

```bash
ros2 run joint_state_publisher_gui joint_state_publisher_gui
```

---

## Xacro: کیونکہ Raw XML تکلیف دہ ہے

**Xacro** = XML Macros

یہ شامل کرتا ہے:
- Variables (properties)
- Macros (دوبارہ استعمال کے قابل حصے)
- Math expressions
- File includes

### Xacro سے پہلے (ایسا نہ کریں)

```xml
<!-- Copy-paste hell for left arm... -->
<link name="left_upper_arm"><!-- same as right but mirrored --></link>
<link name="left_lower_arm"><!-- same as right but mirrored --></link>
<!-- Repeat for every symmetric part -->
```

### Xacro کے بعد (بہت بہتر)

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid">
  
  <!-- Properties -->
  <xacro:property name="arm_radius" value="0.05"/>
  <xacro:property name="upper_arm_length" value="0.3"/>
  
  <!-- Macro for arm -->
  <xacro:macro name="arm" params="side reflect">
    <link name="${side}_upper_arm">
      <visual>
        <origin xyz="0 0 ${-upper_arm_length/2}"/>
        <geometry>
          <cylinder radius="${arm_radius}" length="${upper_arm_length}"/>
        </geometry>
      </visual>
    </link>
    
    <joint name="${side}_shoulder" type="revolute">
      <parent link="torso"/>
      <child link="${side}_upper_arm"/>
      <origin xyz="${reflect * 0.2} 0 0.5"/>
      <axis xyz="0 1 0"/>
      <limit lower="-2.0" upper="2.0" effort="50" velocity="2.0"/>
    </joint>
  </xacro:macro>
  
  <!-- Use the macro for both arms -->
  <xacro:arm side="right" reflect="-1"/>
  <xacro:arm side="left" reflect="1"/>
  
</robot>
```

### Xacro کو پروسیس کرنا

```bash
xacro humanoid.urdf.xacro > humanoid.urdf
```

---

## Inertia کا حساب کتاب

Inertia کو غلط سمجھنے کا مطلب ہے کہ آپ کا روبوٹ simulation میں بے قابو ہو جائے گا۔

### عام اشکال

**Box (a × b × c, mass m):**
```
Ixx = m/12 * (b² + c²)
Iyy = m/12 * (a² + c²)  
Izz = m/12 * (a² + b²)
```

**Cylinder (radius r, height h, mass m):**
```
Ixx = Iyy = m/12 * (3r² + h²)
Izz = m/2 * r²
```

**Sphere (radius r, mass m):**
```
Ixx = Iyy = Izz = 2/5 * m * r²
```

### Pro Tip: MeshLab استعمال کریں

پیچیدہ meshes کے لیے، اپنی STL فائل کو MeshLab میں import کریں:
`Filters → Quality Measure → Compute Geometric Measures`

یہ آپ کو volume، center of mass، اور inertia tensor دیتا ہے۔

---

## عام غلطیاں

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Inertia بہت کم | Robot sim میں پھٹ جاتا ہے | Inertia کی قدریں بڑھائیں |
| Collision غائب | اشیاء ایک دوسرے سے گزر جاتی ہیں | `<collision>` عناصر شامل کریں |
| Joint axis غلط | بازو ایک طرف مڑ جاتا ہے | `<axis>` کی سمت چیک کریں |
| Origin کی الجھن | حصے غلط جگہ پر | یاد رکھیں: origin parent کے نسبت ہوتا ہے |
| Units کا عدم مطابقت | بہت بڑا یا بہت چھوٹا روبوٹ | URDF میٹر اور کلوگرام استعمال کرتا ہے |

---

## مکمل ہیومنائیڈ کی مثال

ایک مکمل 28-DOF ہیومنائیڈ کے لیے، ان کو دیکھیں:
- [Robotis OP3](https://github.com/ROBOTIS-GIT/ROBOTIS-OP3)
- [Nao Robot URDF](https://github.com/ros-naoqi/nao_robot)
- [Boston Dynamics Spot (unofficial)](https://github.com/chvmp/spot_ros)

---

## خلاصہ

- URDF روبوٹ کی geometry کو XML میں بیان کرتا ہے
- **Links** بصری، collision، اور inertial properties کے ساتھ سخت اجسام ہوتے ہیں
- **Joints** یہ بیان کرتے ہیں کہ Links ایک دوسرے کے نسبت کیسے حرکت کرتے ہیں
- **Xacro** macros اور variables کے ساتھ URDF کو قابلِ انتظام بناتا ہے
- اپنی **inertia values کو درست رکھیں** ورنہ اپنے روبوٹ کو پھٹتے ہوئے دیکھیں

---

## اگلا قدم

Module 1 capstone کا وقت! آپ سب کچھ—nodes، topics، اور URDF—کو ملا کر ایک فعال روبوٹ سسٹم بنائیں گے۔

**→ [Module 1 Capstone Project](/docs/module-1-ros2/05-capstone)**