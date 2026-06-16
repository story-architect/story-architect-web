import { apiClient } from './client';
import * as T from '../types';

export const StoryService = {
  getAll: async (skip: number = 0, limit: number = 100) => {
    const res = await apiClient.get<T.StoryListResponse>(`/stories?skip=${skip}&limit=${limit}`);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<T.StoryResponse>(`/stories/${id}`);
    return res.data;
  },
  create: async (data: T.StoryCreate) => {
    const res = await apiClient.post<T.StoryResponse>('/stories', data);
    return res.data;
  },
  update: async (id: string, data: T.StoryUpdate) => {
    const res = await apiClient.put<T.StoryResponse>(`/stories/${id}`, data);
    return res.data;
  },
  getCharacters: async (storyId: string) => {
    const res = await apiClient.get<T.CharacterResponse[]>(`/stories/${storyId}/characters`);
    return res.data;
  },
  getRelationships: async (storyId: string) => {
    const res = await apiClient.get<T.RelationshipResponse[]>(`/stories/${storyId}/relationships`);
    return res.data;
  },
  getLatestDiscovery: async (storyId: string) => {
    const res = await apiClient.get<T.LatestDiscoveryResponse>(`/stories/${storyId}/latest-discovery`);
    return res.data;
  },
  getDiscoveryJournal: async (storyId: string) => {
    const res = await apiClient.get<T.DiscoveryEventResponse[]>(`/stories/${storyId}/discovery-journal`);
    return res.data;
  },
  getActivityFeed: async (storyId: string) => {
    const res = await apiClient.get<T.ActivityFeedItemResponse[]>(`/stories/${storyId}/activity-feed`);
    return res.data;
  },
  getNextDiscovery: async (storyId: string) => {
    const res = await apiClient.get<T.NextDiscoveryResponse>(`/stories/${storyId}/next-discovery`);
    return res.data;
  },
};

export const CharacterService = {
  create: async (data: T.CharacterCreate & { story_id: string }) => {
    const res = await apiClient.post<T.CharacterResponse>(`/stories/${data.story_id}/characters`, data);
    return res.data;
  },
  update: async (id: string, data: T.CharacterUpdate) => {
    const res = await apiClient.put<T.CharacterResponse>(`/characters/${id}`, data);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<T.CharacterResponse>(`/characters/${id}`);
    return res.data;
  },
  getPulse: async (id: string) => {
    const res = await apiClient.get<T.CharacterPulseResponse>(`/characters/${id}/pulse`);
    return res.data;
  },
};

export const RelationshipService = {
  create: async (data: T.RelationshipCreate & { story_id: string }) => {
    const res = await apiClient.post<T.RelationshipResponse>(`/stories/${data.story_id}/relationships`, data);
    return res.data;
  },
  update: async (id: string, data: T.RelationshipUpdate) => {
    const res = await apiClient.put<T.RelationshipResponse>(`/relationships/${id}`, data);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<T.RelationshipResponse>(`/relationships/${id}`);
    return res.data;
  },
};

export const DiscoveryService = {
  getQuestions: async (flowType: T.FlowTypeEnum) => {
    const res = await apiClient.get<T.DiscoveryQuestionResponse[]>(`/discovery/questions?flow_type=${flowType}`);
    return res.data;
  },
  submitAnswer: async (data: T.DiscoveryAnswerCreate) => {
    const res = await apiClient.post<T.DiscoveryAnswerResponse>('/discovery/answers', data);
    return res.data;
  },
  updateAnswer: async (id: string, data: T.DiscoveryAnswerUpdate) => {
    const res = await apiClient.put<T.DiscoveryAnswerResponse>(`/discovery/answers/${id}`, data);
    return res.data;
  },
  getCharacterAnswers: async (characterId: string) => {
    const res = await apiClient.get<T.DiscoveryAnswerResponse[]>(`/discovery/characters/${characterId}/answers`);
    return res.data;
  },
  getRelationshipAnswers: async (relationshipId: string) => {
    const res = await apiClient.get<T.DiscoveryAnswerResponse[]>(`/discovery/relationships/${relationshipId}/answers`);
    return res.data;
  },
};

export const ReportService = {
  getCharacterReport: async (characterId: string) => {
    const res = await apiClient.post<T.CharacterArchitectureReportResponse>(`/characters/${characterId}/generate-report`);
    return res.data;
  },
  getRelationshipReport: async (relationshipId: string) => {
    const res = await apiClient.post<T.RelationshipArchitectureReportResponse>(`/relationships/${relationshipId}/generate-report`);
    return res.data;
  },
};
