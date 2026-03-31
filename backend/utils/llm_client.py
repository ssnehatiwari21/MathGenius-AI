"""
LLM Integration Layer - Using Groq (Free API)
"""
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import json
from groq import Groq

load_dotenv()

class LLMClient:
    def __init__(self, provider: str = "groq"):
        self.provider = "groq"
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("Warning: GROQ_API_KEY not set in .env file")
            self.client = None
        else:
            self.client = Groq(api_key=api_key)

    def generate_chat(self, message: str) -> str:
        """Generate a chat response for a math question"""
        if not self.client:
            return "LLM client not configured. Please set GROQ_API_KEY in your .env file."
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are MathGenius AI, an expert math tutor. Help students with math questions clearly and step by step."},
                    {"role": "user", "content": message}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq generation error: {e}")
            return f"Error generating response: {str(e)}"

    def generate_explanation(self, problem: str, solution: str, steps: List[Dict], complexity: str = "medium") -> str:
        """Generate explanation for a solution"""
        if not self.client:
            return "LLM client not configured."
        
        steps_text = "\n".join([
            f"Step {step['step']}: {step['description']} - {step['content']}"
            for step in steps
        ]) if steps else ""

        prompt = f"""You are an expert math tutor. Explain this problem:

Problem: {problem}
Solution: {solution}
Steps: {steps_text}
Explanation style: {complexity}

Provide a clear, educational explanation."""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

    def parse_natural_language_problem(self, problem_text: str) -> Dict:
        """Parse a math problem into structured format"""
        if not self.client:
            return {"success": False, "error": "LLM client not configured."}

        prompt = f"""Analyze this math problem and return ONLY a JSON object with no markdown:
{{
  "problem_type": "algebra|calculus|arithmetic|geometry",
  "difficulty": "easy|medium|hard",
  "key_concepts": [],
  "variables": [],
  "cleaned_expression": ""
}}

Problem: {problem_text}"""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            result = json.loads(raw.strip())
            result["success"] = True
            return result
        except Exception as e:
            return {"success": False, "error": str(e), "problem_type": "unknown"}

    def _generate_fallback_explanation(self, steps: List[Dict]) -> str:
        explanation = "Here's how to solve this problem:\n\n"
        for step in steps:
            explanation += f"{step['step']}. {step['description']}\n"
            explanation += f"   {step['content']}\n\n"
        return explanation