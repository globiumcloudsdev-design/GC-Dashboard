// Campaign Service - Client-side API wrapper
const API_BASE = '/api/campaigns';

export const campaignService = {
  // Get all campaigns
  list: async () => {
    const response = await fetch(API_BASE);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Get single campaign
  get: async (id) => {
    const response = await fetch(`${API_BASE}/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Create campaign
  create: async (payload) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Update campaign
  update: async (id, payload) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  // Delete campaign
  remove: async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data;
  },

  // Send campaign to subscribers
  send: async (id) => {
    const response = await fetch(`${API_BASE}/${id}/send`, {
      method: 'POST',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },
};
