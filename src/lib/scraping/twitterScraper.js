import { ApifyClient } from 'apify-client';

export class TwitterScraper {
  constructor() {
    if (!process.env.APIFY_TOKEN) {
      throw new Error('APIFY_TOKEN environment variable is not set.');
    }
    this.apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });
  }

  async scrapeProfile(username) {
    console.log(`Starting scrape for username: ${username}`);
    const actorCall = await this.apifyClient.actor('apify/twitter-scraper').call({
      handles: [username],
      tweets_desired: 100,
    });

    console.log('Scraping finished. Fetching results...');
    const { items } = await this.apifyClient.dataset(actorCall.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      throw new Error('Could not scrape the Twitter profile. The profile might be private or does not exist.');
    }

    return this.processScrapedData(items);
  }

  processScrapedData(rawData) {
    // The apify/twitter-scraper returns an array of objects, each object is a tweet.
    // The profile information is attached to each tweet object.
    // We only need the profile info from the first tweet.
    const firstTweet = rawData[0];
    if (!firstTweet) {
      return { profile: null, tweets: [] };
    }

    const profile = {
      username: firstTweet.user.screen_name,
      displayName: firstTweet.user.name,
      bio: firstTweet.user.description,
      followers_count: firstTweet.user.followers_count,
      following_count: firstTweet.user.friends_count,
      tweet_count: firstTweet.user.statuses_count,
      verified: firstTweet.user.verified,
      profile_image_url: firstTweet.user.profile_image_url_https,
    };

    const tweets = rawData.map(tweet => ({
      tweet_id: tweet.id_str,
      content: tweet.full_text,
      created_at_twitter: new Date(tweet.created_at),
      retweet_count: tweet.retweet_count,
      like_count: tweet.favorite_count,
      reply_count: tweet.reply_count,
    }));

    return { profile, tweets };
  }
}
