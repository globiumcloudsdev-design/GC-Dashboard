import api from "@/lib/api";

export const blogService = {
  list: async (opts = {}) => {
    const { q = "", tag, page = 1, limit = 20 } = opts;
    const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
    if (tag) params.append("tag", tag);
    const res = await api.get(`/blogs?${params.toString()}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post(`/blogs`, payload);
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/blogs?id=${id}`);
    return res.data;
  },

  update: async (payload) => {
    const res = await api.put(`/blogs/${payload.id}?id=${payload.id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/blogs/${id}?id=${id}`);
    return res.data;
  },

  uploadAttachments: async (files) => {
    // files: [{ name, data }] where data is base64 string
    const res = await api.post(`/blogs/upload`, { files });
    return res.data;
  }
};
