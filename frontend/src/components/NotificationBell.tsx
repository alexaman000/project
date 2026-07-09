'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative liquid-glass p-3 rounded-2xl text-[#FDE047]/70 hover:text-[#FDE047] hover:bg-white/10 transition-colors"
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-96 max-h-[500px] overflow-hidden rounded-3xl shadow-2xl z-50"
            style={{ background: 'rgba(10,15,30,0.92)', border: '1px solid rgba(253,224,71,0.15)', backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-[#FDE047] font-serif text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#FDE047]/60 hover:text-[#FDE047] flex items-center gap-1 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[#FDE047]/40 hover:text-[#FDE047] transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[380px] custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#FDE047]/30">
                  <Bell size={36} className="mb-3 opacity-40" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-start gap-3 px-5 py-4 border-b border-white/5 group transition-colors cursor-pointer ${
                        notif.read ? 'opacity-50' : 'bg-white/[0.03]'
                      }`}
                      onClick={() => !notif.read && markAsRead(notif._id)}
                    >
                      {/* Unread dot */}
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-transparent' : 'bg-[#FDE047]'}`} />

                      <div className="flex-1 min-w-0">
                        <p className="text-[#FDE047] text-sm font-medium leading-tight">{notif.title}</p>
                        <p className="text-[#FDE047]/50 text-xs mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[#FDE047]/30 text-xs mt-1">
                          {new Date(notif.createdAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all p-1 rounded-full hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
