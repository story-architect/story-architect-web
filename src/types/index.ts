export type RoleEnum = 'MAIN_CHARACTER' | 'SUPPORTING_CHARACTER';

export type RelationshipTypeEnum =
  | 'ROMANCE'
  | 'FRIENDSHIP'
  | 'FAMILY'
  | 'RIVALRY'
  | 'MENTOR'
  | 'OTHER';

export type FlowTypeEnum = 'CHARACTER_DISCOVERY' | 'RELATIONSHIP_DISCOVERY';

export type EventTypeEnum = 
  | 'CHARACTER_CREATED'
  | 'RELATIONSHIP_CREATED'
  | 'QUESTION_ANSWERED'
  | 'PATTERN_EMERGING'
  | 'INSIGHT_UNLOCKED'
  | 'REPORT_GENERATED'
  | 'DISCOVERY_COMPLETED'
  | 'DRAMATIC_ARCHITECTURE_DISCOVERED'
  | 'INTERPRETATION_REVISED';


// Story
export interface StoryCreate {
  title: string;
  genre: string;
  one_sentence_premise: string;
}

export interface StoryUpdate {
  title?: string;
  genre?: string;
  one_sentence_premise?: string;
}

export interface StoryListResponse {
  items: StoryResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface StoryResponse extends StoryCreate {
  id: string;
  created_at: string;
  updated_at: string;
  character_count?: number;
  relationship_count?: number;
  discovery_progress?: number;
  next_insight?: string;
}

export interface LatestDiscoveryResponse {
  id: string;
  event_type: EventTypeEnum;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

export interface ActivityFeedItemResponse {
  id: string;
  event_type: EventTypeEnum;
  event_metadata: Record<string, unknown>;
  timestamp: string;
}

export interface NextDiscoveryResponse {
  next_discovery: string;
  progress: number;
}

export interface UserBase {
  email: string;
  display_name: string;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserRead extends UserBase {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


// Character
export interface CharacterCreate {
  story_id: string;
  name: string;
  age: number;
  role: RoleEnum;
  archetype?: string | null;
}

export interface CharacterUpdate {
  name?: string;
  age?: number;
  role?: RoleEnum;
  archetype?: string | null;
}

export interface CharacterResponse extends CharacterCreate {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterPulseResponse {
  progress: number;
  wound: string;
  fear: string;
  lie: string;
  most_likely_conflict: string;
  latest_discovery: string;
}

export interface PatternEmergingResponse {
  title: string;
  pattern_name: string;
  insight: string;
  supporting_text: string;
  next_discovery_hint: string;
}


// Relationship
export interface RelationshipCreate {
  story_id: string;
  character_a_id: string;
  character_b_id: string;
  relationship_type: RelationshipTypeEnum;
}

export interface RelationshipUpdate {
  relationship_type?: RelationshipTypeEnum;
}

export interface RelationshipResponse extends RelationshipCreate {
  id: string;
  created_at: string;
  updated_at: string;
  character_a_name?: string;
  character_b_name?: string;
}

// Discovery
export interface DiscoveryQuestionResponse {
  id: string;
  flow_type: FlowTypeEnum;
  question_key: string;
  question_text: string;
  order_index: number;
  suggested_answers: string[];
}

export interface DiscoveryAnswerCreate {
  story_id: string;
  character_id?: string | null;
  relationship_id?: string | null;
  question_id: string;
  selected_answer?: string | null;
  custom_answer?: string | null;
}

export interface DiscoveryAnswerUpdate {
  selected_answer?: string | null;
  custom_answer?: string | null;
}

export interface DiscoveryAnswerResponse extends DiscoveryAnswerCreate {
  id: string;
  created_at: string;
  updated_at: string;
  unlocked_events?: DiscoveryEventResponse[];
}

export interface DiscoveryEventResponse {
  id: string;
  story_id: string;
  character_id?: string | null;
  relationship_id?: string | null;
  event_type: EventTypeEnum;
  event_metadata: Record<string, unknown>;
  created_at: string;
}


// Reports
export interface CharacterArchitectureReportResponse {
  id: string;
  character_id: string;
  character_core: string;
  emotional_wound: string;
  deepest_fear: string;
  protective_lie: string;
  behavior: string;
  narrative_consequence: string;
  narrative_consequence_custom?: string | null;
  conflict_created: string;
  conflict_created_custom?: string | null;
  pressure_point: string;
  pressure_point_custom?: string | null;
  transformation: string;
  transformation_path: string;
  transformation_path_custom?: string | null;
  custom_outdated_fields?: Record<string, boolean>;
  updated_at: string;
  is_stale?: boolean;
  stale_reason?: string | null;
}

export interface RelationshipArchitectureReportResponse {
  id: string;
  relationship_id: string;
  current_result: string;
  emotional_effect: string;
  story_consequence: string;
  current_relationship_risk: string;
  turning_point: string;
  relationship_law: string;
  updated_at: string;
  is_stale?: boolean;
  stale_reason?: string | null;
}
