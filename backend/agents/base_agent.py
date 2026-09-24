"""
Base agent: combines RAG-retrieved context with an agent-specific
system prompt to generate a grounded response.
"""

from vectorstore.store import retrieve
from agents.llm_client import chat_completion


class BaseAgent:
    name: str = "general"
    system_prompt: str = "You are a helpful customer support assistant."

    def build_context(self, query: str) -> tuple[str, list[dict]]:
        chunks = retrieve(query)
        if not chunks:
            return "", []
        context_text = "\n\n".join(f"[{c['source']}]: {c['text']}" for c in chunks)
        return context_text, chunks

    def respond(self, query: str, history_text: str = "") -> tuple[str, list[dict]]:
        context, sources = self.build_context(query)

        prompt_parts = []
        if history_text:
            prompt_parts.append(f"Conversation so far:\n{history_text}")
        if context:
            prompt_parts.append(f"Relevant company documents:\n{context}")
        prompt_parts.append(f"Customer question:\n{query}")

        user_prompt = "\n\n".join(prompt_parts)
        answer = chat_completion(self.system_prompt, user_prompt)
        return answer, sources
