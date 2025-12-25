---
id: isaac-ros
title: "Isaac ROS: GPU-Accelerated Perception"
description: "Master Isaac ROS for GPU-accelerated robot perception. Learn Visual SLAM, NVBlox mapping, and hardware-accelerated inference."
sidebar_position: 3
module: 3
keywords: [Isaac ROS, VSLAM, Visual SLAM, GPU acceleration, NITROS, NVBlox, Jetson]
tags: [module-3, hands-on, advanced]
---

# Isaac ROS: GPU-Accelerated Perception

> **TL;DR:** Isaac ROS is a collection of GPU-accelerated ROS 2 packages. It makes your robot see, map, and understand the world faster than traditional CPU methods—essential for real-time humanoid navigation.

---

## What is Isaac ROS?

Isaac ROS provides drop-in replacements for common perception packages:

| Isaac ROS Package | Replaces | Speedup |
|-------------------|----------|---------|
| `isaac_ros_visual_slam` | ORB-SLAM, RTAB-Map | 5-10x |
| `isaac_ros_nvblox` | OctoMap, Voxblox | 10x+ |
| `isaac_ros_apriltag` | AprilTag3 | 3-5x |
| `isaac_ros_dnn_inference` | OpenCV DNN | 3-10x |
| `isaac_ros_stereo_image_proc` | stereo_image_proc | 5x |
| `isaac_ros_image_pipeline` | image_pipeline | 3-5x |

---

## NITROS: The Secret Sauce

**NITROS** (NVIDIA Isaac Transport for ROS) eliminates memory copies:

```
Traditional ROS 2:
┌────────┐   Copy   ┌────────┐   Copy   ┌────────┐
│ Camera │ ──────▶ │  GPU   │ ──────▶ │  SLAM  │
│ Driver │   to    │ Decode │   to    │ Node   │
└────────┘   GPU    └────────┘   CPU    └────────┘

NITROS:
┌────────┐        ┌────────┐        ┌────────┐
│ Camera │ ─────▶ │  GPU   │ ─────▶ │  SLAM  │
│ Driver │        │ Decode │        │ Node   │
└────────┘        └────────┘        └────────┘
                  Data stays on GPU!
```

When all nodes in a pipeline use NITROS, data **never leaves the GPU**.

---

## Installation

### Development Container (Recommended)

```bash
# Clone Isaac ROS Common
cd ~/ros2_ws/src
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_common.git

# Run the development container
cd ~/ros2_ws/src/isaac_ros_common
./scripts/run_dev.sh

# Inside container: clone packages you need
cd /workspaces/isaac_ros-dev/src
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_visual_slam.git
git clone https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_nvblox.git

# Build
cd /workspaces/isaac_ros-dev
colcon build --symlink-install
source install/setup.bash
```

### Native Installation

Requires specific CUDA and TensorRT versions. Check the [compatibility matrix](https://nvidia-isaac-ros.github.io/getting_started/index.html).

---

## Visual SLAM (cuVSLAM)

Visual SLAM estimates robot pose using camera images. Isaac ROS uses **cuVSLAM**, a GPU-accelerated implementation.

### Features

- Stereo or RGB-D cameras
- Loop closure
- Relocalization
- IMU fusion
- 60+ FPS on Jetson

### Launch

```bash
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py
```

### Configuration

```yaml
# config/visual_slam.yaml
visual_slam_node:
  ros__parameters:
    enable_localization_n_mapping: true
    enable_imu_fusion: true
    gyro_noise_density: 0.00016
    gyro_random_walk: 0.000022
    accel_noise_density: 0.0017
    accel_random_walk: 0.00012
    calibration_frequency: 200.0
    img_jitter_threshold_ms: 22.0
```

### Example: SLAM with RealSense

```bash
# Terminal 1: Launch RealSense camera
ros2 launch realsense2_camera rs_launch.py \
    depth_module.profile:=640x480x30 \
    enable_gyro:=true \
    enable_accel:=true \
    unite_imu_method:=2

# Terminal 2: Launch Visual SLAM
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam_realsense.launch.py

# Terminal 3: Visualize in RViz
ros2 run rviz2 rviz2 -d $(ros2 pkg prefix isaac_ros_visual_slam)/share/isaac_ros_visual_slam/rviz/default.rviz
```

---

## NVBlox: 3D Reconstruction

NVBlox creates dense 3D maps using depth cameras or LiDAR.

### Features

- Real-time TSDF reconstruction
- Mesh generation
- Costmap generation (for Nav2)
- Dynamic obstacle detection
- Runs on GPU

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Depth     │     │   NVBlox    │     │   Output    │
│   Camera    │────▶│   Node      │────▶│   - Mesh    │
│   + Pose    │     │   (GPU)     │     │   - Costmap │
└─────────────┘     └─────────────┘     │   - ESDF    │
                                         └─────────────┘
```

### Launch with Nav2

```bash
ros2 launch nvblox_examples_bringup isaac_sim_example.launch.py
```

### Configuration

```yaml
# config/nvblox.yaml
nvblox_node:
  ros__parameters:
    voxel_size: 0.05
    esdf_update_rate_hz: 10.0
    mesh_update_rate_hz: 5.0
    global_frame: "odom"
    
    # Human/dynamic obstacle detection
    use_people_detection: true
    people_detection_topic: "/detectnet/detections"
```

---

## Object Detection (DNN Inference)

Isaac ROS provides TensorRT-accelerated inference:

### DetectNet (Object Detection)

```bash
# Launch with pre-trained model
ros2 launch isaac_ros_detectnet isaac_ros_detectnet_quickstart.launch.py
```

### SegFormer (Semantic Segmentation)

```python
# Python launch
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    return LaunchDescription([
        ComposableNodeContainer(
            name='segformer_container',
            namespace='',
            package='rclcpp_components',
            executable='component_container_mt',
            composable_node_descriptions=[
                ComposableNode(
                    package='isaac_ros_segformer',
                    plugin='nvidia::isaac_ros::dnn_inference::SegformerDecoderNode',
                    name='segformer_decoder',
                    parameters=[{
                        'model_file_path': '/path/to/model.plan',
                        'input_binding_names': ['input'],
                        'output_binding_names': ['output'],
                    }],
                ),
            ],
        ),
    ])
```

---

## AprilTag Detection

GPU-accelerated fiducial marker detection:

```bash
ros2 launch isaac_ros_apriltag isaac_ros_apriltag.launch.py
```

### Performance

| Platform | CPU AprilTag | Isaac ROS AprilTag |
|----------|-------------|-------------------|
| Jetson Orin | 15 FPS | 60+ FPS |
| Desktop RTX 3080 | 30 FPS | 100+ FPS |

---

## Creating a Perception Pipeline

Combine multiple Isaac ROS packages:

```python
from launch import LaunchDescription
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    container = ComposableNodeContainer(
        name='perception_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            # Image rectification
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::RectifyNode',
                name='rectify',
                remappings=[
                    ('image_raw', '/camera/image_raw'),
                    ('camera_info', '/camera/camera_info'),
                ],
            ),
            # Visual SLAM
            ComposableNode(
                package='isaac_ros_visual_slam',
                plugin='nvidia::isaac_ros::visual_slam::VisualSlamNode',
                name='visual_slam',
            ),
            # Object detection
            ComposableNode(
                package='isaac_ros_detectnet',
                plugin='nvidia::isaac_ros::detectnet::DetectNetDecoderNode',
                name='detectnet',
            ),
        ],
    )
    
    return LaunchDescription([container])
```

---

## Jetson Deployment

Isaac ROS is optimized for NVIDIA Jetson:

| Jetson | Performance |
|--------|-------------|
| Jetson Nano | Limited (some packages) |
| Jetson Xavier NX | Good |
| Jetson AGX Orin | Excellent |
| Jetson Orin Nano | Good |

### Flash Jetson with Isaac ROS

1. Use NVIDIA SDK Manager
2. Install JetPack 5.1+
3. Install ROS 2 Humble
4. Clone and build Isaac ROS packages

---

## Benchmarks

### Visual SLAM Performance

| Platform | ORB-SLAM3 | cuVSLAM |
|----------|-----------|---------|
| Intel i7 | 30 FPS | N/A (CPU) |
| Jetson Xavier | 8 FPS | 45 FPS |
| Jetson Orin | 15 FPS | 90 FPS |
| RTX 3080 | N/A | 120+ FPS |

### NVBlox Performance

| Platform | OctoMap | NVBlox |
|----------|---------|--------|
| Intel i7 | 5 Hz | N/A |
| Jetson Orin | 1 Hz | 20 Hz |
| RTX 3080 | N/A | 50+ Hz |

---

## Common Issues

| Issue | Solution |
|-------|----------|
| CUDA out of memory | Reduce resolution, batch size |
| NITROS type error | Ensure all connected nodes support NITROS |
| Slow first frame | TensorRT engine compilation (normal) |
| Missing camera intrinsics | Publish proper `camera_info` |
| Container GPU access | Add `--gpus all` to Docker |

---

## Summary

- **Isaac ROS** provides GPU-accelerated perception
- **NITROS** eliminates CPU-GPU memory copies
- **cuVSLAM** offers 5-10x faster visual SLAM
- **NVBlox** creates real-time 3D maps
- Optimized for **Jetson** edge deployment

---

## Next Up

Now that your robot can see and map, let's make it walk! Nav2 brings path planning for bipedal humanoids.

**→ [Nav2 for Humanoid Navigation](/docs/module-3-isaac/04-nav2-humanoid)**
