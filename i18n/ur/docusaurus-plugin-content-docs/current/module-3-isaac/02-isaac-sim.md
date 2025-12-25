---
description: NVIDIA Isaac Sim میں robot simulation کے لیے مہارت حاصل کریں۔ environments
  بنانا، robots امپورٹ کرنا، اور synthetic training data تیار کرنا سیکھیں۔
id: isaac-sim
keywords:
- Isaac Sim
- photorealistic
- Omniverse
- USD
- synthetic data
- Replicator
module: 3
sidebar_position: 2
tags:
- module-3
- hands-on
- advanced
title: 'Isaac Sim: حقیقت پسندانہ نقالی'
---

# Isaac Sim: حقیقت پسندانہ سمولیشن (Photorealistic Simulation)

> **TL;DR:** Isaac Sim روبوٹ کی سب سے حقیقت پسندانہ سمولیشنز (simulations) تیار کرتا ہے جو دستیاب ہیں۔ یہ سیکشن آپ کو انٹرفیس (interface) کو نیویگیٹ (navigate) کرنا، روبوٹس کو امپورٹ (import) کرنا، ماحول (environments) بنانا، اور AI ٹریننگ (training) کے لیے مصنوعی ڈیٹا (synthetic data) تیار کرنا سکھائے گا۔

---

## انٹرفیس (The Interface)

Isaac Sim کا انٹرفیس (interface) شروع میں بہت زیادہ لگ سکتا ہے۔ اہم حصے:

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

### ضروری پینلز (Essential Panels)

-   **Stage** — سین (scene) کی درجہ بندی (hierarchy) (جیسے Unity/Blender)
-   **Viewport** — آپ کی دنیا کا 3D منظر
-   **Properties** — منتخب آبجیکٹ (object) میں ترمیم کریں
-   **Content Browser** — اثاثوں (assets)، فائلوں تک رسائی
-   **Console** — Python REPL اور لاگز (logs)

### نیویگیشن (Navigation)

-   **Rotate:** Alt + Left Click
-   **Pan:** Alt + Middle Click
-   **Zoom:** Scroll wheel
-   **Focus:** F key (آبجیکٹ منتخب ہونے پر)

---

## USD: سین فارمیٹ (The Scene Format)

Isaac Sim **USD (Universal Scene Description)** کا استعمال کرتا ہے، جسے Pixar نے تیار کیا ہے۔

اہم تصورات (Key concepts):

| تصور (Concept) | تفصیل (Description) |
|---------------|--------------------------------------------------|
| **Prim**      | سین میں کوئی بھی آبجیکٹ (mesh, light, camera, وغیرہ) |
| **Layer**     | ایک USD فائل؛ سینز (scenes) متعدد لیئرز (layers) کا حوالہ دے سکتے ہیں |
| **Reference** | کسی دوسری USD فائل کا لنک (دوبارہ استعمال ہونے والے اثاثے) |
| **Variant**   | ایک اثاثے کے مختلف ورژن |
| **Attribute** | ایک Prim کی خصوصیت (position, color, وغیرہ) |

### USD کیوں؟ (Why USD?)

-   **Non-destructive** — اصل اثاثے (assets) غیر تبدیل شدہ رہتے ہیں
-   **Composable** — متعدد فائلوں کو لیئر (layer) کریں
-   **Scalable** — بڑے سینز (scenes) کو ہینڈل کرتا ہے
-   **Industry standard** — Pixar، Disney، Apple استعمال کرتے ہیں

---

## روبوٹ امپورٹ کرنا (Importing a Robot)

### آپشن 1: بلٹ ان اثاثے (Built-in Assets)

Isaac Sim میں بہت سے روبوٹ شامل ہیں:

```
omniverse://localhost/NVIDIA/Assets/Isaac/Robots/
├── Carter/
├── Franka/
├── Jetbot/
├── Nova_Carter/
├── Unitree/
└── ...
```

لوڈ کرنے کے لیے:
1.  `File → Open`
2.  روبوٹ USD پر نیویگیٹ کریں
3.  یا Content Browser سے ڈریگ (drag) کریں

### آپشن 2: URDF امپورٹ (Import)

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

### آپشن 3: OnShape/CAD امپورٹ (Import)

Isaac Sim CAD ٹولز سے Omniverse کنیکٹرز (connectors) کے ذریعے امپورٹ (import) کر سکتا ہے:
-   Fusion 360
-   SolidWorks
-   OnShape
-   Blender

---

## ماحول بنانا (Creating an Environment)

### گراؤنڈ پلین شامل کرنا (Adding a Ground Plane)

```python
from pxr import UsdGeom, Gf

stage = omni.usd.get_context().get_stage()

# Create ground plane
ground = UsdGeom.Mesh.Define(stage, "/World/ground")
ground.CreatePointsAttr([(-50,-50,0), (50,-50,0), (50,50,0), (-50,50,0)])
ground.CreateFaceVertexCountsAttr([4])
ground.CreateFaceVertexIndicesAttr([0,1,2,3])
```

### ماحولیاتی اثاثے استعمال کرنا (Using Environment Assets)

Isaac Sim میں حقیقت پسندانہ ماحول شامل ہیں:

```
omniverse://localhost/NVIDIA/Assets/Isaac/Environments/
├── Simple_Room/
├── Hospital/
├── Warehouse/
├── Office/
└── ...
```

Content Browser کے ذریعے لوڈ کریں یا:

```python
from omni.isaac.core.utils.stage import add_reference_to_stage

add_reference_to_stage(
    "omniverse://localhost/NVIDIA/Assets/Isaac/Environments/Simple_Warehouse/warehouse.usd",
    "/World/warehouse"
)
```

---

## فزکس سیٹ اپ (Physics Setup)

### آبجیکٹس پر فزکس فعال کریں (Enable Physics on Objects)

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

### فزکس سین کنفیگریشن (Physics Scene Configuration)

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

## ROS 2 انٹیگریشن (Integration)

Isaac Sim میں **Action Graphs** کے ذریعے مقامی ROS 2 سپورٹ (support) موجود ہے۔

### ROS 2 برج فعال کرنا (Enabling ROS 2 Bridge)

1.  `Window → Extensions`
2.  "ROS2 Bridge" تلاش کریں
3.  اسے فعال کریں

### پبلشرز/سبسکرائبرز بنانا (Creating Publishers/Subscribers)

OmniGraph (بصری پروگرامنگ) استعمال کریں:

1.  `Window → Visual Scripting → Action Graph`
2.  رائٹ کلک (Right-click) → Create Node
3.  ROS 2 نوڈز (nodes) تلاش کریں:
    -   `ROS2 Publish Twist`
    -   `ROS2 Subscribe Twist`
    -   `ROS2 Publish Image`
    -   `ROS2 Publish LaserScan`

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

## مصنوعی ڈیٹا جنریشن (Replicator) (Synthetic Data Generation (Replicator))

Replicator خود بخود متنوع ٹریننگ ڈیٹا (training data) تیار کرتا ہے:

### بنیادی رینڈمائزیشن (Basic Randomization)

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

### ڈومین رینڈمائزیشن (Domain Randomization)

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

### آؤٹ پٹ فارمیٹس (Output Formats)

Replicator یہ چیزیں تیار کر سکتا ہے:
-   **RGB images**
-   **Depth images**
-   **Semantic segmentation**
-   **Instance segmentation**
-   **Bounding boxes (2D/3D)**
-   **Skeleton/pose data**
-   **Point clouds**

---

## Python اسکرپٹنگ (Scripting)

Isaac Sim مکمل طور پر اسکرپٹ ایبل (scriptable) ہے:

### اسٹینڈ الون پائتھون (Standalone Python)

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

### ایکسٹینشن ڈویلپمنٹ (Extension Development)

اپنی مرضی کے مطابق Isaac Sim ایکسٹینشنز (extensions) بنائیں:

```python
import omni.ext

class MyExtension(omni.ext.IExt):
    def on_startup(self, ext_id):
        print("Extension started")
        
    def on_shutdown(self):
        print("Extension stopped")
```

---

## کارکردگی کے نکات (Performance Tips)

1.  **GPU physics استعمال کریں** — CPU سے کہیں زیادہ تیز
2.  ٹریننگ (training) کے دوران **render resolution کم کریں**
3.  اگر بصریات (visuals) کے لیے ضرورت نہ ہو تو **raytracing غیر فعال کریں**
4.  ٹریننگ کے لیے **headless mode استعمال کریں**: `SimulationApp({"headless": True})`
5.  **synthetic data جنریشن کو بیچ (batch) کریں**

---

## عام مسائل (Common Issues)

| مسئلہ (Issue) | حل (Solution) |
|---------------|---------------|
| Slow startup  | عام ہے، پہلی بار لوڈ ہونے کے بعد کیشنگ (caching) مدد کرتی ہے |
| Black screen  | GPU ڈرائیورز (drivers)، CUDA ورژن چیک کریں |
| Physics explosion | ٹائم اسٹیمپ (timestep) کم کریں، collision geometry چیک کریں |
| ROS 2 not connecting | یقینی بنائیں کہ لانچ کرنے سے پہلے ROS 2 سورس (sourced) کیا گیا ہے |
| Out of memory | سین (scene) کی پیچیدگی کم کریں، دیگر ایپس (apps) بند کریں |

---

## خلاصہ (Summary)

-   Isaac Sim **حقیقت پسندانہ (photorealistic)** روبوٹ سمولیشن (simulation) فراہم کرتا ہے
-   **Omniverse** اور **USD** پر مبنی
-   Action Graphs کے ذریعے مقامی **ROS 2** انٹیگریشن (integration)
-   **Replicator** مصنوعی ٹریننگ ڈیٹا (synthetic training data) تیار کرتا ہے
-   مکمل طور پر **Python scriptable**

---

## اگلا کیا؟ (Next Up)

Isaac ROS کے ساتھ پرسیپشن (perception) کو تیز کرنے کا وقت — GPU سے چلنے والا SLAM، آبجیکٹ ڈیٹیکشن (object detection)، اور پوائنٹ کلاؤڈ پروسیسنگ (point cloud processing)۔

**→ [Isaac ROS: GPU-Accelerated Perception](/docs/module-3-isaac/03-isaac-ros)**