"""
Module 4: Agent Router.
Central orchestrator: detects intent, routes to one or more specialized agents,
aggregates their responses into a single final answer.
"""

from agents.intent_detector import detect_intent
from agents.sentiment import analyze_sentiment, should_escalate
from agents.billing import BillingAgent
from agents.technical import TechnicalAgent
from agents.product import ProductAgent
from agents.complaint import ComplaintAgent
from agents.faq import FAQAgent
from agents.llm_client import chat_completion

# Map intent labels -> agent instances
_AGENT_MAP = {
    "billing": BillingAgent(),
    "refund": BillingAgent(),
    "product": ProductAgent(),
    "technical": TechnicalAgent(),
    "complaint": ComplaintAgent(),
    "general_faq": FAQAgent(),
}

AGGREGATOR_SYSTEM_PROMPT = """You are the Response Aggregator for a multi-agent customer support system.
You will be given draft responses from one or more specialized agents that each addressed part of the
customer's query. Combine them into a single, natural, non-repetitive reply as if one support agent
were speaking. Keep it concise and friendly. Do not mention "agents" or the aggregation process to the
customer."""


def route_query(message: str, history_text: str = "") -> dict:
    """
    Full pipeline: intent detection -> sentiment -> invoke agent(s) -> aggregate -> return result dict.
    """
    intents = detect_intent(message)
    sentiment = analyze_sentiment(message)
    escalate = should_escalate(sentiment, intents)

    # Deduplicate agents (billing + refund both map to BillingAgent, avoid calling twice)
    seen_agent_names = set()
    agents_to_call = []
    for intent in intents:
        agent = _AGENT_MAP.get(intent, _AGENT_MAP["general_faq"])
        if agent.name not in seen_agent_names:
            agents_to_call.append(agent)
            seen_agent_names.add(agent.name)

    draft_responses = []
    all_sources = []
    for agent in agents_to_call:
        answer, sources = agent.respond(message, history_text)
        draft_responses.append(f"[{agent.name} agent]: {answer}")
        all_sources.extend(sources)

    if len(draft_responses) == 1:
        final_reply = draft_responses[0].split("]: ", 1)[1]
    else:
        combined = "\n\n".join(draft_responses)
        final_reply = chat_completion(AGGREGATOR_SYSTEM_PROMPT, combined)

    if escalate:
        final_reply += "\n\nI'm also connecting you with a human support specialist to make sure this gets resolved quickly."

        

    return {
        "reply": final_reply,
        "agents_invoked": [a.name for a in agents_to_call],
        "sentiment": sentiment,
        "escalated": escalate,
        "sources": all_sources,
    }
