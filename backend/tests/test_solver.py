"""
Basic tests for MathGenius AI backend
"""
import pytest
from solver import MathSolver

class TestMathSolver:
    """Test the mathematical solver"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.solver = MathSolver()
    
    def test_simple_algebra(self):
        """Test solving simple algebraic equation"""
        result = self.solver.solve_problem("2x + 5 = 15", "algebra")
        
        assert result["success"] == True
        assert "solution" in result
        assert len(result["steps"]) > 0
    
    def test_arithmetic(self):
        """Test arithmetic calculation"""
        result = self.solver.solve_problem("10 + 5 * 2", "arithmetic")
        
        assert result["success"] == True
        assert result["solution"] == "20"
    
    def test_problem_classification(self):
        """Test automatic problem type classification"""
        # Test algebra classification
        algebra_type = self.solver._classify_problem("solve x + 5 = 10")
        assert algebra_type == "algebra"
        
        # Test calculus classification
        calculus_type = self.solver._classify_problem("find derivative of x^2")
        assert calculus_type == "calculus"
        
        # Test arithmetic classification
        arithmetic_type = self.solver._classify_problem("5 + 10 - 3")
        assert arithmetic_type == "arithmetic"

class TestStudentModel:
    """Test student profiling functionality"""
    
    def test_skill_score_bounds(self):
        """Test that skill scores stay within 0-100 bounds"""
        # This would require database setup
        # Placeholder for actual implementation
        pass
    
    def test_difficulty_assignment(self):
        """Test automatic difficulty level assignment"""
        # Placeholder for actual implementation
        pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
