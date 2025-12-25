---
id: simulation-sensors
title: "Simulating Sensors"
description: "Learn to simulate LiDAR, depth cameras, and IMUs. Understand sensor noise models and how to make fake sensors behave like real ones."
sidebar_position: 4
module: 2
keywords: [LiDAR simulation, depth camera, IMU, sensor noise, Gazebo sensors, robotics sensors]
tags: [module-2, hands-on, intermediate]
---

# Simulating Sensors

> **TL;DR:** Fake sensors need to lie like real sensors. This section covers how to simulate LiDAR, cameras, depth sensors, and IMUs—including the noise that makes them annoyingly realistic.

---

## Why Sensor Simulation Matters

Your robot's intelligence depends entirely on what it perceives. In simulation, sensors are your robot's eyes, ears, and sense of balance.

**The goal:** Make simulated sensors close enough to reality that algorithms trained in sim transfer to real hardware.

---

## LiDAR (Light Detection and Ranging)

LiDAR shoots laser beams and measures how long they take to return. It gives you distance measurements in a 2D or 3D pattern.

### 2D LiDAR in Gazebo

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

### Key Parameters

| Parameter | Real-World Example | Simulation Value |
|-----------|-------------------|------------------|
| Samples | RPLIDAR A1: 360 | 360-720 |
| Update Rate | 5-40 Hz | 10-30 Hz |
| Range | 0.15-12m (indoor) | 0.1-30m |
| Noise stddev | 0.5-2% of distance | 0.01-0.05m |

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

## Cameras

### RGB Camera

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

### Depth Camera (RGB-D)

Simulates sensors like Intel RealSense or Azure Kinect:

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

### Camera Noise Reality Check

Real cameras have:
- **Gaussian noise** — Random pixel variations
- **Motion blur** — When camera moves fast
- **Rolling shutter** — Top/bottom of image at different times
- **Lens distortion** — Barrel/pincushion effects
- **Vignetting** — Darker corners

Basic simulations usually only model Gaussian noise. For AI training, consider:
- Adding lens distortion post-process
- Randomly varying exposure/brightness
- Simulating motion blur for moving robots

---

## IMU (Inertial Measurement Unit)

IMUs measure:
- **Accelerometer** — Linear acceleration (m/s²)
- **Gyroscope** — Angular velocity (rad/s)
- **Magnetometer** — Magnetic field (for heading)

### Gazebo IMU Sensor

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

### IMU Noise Model

Real IMUs have:

| Noise Type | Description | Impact |
|------------|-------------|--------|
| **White noise** | Random fluctuations | Jittery readings |
| **Bias** | Constant offset | Drift over time |
| **Bias instability** | Slowly changing bias | Long-term errors |
| **Scale factor** | Gain error | Incorrect magnitude |

For navigation, **bias** is the killer. It causes position estimates to drift unboundedly.

---

## GPS/GNSS

For outdoor robots:

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

## Contact/Force Sensors

For manipulation:

```xml
<sensor name="contact" type="contact">
  <always_on>true</always_on>
  <update_rate>100</update_rate>
  <contact>
    <collision>gripper_finger_collision</collision>
    <topic>contact</topic>
  </contact>
</sensor>
```

---

## Domain Randomization for Sensors

To bridge sim-to-real, randomize sensor parameters during training:

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
# If your model works across all variations, it should work in reality
```

---

## Sensor Fusion in Simulation

Just like real robots, simulated robots often combine sensors:

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

The simulation should match real-world sensor rates and synchronization issues.

---

## Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| No sensor noise | Algorithm fails on real robot | Always add realistic noise |
| Perfect time sync | Real sensors have delays | Add latency to simulated sensors |
| Too high resolution | Doesn't match real sensor | Match real sensor specs |
| Missing dropouts | Real sensors have missing data | Randomly drop readings |
| Ignoring update rates | Real sensors have limits | Match real sensor rates |

---

## Summary

- **LiDAR**: Distance measurements with range, resolution, and Gaussian noise
- **Cameras**: RGB/depth with intrinsics, noise, and potential distortion
- **IMU**: Accelerometer and gyroscope with bias and noise
- **GPS**: Position with significant uncertainty
- **Domain randomization**: Vary parameters to improve sim-to-real transfer

---

## Next Up

Time for the Module 2 capstone! You'll build a complete simulation environment with multiple sensors and test your robot's ability to navigate and perceive.

**→ [Module 2 Capstone](/docs/module-2-simulation/05-capstone)**
