---
id: isaac-sim
title: "Isaac Sim: Photorealistic Simulation"
description: "Master NVIDIA Isaac Sim for robot simulation. Learn to create environments, import robots, and generate synthetic training data."
sidebar_position: 2
module: 3
keywords: [Isaac Sim, photorealistic, Omniverse, USD, synthetic data, Replicator]
tags: [module-3, hands-on, advanced]
---

# Isaac Sim: Photorealistic Simulation

> **TL;DR:** Isaac Sim creates the most realistic robot simulations available. This section teaches you to navigate the interface, import robots, create environments, and generate synthetic data for AI training.

---

## The Interface

Isaac Sim's interface can be overwhelming at first. Key areas:

```
┌────────────────────────────────────────────────────────────────┐
│  Menu Bar                                                       │
├───────────────┬────────────────────────────┬───────────────────┤
│               │                            │                   │
│   Stage       │      Viewport              │    Properties     │
│   (Scene      │      (3D View)             │    (Selected      │
│    tree)      │                            │     object)       │
│               │                            │                   │
├───────────────┴────────────────────────────┴───────────────────┤
│  Content Browser / Console / Timeline                          │
└────────────────────────────────────────────────────────────────┘
```

### Essential Panels

- **Stage** — Scene hierarchy (like Unity/Blender)
- **Viewport** — 3D view of your world
- **Properties** — Edit selected object
- **Content Browser** — Access assets, files
- **Console** — Python REPL and logs

### Navigation

- **Rotate:** Alt + Left Click
- **Pan:** Alt + Middle Click
- **Zoom:** Scroll wheel
- **Focus:** F key (with object selected)

---

## USD: The Scene Format

Isaac Sim uses **USD (Universal Scene Description)**, developed by Pixar.

Key concepts:

| Concept | Description |
|---------|-------------|
| **Prim** | Any object in the scene (mesh, light, camera, etc.) |
| **Layer** | A USD file; scenes can reference multiple layers |
| **Reference** | Link to another USD file (reusable assets) |
| **Variant** | Different versions of an asset |
| **Attribute** | Property of a prim (position, color, etc.) |

### Why USD?

- **Non-destructive** — Original assets unchanged
- **Composable** — Layer multiple files
- **Scalable** — Handles massive scenes
- **Industry standard** — Used by Pixar, Disney, Apple

---

## Importing a Robot

### Option 1: Built-in Assets

Isaac Sim includes many robots:

```
omniverse://localhost/NVIDIA/Assets/Isaac/Robots/
├── Carter/
├── Franka/
├── Jetbot/
├── Nova_Carter/
├── Unitree/
└── ...
```

To load:
1. `File → Open`
2. Navigate to robot USD
3. Or drag from Content Browser

### Option 2: URDF Import

```python
# In Isaac Sim's Script Editor
from omni.isaac.urdf import _urdf
from pxr import UsdPhysics

# Configure import
import_config = _urdf.ImportConfig()
import_config.merge_fixed_joints = False
import_config.fix_base = False
import_config.import_inertia_tensor = True

# Import URDF
urdf_interface = _urdf.acquire_urdf_interface()
result = urdf_interface.parse_urdf(
    "/path/to/robot.urdf",
    import_config
)

# Create in stage
urdf_interface.import_robot(
    "/path/to/robot.urdf",
    result,
    import_config,
    "/World/my_robot"
)
```

### Option 3: OnShape/CAD Import

Isaac Sim can import from CAD tools via Omniverse connectors:
- Fusion 360
- SolidWorks
- OnShape
- Blender

---

## Creating an Environment

### Adding a Ground Plane

```python
from pxr import UsdGeom, Gf

stage = omni.usd.get_context().get_stage()

# Create ground plane
ground = UsdGeom.Mesh.Define(stage, "/World/ground")
ground.CreatePointsAttr([(-50,-50,0), (50,-50,0), (50,50,0), (-50,50,0)])
ground.CreateFaceVertexCountsAttr([4])
ground.CreateFaceVertexIndicesAttr([0,1,2,3])
```

### Using Environment Assets

Isaac Sim includes realistic environments:

```
omniverse://localhost/NVIDIA/Assets/Isaac/Environments/
├── Simple_Room/
├── Hospital/
├── Warehouse/
├── Office/
└── ...
```

Load via Content Browser or:

```python
from omni.isaac.core.utils.stage import add_reference_to_stage

add_reference_to_stage(
    "omniverse://localhost/NVIDIA/Assets/Isaac/Environments/Simple_Warehouse/warehouse.usd",
    "/World/warehouse"
)
```

---

## Physics Setup

### Enable Physics on Objects

```python
from pxr import UsdPhysics

stage = omni.usd.get_context().get_stage()

# Get the prim
prim = stage.GetPrimAtPath("/World/my_robot/base_link")

# Add rigid body
rigid_body = UsdPhysics.RigidBodyAPI.Apply(prim)

# Add collision
collision = UsdPhysics.CollisionAPI.Apply(prim)
```

### Physics Scene Configuration

```python
from pxr import PhysxSchema

# Configure physics scene
physics_scene = PhysxSchema.PhysxSceneAPI.Apply(
    stage.GetPrimAtPath("/World/physicsScene")
)
physics_scene.CreateGravityDirectionAttr(Gf.Vec3f(0, 0, -1))
physics_scene.CreateGravityMagnitudeAttr(9.81)
```

---

## ROS 2 Integration

Isaac Sim has native ROS 2 support via **Action Graphs**.

### Enabling ROS 2 Bridge

1. `Window → Extensions`
2. Search "ROS2 Bridge"
3. Enable it

### Creating Publishers/Subscribers

Use OmniGraph (visual programming):

1. `Window → Visual Scripting → Action Graph`
2. Right-click → Create Node
3. Search for ROS 2 nodes:
   - `ROS2 Publish Twist`
   - `ROS2 Subscribe Twist`
   - `ROS2 Publish Image`
   - `ROS2 Publish LaserScan`

### Python API

```python
import omni.graph.core as og
from omni.isaac.core_nodes.scripts.utils import set_target_prims

# Create ROS 2 publisher for camera
og.Controller.edit(
    {"graph_path": "/ActionGraph", "evaluator_name": "execution"},
    {
        og.Controller.Keys.CREATE_NODES: [
            ("OnPlaybackTick", "omni.graph.action.OnPlaybackTick"),
            ("CameraHelper", "omni.isaac.ros2_bridge.ROS2CameraHelper"),
        ],
        og.Controller.Keys.CONNECT: [
            ("OnPlaybackTick.outputs:tick", "CameraHelper.inputs:execIn"),
        ],
        og.Controller.Keys.SET_VALUES: [
            ("CameraHelper.inputs:topicName", "/camera/image_raw"),
            ("CameraHelper.inputs:frameId", "camera"),
        ],
    },
)
```

---

## Synthetic Data Generation (Replicator)

Replicator generates diverse training data automatically:

### Basic Randomization

```python
import omni.replicator.core as rep

# Register randomizer
with rep.new_layer():
    # Create camera
    camera = rep.create.camera(position=(0, 0, 3), look_at=(0, 0, 0))
    
    # Create render product
    render_product = rep.create.render_product(camera, (640, 480))
    
    # Randomize object positions
    cube = rep.create.cube(position=(0, 0, 0.5))
    
    with rep.trigger.on_frame(num_frames=100):
        with cube:
            rep.modify.pose(
                position=rep.distribution.uniform((-2, -2, 0.5), (2, 2, 0.5)),
                rotation=rep.distribution.uniform((0, 0, 0), (360, 360, 360))
            )
    
    # Write data
    writer = rep.WriterRegistry.get("BasicWriter")
    writer.initialize(output_dir="_output", rgb=True)
    writer.attach(render_product)
```

### Domain Randomization

```python
import omni.replicator.core as rep

with rep.trigger.on_frame():
    # Randomize lighting
    with rep.get.light():
        rep.modify.attribute("intensity", rep.distribution.uniform(500, 2000))
        rep.modify.attribute("color", rep.distribution.uniform((0.8,0.8,0.8), (1,1,1)))
    
    # Randomize textures
    with rep.get.prims(semantics=[("class", "floor")]):
        rep.randomizer.texture(
            textures=[
                "omniverse://localhost/NVIDIA/Materials/Base/Wood/",
                "omniverse://localhost/NVIDIA/Materials/Base/Concrete/",
            ]
        )
    
    # Randomize object colors
    with rep.get.prims(semantics=[("class", "object")]):
        rep.randomizer.color(
            colors=rep.distribution.uniform((0,0,0), (1,1,1))
        )
```

### Output Formats

Replicator can generate:
- **RGB images**
- **Depth images**
- **Semantic segmentation**
- **Instance segmentation**
- **Bounding boxes (2D/3D)**
- **Skeleton/pose data**
- **Point clouds**

---

## Python Scripting

Isaac Sim is fully scriptable:

### Standalone Python

```python
# Run simulation programmatically
from omni.isaac.kit import SimulationApp

# Create app
simulation_app = SimulationApp({"headless": False})

# Import after app creation
from omni.isaac.core import World
from omni.isaac.core.robots import Robot

# Create world
world = World(stage_units_in_meters=1.0)

# Add robot
world.scene.add(Robot(prim_path="/World/robot", name="my_robot"))

# Run simulation
while simulation_app.is_running():
    world.step(render=True)
    
simulation_app.close()
```

### Extension Development

Create custom Isaac Sim extensions:

```python
import omni.ext

class MyExtension(omni.ext.IExt):
    def on_startup(self, ext_id):
        print("Extension started")
        
    def on_shutdown(self):
        print("Extension stopped")
```

---

## Performance Tips

1. **Use GPU physics** — Much faster than CPU
2. **Reduce render resolution** during training
3. **Disable raytracing** if not needed for visuals
4. **Use headless mode** for training: `SimulationApp({"headless": True})`
5. **Batch synthetic data** generation

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Slow startup | Normal, caching helps after first load |
| Black screen | Check GPU drivers, CUDA version |
| Physics explosion | Reduce timestep, check collision geometry |
| ROS 2 not connecting | Ensure ROS 2 sourced before launching |
| Out of memory | Reduce scene complexity, close other apps |

---

## Summary

- Isaac Sim provides **photorealistic** robot simulation
- Built on **Omniverse** and **USD**
- Native **ROS 2** integration via Action Graphs
- **Replicator** generates synthetic training data
- Fully **Python scriptable**

---

## Next Up

Time to accelerate perception with Isaac ROS—GPU-powered SLAM, object detection, and point cloud processing.

**→ [Isaac ROS: GPU-Accelerated Perception](/docs/module-3-isaac/03-isaac-ros)**
