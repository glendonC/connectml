import os
from dotenv import load_dotenv
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_anthropic import ChatAnthropic
from IPython.display import Image, display
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import ToolMessage, BaseMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import Command, interrupt
import json
from langchain_core.tools import tool, InjectedToolCallId

# Load environment variables from .env file
load_dotenv()

# Define the State class
class State(TypedDict):
    messages: Annotated[list, add_messages]

# Create a StateGraph instance
graph_builder = StateGraph(State)

@tool
def human_assistance(
    name: str, birthday: str, tool_call_id: Annotated[str, InjectedToolCallId]
) -> str:
    """Request assistance from a human."""
    print("\n🤖 Bot needs verification:")
    print(f"Name: {name}")
    print(f"Birthday: {birthday}")
    correct = input("Is this correct? (y/n): ").lower()
    
    if correct.startswith("y"):
        verified_name = name
        verified_birthday = birthday
        response = "Correct"
    else:
        verified_name = input("Enter correct name: ")
        verified_birthday = input("Enter correct birthday: ")
        response = f"Made corrections - Name: {verified_name}, Birthday: {verified_birthday}"

    state_update = {
        "name": verified_name,
        "birthday": verified_birthday,
        "messages": [ToolMessage(content=response, tool_call_id=tool_call_id)]
    }
    return Command(update=state_update)

# Initialize tools and LLM
tool = TavilySearchResults(max_results=2)
tools = [tool, human_assistance]
llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    message = llm_with_tools.invoke(state["messages"])
    assert(len(message.tool_calls) <= 1)  # Ensure only one tool call at a time
    return {"messages": [message]}

# Add nodes
graph_builder.add_node("chatbot", chatbot)
tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

# Add edges with conditional routing
graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

# Initialize memory and compile graph
memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)

# Function to handle graph updates with memory
def stream_graph_updates(user_input: str, config: dict):
    events = graph.stream(
        {
            "messages": [{"role": "user", "content": user_input}],
            "name": "",  # Initialize empty name
            "birthday": "",  # Initialize empty birthday
        },
        config,
        stream_mode="values"
    )
    for event in events:
        if "messages" in event and event["messages"]:
            print("\nAssistant:", event["messages"][-1].content)
        # Print state updates if available
        if "name" in event and event["name"]:
            print(f"[State Update] Name: {event['name']}")
        if "birthday" in event and event["birthday"]:
            print(f"[State Update] Birthday: {event['birthday']}")

# Interactive chat loop with memory
config = {"configurable": {"thread_id": "1"}}  # Initialize with thread_id 1

print("Chat started! Type 'quit', 'exit', or 'q' to end the conversation.")
print("Your chat thread ID is: 1")
print("This bot can now store and verify personal information!")

while True:
    try:
        user_input = input("\nUser: ")
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Goodbye!")
            break
        stream_graph_updates(user_input, config)
    except KeyboardInterrupt:
        print("\nGoodbye!")
        break
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        break

# Test the graph with time travel functionality
def test_time_travel():
    print("Starting time travel test...")
    config = {"configurable": {"thread_id": "1"}}
    
    # First interaction
    print("\nFirst interaction:")
    events = graph.stream(
        {
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "I'm learning LangGraph. "
                        "Could you do some research on it for me?"
                    ),
                },
            ],
        },
        config,
        stream_mode="values",
    )
    
    for event in events:
        if "messages" in event:
            print("\nAssistant:", event["messages"][-1].content)

    # Second interaction
    print("\nSecond interaction:")
    events = graph.stream(
        {
            "messages": [
                {
                    "role": "user",
                    "content": (
                        "Ya that's helpful. Maybe I'll "
                        "build an autonomous agent with it!"
                    ),
                },
            ],
        },
        config,
        stream_mode="values",
    )
    
    for event in events:
        if "messages" in event:
            print("\nAssistant:", event["messages"][-1].content)

    # Analyze state history
    print("\nAnalyzing state history...")
    to_replay = None
    print("\nState History Analysis:")
    for state in graph.get_state_history(config):
        print(f"\nNum Messages: {len(state.values['messages'])} Next: {state.next}")
        print("-" * 80)
        if len(state.values["messages"]) == 6:  # Select state with 6 messages
            to_replay = state
            print("Found state to replay!")
    
    if to_replay:
        print("\nSelected State for Replay:")
        print(f"Next node to execute: {to_replay.next}")
        print(f"Config: {to_replay.config}")
        print("\nMessages in selected state:")
        for msg in to_replay.values["messages"]:
            print(f"- {msg.role}: {msg.content[:100]}...")
        
        # Replay from checkpoint
        print("\nReplaying from checkpoint...")
        print(f"Using checkpoint_id: {to_replay.config.get('checkpoint_id', 'Not found')}")
        replay_events = graph.stream(None, to_replay.config, stream_mode="values")
        for event in replay_events:
            if "messages" in event:
                print("\nReplayed Assistant:", event["messages"][-1].content)

if __name__ == "__main__":
    print("Time Travel Test Mode")
    print("====================")
    test_time_travel()
    print("\nTest completed!")