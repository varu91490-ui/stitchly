import { request } from './api';
import { VoiceParseResponse, VoiceQueryResponse, Order } from '../types';

export const voiceService = {
  async parse(transcript: string, draft_id?: number | null): Promise<VoiceParseResponse> {
    return request<VoiceParseResponse>('/voice/parse', {
      method: 'POST',
      body: JSON.stringify({ transcript, draft_id }),
    });
  },

  async query(queryText: string): Promise<VoiceQueryResponse> {
    return request<VoiceQueryResponse>('/voice/query', {
      method: 'POST',
      body: JSON.stringify({ query: queryText }),
    });
  },

  async confirmDraft(draft_id: number, overrides?: any): Promise<Order> {
    return request<Order>(`/drafts/${draft_id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(overrides || {}),
    });
  },

  async cancelDraft(draft_id: number): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/drafts/${draft_id}`, {
      method: 'DELETE',
    });
  }
};
