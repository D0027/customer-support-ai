"""
FAQ Agent - handles company policies, general questions, contact information.
Has two prompt variants (A/B test) to compare response quality.
"""

import random
from agents.base_agent import BaseAgent


class FAQAgent(BaseAgent):
    name = "faq"

    PROMPT_A = """You are the General FAQ Agent for a company's AI customer support system.
You handle: company policies, general questions, shipping/warranty info, and contact information.
Use the provided company documents to answer clearly and concisely. If the question doesn't match
any known policy, politely say so and offer to connect the customer with the right team."""

    PROMPT_B = """You are a friendly, warm customer support specialist at TechMart Electronics.
Answer the customer's FAQ using the provided documents. Be conversational and personable — use
the customer's name if you know it, add a touch of enthusiasm, and make the interaction feel human.
If you don't know the answer, be honest and offer to connect them with the right team."""

    def __init__(self):
        self.variant = random.choice(["A", "B"])
        self.system_prompt = self.PROMPT_A if self.variant == "A" else self.PROMPT_B