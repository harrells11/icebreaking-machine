# 🤖 Live AI Mode Setup Guide
## Complete Guide to Enabling Real AI Generation

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting API Keys](#getting-api-keys)
4. [Deployment Instructions](#deployment-instructions)
5. [Enabling Live AI Mode](#enabling-live-ai-mode)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## Overview

The Icebreaking Machine includes a **Live AI Mode** that uses real AI models (Anthropic Claude or OpenAI GPT) to generate personalized icebreakers. This guide will walk you through setting it up.

### Key Features:
- ✅ Secure API key management (server-side only)
- ✅ Automatic fallback to simulation on errors
- ✅ Support for Anthropic Claude and OpenAI GPT
- ✅ Rate limiting to prevent API overuse
- ✅ Customizable AI parameters (temperature, max tokens)

### Architecture:
```
Frontend (Browser) → Serverless Function → AI Provider API
                    ↑
                    API keys stored here (secure)
```

**API keys are NEVER exposed to the browser or client code.**

---

## Prerequisites

Before you begin, you'll need:

1. **Hosting Platform Account** (choose one):
   - [Vercel](https://vercel.com) (Recommended)
   - [Netlify](https://netlify.com)

2. **AI Provider Account** (choose one or both):
   - [Anthropic](https://console.anthropic.com) for Claude models
   - [OpenAI](https://platform.openai.com) for GPT models

3. **Credit Card** (required for AI providers):
   - Both Anthropic and OpenAI require payment information
   - Usage-based pricing (typically $0.01 - $0.10 per generation)

---

## Getting API Keys

### Option 1: Anthropic Claude (Recommended)

1. **Sign up** at [console.anthropic.com](https://console.anthropic.com/)
2. **Add payment method** in Account Settings
3. **Create API Key**:
   - Navigate to "API Keys" section
   - Click "Create Key"
   - Give it a name (e.g., "Icebreaking Machine")
   - Copy the key (starts with `sk-ant-...`)
   - ⚠️ **Save it immediately - you can only see it once!**

**Recommended Model:** `claude-3-5-sonnet-20241022`

### Option 2: OpenAI GPT

1. **Sign up** at [platform.openai.com](https://platform.openai.com/signup)
2. **Add payment method** in Billing settings
3. **Create API Key**:
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Name it (e.g., "Icebreaking Machine")
   - Copy the key (starts with `sk-proj-...` or `sk-...`)
   - ⚠️ **Save it immediately - you can only see it once!**

**Recommended Models:** `gpt-4` or `gpt-3.5-turbo`

---

## Deployment Instructions

### Vercel Deployment (Recommended)

#### 1. Deploy Your Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts
```

Or use the Vercel dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click "Deploy"

#### 2. Add Environment Variables

**Via Vercel Dashboard:**
1. Go to your project at `vercel.com/<username>/<project>`
2. Click "Settings" → "Environment Variables"
3. Add your keys:
   ```
   Key: ANTHROPIC_API_KEY
   Value: sk-ant-your-actual-key-here
   Environments: ✅ Production ✅ Preview ✅ Development
   
   Key: OPENAI_API_KEY
   Value: sk-proj-your-actual-key-here
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
4. Click "Save"
5. **Redeploy** your project (required for changes to take effect)

**Via CLI:**
```bash
# Add Anthropic key
vercel env add ANTHROPIC_API_KEY

# Add OpenAI key
vercel env add OPENAI_API_KEY

# Redeploy
vercel --prod
```

#### 3. Verify Endpoint

Your serverless function should be available at:
```
https://your-project.vercel.app/api/generate
```

---

### Netlify Deployment

#### 1. Deploy Your Project

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
netlify init

# Deploy
netlify deploy --prod
```

Or use the Netlify dashboard:
1. Go to [app.netlify.com/start](https://app.netlify.com/start)
2. Connect your GitHub repository
3. Click "Deploy site"

#### 2. Add Environment Variables

**Via Netlify Dashboard:**
1. Go to Site settings → "Environment variables"
2. Click "Add a variable"
3. Add your keys:
   ```
   Key: ANTHROPIC_API_KEY
   Value: sk-ant-your-actual-key-here
   
   Key: OPENAI_API_KEY
   Value: sk-proj-your-actual-key-here
   ```
4. Click "Save"
5. **Trigger redeploy** from Deploys tab

**Via CLI:**
```bash
netlify env:set ANTHROPIC_API_KEY "sk-ant-your-key-here"
netlify env:set OPENAI_API_KEY "sk-proj-your-key-here"
```

#### 3. Verify Endpoint

Your serverless function should be available at:
```
https://your-site.netlify.app/.netlify/functions/generate
```

---

## Enabling Live AI Mode

Once deployed, enable Live AI in your application:

### 1. Navigate to Settings

1. Open your deployed Icebreaking Machine
2. Click "Settings" in the sidebar
3. Go to "AI Prompts" tab

### 2. Configure Live AI

1. **Check "Use Live AI Generation"**
2. **Select Provider:**
   - Choose "Anthropic (Claude)" or "OpenAI (GPT)"
3. **Set Model:**
   - For Anthropic: `claude-3-5-sonnet-20241022` (recommended)
   - For OpenAI: `gpt-4` or `gpt-3.5-turbo`
4. **Adjust Parameters** (optional):
   - Temperature: `0.2` (default, range 0.0 - 1.0)
   - Max Tokens: `300` (default, range 50 - 1000)
5. **Click "Save Settings"**

### 3. Test Generation

1. Go to "Research Engine"
2. Select a contact with approved research
3. Click "Generate Icebreakers"
4. You should see "(Live AI)" in the toast notification
5. Generation takes 5-15 seconds (real API call)

---

## Testing

### Test the Endpoint Directly

**Using curl:**
```bash
# Test Anthropic
curl -X POST https://your-project.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.2,
    "max_tokens": 300,
    "prompt": "Write 2 icebreakers for a CRE professional"
  }'

# Test OpenAI
curl -X POST https://your-project.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.2,
    "max_tokens": 300,
    "prompt": "Write 2 icebreakers for a CRE professional"
  }'
```

**Expected Response:**
```json
{
  "text": "A: Your recent LinkedIn post about...\nB: I noticed your company just...",
  "usage": { "input_tokens": 50, "output_tokens": 120 },
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Browser Console Testing

Open browser DevTools (F12) and run:

```javascript
// Check if endpoint is reachable
await testAIEndpoint()

// Get AI status
await getAIStatus()

// Validate settings
validateAISettings()
```

---

## Troubleshooting

### Problem: "Server configuration error"

**Cause:** API key not set or incorrectly formatted

**Solution:**
1. Verify environment variable name is exact:
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
2. Check for extra spaces or quotes
3. Redeploy after adding environment variables
4. For Vercel: Run `vercel env pull` to verify

### Problem: "Generation failed. Using simulation fallback"

**Possible Causes:**

1. **Network/Timeout**
   - Solution: Try again - temporary issue

2. **Invalid API Key**
   - Check key format: `sk-ant-...` or `sk-proj-...`
   - Regenerate key if necessary

3. **Insufficient Credits**
   - Add payment method to your AI provider account
   - Check billing dashboard for usage limits

4. **Rate Limiting**
   - Anthropic: 50 requests/minute (Tier 1)
   - OpenAI: Varies by account tier
   - Solution: Use batch generation with queue (automatic)

### Problem: "Prompt too long"

**Cause:** Prompt exceeds 10,000 character limit

**Solution:**
1. Shorten custom prompt templates
2. Reduce activity summary length
3. Remove unnecessary placeholders

### Problem: Generations work but are poor quality

**Solutions:**
1. Adjust temperature (lower = more focused)
2. Customize prompts in Settings → AI Prompts
3. Add banned/approved phrases for guidance
4. Increase max_tokens if responses are cut off

### Problem: High API costs

**Solutions:**
1. Use Claude 3.5 Haiku (cheaper than Sonnet)
2. Use GPT-3.5-turbo (cheaper than GPT-4)
3. Reduce max_tokens to 200
4. Use simulation mode for testing
5. Set daily spending limits in provider dashboard

---

## Security Best Practices

### ✅ DO:

- ✅ Keep API keys in environment variables
- ✅ Use separate keys for development and production
- ✅ Monitor API usage regularly
- ✅ Set spending limits on AI provider accounts
- ✅ Rotate API keys periodically (every 90 days)
- ✅ Use `.env.example` for documentation

### ❌ DON'T:

- ❌ Never commit `.env` files to Git
- ❌ Never expose API keys in client JavaScript
- ❌ Never log API keys in console or error messages
- ❌ Never share API keys via email or messaging
- ❌ Never use production keys for development
- ❌ Never hard-code API keys in source files

### .gitignore Configuration

Make sure your `.gitignore` includes:
```
.env
.env.local
.env.*.local
.vercel
.netlify
```

---

## Cost Estimates

### Typical Usage Costs (as of 2025)

**Anthropic Claude 3.5 Sonnet:**
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens
- **Per icebreaker:** ~$0.005 - $0.02 (½ cent to 2 cents)
- **100 icebreakers:** ~$0.50 - $2.00

**OpenAI GPT-4:**
- Input: $30.00 per million tokens
- Output: $60.00 per million tokens
- **Per icebreaker:** ~$0.02 - $0.10 (2 to 10 cents)
- **100 icebreakers:** ~$2.00 - $10.00

**OpenAI GPT-3.5-turbo:**
- Input: $0.50 per million tokens
- Output: $1.50 per million tokens
- **Per icebreaker:** ~$0.001 - $0.005 (⅒ cent to ½ cent)
- **100 icebreakers:** ~$0.10 - $0.50

💡 **Recommendation:** Start with Claude 3.5 Sonnet for best quality/cost ratio.

---

## Advanced Configuration

### Custom Models

Edit `js/settings-model.js` defaults or use Settings UI:

```javascript
// For latest models
ai_model: "claude-3-5-sonnet-20241022"  // Anthropic
ai_model: "gpt-4-turbo-preview"        // OpenAI
ai_model: "claude-3-haiku-20240307"    // Cheaper alternative
```

### Rate Limiting

Adjust in `js/icebreaker-engine.js`:

```javascript
// Batch generation queue settings
const queue = new TaskQueue(
  2,    // Concurrency (parallel requests)
  1000  // Delay between requests (ms)
);
```

### Timeout Configuration

Add to serverless function if needed:

**Vercel (`vercel.json`):**
```json
{
  "functions": {
    "api/generate.js": {
      "maxDuration": 30
    }
  }
}
```

**Netlify (`netlify.toml`):**
```toml
[functions]
  timeout = 30
```

---

## Support & Resources

### Documentation
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

### Community
- GitHub Issues: Report bugs or request features
- Discussions: Ask questions and share tips

### Monitoring
- Anthropic Console: [console.anthropic.com](https://console.anthropic.com)
- OpenAI Dashboard: [platform.openai.com/usage](https://platform.openai.com/usage)
- Vercel Analytics: [vercel.com/dashboard](https://vercel.com/dashboard)
- Netlify Analytics: [app.netlify.com](https://app.netlify.com)

---

**Ready to use Live AI Mode! 🚀**

Remember: Live AI Mode is optional. The app works perfectly in simulation mode if you prefer not to incur API costs.
