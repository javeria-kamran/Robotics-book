---
description: OpenAI Whisper کو speech-to-text کے لیے مربوط کریں، تاکہ آپ کا humanoid
  صوتی احکامات کو سمجھ سکے اور انہیں قابل عمل ہدایات میں تبدیل کر سکے۔
id: vla-voice-to-action
keywords:
- Whisper
- speech recognition
- voice commands
- OpenAI
- audio processing
- ROS 2
module: 4
sidebar_position: 2
tags:
- module-4
- hands-on
- intermediate
title: 'آواز سے عمل تک: Speech Recognition'
---

# Voice to Action: Speech Recognition

> **TL;DR:** Your robot needs ears. We'll use OpenAI Whisper for speech-to-text, turning "hey robot, grab that bottle" into structured commands. Works offline, multiple languages, and handles noisy environments surprisingly well.

---

## Why Voice?

Keyboards and GUIs are for computers. Robots operating in the real world need natural interfaces:

| Interface | Use Case | Practicality |
|-----------|----------|--------------|
| **Keyboard** | Programming | 🟡 Development only |
| **GUI** | Monitoring | 🟡 Requires screen access |
| **Gesture** | Quick commands | 🟡 Ambiguous |
| **Voice** | Natural interaction | 🟢 Like talking to a human |

**The goal**: Speak → Understand → Act

---

## OpenAI Whisper

Whisper is an open-source speech recognition model from OpenAI:

- **Multilingual**: 99 languages
- **Robust**: Handles noise, accents, technical terms
- **Offline**: Runs locally (no API needed)
- **Free**: Apache 2.0 license

### Model Sizes

| Model | Parameters | VRAM | Speed | Accuracy |
|-------|------------|------|-------|----------|
| `tiny` | 39M | ~1GB | Fastest | Good |
| `base` | 74M | ~1GB | Fast | Better |
| `small` | 244M | ~2GB | Medium | Great |
| `medium` | 769M | ~5GB | Slow | Excellent |
| `large-v3` | 1550M | ~10GB | Slowest | Best |

**Recommendation**: `small` for robotics (good balance of speed/accuracy).

---

## Installation

```bash
pip install openai-whisper
pip install pyaudio  # For microphone access
```

For GPU acceleration:

```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu118
```

---

## Basic Usage

```python
import whisper

# Load model
model = whisper.load_model("small")

# Transcribe audio file
result = model.transcribe("command.wav")
print(result["text"])
```

Output:
```
Pick up the red bottle on the table
```

---

## Real-Time Microphone Input

```python
#!/usr/bin/env python3
"""
real_time_whisper.py
Continuous speech recognition for robotics.
"""

import whisper
import pyaudio
import numpy as np
import wave
import tempfile
import os
import threading
import queue

class SpeechRecognizer:
    def __init__(self, model_name="small"):
        print(f"Loading Whisper model: {model_name}")
        self.model = whisper.load_model(model_name)
        
        # Audio settings
        self.RATE = 16000
        self.CHUNK = 1024
        self.CHANNELS = 1
        self.FORMAT = pyaudio.paInt16
        
        # Recording state
        self.is_recording = False
        self.audio_queue = queue.Queue()
        
        # Initialize PyAudio
        self.audio = pyaudio.PyAudio()
        
    def start_stream(self):
        """Start the audio input stream."""
        self.stream = self.audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            frames_per_buffer=self.CHUNK,
            stream_callback=self._audio_callback
        )
        self.stream.start_stream()
        
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """Callback for audio stream."""
        if self.is_recording:
            self.audio_queue.put(in_data)
        return (in_data, pyaudio.paContinue)
    
    def record_command(self, duration=5.0):
        """Record audio for specified duration."""
        print(f"Recording for {duration} seconds...")
        
        self.is_recording = True
        frames = []
        
        # Collect audio frames
        import time
        start = time.time()
        while time.time() - start < duration:
            try:
                frame = self.audio_queue.get(timeout=0.1)
                frames.append(frame)
            except queue.Empty:
                continue
                
        self.is_recording = False
        print("Recording complete.")
        
        return b''.join(frames)
    
    def transcribe(self, audio_data):
        """Transcribe audio data to text."""
        # Save to temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            wf = wave.open(f.name, 'wb')
            wf.setnchannels(self.CHANNELS)
            wf.setsampwidth(self.audio.get_sample_size(self.FORMAT))
            wf.setframerate(self.RATE)
            wf.writeframes(audio_data)
            wf.close()
            
            # Transcribe
            result = self.model.transcribe(f.name)
            
            # Cleanup
            os.unlink(f.name)
            
        return result["text"].strip()
    
    def listen_and_transcribe(self, duration=5.0):
        """Record and transcribe in one call."""
        audio_data = self.record_command(duration)
        return self.transcribe(audio_data)
    
    def cleanup(self):
        """Clean up resources."""
        self.stream.stop_stream()
        self.stream.close()
        self.audio.terminate()


def main():
    recognizer = SpeechRecognizer(model_name="small")
    recognizer.start_stream()
    
    print("\n🎤 Say a command (recording for 5 seconds)...\n")
    
    try:
        while True:
            text = recognizer.listen_and_transcribe(duration=5.0)
            print(f"\n📝 Transcribed: {text}\n")
            
            input("Press Enter to record again (Ctrl+C to exit)...")
            
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        recognizer.cleanup()


if __name__ == "__main__":
    main()
```

---

## Voice Activity Detection (VAD)

Don't want to record silence? Use VAD:

```python
import webrtcvad

class VADSpeechRecognizer(SpeechRecognizer):
    def __init__(self, model_name="small", aggressiveness=2):
        super().__init__(model_name)
        self.vad = webrtcvad.Vad(aggressiveness)  # 0-3
        self.FRAME_DURATION = 30  # ms
        
    def is_speech(self, audio_chunk):
        """Check if audio chunk contains speech."""
        # VAD requires 10, 20, or 30ms frames at 8, 16, or 32kHz
        frame_size = int(self.RATE * self.FRAME_DURATION / 1000) * 2
        
        if len(audio_chunk) >= frame_size:
            return self.vad.is_speech(audio_chunk[:frame_size], self.RATE)
        return False
    
    def record_until_silence(self, max_duration=10.0, silence_threshold=1.0):
        """Record until user stops speaking."""
        print("Listening... (speak now)")
        
        self.is_recording = True
        frames = []
        silence_frames = 0
        required_silence = int(silence_threshold * self.RATE / self.CHUNK)
        
        import time
        start = time.time()
        
        while time.time() - start < max_duration:
            try:
                frame = self.audio_queue.get(timeout=0.1)
                frames.append(frame)
                
                if self.is_speech(frame):
                    silence_frames = 0
                else:
                    silence_frames += 1
                    
                    if len(frames) > 10 and silence_frames > required_silence:
                        print("Detected end of speech.")
                        break
                        
            except queue.Empty:
                continue
        
        self.is_recording = False
        return b''.join(frames)
```

Install VAD:
```bash
pip install webrtcvad
```

---

## ROS 2 Integration

### Speech Recognition Node

```python
#!/usr/bin/env python3
"""
speech_recognition_node.py
ROS 2 node for Whisper-based speech recognition.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from std_srvs.srv import Trigger
import whisper
import pyaudio
import numpy as np
import wave
import tempfile
import os
import threading

class SpeechRecognitionNode(Node):
    def __init__(self):
        super().__init__('speech_recognition')
        
        # Parameters
        self.declare_parameter('model_name', 'small')
        self.declare_parameter('record_duration', 5.0)
        self.declare_parameter('language', 'en')
        
        model_name = self.get_parameter('model_name').value
        self.record_duration = self.get_parameter('record_duration').value
        self.language = self.get_parameter('language').value
        
        # Load Whisper model
        self.get_logger().info(f'Loading Whisper model: {model_name}')
        self.model = whisper.load_model(model_name)
        self.get_logger().info('Model loaded!')
        
        # Audio settings
        self.RATE = 16000
        self.CHUNK = 1024
        self.CHANNELS = 1
        self.FORMAT = pyaudio.paInt16
        self.audio = pyaudio.PyAudio()
        
        # Publishers
        self.text_pub = self.create_publisher(String, '/speech/text', 10)
        
        # Services
        self.listen_srv = self.create_service(
            Trigger, '/speech/listen', self.listen_callback
        )
        
        # Recording state
        self.is_recording = False
        self.frames = []
        
        self.get_logger().info('Speech recognition node ready!')
        
    def record_audio(self, duration):
        """Record audio for specified duration."""
        stream = self.audio.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            frames_per_buffer=self.CHUNK
        )
        
        self.get_logger().info(f'Recording for {duration} seconds...')
        frames = []
        
        for _ in range(int(self.RATE / self.CHUNK * duration)):
            data = stream.read(self.CHUNK, exception_on_overflow=False)
            frames.append(data)
        
        stream.stop_stream()
        stream.close()
        
        return b''.join(frames)
    
    def transcribe(self, audio_data):
        """Transcribe audio to text."""
        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            wf = wave.open(f.name, 'wb')
            wf.setnchannels(self.CHANNELS)
            wf.setsampwidth(self.audio.get_sample_size(self.FORMAT))
            wf.setframerate(self.RATE)
            wf.writeframes(audio_data)
            wf.close()
            
            # Transcribe
            result = self.model.transcribe(
                f.name,
                language=self.language
            )
            
            os.unlink(f.name)
        
        return result["text"].strip()
    
    def listen_callback(self, request, response):
        """Service callback for listen command."""
        try:
            audio_data = self.record_audio(self.record_duration)
            text = self.transcribe(audio_data)
            
            # Publish
            msg = String()
            msg.data = text
            self.text_pub.publish(msg)
            
            response.success = True
            response.message = text
            
            self.get_logger().info(f'Transcribed: "{text}"')
            
        except Exception as e:
            response.success = False
            response.message = str(e)
            self.get_logger().error(f'Error: {e}')
        
        return response

def main(args=None):
    rclpy.init(args=args)
    node = SpeechRecognitionNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    
    node.audio.terminate()
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Usage

```bash
# Terminal 1: Start node
ros2 run my_humanoid_pkg speech_recognition_node

# Terminal 2: Trigger listening
ros2 service call /speech/listen std_srvs/srv/Trigger

# Terminal 3: Monitor transcriptions
ros2 topic echo /speech/text
```

---

## Continuous Listening Mode

```python
# Add to SpeechRecognitionNode

def __init__(self):
    # ... existing init ...
    
    # Continuous mode
    self.declare_parameter('continuous_mode', False)
    self.continuous = self.get_parameter('continuous_mode').value
    
    if self.continuous:
        self.listen_timer = self.create_timer(
            self.record_duration + 0.5, 
            self.continuous_listen
        )

def continuous_listen(self):
    """Continuously listen and transcribe."""
    try:
        audio_data = self.record_audio(self.record_duration)
        text = self.transcribe(audio_data)
        
        # Filter out empty/noise
        if len(text) > 2 and not text.isspace():
            msg = String()
            msg.data = text
            self.text_pub.publish(msg)
            self.get_logger().info(f'Heard: "{text}"')
            
    except Exception as e:
        self.get_logger().error(f'Error: {e}')
```

---

## Wake Word Detection

Only activate after hearing "Hey robot":

```python
import re

class WakeWordSpeechRecognition(SpeechRecognitionNode):
    def __init__(self):
        super().__init__()
        
        self.declare_parameter('wake_word', 'hey robot')
        self.wake_word = self.get_parameter('wake_word').value.lower()
        
        self.awake = False
        self.awake_timeout = 10.0  # seconds
        self.last_wake_time = 0
        
    def continuous_listen(self):
        """Listen with wake word detection."""
        audio_data = self.record_audio(self.record_duration)
        text = self.transcribe(audio_data).lower()
        
        import time
        
        # Check for wake word
        if self.wake_word in text:
            self.awake = True
            self.last_wake_time = time.time()
            self.get_logger().info('Wake word detected! Listening...')
            
            # Remove wake word from command
            text = text.replace(self.wake_word, '').strip()
        
        # Check if still awake
        if time.time() - self.last_wake_time > self.awake_timeout:
            self.awake = False
        
        # Only publish if awake and has content
        if self.awake and len(text) > 2:
            msg = String()
            msg.data = text
            self.text_pub.publish(msg)
            self.get_logger().info(f'Command: "{text}"')
```

---

## Command Parsing

Convert natural language to structured commands:

```python
import json
import re

class CommandParser:
    """Parse natural language into robot commands."""
    
    # Patterns for common commands
    PATTERNS = {
        'pick_up': [
            r'pick up (?:the )?(.+)',
            r'grab (?:the )?(.+)',
            r'get (?:the )?(.+)',
        ],
        'move_to': [
            r'go to (?:the )?(.+)',
            r'navigate to (?:the )?(.+)',
            r'move to (?:the )?(.+)',
        ],
        'look_at': [
            r'look at (?:the )?(.+)',
            r'turn to (?:the )?(.+)',
        ],
        'stop': [
            r'stop',
            r'halt',
            r'freeze',
        ],
    }
    
    def parse(self, text):
        """Parse text into command structure."""
        text = text.lower().strip()
        
        for action, patterns in self.PATTERNS.items():
            for pattern in patterns:
                match = re.match(pattern, text)
                if match:
                    return {
                        'action': action,
                        'target': match.group(1) if match.groups() else None,
                        'raw_text': text
                    }
        
        # No pattern matched
        return {
            'action': 'unknown',
            'target': None,
            'raw_text': text
        }

# Usage
parser = CommandParser()
command = parser.parse("Pick up the red bottle")
print(command)
# {'action': 'pick_up', 'target': 'red bottle', 'raw_text': 'pick up the red bottle'}
```

---

## Putting It Together

```python
#!/usr/bin/env python3
"""
voice_command_node.py
Complete voice command pipeline for humanoid robot.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
import json

class VoiceCommandNode(Node):
    def __init__(self):
        super().__init__('voice_command')
        
        # Subscribe to speech text
        self.speech_sub = self.create_subscription(
            String, '/speech/text', self.speech_callback, 10
        )
        
        # Publishers for different command types
        self.nav_pub = self.create_publisher(PoseStamped, '/goal_pose', 10)
        self.action_pub = self.create_publisher(String, '/robot_action', 10)
        
        # Command parser
        self.parser = CommandParser()
        
        # Known locations (could be loaded from file)
        self.locations = {
            'kitchen': (5.0, 3.0, 0.0),
            'living room': (2.0, 1.0, 0.0),
            'bedroom': (8.0, 2.0, 0.0),
            'front door': (0.0, 0.0, 0.0),
        }
        
        self.get_logger().info('Voice command node ready!')
        
    def speech_callback(self, msg):
        """Process incoming speech."""
        text = msg.data
        self.get_logger().info(f'Processing: "{text}"')
        
        command = self.parser.parse(text)
        self.execute_command(command)
        
    def execute_command(self, command):
        """Execute parsed command."""
        action = command['action']
        target = command['target']
        
        if action == 'move_to':
            self.handle_navigation(target)
        elif action == 'pick_up':
            self.handle_manipulation(target)
        elif action == 'look_at':
            self.handle_look(target)
        elif action == 'stop':
            self.handle_stop()
        else:
            self.get_logger().warn(f'Unknown command: {command["raw_text"]}')
    
    def handle_navigation(self, location):
        """Navigate to named location."""
        if location in self.locations:
            x, y, theta = self.locations[location]
            
            goal = PoseStamped()
            goal.header.frame_id = 'map'
            goal.header.stamp = self.get_clock().now().to_msg()
            goal.pose.position.x = x
            goal.pose.position.y = y
            goal.pose.orientation.w = 1.0
            
            self.nav_pub.publish(goal)
            self.get_logger().info(f'Navigating to {location}')
        else:
            self.get_logger().warn(f'Unknown location: {location}')
    
    def handle_manipulation(self, object_name):
        """Send pick up command."""
        action = String()
        action.data = json.dumps({
            'type': 'pick_up',
            'object': object_name
        })
        self.action_pub.publish(action)
        self.get_logger().info(f'Picking up: {object_name}')
    
    def handle_look(self, target):
        """Look at target."""
        action = String()
        action.data = json.dumps({
            'type': 'look_at',
            'target': target
        })
        self.action_pub.publish(action)
        
    def handle_stop(self):
        """Emergency stop."""
        action = String()
        action.data = json.dumps({'type': 'stop'})
        self.action_pub.publish(action)
        self.get_logger().info('STOP command sent!')

def main(args=None):
    rclpy.init(args=args)
    node = VoiceCommandNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Summary

| Component | Role |
|-----------|------|
| **Whisper** | Speech-to-text transcription |
| **VAD** | Detect when user is speaking |
| **Wake word** | "Hey robot" activation |
| **Parser** | Text → structured commands |
| **ROS 2 node** | Integration with robot |

---

## Next Up

Your robot can hear, but it still can't *think*. Next, we'll add cognitive planning with LLMs—breaking complex tasks into executable steps.

**→ [Cognitive Planning with LLMs](/docs/module-4-vla/03-cognitive-planning)**