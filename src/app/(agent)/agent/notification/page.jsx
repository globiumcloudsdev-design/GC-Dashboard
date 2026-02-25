// app/(agent)/agent/notification/page.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, CheckCircle, Clock, AlertCircle, Info, Loader, Filter, Search, X } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import { agentNotificationService } from "@/services/agentNotificationService";

export default function AgentNotificationPage() {
  const { isLoggedIn, agent, isLoading: contextLoading } = useAgent();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const loadedRef = useRef(false);

  // Load notifications only once on mount
  const loadNotifications = useCallback(async () => {
    if (!agent?._id) return;
    
    try {
      const [specificNotifications, allNotifications] = await Promise.all([
        agentNotificationService.fetchNotificationsForAgent(agent._id || agent.agentId),
        agentNotificationService.fetchUserNotifications()
      ]);

      const combinedNotifications = [
        ...specificNotifications.map(notif => ({ ...notif, notificationType: 'specific' })),
        ...allNotifications.map(notif => ({ ...notif, notificationType: 'all' }))
      ];

      combinedNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(combinedNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [agent?._id, agent?.agentId]);

  // Load notifications only once when agent is ready
  useEffect(() => {
    if (isLoggedIn && agent && !loadedRef.current) {
      loadedRef.current = true;
      loadNotifications();
    }
  }, [isLoggedIn, agent, loadNotifications]);

  const isNotificationRead = (notification) => {
    return notification.readBy && notification.readBy.includes(agent._id);
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    // Mark as read when opening the notification detail
    if (!isNotificationRead(notification)) {
      try {
        await agentNotificationService.markAsRead(notification._id);
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notification._id
              ? {
                  ...notif,
                  readBy: notif.readBy ? [...notif.readBy, agent._id] : [agent._id]
                }
              : notif
          )
        );
        // Update selected notification as well
        setSelectedNotification(prev => ({
          ...prev,
          readBy: prev.readBy ? [...prev.readBy, agent._id] : [agent._id]
        }));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setDeleting(notificationId);
      await agentNotificationService.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
      // Close modal if the deleted notification was in modal
      if (selectedNotification?._id === notificationId) {
        setIsModalOpen(false);
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'warning':
        return 'text-blue-600 bg-blue-50';
      case 'cancel':
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'announcement':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'cancel':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'announcement':
        return <BellRing className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">Please login to view notifications.</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !isNotificationRead(n)).length;
  const filteredNotifications = notifications.filter(notification => {
    const isRead = isNotificationRead(notification);
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !isRead) ||
      (filter === 'read' && isRead);

    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 pt-6">Notifications</h1>
              <p className="text-gray-600 text-sm">Stay updated with your activities</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === 'unread'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === 'read'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Unread</p>
          <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <Loader className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-700 font-medium mb-1">
                {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </p>
              <p className="text-gray-500 text-sm">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'You\'ll see notifications here when you have updates.'
                }
              </p>
              {(searchTerm || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer transition-colors ${
                  !isNotificationRead(notification) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(notification.status).split(' ')[1]}`}>
                    {getStatusIcon(notification.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          notification.notificationType === 'specific' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.notificationType === 'specific' ? 'For You' : 'All Agents'}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        {!isNotificationRead(notification) && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    disabled={deleting === notification._id}
                    className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {!loading && filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                setLoading(true);
                loadNotifications();
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {isModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getStatusColor(selectedNotification.status).split(' ')[1]}`}>
                  {getStatusIcon(selectedNotification.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedNotification.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedNotification(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Message</h3>
                <p className="text-gray-900 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Type</h3>
                  <p className="text-gray-900">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                      selectedNotification.notificationType === 'specific' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedNotification.notificationType === 'specific' ? 'For You' : 'All Agents'}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
                  <p className="text-gray-900">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${getStatusColor(selectedNotification.status)}`}>
                      {selectedNotification.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Additional Data */}
              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(selectedNotification.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  {isNotificationRead(selectedNotification) 
                    ? '✓ You have read this notification' 
                    : 'This notification is unread'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Close
              </button>
              <button
                onClick={() => deleteNotification(selectedNotification._id)}
                disabled={deleting === selectedNotification._id}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg font-medium"
              >
                {deleting === selectedNotification._id ? 'Deleting...' : 'Delete Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}