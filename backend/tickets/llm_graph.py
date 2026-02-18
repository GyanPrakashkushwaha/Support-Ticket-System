
import os
from typing import TypedDict, Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END


class GraphState(TypedDict):
    description: str
    category: str
    priority: str
    error: bool

class TicketClassification(BaseModel):
    category: Literal["billing", "technical", "account", "general"] = Field(description="The category of the support ticket.")
    priority: Literal["low", "medium", "high", "critical"] = Field(description="The priority level of the support ticket.")

def classify_with_llm(state: GraphState):
    description = state["description"]
    api_key = os.environ.get("LLM_API_KEY")
    
    if not api_key:
        print("Warning: LLM_API_KEY is not set.")
        return {"error": True}

    try:
        # Initialize Gemini 
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            google_api_key=api_key,
            temperature=0.1 
        )
        
        # Force the LLM to reply using our strict Pydantic schema
        structured_llm = llm.with_structured_output(TicketClassification)
        
        # The prompt evaluator will review
        prompt = f"""
        You are an expert IT support dispatcher. 
        Analyze the following user support ticket description and classify it.
        
        Allowed Categories: billing, technical, account, general
        Allowed Priorities: low, medium, high, critical
        
        Ticket Description:
        "{description}"
        """
        
        result = structured_llm.invoke(prompt)
        
        return {
            "category": result.category,
            "priority": result.priority,
            "error": False
        }
        
    except Exception as e:
        print(f"LLM Classification Failed: {e}")
        return {"error": True}


def fallback_classification(state: GraphState):
    return {
        "category": "general",
        "priority": "medium",
        "error": False
    }

def route_after_classification(state: GraphState):
    if state.get("error"):
        return "fallback"
    return "end"

workflow = StateGraph(GraphState)

workflow.add_node("classify", classify_with_llm)
workflow.add_node("fallback", fallback_classification)

workflow.set_entry_point("classify")
workflow.add_conditional_edges(
    "classify",
    route_after_classification,
    {
        "fallback": "fallback",
        "end": END
    }
)
workflow.add_edge("fallback", END)

app = workflow.compile()

def run_ticket_classification(description: str) -> dict:
    initial_state = {"description": description, "category": "", "priority": "", "error": False}
    result = app.invoke(initial_state)
    print('==================================================================')
    print(result)
    print('==================================================================')
    return {
        "suggested_category": result["category"],
        "suggested_priority": result["priority"]
    }
