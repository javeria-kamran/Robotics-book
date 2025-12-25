---
description: LiDAR، depth cameras، اور IMUs کو simulate کرنا سیکھیں۔ sensor noise
  models کو سمجھیں اور یہ کہ کس طرح fake sensors کو real ones کی طرح برتاؤ کرایا جائے۔
id: simulation-sensors
keywords:
- LiDAR simulation
- depth camera
- IMU
- sensor noise
- Gazebo sensors
- robotics sensors
module: 2
sidebar_position: 4
tags:
- module-2
- hands-on
- intermediate
title: Sensors کی تخروپ کاری
---

# سینسرز کی نقل (Simulating Sensors)

> **TL;DR:** نقلی سینسرز کو حقیقی سینسرز کی طرح جھوٹ بولنا چاہیے۔ یہ سیکشن LiDAR، کیمروں، ڈیپتھ سینسرز، اور IMUs کی نقل کرنے کا طریقہ بتاتا ہے — بشمول وہ شور جو انہیں پریشان کن حد تک حقیقت پسندانہ بناتا ہے۔

---

## سینسر سمولیشن کیوں ضروری ہے؟

آپ کے روبوٹ کی ذہانت کا انحصار مکمل طور پر اس بات پر ہے کہ وہ کیا محسوس کرتا ہے۔ سمولیشن میں، سینسرز آپ کے روبوٹ کی آنکھیں، کان اور توازن کا احساس ہوتے ہیں۔

**مقصد:** نقلی سینسرز کو حقیقت کے اتنا قریب بنانا کہ سم میں تربیت یافتہ الگورتھم حقیقی ہارڈویئر پر منتقل ہو سکیں۔

---

## LiDAR (Light Detection and Ranging)

LiDAR لیزر شعاعیں خارج کرتا ہے اور یہ پیمائش کرتا ہے کہ انہیں واپس آنے میں کتنا وقت لگتا ہے۔ یہ آپ کو 2D یا 3D پیٹرن میں فاصلے کی پیمائش فراہم کرتا ہے۔

### Gazebo میں 2D LiDAR

```xml
<!-- Add to your robot model's SDF or URDF -->
<sensor name="lidar" type="ray">
  <always_on>true</always_on>
  <update_rate>10</update_rate>
  <visualize>true</visualize>
  <ray>
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
      <max>30.0</max>
      <resolution>0.01</resolution>
    </range>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.01</stddev>
    </noise>
  </ray>
  <plugin filename="libgz-sim-sensors-system.so" name="gz::sim::systems::Sensors">
    <render_engine>ogre2</render_engine>
  </plugin>
  <topic>scan</topic>
</sensor>
```

### اہم پیرامیٹرز

| پیرامیٹر | حقیقی دنیا کی مثال | سمولیشن ویلیو |
|-----------|-------------------|------------------|
| Samples | RPLIDAR A1: 360 | 360-720 |
| Update Rate | 5-40 Hz | 10-30 Hz |
| Range | 0.15-12m (انڈور) | 0.1-30m |
| Noise stddev | فاصلے کا 0.5-2% | 0.01-0.05m |

### 3D LiDAR (Velodyne-style)

```xml
<sensor name="lidar_3d" type="gpu_lidar">
  <update_rate>10</update_rate>
  <lidar>
    <scan>
      <horizontal>
        <samples>1800</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
      <vertical>
        <samples>16</samples>
        <resolution>1</resolution>
        <min_angle>-0.26</min_angle>
        <max_angle>0.26</max_angle>
      </vertical>
    </scan>
    <range>
      <min>0.5</min>
      <max>100.0</max>
    </range>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.02</stddev>
    </noise>
  </lidar>
  <topic>points</topic>
</sensor>
```

---

## کیمرے (Cameras)

### RGB کیمرہ

```xml
<sensor name="camera" type="camera">
  <always_on>true</always_on>
  <update_rate>30</update_rate>
  <camera name="robot_camera">
    <horizontal_fov>1.047</horizontal_fov>  <!-- ~60 degrees -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>R8G8B8</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>100</far>
    </clip>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.007</stddev>
    </noise>
    <lens>
      <intrinsics>
        <fx>554.25</fx>
        <fy>554.25</fy>
        <cx>320.5</cx>
        <cy>240.5</cy>
        <s>0</s>
      </intrinsics>
    </lens>
  </camera>
  <topic>camera/image_raw</topic>
</sensor>
```

### ڈیپتھ کیمرہ (RGB-D)

Intel RealSense یا Azure Kinect جیسے سینسرز کی نقل کرتا ہے:

```xml
<sensor name="depth_camera" type="depth_camera">
  <update_rate>30</update_rate>
  <camera name="depth">
    <horizontal_fov>1.22</horizontal_fov>  <!-- ~70 degrees -->
    <image>
      <width>640</width>
      <height>480</height>
      <format>R_FLOAT32</format>
    </image>
    <clip>
      <near>0.1</near>
      <far>10.0</far>
    </clip>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.005</stddev>
    </noise>
  </camera>
  <topic>depth/image_raw</topic>
</sensor>
```

### کیمرہ نائز رئیلٹی چیک (Camera Noise Reality Check)

حقیقی کیمروں میں یہ خصوصیات ہوتی ہیں:
- **Gaussian noise** — بے ترتیب پکسل کی تبدیلیاں
- **Motion blur** — جب کیمرہ تیزی سے حرکت کرتا ہے
- **Rolling shutter** — تصویر کا اوپری/نچلا حصہ مختلف اوقات میں
- **Lens distortion** — Barrel/pincushion اثرات
- **Vignetting** — گہرے کونے

بنیادی سمولیشنز عام طور پر صرف Gaussian noise کو ماڈل کرتی ہیں۔ AI ٹریننگ کے لیے، درج ذیل پر غور کریں:
- پوسٹ پروسیس میں Lens distortion شامل کرنا
- بے ترتیب طور پر exposure/brightness کو تبدیل کرنا
- حرکت پذیر روبوٹس کے لیے Motion blur کی نقل کرنا

---

## IMU (Inertial Measurement Unit)

IMUs پیمائش کرتے ہیں:
- **Accelerometer** — لکیری ایکسیلریشن (m/s²)
- **Gyroscope** — اینگولر ویلوسٹی (rad/s)
- **Magnetometer** — مقناطیسی میدان (سمت کے لیے)

### Gazebo IMU سینسر

```xml
<sensor name="imu" type="imu">
  <always_on>true</always_on>
  <update_rate>100</update_rate>
  <imu>
    <angular_velocity>
      <x>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.0002</stddev>
          <bias_mean>0.0000075</bias_mean>
          <bias_stddev>0.0000008</bias_stddev>
        </noise>
      </x>
      <!-- Repeat for y and z -->
    </angular_velocity>
    <linear_acceleration>
      <x>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.017</stddev>
          <bias_mean>0.1</bias_mean>
          <bias_stddev>0.001</bias_stddev>
        </noise>
      </x>
      <!-- Repeat for y and z -->
    </linear_acceleration>
  </imu>
  <topic>imu</topic>
</sensor>
```

### IMU نائز ماڈل (IMU Noise Model)

حقیقی IMUs میں یہ خصوصیات ہوتی ہیں:

| نائز کی قسم | تفصیل | اثر |
|------------|-------------|--------|
| **White noise** | بے ترتیب اتار چڑھاؤ | جھٹکے دار ریڈنگز |
| **Bias** | مستقل آفسیٹ | وقت کے ساتھ بہاؤ |
| **Bias instability** | آہستہ آہستہ تبدیل ہونے والا Bias | طویل مدتی غلطیاں |
| **Scale factor** | گین کی غلطی | غلط مقدار |

نیویگیشن کے لیے، **bias** سب سے زیادہ نقصان دہ ہے۔ یہ پوزیشن کے تخمینوں کو بے حد بہاؤ کا سبب بنتا ہے۔

---

## GPS/GNSS

بیرونی روبوٹس کے لیے:

```xml
<sensor name="gps" type="gps">
  <always_on>true</always_on>
  <update_rate>10</update_rate>
  <gps>
    <position_sensing>
      <horizontal>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>2.0</stddev>  <!-- ~2m accuracy -->
        </noise>
      </horizontal>
      <vertical>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>4.0</stddev>  <!-- Worse vertically -->
        </noise>
      </vertical>
    </position_sensing>
    <velocity_sensing>
      <horizontal>
        <noise type="gaussian">
          <mean>0</mean>
          <stddev>0.1</stddev>
        </noise>
      </horizontal>
    </velocity_sensing>
  </gps>
  <topic>gps</topic>
</sensor>
```

---

## سینسرز کے لیے ڈومین رینڈمائزیشن (Domain Randomization)

سم-ٹو-ریل کو جوڑنے کے لیے، ٹریننگ کے دوران سینسر پیرامیٹرز کو بے ترتیب کریں:

```python
# Example: Randomizing camera parameters for training
import random

def randomize_camera():
    """Randomize camera parameters for domain randomization."""
    params = {
        'brightness': random.uniform(0.8, 1.2),
        'contrast': random.uniform(0.9, 1.1),
        'saturation': random.uniform(0.9, 1.1),
        'noise_stddev': random.uniform(0.005, 0.02),
        'blur_kernel': random.choice([0, 3, 5]),  # 0 = no blur
    }
    return params

# Apply these variations each episode
# اگر آپ کا ماڈل تمام تغیرات پر کام کرتا ہے، تو اسے حقیقت میں بھی کام کرنا چاہیے۔
```

---

## سمولیشن میں سینسر فیوژن (Sensor Fusion)

حقیقی روبوٹس کی طرح، نقلی روبوٹس بھی اکثر سینسرز کو یکجا کرتے ہیں:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Camera    │     │    LiDAR    │     │     IMU     │
│  (30 Hz)    │     │  (10 Hz)    │     │  (100 Hz)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Sensor    │
                    │   Fusion    │
                    │ (EKF/UKF)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Robot     │
                    │   State     │
                    └─────────────┘
```

سمولیشن کو حقیقی دنیا کے سینسر ریٹس اور ہم آہنگی کے مسائل سے مماثل ہونا چاہیے۔

---

## عام غلطیاں

| غلطی | مسئلہ | حل |
|---------|---------|----------|
| سینسر نائز نہیں | الگورتھم حقیقی روبوٹ پر ناکام ہو جاتا ہے | ہمیشہ حقیقت پسندانہ نائز شامل کریں |
| کامل ٹائم سنک | حقیقی سینسرز میں تاخیر ہوتی ہے | نقلی سینسرز میں لیٹنسی شامل کریں |
| بہت زیادہ ریزولوشن | حقیقی سینسر سے مماثل نہیں | حقیقی سینسر کی تفصیلات سے مماثل کریں |
| گمشدہ ڈراپ آؤٹس | حقیقی سینسرز میں ڈیٹا غائب ہوتا ہے | بے ترتیب طور پر ریڈنگز کو ڈراپ کریں |
| اپ ڈیٹ ریٹس کو نظر انداز کرنا | حقیقی سینسرز کی حدود ہوتی ہیں | حقیقی سینسر ریٹس سے مماثل کریں |

---

## خلاصہ

-   **LiDAR**: رینج، ریزولوشن، اور Gaussian noise کے ساتھ فاصلے کی پیمائش
-   **Cameras**: intrinsics، noise، اور ممکنہ distortion کے ساتھ RGB/depth
-   **IMU**: bias اور noise کے ساتھ Accelerometer اور Gyroscope
-   **GPS**: نمایاں غیر یقینی صورتحال کے ساتھ پوزیشن
-   **Domain randomization**: سم-ٹو-ریل منتقلی کو بہتر بنانے کے لیے پیرامیٹرز کو تبدیل کریں

---

## اگلا مرحلہ

ماڈیول 2 کیپ اسٹون کا وقت! آپ متعدد سینسرز کے ساتھ ایک مکمل سمولیشن ماحول بنائیں گے اور اپنے روبوٹ کی نیویگیٹ کرنے اور سمجھنے کی صلاحیت کی جانچ کریں گے۔

**→ [Module 2 Capstone](/docs/module-2-simulation/05-capstone)**