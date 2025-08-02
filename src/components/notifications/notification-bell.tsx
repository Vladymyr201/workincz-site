"use client";

import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Eye, 
  User, 
  AlertTriangle,
  Trash2,
  Check,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { NotificationType } from "@/types";

export function NotificationBell() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications({ limit: 10 });
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "application_received":
      case "application_accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "application_rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "new_message":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case "job_viewed":
      case "profile_viewed":
        return <Eye className="h-4 w-4 text-purple-600" />;
      case "system_alert":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "application_received":
      case "application_accepted":
        return "border-l-green-500 bg-green-50";
      case "application_rejected":
        return "border-l-red-500 bg-red-50";
      case "new_message":
        return "border-l-blue-500 bg-blue-50";
      case "job_viewed":
      case "profile_viewed":
        return "border-l-purple-500 bg-purple-50";
      case "system_alert":
        return "border-l-orange-500 bg-orange-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Уведомления</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Прочитать все
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет уведомлений</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? "text-gray-900" : "text-gray-700"
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteNotification(e, notification.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Закрыть
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 