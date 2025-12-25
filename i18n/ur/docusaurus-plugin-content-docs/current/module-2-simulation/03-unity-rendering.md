---
description: Use Unity game engine for robotics simulation. Learn to create photorealistic
  environments and connect to ROS 2.
id: simulation-unity-rendering
keywords:
- Unity
- robotics
- simulation
- ROS 2
- photorealistic
- game engine
- ROS-TCP-Connector
module: 2
sidebar_position: 3
tags:
- module-2
- hands-on
- intermediate
title: Unity کے ساتھ اعلیٰ حقیقت پسندی کی محاکات
---

# Unity کے ساتھ ہائی-فائیڈیلٹی سمولیشن

> **مختصر خلاصہ:** Unity ایک گیم انجن ہے جو روبوٹس کو شاندار دکھاتا ہے۔ ROS 2 کے ساتھ مل کر، یہ پرسیپشن ٹیسٹنگ، سنتھیٹک ڈیٹا جنریشن، اور ایسے ڈیموز کے لیے بہترین ہے جو لوگوں کو واقعی متاثر کرتے ہیں۔

---

## روبوٹکس کے لیے Unity کیوں؟

| خصوصیت | Gazebo | Unity |
|---------|--------|-------|
| فزکس | اچھا | اچھا (PhysX) |
| گرافکس | فعال | شاندار |
| ایسٹ لائبریری | محدود | بہت بڑی |
| ROS انٹیگریشن | نیٹیو | پیکیج کے ذریعے |
| سیکھنے کا منحنی | درمیانہ | زیادہ مشکل |
| لاگت | مفت | مفت (پرسنل) |

**Unity کا استعمال کریں جب:**
- آپ کو فوٹو ریئلسٹک بصریات کی ضرورت ہو
- متنوع ماحول میں کمپیوٹر ویژن کی جانچ کر رہے ہوں
- سنتھیٹک ٹریننگ ڈیٹا تیار کر رہے ہوں
- غیر تکنیکی اسٹیک ہولڈرز کے لیے ڈیموز بنا رہے ہوں
- انسانی-روبوٹ تعامل کے منظرنامے بنا رہے ہوں

---

## روبوٹکس کے لیے Unity سیٹ اپ کرنا

### مرحلہ 1: Unity Hub انسٹال کریں

[unity.com/download](https://unity.com/download) سے ڈاؤن لوڈ کریں۔

### مرحلہ 2: Unity Editor انسٹال کریں

- تجویز کردہ: **Unity 2022.3 LTS**
- شامل کریں: Windows Build Support، Linux Build Support

### مرحلہ 3: ایک نیا پروجیکٹ بنائیں

1. Unity Hub کھولیں
2. "New Project" پر کلک کریں
3. "3D (URP)" ٹیمپلیٹ منتخب کریں — بہترین کوالٹی/کارکردگی کے لیے Universal Render Pipeline
4. اسے "RobotSimulation" کا نام دیں

---

## ROS 2 انٹیگریشن انسٹال کرنا

Unity، **Unity Robotics Hub** پیکیجز کا استعمال کرتے ہوئے ROS 2 سے منسلک ہوتا ہے۔

### پیکیج کی انحصاریاں شامل کریں

Unity میں، `Window → Package Manager` کھولیں:

1. `+` پر کلک کریں → "Add package from git URL"
2. ان پیکیجز کو ایک ایک کرکے شامل کریں:

```
https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector
```

```
https://github.com/Unity-Technologies/URDF-Importer.git?path=/com.unity.robotics.urdf-importer
```

### ROS-TCP-Endpoint شروع کریں (ROS 2 سائیڈ)

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

### Unity کو کنفیگر کریں

1. `Robotics → ROS Settings`
2. ROS IP Address سیٹ کریں: `127.0.0.1` (یا آپ کی ROS مشین کا IP)
3. Protocol سیٹ کریں: `ROS2`

---

## اپنے روبوٹ کو امپورٹ کرنا

Unity براہ راست URDF فائلوں کو امپورٹ کر سکتا ہے!

### URDF امپورٹ کریں

1. `Assets → Import Robot from URDF`
2. اپنی `.urdf` فائل منتخب کریں
3. امپورٹ سیٹنگز کنفیگر کریں:
   - **Axis Type**: Y-Up (Unity) بمقابلہ Z-Up (ROS)
   - **Mesh Decomposer**: کانویکس کولیژنز کے لیے VHACD

### دستی اصلاحات (عموماً درکار)

- **Scale**: ROS میٹرز استعمال کرتا ہے، Unity بھی میٹرز پر ڈیفالٹ کرتا ہے، لیکن دوبارہ چیک کر لیں
- **Materials**: بصری معیار کے لیے مناسب میٹیریلز تفویض کریں
- **Colliders**: پیچیدہ اشکال کے لیے دستی ایڈجسٹمنٹ کی ضرورت پڑ سکتی ہے

---

## سمولیشن ماحول بنانا

### فوری ماحول سیٹ اپ

```csharp
// Create a simple room
// In Unity: GameObject → 3D Object → Plane (floor)
// GameObject → 3D Object → Cube (walls, scale as needed)
```

### Asset Store کا استعمال

Unity Asset Store میں ہزاروں مفت اور ادا شدہ Assets موجود ہیں:

- **گودام کے ماحول**
- **دفتر کی جگہیں**
- **بیرونی خطے**
- **فرنیچر اور اشیاء**

روبوٹ سے متعلقہ مناظر کے لیے "interior" یا "warehouse" تلاش کریں۔

### پرو ٹپ: ProBuilder استعمال کریں

Unity کا ProBuilder (مفت) آپ کو ماحول تیزی سے بنانے کی سہولت دیتا ہے:

```
Window → Package Manager → Search "ProBuilder" → Install
Tools → ProBuilder → ProBuilder Window
```

---

## ROS 2 پر پبلش/سبسکرائب کرنا

### ایک پبلشر بنائیں (Unity → ROS 2)

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

### ایک سبسکرائبر بنائیں (ROS 2 → Unity)

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

## سینسرز کی سمولیشن

### کیمرہ

Unity کیمرے روبوٹ کیمروں کی سمولیشن کے لیے بہترین ہیں:

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

### ڈیپتھ کیمرہ

Unity کے depth buffer کا استعمال کریں:

```csharp
// Attach a shader that outputs depth
// Then convert to ROS PointCloud2 or depth image
```

---

## فزکس اور Articulation Bodies

پیچیدہ روبوٹس کے لیے، Unity کے **Articulation Bodies** کا استعمال کریں (Rigidbodies سے روبوٹکس کے لیے بہتر):

1. URDF Importer کے ذریعے روبوٹ امپورٹ کریں (ڈیفالٹ کے طور پر Articulation Bodies استعمال کرتا ہے)
2. Inspector میں joint drives کنفیگر کریں
3. اسکرپٹس کے ذریعے کنٹرول کریں:

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

## انسانی-روبوٹ تعامل

Unity انسانوں کی سمولیشن میں بہترین ہے:

- مفت اینیمیٹڈ انسانی ماڈلز کے لیے **Mixamo** استعمال کریں
- انسانی پاتھ فائنڈنگ کے لیے **AI Navigation**
- حقیقت پسندانہ حرکت کے لیے **Animation Rigging**

یہ ان روبوٹس کی جانچ کے لیے انمول ہے جو لوگوں کے ارد گرد کام کرتے ہیں۔

---

## کارکردگی کی اصلاح

| تکنیک | اثر |
|-----------|--------|
| LOD Groups استعمال کریں | پیچیدہ مناظر کے لیے کارکردگی میں بڑا اضافہ |
| لائٹنگ بیک کریں | ریئل ٹائم لائٹنگ سے تیز |
| کیمرہ ریزولوشن کم کریں | رینڈر اور منتقل کرنے کے لیے کم ڈیٹا |
| آبجیکٹ پولنگ استعمال کریں | انسٹنشی ایشن کے اوور ہیڈ سے بچیں |
| جلد پروفائل کریں | `Window → Analysis → Profiler` |

---

## Unity بمقابلہ Gazebo: کب کون سا استعمال کریں

| منظرنامہ | تجویز کردہ |
|----------|-------------|
| فوری فزکس ٹیسٹنگ | Gazebo |
| ROS 2 نیٹیو ورک فلو | Gazebo |
| پرسیپشن ڈویلپمنٹ | Unity |
| سنتھیٹک ڈیٹا جنریشن | Unity |
| انسانی-روبوٹ تعامل | Unity |
| حتمی ڈیمو/پریزنٹیشن | Unity |
| ری انفورسمنٹ لرننگ (بنیادی) | Gazebo |
| ری انفورسمنٹ لرننگ (پیچیدہ) | Isaac Sim (ماڈیول 3) |

---

## خلاصہ

- Unity روبوٹکس کے لیے **فوٹو ریئلسٹک سمولیشن** فراہم کرتا ہے
- **ROS-TCP-Connector** Unity اور ROS 2 کے درمیان پل کا کام کرتا ہے
- **URDF Importer** آپ کے روبوٹ کو Unity میں لاتا ہے
- مناسب روبوٹ فزکس کے لیے **Articulation Bodies** استعمال کریں
- Unity **پرسیپشن ٹیسٹنگ** اور **انسانی تعامل** کے لیے بہترین ہے

---

## اگلا

آپ کی سمولیٹڈ دنیا کو سینسرز کی ضرورت ہے۔ آئیے سیکھیں کہ LiDAR، ڈیپتھ کیمروں اور IMUs کو کس طرح قائل کرنے والے انداز میں فیک کیا جائے۔

**→ [Simulating Sensors](/docs/module-2-simulation/04-sensors-simulation)**