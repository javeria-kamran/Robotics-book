---
id: simulation-unity-rendering
title: "High-Fidelity Simulation with Unity"
description: "Use Unity game engine for robotics simulation. Learn to create photorealistic environments and connect to ROS 2."
sidebar_position: 3
module: 2
keywords: [Unity, robotics, simulation, ROS 2, photorealistic, game engine, ROS-TCP-Connector]
tags: [module-2, hands-on, intermediate]
---

# High-Fidelity Simulation with Unity

> **TL;DR:** Unity is a game engine that makes robots look gorgeous. Combined with ROS 2, it's perfect for perception testing, synthetic data generation, and demos that actually impress people.

---

## Why Unity for Robotics?

| Feature | Gazebo | Unity |
|---------|--------|-------|
| Physics | Good | Good (PhysX) |
| Graphics | Functional | Stunning |
| Asset Library | Limited | Massive |
| ROS Integration | Native | Via Package |
| Learning Curve | Moderate | Steeper |
| Cost | Free | Free (Personal) |

**Use Unity when:**
- You need photorealistic visuals
- Testing computer vision in diverse environments
- Generating synthetic training data
- Building demos for non-technical stakeholders
- Creating human-robot interaction scenarios

---

## Setting Up Unity for Robotics

### Step 1: Install Unity Hub

Download from [unity.com/download](https://unity.com/download).

### Step 2: Install Unity Editor

- Recommended: **Unity 2022.3 LTS**
- Include: Windows Build Support, Linux Build Support

### Step 3: Create a New Project

1. Open Unity Hub
2. Click "New Project"
3. Select "3D (URP)" template — Universal Render Pipeline for best quality/performance
4. Name it "RobotSimulation"

---

## Installing ROS 2 Integration

Unity connects to ROS 2 using the **Unity Robotics Hub** packages.

### Add Package Dependencies

In Unity, open `Window → Package Manager`:

1. Click `+` → "Add package from git URL"
2. Add these packages one by one:

```
https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector
```

```
https://github.com/Unity-Technologies/URDF-Importer.git?path=/com.unity.robotics.urdf-importer
```

### Start the ROS-TCP-Endpoint (ROS 2 Side)

```bash
# Install the ROS 2 package
cd ~/ros2_ws/src
git clone -b main https://github.com/Unity-Technologies/ROS-TCP-Endpoint.git
cd ~/ros2_ws
colcon build
source install/setup.bash

# Run the endpoint
ros2 run ros_tcp_endpoint default_server_endpoint --ros-args -p ROS_IP:=0.0.0.0
```

### Configure Unity

1. `Robotics → ROS Settings`
2. Set ROS IP Address: `127.0.0.1` (or your ROS machine IP)
3. Set Protocol: `ROS2`

---

## Importing Your Robot

Unity can import URDF files directly!

### Import URDF

1. `Assets → Import Robot from URDF`
2. Select your `.urdf` file
3. Configure import settings:
   - **Axis Type**: Y-Up (Unity) vs Z-Up (ROS)
   - **Mesh Decomposer**: VHACD for convex collisions

### Manual Fixes (Usually Needed)

- **Scale**: ROS uses meters, Unity defaults to meters, but double-check
- **Materials**: Assign proper materials for visual quality
- **Colliders**: May need manual adjustment for complex shapes

---

## Creating a Simulation Environment

### Quick Environment Setup

```csharp
// Create a simple room
// In Unity: GameObject → 3D Object → Plane (floor)
// GameObject → 3D Object → Cube (walls, scale as needed)
```

### Using Asset Store

Unity Asset Store has thousands of free and paid assets:

- **Warehouse environments**
- **Office spaces**
- **Outdoor terrains**
- **Furniture and objects**

Search for "interior" or "warehouse" for robot-relevant scenes.

### Pro Tip: Use ProBuilder

Unity's ProBuilder (free) lets you build environments quickly:

```
Window → Package Manager → Search "ProBuilder" → Install
Tools → ProBuilder → ProBuilder Window
```

---

## Publishing/Subscribing to ROS 2

### Create a Publisher (Unity → ROS 2)

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Geometry;

public class VelocityPublisher : MonoBehaviour
{
    private ROSConnection ros;
    private string topicName = "/unity/cmd_vel";
    
    public float publishRate = 10f;
    public float linearSpeed = 0.5f;
    public float angularSpeed = 1.0f;
    
    private float timeElapsed;
    
    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<TwistMsg>(topicName);
    }
    
    void Update()
    {
        timeElapsed += Time.deltaTime;
        
        if (timeElapsed >= 1f / publishRate)
        {
            TwistMsg msg = new TwistMsg();
            
            // Example: Use keyboard input
            msg.linear.x = Input.GetAxis("Vertical") * linearSpeed;
            msg.angular.z = -Input.GetAxis("Horizontal") * angularSpeed;
            
            ros.Publish(topicName, msg);
            timeElapsed = 0;
        }
    }
}
```

### Create a Subscriber (ROS 2 → Unity)

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class LaserScanVisualizer : MonoBehaviour
{
    private ROSConnection ros;
    private string topicName = "/scan";
    
    public GameObject pointPrefab;
    private GameObject[] points;
    
    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Subscribe<LaserScanMsg>(topicName, ScanCallback);
    }
    
    void ScanCallback(LaserScanMsg msg)
    {
        // Visualize laser scan points
        for (int i = 0; i < msg.ranges.Length; i++)
        {
            float angle = msg.angle_min + i * msg.angle_increment;
            float range = msg.ranges[i];
            
            if (!float.IsInfinity(range))
            {
                Vector3 point = new Vector3(
                    range * Mathf.Cos(angle),
                    0,
                    range * Mathf.Sin(angle)
                );
                
                // Update visualization
                // (Implementation depends on your visualization method)
            }
        }
    }
}
```

---

## Simulating Sensors

### Camera

Unity cameras are perfect for simulating robot cameras:

```csharp
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;

public class CameraPublisher : MonoBehaviour
{
    private ROSConnection ros;
    private Camera robotCamera;
    private RenderTexture renderTexture;
    private Texture2D texture2D;
    
    public string topicName = "/camera/image_raw";
    public int width = 640;
    public int height = 480;
    public float publishRate = 30f;
    
    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ImageMsg>(topicName);
        
        robotCamera = GetComponent<Camera>();
        renderTexture = new RenderTexture(width, height, 24);
        texture2D = new Texture2D(width, height, TextureFormat.RGB24, false);
        robotCamera.targetTexture = renderTexture;
        
        InvokeRepeating("PublishImage", 0, 1f / publishRate);
    }
    
    void PublishImage()
    {
        RenderTexture.active = renderTexture;
        texture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        texture2D.Apply();
        RenderTexture.active = null;
        
        byte[] imageData = texture2D.GetRawTextureData();
        
        ImageMsg msg = new ImageMsg();
        msg.header.stamp.sec = (int)Time.time;
        msg.height = (uint)height;
        msg.width = (uint)width;
        msg.encoding = "rgb8";
        msg.step = (uint)(width * 3);
        msg.data = imageData;
        
        ros.Publish(topicName, msg);
    }
}
```

### Depth Camera

Use Unity's depth buffer:

```csharp
// Attach a shader that outputs depth
// Then convert to ROS PointCloud2 or depth image
```

---

## Physics and Articulation Bodies

For complex robots, use Unity's **Articulation Bodies** (better for robotics than Rigidbodies):

1. Import robot via URDF Importer (uses Articulation Bodies by default)
2. Configure joint drives in the Inspector
3. Control via scripts:

```csharp
using UnityEngine;

public class JointController : MonoBehaviour
{
    public ArticulationBody joint;
    public float targetPosition = 0f;
    public float stiffness = 1000f;
    public float damping = 100f;
    
    void Start()
    {
        var drive = joint.xDrive;
        drive.stiffness = stiffness;
        drive.damping = damping;
        joint.xDrive = drive;
    }
    
    void Update()
    {
        var drive = joint.xDrive;
        drive.target = targetPosition * Mathf.Rad2Deg;
        joint.xDrive = drive;
    }
}
```

---

## Human-Robot Interaction

Unity excels at simulating humans:

- Use **Mixamo** for free animated human models
- **AI Navigation** for human pathfinding
- **Animation Rigging** for realistic movement

This is invaluable for testing robots that work around people.

---

## Performance Optimization

| Technique | Impact |
|-----------|--------|
| Use LOD Groups | Major performance boost for complex scenes |
| Bake lighting | Faster than real-time lighting |
| Reduce camera resolution | Less to render and transmit |
| Use object pooling | Avoid instantiation overhead |
| Profile early | `Window → Analysis → Profiler` |

---

## Unity vs. Gazebo: When to Use Which

| Scenario | Recommended |
|----------|-------------|
| Quick physics testing | Gazebo |
| ROS 2 native workflow | Gazebo |
| Perception development | Unity |
| Synthetic data generation | Unity |
| Human-robot interaction | Unity |
| Final demo/presentation | Unity |
| Reinforcement learning (basic) | Gazebo |
| Reinforcement learning (complex) | Isaac Sim (Module 3) |

---

## Summary

- Unity provides **photorealistic simulation** for robotics
- **ROS-TCP-Connector** bridges Unity and ROS 2
- **URDF Importer** brings your robot into Unity
- Use **Articulation Bodies** for proper robot physics
- Unity shines for **perception testing** and **human interaction**

---

## Next Up

Your simulated world needs sensors. Let's learn how to fake LiDAR, depth cameras, and IMUs convincingly.

**→ [Simulating Sensors](/docs/module-2-simulation/04-sensors-simulation)**
