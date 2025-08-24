import OpenAI from 'openai';

const POLITICAL_ANALYSIS_PROMPT = `
You are a political science expert analyzing social media content.

Analyze the following Twitter profile and tweets:

Profile: @{username}
Bio: {bio}
Recent Tweets ({tweet_count}):
{tweets}

Provide analysis in the following JSON format:
{
  "political_leaning": {
    "left_right_score": <number between -1 (far left) and 1 (far right)>,
    "confidence": <number between 0 and 1>,
    "reasoning": "<brief explanation>"
  },
  "political_issues": {
    "healthcare": "<progressive|moderate|conservative|unclear>",
    "economy": "<progressive|moderate|conservative|unclear>",
    "environment": "<progressive|moderate|conservative|unclear>",
    "social_issues": "<progressive|moderate|conservative|unclear>",
    "foreign_policy": "<progressive|moderate|conservative|unclear>"
  },
  "recent_themes": [
    "<theme 1>", "<theme 2>", "<theme 3>", "<theme 4>", "<theme 5>"
  ],
  "sentiment_analysis": {
    "overall_tone": "<positive|neutral|negative>",
    "emotional_patterns": ["<pattern1>", "<pattern2>"],
    "communication_style": "<description>"
  },
  "key_topics": [
    {"topic": "<topic name>", "frequency": <number>, "stance": "<description>"}
  ],
  "overview": "<2-3 paragraph summary of the account owner's political thoughts and viewpoints based on their recent activity>"
}

Base your analysis on:
- Direct political statements
- Issue positions expressed
- Sources shared and referenced
- Language patterns and framing
- Interaction patterns with political content
`;

export class OpenAIAnalyzer {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzePoliticalLeaning(profile, tweets) {
    let prompt = POLITICAL_ANALYSIS_PROMPT;
    prompt = prompt.replace('{username}', profile.username);
    prompt = prompt.replace('{bio}', profile.bio || 'N/A');
    prompt = prompt.replace('{tweet_count}', tweets.length);
    prompt = prompt.replace('{tweets}', tweets.map((tweet, i) => `${i + 1}. ${tweet.content}`).join('\\n'));

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a political analyst expert at determining political leanings from social media content. You must respond with valid JSON."
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      response_format: { type: "json_object" }
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Failed to parse JSON response from OpenAI:", error);
      throw new Error("Invalid JSON response from AI.");
    }
  }
}
