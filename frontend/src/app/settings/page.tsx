'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, Bell, Mail, Moon, Globe, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [settings, setSettings] = useState({
    emailNotifications: true,
    browserNotifications: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth'); return; }
    fetch(`${apiUrl}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, [isAuthenticated, token, apiUrl, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${apiUrl}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const ToggleRow = ({
    icon, label, description, settingKey,
  }: { icon: React.ReactNode; label: string; description: string; settingKey: keyof typeof settings }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="text-[#FDE047]/60">{icon}</div>
        <div>
          <p className="text-[#FDE047] font-medium">{label}</p>
          <p className="text-[#FDE047]/40 text-sm">{description}</p>
        </div>
      </div>
      <button
        onClick={() => toggle(settingKey)}
        className={`w-12 h-6 rounded-full transition-all relative ${settings[settingKey] ? 'bg-[#FDE047]' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-all ${settings[settingKey] ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="w-full flex-1 flex flex-col pt-8 pb-20 overflow-y-auto px-4 md:px-8 custom-scrollbar">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#FDE047]/50 hover:text-[#FDE047] transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-4xl md:text-5xl font-serif text-[#FDE047] tracking-tight">Settings</h1>
        <p className="text-[#FDE047]/50 mt-2">Manage your notification and reminder preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="liquid-glass rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-[#FDE047]/60" />
            <h2 className="text-[#FDE047] font-serif text-xl">Notifications</h2>
          </div>
          <ToggleRow
            icon={<Mail size={18} />}
            label="Email Notifications"
            description="Receive reminder emails for your tasks"
            settingKey="emailNotifications"
          />
          <ToggleRow
            icon={<Bell size={18} />}
            label="Browser Notifications"
            description="Show push notifications in your browser"
            settingKey="browserNotifications"
          />
        </motion.div>

        {/* Quiet Hours Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Moon size={20} className="text-[#FDE047]/60" />
            <h2 className="text-[#FDE047] font-serif text-xl">Quiet Hours</h2>
          </div>
          <ToggleRow
            icon={<Moon size={18} />}
            label="Enable Quiet Hours"
            description="Silence browser notifications during set hours"
            settingKey="quietHoursEnabled"
          />
          {settings.quietHoursEnabled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-[#FDE047]/50 text-xs uppercase tracking-widest mb-1 block">From</label>
                <input
                  type="time" value={settings.quietHoursStart}
                  onChange={(e) => setSettings((p) => ({ ...p, quietHoursStart: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#FDE047] outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-[#FDE047]/50 text-xs uppercase tracking-widest mb-1 block">To</label>
                <input
                  type="time" value={settings.quietHoursEnd}
                  onChange={(e) => setSettings((p) => ({ ...p, quietHoursEnd: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#FDE047] outline-none text-sm"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Timezone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-[#FDE047]/60" />
            <h2 className="text-[#FDE047] font-serif text-xl">Timezone</h2>
          </div>
          <p className="text-[#FDE047]/50 text-sm mb-3">
            Your timezone is auto-detected. All reminders will be sent at the correct local time.
          </p>
          <div className="liquid-glass rounded-2xl px-4 py-3 text-[#FDE047] font-mono text-sm">
            🌍 {settings.timezone}
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 max-w-4xl">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-3 rounded-2xl bg-[#FDE047] text-black font-bold hover:bg-[#FDE047]/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </motion.div>
    </div>
  );
}
