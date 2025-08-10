# Game Analytics Setup with PostHog

This document explains how to set up and configure PostHog analytics for the Chrome Dino Runner game.

## Quick Setup

1. **Get PostHog API Key**
   - Sign up at [PostHog Cloud](https://app.posthog.com/signup)
   - Create a new project or use an existing one
   - Copy your Project API Key from Project Settings

2. **Configure Environment Variables**
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   
   # Edit .env.local and add your PostHog key
   VITE_PUBLIC_POSTHOG_KEY=phc_your_actual_api_key_here
   ```

3. **Start the Development Server**
   ```bash
   pnpm dev
   ```

The analytics will automatically start tracking when you play the game!

## Analytics Events Tracked

### Game Lifecycle Events
- **`game_started`**: When a player starts a new game
- **`game_ended`**: When a game ends (with comprehensive session data)
- **`high_score_achieved`**: When a player beats their high score

### Player Action Events
- **`player_jumped`**: Every time the player jumps
- **`player_ducked`**: Every time the player ducks
- **`coin_collected`**: When a player collects a coin
- **`obstacle_collision`**: When the player hits an obstacle

### Milestone Events
- **`score_milestone_reached`**: At score thresholds (100, 500, 1K, 2.5K, 5K, 10K, 25K, 50K)
- **`speed_milestone_reached`**: At speed thresholds (5, 10, 15, 20, 25, 30)

### Performance Events
- **`obstacle_avoided`**: When successfully avoiding obstacles
- **`game_performance`**: Frame rate and performance metrics

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_PUBLIC_POSTHOG_KEY` | Your PostHog project API key | None | ✅ Yes |
| `VITE_PUBLIC_POSTHOG_HOST` | PostHog instance URL | `https://us.i.posthog.com` | No |

## Analytics Configuration

The analytics system is configured in several files:

### Main Configuration (`src/main.tsx`)
- PostHog provider setup
- Basic configuration options
- Session recording settings

### Analytics Library (`src/lib/analytics.ts`)
- Type-safe event definitions
- Analytics utility functions
- Session management
- Milestone tracking

### Game Integration (`src/components/Game/Game.tsx`)
- Event tracking throughout game loop
- Session state management
- Performance monitoring

## Tracked Data Structure

### Common Properties (Added to All Events)
```typescript
{
  game_name: "chrome_dino_runner",
  game_version: "1.0.0",
  user_agent: string,
  screen_width: number,
  screen_height: number,
  timestamp: number,
  session_id: string
}
```

### Game Session Data
```typescript
{
  session_id: string,
  final_score: number,
  time_played_seconds: number,
  coins_collected: number,
  top_speed_reached: number,
  obstacles_avoided: number,
  jumps_made: number,
  ducks_made: number,
  cause_of_death: "obstacle_collision" | "manual_restart"
}
```

## Analytics Dashboard in PostHog

### Recommended Insights to Create

1. **Player Engagement**
   - Total games played per day
   - Average session duration
   - Player retention rate

2. **Game Performance**
   - Score distribution histogram
   - High score trends over time
   - Completion rates by score milestone

3. **Player Behavior**
   - Jump vs duck action ratios
   - Coin collection efficiency
   - Common failure points

4. **Technical Metrics**
   - Game performance by device type
   - Error rates and crash analytics
   - Feature usage patterns

### Sample Queries

```sql
-- Average game duration
SELECT 
  avg(time_played_seconds) as avg_duration,
  count(*) as total_games
FROM events 
WHERE event = 'game_ended'

-- Score milestone conversion rates
SELECT 
  milestone_score,
  count(*) as players_reached
FROM events 
WHERE event = 'score_milestone_reached'
GROUP BY milestone_score
ORDER BY milestone_score

-- Player action frequency
SELECT 
  session_id,
  sum(case when event = 'player_jumped' then 1 else 0 end) as jumps,
  sum(case when event = 'player_ducked' then 1 else 0 end) as ducks
FROM events 
WHERE event IN ('player_jumped', 'player_ducked')
GROUP BY session_id
```

## Feature Flags Integration

PostHog feature flags can be used to A/B test game features:

```typescript
// Example usage in game component
const { trackFeatureFlag } = useGameAnalytics();
const posthog = usePostHog();

// Check feature flag
const showNewUI = posthog?.isFeatureEnabled('new-game-ui');

// Track feature flag usage
if (showNewUI) {
  trackFeatureFlag('new-game-ui', true);
}
```

## Privacy and GDPR Compliance

The analytics system is designed with privacy in mind:

- **No Personal Data**: Only game-related metrics are tracked
- **Session-Based**: Uses anonymous session IDs
- **No Autocapture**: Only manually defined events are captured
- **Local Storage**: User preferences stored locally
- **Opt-out Ready**: Easy to disable analytics if needed

To disable analytics entirely, remove or comment out the PostHog API key.

## Troubleshooting

### Analytics Not Working
1. Check that `VITE_PUBLIC_POSTHOG_KEY` is set correctly
2. Verify the API key in PostHog dashboard
3. Check browser console for PostHog errors
4. Ensure network requests to PostHog aren't blocked

### Missing Events
1. Check browser DevTools Network tab for PostHog requests
2. Verify event names match the interface in `analytics.ts`
3. Check that the component is properly wrapped with PostHogProvider

### Development vs Production
- In development, events may appear delayed in PostHog
- Use PostHog's live events view for real-time debugging
- Production events typically appear within seconds

## Analytics Best Practices

1. **Event Naming**: Use consistent, descriptive event names
2. **Property Types**: Keep property types consistent across events
3. **Batch Events**: Related events are automatically batched for performance
4. **Error Handling**: Analytics failures don't affect game functionality
5. **Performance**: Analytics tracking is designed to be lightweight

## Support

For issues with PostHog setup:
- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/slack)

For game-specific analytics questions:
- Check the analytics interface in `src/lib/analytics.ts`
- Review event tracking in `src/components/Game/Game.tsx`