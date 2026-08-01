import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionTemplate } from 'motion/react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Zap,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../types';
import { notificationService } from '../services/notificationService';
import { useGlassTilt, SPRING_PANEL } from '../hooks/useGlassTilt';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface NotificationDropdownProps {
  onNavigateTab?: (tab: string) => void;
}

export default function NotificationDropdown({ onNavigateTab }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'achievement' | 'system'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Glass tilt & focus management
  const { ref: tiltRef, style: tiltStyle, springLightX, springLightY } = useGlassTilt<HTMLDivElement>(isOpen);
  const focusTrapRef = useFocusTrap(isOpen, () => setIsOpen(false));

  // Dynamic light spot background
  const lightGradient = useMotionTemplate`radial-gradient(600px circle at ${springLightX}% ${springLightY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`;

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'achievement') return item.type === 'achievement' || item.type === 'streak';
    if (activeFilter === 'system') return item.type === 'system' || item.type === 'lesson';
    return true;
  });

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await notificationService.markAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const handleClearAll = async () => {
    const updated = await notificationService.clearAll();
    setNotifications(updated);
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await notificationService.deleteNotification(id);
    setNotifications(updated);
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      notificationService.markAsRead(item.id).then((updated) => setNotifications(updated));
    }
    if (item.actionUrl && onNavigateTab) {
      onNavigateTab(item.actionUrl);
      setIsOpen(false);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'streak':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-emerald-500" />;
      case 'lesson':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'system':
      default:
        return <Info className="h-4 w-4 text-indigo-500" />;
    }
  };

  // Merge refs: tilt ref + focus trap ref + outside-click ref
  const setPanelRef = useCallback((node: HTMLDivElement | null) => {
    (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [tiltRef, focusTrapRef]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Bell Button */}
      <motion.button
        id="notif_bell_trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications dropdown, ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={`relative p-2.5 rounded-xl transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          isOpen ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-100'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* ─── Glass Popover Dropdown Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={setPanelRef}
            id="notif_dropdown_panel"
            role="dialog"
            aria-label="Notifications Center"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={SPRING_PANEL}
            style={{
              ...tiltStyle,
              backgroundImage: lightGradient,
            }}
            className="glass-dropdown absolute right-0 mt-2 w-80 sm:w-96 z-50 overflow-hidden"
          >
            {/* Header Bar */}
            <div className="p-4 bg-white/40 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    id="notif_mark_all_read_btn"
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    aria-label="Mark all as read"
                    className="p-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/60 rounded-lg flex items-center space-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mark read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    id="notif_clear_all_btn"
                    onClick={handleClearAll}
                    title="Clear all notifications"
                    aria-label="Clear all notifications"
                    className="p-1 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50/60 rounded-lg flex items-center space-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Notifications"
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-white/15 px-3 bg-white/20 text-xs font-medium text-gray-500 overflow-x-auto space-x-1 py-1.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'achievement', label: 'Achievements' },
                  { id: 'system', label: 'System' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  aria-pressed={activeFilter === tab.id}
                  aria-label={`Filter by ${tab.label}`}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition ${
                    activeFilter === tab.id
                      ? 'bg-emerald-50/80 text-emerald-700 font-bold'
                      : 'hover:bg-white/30 text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List Frame */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/10">
              {loading ? (
                // Skeletons
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex space-x-3 animate-pulse">
                      <div className="h-8 w-8 bg-gray-200/60 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200/60 rounded w-3/4" />
                        <div className="h-2 bg-gray-200/40 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                /* Empty State */
                <div className="p-8 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50/80 flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">You're all caught up!</p>
                  <p className="text-xs text-gray-500 mt-1">No notifications found for this filter.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ ...SPRING_PANEL, delay: index * 0.03 }}
                      onClick={() => handleItemClick(item)}
                      className={`p-3.5 flex items-start space-x-3 hover:bg-white/30 cursor-pointer transition-colors relative group ${
                        !item.read ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Icon Bubble */}
                      <div className="h-8 w-8 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5 border border-white/30">
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold truncate ${!item.read ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>

                        {item.actionUrl && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 mt-1 hover:underline">
                            View {item.actionUrl} <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                          </span>
                        )}
                      </div>

                      {/* Read status / Quick Actions */}
                      <div className="flex flex-col items-end space-y-1 shrink-0">
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-600" title="Unread" />
                        )}
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          title="Dismiss"
                          aria-label={`Dismiss notification ${item.title}`}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-3 bg-white/30 border-t border-white/15 text-center">
              <span className="text-[11px] text-gray-500">
                SignAI Learn Notification Hub • Live Updates Enabled
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
