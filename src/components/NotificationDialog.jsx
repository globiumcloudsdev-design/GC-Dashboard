"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Clock,
  Trash2,
  Edit,
} from "lucide-react";

export default function NotificationDialog({
  notification,
  isOpen,
  onClose,
  onDelete,
  onMarkAsRead,
  onEdit,
  isRead,
  isAdmin = false,
}) {
  if (!notification) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <MessageCircle className="w-6 h-6 text-[#10B5DB]" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "announcement":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    onDelete(notification._id);
    onClose();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(notification);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold mb-2 flex items-center gap-2">
                {notification.title}
                {!isRead && (
                  <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#10B5DB]" />
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getTypeBadgeColor(notification.type)}>
                  {notification.type || "info"}
                </Badge>
                {notification.targetType && (
                  <Badge variant="outline" className="text-xs">
                    Target: {notification.targetType}
                  </Badge>
                )}
                {notification.targetType === "specific" &&
                  notification.targetUsers?.[0] && (
                    <Badge variant="secondary" className="text-xs">
                      Sent to:{" "}
                      {typeof notification.targetUsers[0] === "object"
                        ? notification.targetUsers[0].agentName ||
                          notification.targetUsers[0].name ||
                          notification.targetUsers[0].agentId
                        : "Specific Agent"}
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {/* Message Content */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Message
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
              {notification.message}
            </p>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Created:</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300 ml-6">
                {formatDate(notification.createdAt)}
              </p>
            </div>

            {notification.createdBy && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Created By:</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {notification.createdBy?.name || "System"}
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">Status:</span>{" "}
              {isRead ? (
                <span className="text-green-600 dark:text-green-400">Read</span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">Unread</span>
              )}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex gap-2">
            {!isRead && (
              <Button
                variant="outline"
                onClick={() => {
                  onMarkAsRead(notification._id);
                  onClose();
                }}
                className="w-full sm:w-auto"
              >
                Mark as Read
              </Button>
            )}

            {isAdmin && onEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2 border-[#10B5DB] text-[#10B5DB] hover:bg-[#10B5DB] hover:text-white"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isAdmin ? "Delete Permanently" : "Delete"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
