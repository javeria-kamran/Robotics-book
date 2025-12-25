---
description: Use Large Language Models to break down complex tasks into executable
  robot actions. LangChain, GPT-4, and the art of prompt engineering for robotics.
id: vla-cognitive-planning
keywords:
- LLM
- GPT-4
- Claude
- LangChain
- task planning
- prompt engineering
- cognitive robotics
module: 4
sidebar_position: 3
tags:
- module-4
- hands-on
- advanced
title: Cognitive Planning with LLMs
---

# LLMs کے ساتھ کاگنیٹو پلاننگ

> **TL;DR:** "مجھے ایک سینڈوچ بنا دو" روایتی روبوٹکس کے لیے ایک ڈراؤنا خواب ہے—اس میں بہت سے ضمنی اقدامات شامل ہیں۔ LLMs اسے ان حصوں میں تقسیم کر سکتے ہیں: (1) کچن میں جاؤ، (2) فریج کھولو، (3) روٹی لو... اور اسی طرح۔ یہ سیکشن GPT-4/Claude/LLaMA کو روبوٹ کی کاگنیٹو لیئر کے طور پر استعمال کرنے کا احاطہ کرتا ہے۔

---

## ڈی کمپوزیشن کا مسئلہ

روایتی روبوٹکس کو واضح پروگرامنگ کی ضرورت ہوتی ہے:

```python
# Old way: 500 lines for each task
def make_sandwich():
    navigate_to(kitchen)
    open(fridge)
    grab(bread)
    close(fridge)
    # ... 50 more steps
```

**مسئلہ**: حقیقی دنیا کے کاموں میں لامحدود تغیرات ہوتے ہیں۔

**حل**: ایک LLM کو اقدامات کا پتہ لگانے دیں۔

---

## LLMs بطور ٹاسک پلانرز

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  USER: "Make me a coffee"                                       │
│                                                                  │
│          ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      LLM PLANNER                          │   │
│  │                                                           │   │
│  │  "Given the user wants coffee and you are a humanoid     │   │
│  │   robot with the following capabilities: [nav, grasp...] │   │
│  │   Generate a step-by-step plan."                          │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│          ▼                                                       │
│  OUTPUT:                                                         │
│    1. Navigate to kitchen                                        │
│    2. Locate coffee machine                                      │
│    3. Check if water reservoir is filled                        │
│    4. If not, fill water reservoir                              │
│    5. Place cup under spout                                      │
│    6. Press brew button                                          │
│    7. Wait for brewing to complete                              │
│    8. Grasp cup                                                  │
│    9. Navigate to user location                                  │
│   10. Extend arm to hand over cup                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## سیٹ اپ

### آپشن 1: OpenAI API

```bash
pip install openai langchain langchain-openai
```

```python
import os
os.environ["OPENAI_API_KEY"] = "sk-..."
```

### آپشن 2: Anthropic Claude

```bash
pip install anthropic langchain-anthropic
```

```python
os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."
```

### آپشن 3: لوکل LLM (Ollama)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.1:8b
```

```bash
pip install langchain-ollama
```

---

## بنیادی ٹاسک ڈی کمپوزیشن

```python
#!/usr/bin/env python3
"""
task_decomposer.py
Break down high-level commands into robot actions.
"""

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List

# Define output structure
class RobotAction(BaseModel):
    action: str = Field(description="The action type: navigate, grasp, place, look, wait, speak")
    target: str = Field(description="The target of the action")
    parameters: dict = Field(default={}, description="Additional parameters")

class TaskPlan(BaseModel):
    task: str = Field(description="The original task")
    steps: List[RobotAction] = Field(description="List of actions to complete the task")
    success_criteria: str = Field(description="How to verify task completion")

# Create parser
parser = PydanticOutputParser(pydantic_object=TaskPlan)

# Define the prompt
SYSTEM_PROMPT = """You are a task planner for a humanoid robot.

The robot has the following capabilities:
- navigate(location): Move to a named location
- grasp(object): Pick up an object
- place(object, location): Put an object somewhere
- look(target): Turn head to look at something
- wait(seconds): Wait for a duration
- speak(message): Say something to the user

Given a high-level task, break it down into a sequence of these primitive actions.
Be specific about object names and locations.
Consider failure modes and include verification steps.

{format_instructions}
"""

USER_PROMPT = """
Task: {task}

Current context:
- Robot location: {robot_location}
- Known objects: {known_objects}
- Known locations: {known_locations}

Generate a step-by-step plan.
"""

class TaskDecomposer:
    def __init__(self, model_name="gpt-4"):
        self.llm = ChatOpenAI(model=model_name, temperature=0)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("user", USER_PROMPT)
        ])
        
        self.chain = self.prompt | self.llm | parser
    
    def decompose(self, task: str, context: dict) -> TaskPlan:
        """Decompose a task into robot actions."""
        result = self.chain.invoke({
            "task": task,
            "robot_location": context.get("robot_location", "unknown"),
            "known_objects": ", ".join(context.get("known_objects", [])),
            "known_locations": ", ".join(context.get("known_locations", [])),
            "format_instructions": parser.get_format_instructions()
        })
        return result

# Usage
if __name__ == "__main__":
    decomposer = TaskDecomposer()
    
    context = {
        "robot_location": "living room",
        "known_objects": ["red cup", "water bottle", "remote control"],
        "known_locations": ["kitchen", "living room", "bedroom", "bathroom"]
    }
    
    plan = decomposer.decompose("Bring me the water bottle", context)
    
    print(f"Task: {plan.task}")
    print(f"\nSteps:")
    for i, step in enumerate(plan.steps, 1):
        print(f"  {i}. {step.action}({step.target})")
    print(f"\nSuccess: {plan.success_criteria}")
```

Output:
```
Task: Bring me the water bottle

Steps:
  1. look(water bottle)
  2. navigate(water bottle location)
  3. grasp(water bottle)
  4. navigate(living room)
  5. speak(Here is your water bottle)
  6. place(water bottle, user's hand)

Success: User has received the water bottle
```

---

## ورلڈ اسٹیٹ شامل کرنا

LLM کو یہ جاننے کی ضرورت ہے کہ کیا ہو رہا ہے:

```python
class WorldState:
    """Maintains robot's understanding of the world."""
    
    def __init__(self):
        self.robot_location = "unknown"
        self.robot_holding = None
        self.objects = {}  # name -> location
        self.locations = set()
        
    def update_from_perception(self, perception_data):
        """Update state from sensor data."""
        for obj in perception_data.get("detected_objects", []):
            self.objects[obj["name"]] = obj["position"]
    
    def to_context(self):
        """Convert to LLM context."""
        return {
            "robot_location": self.robot_location,
            "robot_holding": self.robot_holding or "nothing",
            "known_objects": list(self.objects.keys()),
            "known_locations": list(self.locations),
            "object_locations": self.objects
        }
```

---

## ReAct پیٹرن: ریزننگ + ایکٹنگ

ReAct پیٹرن سوچنے اور کرنے کو آپس میں جوڑتا ہے:

```python
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool

# Define robot tools
def navigate_tool(location: str) -> str:
    """Navigate to a location."""
    # In real implementation, call ROS 2 action
    return f"Navigated to {location}"

def look_tool(target: str) -> str:
    """Look at a target."""
    # Call head controller
    return f"Looking at {target}. Detected: [object list]"

def grasp_tool(obj: str) -> str:
    """Grasp an object."""
    # Call manipulation action
    return f"Grasped {obj}"

tools = [
    Tool(name="navigate", func=navigate_tool, description="Move to a location"),
    Tool(name="look", func=look_tool, description="Look at something"),
    Tool(name="grasp", func=grasp_tool, description="Pick up an object"),
]

REACT_PROMPT = """You are a humanoid robot assistant.

You have access to the following tools:
{tools}

Use this format:
Thought: What do I need to do next?
Action: tool_name
Action Input: input
Observation: result of action
... (repeat as needed)
Thought: I have completed the task
Final Answer: summary of what was done

Task: {input}
{agent_scratchpad}
"""

from langchain.prompts import PromptTemplate

prompt = PromptTemplate.from_template(REACT_PROMPT)
llm = ChatOpenAI(model="gpt-4", temperature=0)

agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run
result = executor.invoke({"input": "Find the red cup and bring it to me"})
```

---

## ROS 2 انٹیگریشن

### پلانر نوڈ

```python
#!/usr/bin/env python3
"""
llm_planner_node.py
ROS 2 node for LLM-based task planning.
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
import json

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

class LLMPlannerNode(Node):
    def __init__(self):
        super().__init__('llm_planner')
        
        # Parameters
        self.declare_parameter('model', 'gpt-4')
        self.declare_parameter('temperature', 0.0)
        
        model = self.get_parameter('model').value
        temp = self.get_parameter('temperature').value
        
        # Initialize LLM
        self.llm = ChatOpenAI(model=model, temperature=temp)
        
        # Subscribers
        self.command_sub = self.create_subscription(
            String, '/voice_command', self.command_callback, 10
        )
        
        self.world_state_sub = self.create_subscription(
            String, '/world_state', self.world_state_callback, 10
        )
        
        # Publishers
        self.plan_pub = self.create_publisher(String, '/task_plan', 10)
        self.action_pub = self.create_publisher(String, '/execute_action', 10)
        
        # State
        self.world_state = {}
        
        self.get_logger().info('LLM Planner ready!')
    
    def world_state_callback(self, msg):
        """Update world state from perception."""
        self.world_state = json.loads(msg.data)
    
    def command_callback(self, msg):
        """Process incoming command."""
        task = msg.data
        self.get_logger().info(f'Planning: {task}')
        
        # Generate plan
        plan = self.generate_plan(task)
        
        # Publish plan
        plan_msg = String()
        plan_msg.data = json.dumps(plan)
        self.plan_pub.publish(plan_msg)
        
        # Execute steps
        for step in plan['steps']:
            action_msg = String()
            action_msg.data = json.dumps(step)
            self.action_pub.publish(action_msg)
            self.get_logger().info(f'Action: {step["action"]}({step["target"]})')
    
    def generate_plan(self, task):
        """Generate task plan using LLM."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a robot task planner.
Output a JSON object with this structure:
{
  "task": "original task",
  "steps": [
    {"action": "navigate|grasp|place|look|wait|speak", "target": "...", "params": {}}
  ]
}

Available actions:
- navigate: go to location
- grasp: pick up object
- place: put object at location
- look: look at target
- wait: pause for seconds
- speak: say message

Robot state: """ + json.dumps(self.world_state)),
            ("user", task)
        ])
        
        response = self.llm.invoke(prompt.format_messages())
        
        # Parse JSON from response
        try:
            plan = json.loads(response.content)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if match:
                plan = json.loads(match.group())
            else:
                plan = {"task": task, "steps": [], "error": "Failed to parse"}
        
        return plan

def main(args=None):
    rclpy.init(args=args)
    node = LLMPlannerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## ناکامیوں کو سنبھالنا

LLMs ریکوری میں مدد کر سکتے ہیں:

```python
RECOVERY_PROMPT = """
The robot attempted: {action}
It failed with error: {error}
Current state: {state}

Suggest a recovery strategy. Options:
1. Retry the action
2. Try alternative approach
3. Ask user for help
4. Abort task

Respond with JSON:
{
  "strategy": "retry|alternative|ask_help|abort",
  "new_action": {...} or null,
  "message": "explanation"
}
"""

class FailureRecovery:
    def __init__(self, llm):
        self.llm = llm
        
    def handle_failure(self, action, error, state):
        """Get LLM to suggest recovery."""
        prompt = RECOVERY_PROMPT.format(
            action=json.dumps(action),
            error=error,
            state=json.dumps(state)
        )
        
        response = self.llm.invoke(prompt)
        return json.loads(response.content)
```

---

## پرامپٹ انجینئرنگ کے نکات

### 1. صلاحیتوں کے بارے میں واضح رہیں

```
❌ Bad: "You can control a robot"
✅ Good: "You can: navigate(loc), grasp(obj), place(obj, loc), speak(msg)"
```

### 2. سیاق و سباق فراہم کریں

```
❌ Bad: "Pick up the cup"
✅ Good: "Robot is in kitchen. Objects visible: [red cup on counter, blue mug in sink]. Pick up the cup."
```

### 3. آؤٹ پٹ فارمیٹ کو محدود کریں

```python
# Use Pydantic models or explicit JSON schemas
output_schema = {
    "type": "object",
    "properties": {
        "action": {"enum": ["navigate", "grasp", "place"]},
        "target": {"type": "string"}
    }
}
```

### 4. فیو-شاٹ مثالیں

```
Example 1:
Task: "Get me water"
Plan: 
1. navigate(kitchen)
2. look(water bottle)
3. grasp(water bottle)
4. navigate(user)
5. place(water bottle, user_hand)

Now plan this task: ...
```

---

## لوکل LLM آپشن

انٹرنیٹ کے بغیر ایج ڈیپلائمنٹ کے لیے:

```python
from langchain_ollama import OllamaLLM

class LocalPlanner:
    def __init__(self, model="llama3.1:8b"):
        self.llm = OllamaLLM(model=model)
        
    def plan(self, task, context):
        prompt = f"""You are a robot planner.
Context: {context}
Task: {task}
Output only a JSON plan."""
        
        return self.llm.invoke(prompt)
```

---

## آرکیٹیکچر کا خلاصہ

```
┌─────────────────────────────────────────────────────────────────┐
│                      COGNITIVE LAYER                             │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Speech     │    "Make me coffee"                           │
│  │  (Whisper)   │─────────────────┐                             │
│  └──────────────┘                 │                             │
│                                   ▼                             │
│                          ┌────────────────┐                     │
│                          │  LLM Planner   │                     │
│  ┌──────────────┐       │  (GPT-4/Local) │                     │
│  │ World State  │──────▶│                │                     │
│  └──────────────┘       └───────┬────────┘                     │
│                                 │                               │
│                    ┌────────────┼────────────┐                 │
│                    ▼            ▼            ▼                 │
│              ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│              │navigate │  │ grasp   │  │ speak   │            │
│              └────┬────┘  └────┬────┘  └────┬────┘            │
│                   │            │            │                   │
└───────────────────┼────────────┼────────────┼───────────────────┘
                    │            │            │
                    ▼            ▼            ▼
              ┌─────────────────────────────────────┐
              │           ROS 2 ACTIONS             │
              │  Nav2, MoveIt, Audio playback       │
              └─────────────────────────────────────┘
```

---

## خلاصہ

| کمپوننٹ | مقصد |
|-----------|---------|
| **LLM** | ٹاسک ڈی کمپوزیشن اور ریزننگ |
| **World State** | سیاق و سباق سے آگاہی |
| **ReAct** | سوچنے اور عمل کرنے کا باہمی ربط |
| **Recovery** | ناکامیوں کو خوبصورتی سے سنبھالنا |
| **ROS 2 Node** | روبوٹ سسٹمز کے ساتھ انٹیگریشن |

---

## آگے کیا ہے

آپ کے پاس آنکھیں، کان اور دماغ ہیں۔ اب آئیے اسے حتمی کیپ اسٹون میں ایک ساتھ رکھتے ہیں: ایک خود مختار ہیومنائیڈ جو کمانڈز کو سمجھ سکتا ہے، اپنے ماحول کو محسوس کر سکتا ہے، کاموں کی منصوبہ بندی کر سکتا ہے اور اقدامات کو انجام دے سکتا ہے۔

**→ [کیپ اسٹون: خود مختار ہیومنائیڈ](/docs/module-4-vla/04-capstone-project)**