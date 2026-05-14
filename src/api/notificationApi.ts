// api/notificationApi.ts
import api from './axiosConfig';

export const notificationApi = {
    getMyNotifications: () => api.get('/notifications'),
    getUnreadNotifications: () => api.get('/notifications/unread'),
    countUnread: () => api.get<number>('/notifications/unread/count'),
    getRecent: (limit = 10) => api.get('/notifications/recent', { params: { limit } }),
    markAsRead: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
    deleteAllRead: () => api.delete('/notifications/read'),
};