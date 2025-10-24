import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { portfolioData, marketData } = await request.json();

    // Create AI prompt for DeFi analysis
    const prompt = `
You are an AI-driven DeFi portfolio analyst. Analyze the following data and provide actionable insights:

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

Market Data:
${JSON.stringify(marketData, null, 2)}

Please provide:
1. Market sentiment analysis (Bullish/Bearish/Neutral)
2. Portfolio risk assessment (Low/Medium/High)
3. Recommended actions (Hold/Rebalance/Diversify)
4. Specific asset allocation suggestions
5. Risk mitigation strategies

Format your response as JSON with the following structure:
{
  "sentiment": "Bullish|Bearish|Neutral",
  "riskLevel": "Low|Medium|High", 
  "recommendation": "Hold|Rebalance|Diversify",
  "confidence": 0-100,
  "analysis": "Detailed explanation",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert DeFi portfolio manager and market analyst. Provide clear, actionable investment advice based on data analysis."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Try to parse AI response as JSON, fallback to structured response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse || '{}');
    } catch {
      analysis = {
        sentiment: "Neutral",
        riskLevel: "Medium",
        recommendation: "Hold",
        confidence: 75,
        analysis: aiResponse || "Unable to generate analysis at this time.",
        suggestions: ["Monitor market conditions", "Consider diversification", "Review risk tolerance"]
      };
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate AI analysis',
        fallback: {
          sentiment: "Neutral",
          riskLevel: "Medium", 
          recommendation: "Hold",
          confidence: 50,
          analysis: "AI analysis temporarily unavailable. Using conservative recommendations.",
          suggestions: ["Hold current positions", "Monitor market trends", "Reassess in 24 hours"]
        }
      },
      { status: 500 }
    );
  }
}