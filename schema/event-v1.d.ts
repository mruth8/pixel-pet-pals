export type EventType = "activity" | "level_up" | "loot" | "death" | "pet_drop" | "quest" | "login" | "logout" | "idle" | "heartbeat";
export type ActivityCategory = "skilling" | "combat" | "bossing" | "banking" | "traveling" | "minigame" | "idle";
export interface Activity { category: ActivityCategory; skill?: string; target?: string; region?: string; }
export interface PetEventV1 {
  v: 1;
  player: string;
  ts: string; // ISO 8601
  type: EventType;
  activity?: Activity;
  detail?: Record<string, unknown>;
}
