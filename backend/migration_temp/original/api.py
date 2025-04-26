from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_anthropic import ChatAnthropic
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import ToolMessage, BaseMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import Command, interrupt
from typing import Annotated
from typing_extensions import TypedDict
from langchain_core.tools import tool, InjectedToolCallId

# Load environment variables
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
    # In the API version, we'll just return a message that verification is needed
    response = f"Verification needed for Name: {name}, Birthday: {birthday}"
    
    state_update = {
        "name": name,
        "birthday": birthday,
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

# FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    thread_id: str = "1"
    name: str = ""
    birthday: str = ""

class ChatResponse(BaseModel):
    response: str
    state_updates: Dict[str, str] = {}

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        
        # Initialize state with user message
        initial_state = {
            "messages": [{"role": "user", "content": request.message}],
            "name": request.name,
            "birthday": request.birthday,
        }
        
        # Process the message through the graph
        events = list(graph.stream(initial_state, config, stream_mode="values"))
        
        # Extract the assistant's response and any state updates
        response = ""
        state_updates = {}
        
        for event in events:
            if "messages" in event and event["messages"]:
                response = event["messages"][-1].content
            if "name" in event and event["name"]:
                state_updates["name"] = event["name"]
            if "birthday" in event and event["birthday"]:
                state_updates["birthday"] = event["birthday"]
        
        return ChatResponse(response=response, state_updates=state_updates)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"} 