"""
Hybrid Math Solver
SymPy (math solving) + Gemini (explanations)
"""

import sympy as sp
from sympy import symbols, solve, diff, integrate, simplify, factor, limit
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application
)
import google.generativeai as genai
from typing import Dict, List
import re


class MathSolver:

    def __init__(self, gemini_api_key=None):
        self.transformations = standard_transformations + (implicit_multiplication_application,)

        # Configure Gemini
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.model = genai.GenerativeModel("gemini-pro")
        else:
            self.model = None

    # ───────────────────────────────
    # MAIN ENTRY
    # ───────────────────────────────
    def solve_problem(self, problem: str, problem_type: str = "auto") -> Dict:
        try:
            if problem_type == "auto":
                problem_type = self._classify_problem(problem)

            # 👉 Explanation → Gemini
            if problem_type == "explain":
                return self._solve_with_gemini(problem)

            routes = {
                "algebra": self._solve_algebra,
                "calculus": self._solve_calculus,
                "arithmetic": self._solve_arithmetic,
                "geometry": self._solve_geometry,
            }

            return routes.get(problem_type, self._solve_generic)(problem)

        except Exception as e:
            return {"success": False, "error": str(e), "solution": None, "steps": []}

    # ───────────────────────────────
    # SMART CLASSIFIER (FIXED)
    # ───────────────────────────────
    def _classify_problem(self, problem: str) -> str:
        p = problem.lower().strip()

        has_math = bool(re.search(r'[0-9=+\-*/^()]', p))

        explain_kws = [
            "explain", "what is", "define", "describe",
            "why", "how does", "tell me about"
        ]

        if any(k in p for k in explain_kws) and not has_math:
            return "explain"

        if re.search(r'(derivative|integral|d/dx|limit)', p):
            return "calculus"

        if re.search(r'(triangle|circle|area|volume|pythagorean|hypotenuse)', p):
            return "geometry"

        if re.fullmatch(r'[\d\s\+\-\*/\(\)\.%]+', p):
            return "arithmetic"

        if has_math:
            return "algebra"

        return "explain"

    # ───────────────────────────────
    # GEMINI HANDLER
    # ───────────────────────────────
    def _solve_with_gemini(self, problem: str) -> Dict:
        try:
            if not self.model:
                return {
                    "success": False,
                    "error": "Gemini API key not configured",
                    "steps": []
                }

            response = self.model.generate_content(
                f"Explain this clearly in simple steps:\n{problem}"
            )

            return {
                "success": True,
                "problem_type": "explanation",
                "solution": response.text,
                "steps": [
                    {
                        "step": 1,
                        "description": "AI Explanation",
                        "content": response.text,
                        "latex": ""
                    }
                ]
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Gemini error: {str(e)}",
                "steps": []
            }

    # ───────────────────────────────
    # HELPERS
    # ───────────────────────────────
    def _step(self, step, desc, content, latex=""):
        return {
            "step": step,
            "description": desc,
            "content": content,
            "latex": latex
        }

    def _parse(self, expr_str: str):
        expr_str = expr_str.strip().replace("^", "**")
        return parse_expr(expr_str, transformations=self.transformations)

    def _clean_expression(self, text: str) -> str:
        for phrase in ["solve", "find", "calculate", "compute", "simplify", "factor"]:
            text = re.sub(rf'\b{phrase}\b', '', text, flags=re.IGNORECASE)
        return re.sub(r'[?!;]', '', text).strip()

    def _extract_math_expr(self, text: str) -> str:
        text = text.replace("^", "**")

        match = re.search(r'[=:]\s*(.+)', text)
        if match:
            return match.group(1).strip()

        phrases = [
            "derivative of", "integral of", "differentiate",
            "integrate", "find", "calculate", "what is"
        ]

        for p in phrases:
            text = re.sub(p, '', text, flags=re.IGNORECASE)

        return re.sub(r'[?!;]', '', text).strip()

    # ───────────────────────────────
    # ALGEBRA
    # ───────────────────────────────
    def _solve_algebra(self, problem: str) -> Dict:
        steps = []
        try:
            raw = self._clean_expression(problem)
            steps.append(self._step(1, "Expression", raw))

            if "=" in raw:
                lhs, rhs = raw.split("=")
                eq = sp.Eq(self._parse(lhs), self._parse(rhs))

                steps.append(self._step(2, "Equation", str(eq), sp.latex(eq)))

                variables = list(eq.free_symbols)
                solutions = solve(eq, variables)

                steps.append(self._step(3, "Solve", str(solutions), sp.latex(solutions)))

                return {
                    "success": True,
                    "problem_type": "algebra",
                    "solution": str(solutions),
                    "latex_solution": sp.latex(solutions),
                    "steps": steps
                }

            expr = self._parse(raw)
            result = factor(expr)

            if result == expr:
                result = simplify(expr)

            steps.append(self._step(2, "Simplify", str(result), sp.latex(result)))

            return {
                "success": True,
                "problem_type": "algebra",
                "solution": str(result),
                "latex_solution": sp.latex(result),
                "steps": steps
            }

        except Exception as e:
            return {"success": False, "error": str(e), "steps": steps}

    # ───────────────────────────────
    # CALCULUS
    # ───────────────────────────────
    def _solve_calculus(self, problem: str) -> Dict:
        p = problem.lower()
        steps = []

        try:
            if "limit" in p:
                return self._limit(problem, steps)

            if any(k in p for k in ["derivative", "differentiate", "d/dx"]):
                return self._derivative(problem, steps)

            if any(k in p for k in ["integral", "integrate"]):
                return self._integral(problem, steps)

            return {"success": False, "error": "Unknown calculus type", "steps": steps}

        except Exception as e:
            return {"success": False, "error": str(e), "steps": steps}

    def _derivative(self, problem: str, steps: List) -> Dict:
        x = symbols('x')
        fn_str = self._extract_math_expr(problem)
        fn = self._parse(fn_str)

        steps.append(self._step(1, "Function", f"f(x) = {fn_str}", sp.latex(fn)))
        result = simplify(diff(fn, x))

        steps.append(self._step(2, "Differentiate", str(result), sp.latex(result)))

        return {"success": True, "solution": str(result), "steps": steps}

    def _integral(self, problem: str, steps: List) -> Dict:
        x = symbols('x')
        fn_str = self._extract_math_expr(problem)
        fn = self._parse(fn_str)

        steps.append(self._step(1, "Integral", f"∫ {fn_str} dx", sp.latex(fn)))
        result = integrate(fn, x)

        steps.append(self._step(2, "Integrate", str(result) + " + C", sp.latex(result)))

        return {"success": True, "solution": str(result) + " + C", "steps": steps}

    def _limit(self, problem: str, steps: List) -> Dict:
        x = symbols('x')
        expr_str = self._extract_math_expr(problem)
        expr = self._parse(expr_str)

        steps.append(self._step(1, "Expression", expr_str, sp.latex(expr)))
        result = limit(expr, x, 0)

        steps.append(self._step(2, "Limit Result", str(result), sp.latex(result)))

        return {"success": True, "solution": str(result), "steps": steps}

    # ───────────────────────────────
    # ARITHMETIC
    # ───────────────────────────────
    def _solve_arithmetic(self, problem: str) -> Dict:
        steps = []
        try:
            expr = self._parse(problem)

            steps.append(self._step(1, "Expression", str(expr), sp.latex(expr)))
            result = sp.N(expr)

            steps.append(self._step(2, "Evaluate", str(result), sp.latex(result)))

            return {"success": True, "solution": str(result), "steps": steps}

        except Exception as e:
            return {"success": False, "error": str(e), "steps": steps}

    # ───────────────────────────────
    # GEOMETRY
    # ───────────────────────────────
    def _solve_geometry(self, problem: str) -> Dict:
        p = problem.lower()
        steps = []
        numbers = list(map(float, re.findall(r'\d+\.?\d*', problem)))

        try:
            if "circle" in p and "area" in p:
                r = numbers[0]
                area = 3.1416 * r * r

                steps = [
                    self._step(1, "Formula", "A = πr²"),
                    self._step(2, "Substitute", f"A = π × {r}²"),
                    self._step(3, "Result", str(area))
                ]
                return {"success": True, "solution": str(area), "steps": steps}

            if "triangle" in p and "area" in p:
                b, h = numbers[:2]
                area = 0.5 * b * h

                steps = [
                    self._step(1, "Formula", "A = ½bh"),
                    self._step(2, "Substitute", f"A = ½ × {b} × {h}"),
                    self._step(3, "Result", str(area))
                ]
                return {"success": True, "solution": str(area), "steps": steps}

            if "hypotenuse" in p:
                a, b = numbers[:2]
                c = (a**2 + b**2) ** 0.5

                steps = [
                    self._step(1, "Formula", "c² = a² + b²"),
                    self._step(2, "Substitute", f"{a}² + {b}²"),
                    self._step(3, "Result", str(c))
                ]
                return {"success": True, "solution": str(c), "steps": steps}

            return self._solve_with_gemini(problem)

        except Exception as e:
            return {"success": False, "error": str(e), "steps": steps}

    # ───────────────────────────────
    # GENERIC
    # ───────────────────────────────
    def _solve_generic(self, problem: str) -> Dict:
        try:
            expr = self._parse(problem)
            result = simplify(expr)

            return {
                "success": True,
                "solution": str(result),
                "steps": [self._step(1, "Simplify", str(result))]
            }

        except Exception as e:
            return {"success": False, "error": str(e), "steps": []}