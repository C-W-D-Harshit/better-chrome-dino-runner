import { usePostHog } from "posthog-js/react";

/**
 * Analytics property types
 */
export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface FeatureFlagValue {
  [key: string]: string | number | boolean;
}

/**
 * Game Analytics Events Interface
 * Defines all the trackable events in the Chrome Dino Runner game
 */
export interface GameAnalyticsEvents {
  // Game lifecycle events
  "game_started": {
    session_id: string;
    timestamp: number;
  };
  
  "game_ended": {
    session_id: string;
    final_score: number;
    time_played_seconds: number;
    coins_collected: number;
    top_speed_reached: number;
    obstacles_avoided: number;
    jumps_made: number;
    ducks_made: number;
    cause_of_death: "obstacle_collision" | "manual_restart";
  };

  "high_score_achieved": {
    session_id: string;
    new_high_score: number;
    previous_high_score: number;
    improvement: number;
  };

  // Player action events
  "player_jumped": {
    session_id: string;
    current_score: number;
    current_speed: number;
    player_x: number;
    player_y: number;
  };

  "player_ducked": {
    session_id: string;
    current_score: number;
    current_speed: number;
    player_x: number;
  };

  // Collectible events
  "coin_collected": {
    session_id: string;
    coin_value: number;
    total_coins: number;
    current_score: number;
    coin_x: number;
    coin_y: number;
  };

  // Milestone events
  "speed_milestone_reached": {
    session_id: string;
    speed_level: number;
    score_at_milestone: number;
    time_to_reach_seconds: number;
  };

  "score_milestone_reached": {
    session_id: string;
    milestone_score: number;
    time_to_reach_seconds: number;
    coins_collected: number;
  };

  // Obstacle events
  "obstacle_avoided": {
    session_id: string;
    obstacle_type: string;
    current_score: number;
    current_speed: number;
    close_call: boolean; // if player barely avoided collision
  };

  "obstacle_collision": {
    session_id: string;
    obstacle_type: string;
    collision_score: number;
    collision_speed: number;
    player_x: number;
    player_y: number;
    obstacle_x: number;
    obstacle_y: number;
  };

  // Performance events
  "game_performance": {
    session_id: string;
    average_fps: number;
    frame_drops: number;
    total_frames: number;
  };
}

/**
 * Game Analytics Hook
 * Provides analytics tracking functionality for the game
 */
export function useGameAnalytics() {
  const posthog = usePostHog();

  /**
   * Track a game analytics event
   */
  const trackEvent = <K extends keyof GameAnalyticsEvents>(
    eventName: K,
    properties: GameAnalyticsEvents[K]
  ): void => {
    if (!posthog) {
      console.warn("PostHog not initialized, skipping event:", eventName);
      return;
    }

    // Add common properties to all events
    const enhancedProperties = {
      ...properties,
      game_name: "chrome_dino_runner",
      game_version: "1.0.0",
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      event_timestamp: Date.now(), // Renamed to avoid shadowing caller's timestamp
    };

    posthog.capture(eventName, enhancedProperties);
    
    // Also track as a custom event for easier filtering
    posthog.capture("game_event", {
      event_type: eventName,
      ...enhancedProperties,
    });
  };

  /**
   * Identify the player with session information
   */
  const identifyPlayer = (sessionId: string, properties?: AnalyticsProperties): void => {
    if (!posthog) return;

    posthog.identify(sessionId, {
      session_start: Date.now(),
      game_name: "chrome_dino_runner",
      ...properties,
    });
  };

  /**
   * Set user properties for analytics
   */
  const setUserProperties = (properties: AnalyticsProperties): void => {
    if (!posthog) return;

    posthog.setPersonProperties(properties);
  };

  /**
   * Track feature flag usage
   */
  const trackFeatureFlag = (flagName: string, value: string | number | boolean): void => {
    if (!posthog) return;

    posthog.capture("feature_flag_used", {
      flag_name: flagName,
      flag_value: value,
      game_name: "chrome_dino_runner",
    });
  };

  /**
   * Start a new analytics session
   */
  const startSession = (): string => {
    // Use GameAnalytics as single source of truth for session management
    const sessionId = GameAnalytics.initSession();
    identifyPlayer(sessionId);
    return sessionId;
  };

  /**
   * Track page/game view
   */
  const trackGameView = (sessionId: string): void => {
    if (!posthog) return;

    posthog.capture("$pageview", {
      $current_url: window.location.href,
      game_name: "chrome_dino_runner",
      session_id: sessionId,
    });
  };

  return {
    trackEvent,
    identifyPlayer,
    setUserProperties,
    trackFeatureFlag,
    startSession,
    trackGameView,
    isEnabled: !!posthog,
  };
}

/**
 * Analytics utility functions
 */
export class GameAnalytics {
  private static sessionId: string | null = null;
  private static gameStartTime: number = 0;
  private static actionCounts = {
    jumps: 0,
    ducks: 0,
    obstaclesAvoided: 0,
  };

  /**
   * Initialize analytics session
   */
  static initSession(): string {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.gameStartTime = Date.now();
    this.resetActionCounts();
    return this.sessionId;
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string {
    return this.sessionId || this.initSession();
  }

  /**
   * Get time played in current session
   */
  static getTimePlayedSeconds(): number {
    return this.gameStartTime > 0 ? (Date.now() - this.gameStartTime) / 1000 : 0;
  }

  /**
   * Increment action counters
   */
  static incrementJumps(): void {
    this.actionCounts.jumps++;
  }

  static incrementDucks(): void {
    this.actionCounts.ducks++;
  }

  static incrementObstaclesAvoided(): void {
    this.actionCounts.obstaclesAvoided++;
  }

  /**
   * Get current action counts
   */
  static getActionCounts() {
    return { ...this.actionCounts };
  }

  /**
   * Reset action counts for new game
   */
  static resetActionCounts(): void {
    this.actionCounts = {
      jumps: 0,
      ducks: 0,
      obstaclesAvoided: 0,
    };
  }

  /**
   * Reset session for new game
   */
  static resetSession(): void {
    this.gameStartTime = Date.now();
    this.resetActionCounts();
  }
}

/**
 * Score milestones to track
 */
export const SCORE_MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];

/**
 * Speed milestones to track (in pixels per frame or similar unit)
 */
export const SPEED_MILESTONES = [5, 10, 15, 20, 25, 30];

/**
 * Check if a score is a milestone
 */
export function isScoreMilestone(score: number): boolean {
  return SCORE_MILESTONES.includes(Math.floor(score));
}

/**
 * Check if a speed is a milestone
 */
export function isSpeedMilestone(speed: number): boolean {
  return SPEED_MILESTONES.includes(Math.floor(speed));
}