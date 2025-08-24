import { TwitterScraper } from '@/lib/scraping/twitterScraper';
import { OpenAIAnalyzer } from '@/lib/ai/openai';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

function extractUsername(url) {
  try {
    const urlObject = new URL(url);
    const path = urlObject.pathname;
    const username = path.split('/')[1];
    if (!username) {
      throw new Error();
    }
    return username;
  } catch (error) {
    throw new Error('Invalid Twitter URL. Please use a valid format like https://twitter.com/username.');
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { twitterUrl } = await request.json();
    if (!twitterUrl) {
      return Response.json({ error: 'Twitter URL is required.' }, { status: 400 });
    }

    const username = extractUsername(twitterUrl);

    // 1. Check for a recent analysis in the cache
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingAnalysis = await db.analysisResult.findFirst({
      where: {
        twitterProfile: { username },
        userId,
        analysisDate: { gte: twentyFourHoursAgo },
      },
      include: { twitterProfile: true },
    });

    if (existingAnalysis) {
      console.log(`Returning cached analysis for ${username}`);
      return Response.json(existingAnalysis);
    }

    // 2. Scrape fresh data
    const scraper = new TwitterScraper();
    const { profile, tweets } = await scraper.scrapeProfile(username);

    if (!profile || tweets.length === 0) {
      return Response.json({ error: 'Could not retrieve profile data or tweets.' }, { status: 500 });
    }

    // 3. Store/update profile and cache tweets
    const twitterProfile = await db.twitterProfile.upsert({
      where: { username },
      update: { ...profile, lastScrapedAt: new Date() },
      create: { ...profile, username },
    });

    // Ensure tweets have the profile ID and are not duplicated
    await db.tweetCache.createMany({
      data: tweets.map(tweet => ({
        ...tweet,
        twitterProfileId: twitterProfile.id,
      })),
      skipDuplicates: true,
    });

    // 4. AI Analysis
    const analyzer = new OpenAIAnalyzer();
    const analysis = await analyzer.analyzePoliticalLeaning(profile, tweets);

    // 5. Store new analysis result
    const result = await db.analysisResult.create({
      data: {
        userId,
        twitterProfileId: twitterProfile.id,
        politicalLeaning: analysis.political_leaning,
        politicalIssues: analysis.political_issues,
        recentThemes: { themes: analysis.recent_themes }, // Ensure themes are wrapped in an object if needed
        sentimentAnalysis: analysis.sentiment_analysis,
        aiOverview: analysis.overview,
        analyzedTweetsCount: tweets.length,
        aiModelUsed: 'openai-gpt-4-turbo', // Be specific
        analysisDate: new Date(),
      },
      include: { twitterProfile: true },
    });

    return Response.json(result);

  } catch (error) {
    console.error('Error in /api/profiles/analyze:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
