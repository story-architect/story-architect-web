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
  | 'DISCOVERY_COMPLETED';


// Story
export interface StoryCreate {
  title: string;
  genre: string;
  one_sentence_premise: string;
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
  title: string;
  summary: string;
  created_at: string;
}

export interface ActivityFeedItemResponse {
  title: string;
  description: string;
  event_type: EventTypeEnum;
  timestamp: string;
}

export interface NextDiscoveryResponse {
  next_discovery: string;
  progress: number;
}


// Character
export interface CharacterCreate {
  story_id: string;
  name: string;
  age: number;
  role: RoleEnum;
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


// Relationship
export interface RelationshipCreate {
  story_id: string;
  character_a_id: string;
  character_b_id: string;
  relationship_type: RelationshipTypeEnum;
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
  suggested_answers: any[];
}

export interface DiscoveryAnswerCreate {
  story_id: string;
  character_id?: string | null;
  relationship_id?: string | null;
  question_id: string;
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
  title: string;
  description: string;
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
  conflict_created: string;
  transformation: string;
  updated_at: string;
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
}
