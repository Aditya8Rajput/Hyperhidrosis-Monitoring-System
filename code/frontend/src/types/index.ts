/**
 * User Profile entity stored in Firestore & AuthContext
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string;
  createdAt: string;
  photoURL?: string | null;
}

/**
 * Hyperhidrosis episode log entity
 */
export interface Episode {
  id?: string;
  userId: string;
  timestamp: string;
  severity: number; // 1-10
  bodyAreas: string[];
  durationMinutes: number;
  trigger: string;
  stressLevel: number; // 1-10
  activity: string;
  temperature?: number;
  humidity?: number;
  notes?: string;
  createdAt?: unknown; // Firestore serverTimestamp
}

/**
 * Summary analytics metrics for user overview
 */
export interface AnalyticsSummary {
  totalEpisodes: number;
  avgSeverity: number;
  avgDuration: number;
  topTrigger: string;
  topBodyArea: string;
}

/**
 * Supported affected body areas
 */
export type BodyAreaOption = 
  | "Palms"
  | "Feet"
  | "Underarms"
  | "Face"
  | "Scalp"
  | "Back"
  | "Chest"
  | "Other";

/**
 * Supported trigger options
 */
export type TriggerOption =
  | "Stress"
  | "Heat"
  | "Exercise"
  | "Caffeine"
  | "Spicy Food"
  | "Social Anxiety"
  | "Unknown"
  | "Other";

/**
 * Common activity options
 */
export type ActivityOption =
  | "Working / Desk"
  | "Resting / Relaxing"
  | "Exercising / Active"
  | "Socializing / Meeting"
  | "Commuting / Driving"
  | "Sleeping / Waking"
  | "Other";
