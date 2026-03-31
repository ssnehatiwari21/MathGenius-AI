# MathGenius AI - Setup Instructions

## Quick Start Guide

### Option 1: Manual Setup (Recommended for Development)

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt --break-system-packages
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Run the backend server**
   ```bash
   python main.py
   ```

   The backend will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

### Option 2: Docker Setup

1. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your API keys
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

4. **Stop services**
   ```bash
   docker-compose down
   ```

## Configuration

### Required Environment Variables

#### Backend (.env)

```env
# LLM Provider (choose one)
LLM_PROVIDER=openai

# API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Database (default is SQLite)
DATABASE_URL=sqlite:///./data/mathgenius.db
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Testing the System

### 1. Test Backend API

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test Problem Solving

```bash
curl -X POST http://localhost:8000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "question": "Solve for x: 2x + 5 = 15",
    "question_type": "algebra"
  }'
```

### 3. Access Frontend

Open browser and navigate to `http://localhost:3000`

## Sample User Workflow

1. **Open the application** at `http://localhost:3000`

2. **Enter a math problem**:
   - "Solve for x: 3x - 7 = 11"
   - "Find the derivative of x^2 + 3x + 2"
   - "Calculate 15% of 200"

3. **Optionally enter your answer** to check if it's correct

4. **Click "Solve Problem"** to get:
   - Step-by-step solution
   - Detailed explanation
   - Feedback on your answer (if provided)
   - Updated skill score
   - Recommendation for next problem

5. **Switch to Analytics tab** to view:
   - Performance trends
   - Topic breakdown
   - Learning insights
   - Study recommendations

## Troubleshooting

### Backend Issues

**Problem**: "Module not found" errors
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt --break-system-packages
```

**Problem**: Database errors
```bash
# Solution: Delete and recreate database
rm backend/data/mathgenius.db
python backend/main.py
```

**Problem**: LLM API errors
```bash
# Solution: Verify API key in .env
# Test with a simple curl:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Frontend Issues

**Problem**: "Cannot connect to backend"
```bash
# Solution: Verify backend is running
curl http://localhost:8000/health

# Check .env.local has correct API URL
cat frontend/.env.local
```

**Problem**: Build errors
```bash
# Solution: Clear cache and rebuild
rm -rf frontend/.next
rm -rf frontend/node_modules
cd frontend && npm install
npm run dev
```

**Problem**: Port already in use
```bash
# Solution: Use different port
npm run dev -- -p 3001
```

## System Requirements

### Minimum Requirements
- **OS**: Linux, macOS, or Windows
- **Python**: 3.9 or higher
- **Node.js**: 18 or higher
- **RAM**: 4GB
- **Storage**: 1GB free space

### Recommended Requirements
- **OS**: Linux or macOS
- **Python**: 3.11
- **Node.js**: 18 LTS
- **RAM**: 8GB
- **Storage**: 2GB free space

## API Keys

### Getting OpenAI API Key

1. Visit https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create new secret key
5. Copy and paste into `.env` file

### Getting Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create new key
5. Copy and paste into `.env` file

## Next Steps

After successful setup:

1. **Explore the demo**: Try different types of math problems
2. **Check analytics**: View your performance metrics
3. **Read documentation**: Review `architecture.md` and `research_novelty.md`
4. **Customize**: Modify components to fit your needs
5. **Contribute**: Submit improvements or bug fixes

## Support

For issues or questions:
- Check `README.md` for comprehensive documentation
- Review `architecture.md` for technical details
- See `research_novelty.md` for research background

## Production Deployment

For production deployment guidance, see:
- `architecture.md` - Scalability section
- `README.md` - Deployment section

Key considerations:
- Migrate from SQLite to PostgreSQL
- Set up proper authentication
- Configure HTTPS
- Set up monitoring and logging
- Implement rate limiting
- Use environment-specific configurations
