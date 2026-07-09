'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, CheckCircle2, Circle, 
  Trash2, Pin, Tag, AlertCircle, ArrowUpRight,
  Sun, CloudSun, CloudFog, CloudRain, CloudSnow, CloudLightning, Cloud, LogOut,
  Bell, Settings, Calendar
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface TodoMeta {
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  pinned: boolean;
  actualDescription: string;
}

interface RawTodo {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  reminderEnabled?: boolean;
  reminderDateTime?: string | null;
  reminderBeforeMinutes?: number;
  timezone?: string;
  reminderSent?: boolean;
  isRecurring?: boolean;
  recurringType?: string | null;
  dueDateTime?: string | null;
}

interface Todo extends RawTodo {
  meta: TodoMeta;
}

const REMINDER_OPTIONS = [
  { label: 'At exact time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
];

const RECURRING_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekends', value: 'weekends' },
];

// Helper to safely parse description JSON without breaking old tasks
const parseMeta = (description: string): TodoMeta => {
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === 'object' && 'priority' in parsed) {
      return parsed;
    }
    // Fallback if valid JSON but not our meta format
    return { priority: 'Low', category: 'Personal', pinned: false, actualDescription: description };
  } catch (e) {
    // Legacy task (plain string)
    return { priority: 'Low', category: 'Personal', pinned: false, actualDescription: description };
  }
};

const encodeMeta = (meta: TodoMeta): string => JSON.stringify(meta);

export default function Dashboard() {
  const { token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('Date'); // 'Date', 'Priority'
  
  // New Task State
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newCategory, setNewCategory] = useState('Work');

  // Reminder Modal State
  const [reminderModal, setReminderModal] = useState<{ open: boolean; todo: Todo | null }>({ open: false, todo: null });
  const [remDate, setRemDate] = useState('');
  const [remTime, setRemTime] = useState('');
  const [remBefore, setRemBefore] = useState(0);
  const [remRecurring, setRemRecurring] = useState('');
  const [remEnabled, setRemEnabled] = useState(false);

  const openReminderModal = (todo: Todo) => {
    setReminderModal({ open: true, todo });
    setRemEnabled(todo.reminderEnabled ?? false);
    if (todo.reminderDateTime) {
      const d = new Date(todo.reminderDateTime);
      setRemDate(d.toISOString().split('T')[0]);
      setRemTime(d.toTimeString().slice(0, 5));
    } else {
      const now = new Date();
      setRemDate(now.toISOString().split('T')[0]);
      setRemTime(now.toTimeString().slice(0, 5));
    }
    setRemBefore(todo.reminderBeforeMinutes ?? 0);
    setRemRecurring(todo.recurringType ?? '');
  };

  const saveReminder = async () => {
    if (!reminderModal.todo) return;
    const reminderDateTime = remEnabled && remDate && remTime
      ? new Date(`${remDate}T${remTime}`).toISOString()
      : null;
    await updateTodo(reminderModal.todo._id, {
      reminderEnabled: remEnabled,
      reminderDateTime,
      reminderBeforeMinutes: remBefore,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isRecurring: !!remRecurring,
      recurringType: remRecurring || null,
    } as any);
    setReminderModal({ open: false, todo: null });
  };
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{temp: number, code: number} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (data && data.current_weather) {
          setWeather({ temp: Math.round(data.current_weather.temperature), code: data.current_weather.weathercode });
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    // Fetch fallback immediately so it shows up instantly
    fetchWeather(40.7128, -74.0060);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {}, // Ignore errors, fallback already loaded
        { timeout: 5000 }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={28} className="text-[#FDE047] drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />;
    if (code >= 1 && code <= 3) return <CloudSun size={28} className="text-[#FDE047]/80" />;
    if (code >= 45 && code <= 48) return <CloudFog size={28} className="text-[#FDE047]/60" />;
    if (code >= 51 && code <= 67) return <CloudRain size={28} className="text-[#FDE047]/90" />;
    if (code >= 71 && code <= 77) return <CloudSnow size={28} className="text-[#FDE047]" />;
    if (code >= 95) return <CloudLightning size={28} className="text-[#FDE047]" />;
    return <Cloud size={28} className="text-[#FDE047]/70" />;
  };
  
  // Undo State
  const [undoSnackbar, setUndoSnackbar] = useState<{open: boolean, todo: Todo | null}>({ open: false, todo: null });
  const deleteTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    } else {
      fetchTodos();
    }
  }, [isAuthenticated, router]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl+N for new task is handled natively by browsers usually, but let's override if possible, or just use another
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchTodos = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: RawTodo[] = await res.json();
        const mapped = data.map(t => ({ ...t, meta: parseMeta(t.description) }));
        setTodos(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const meta: TodoMeta = {
      priority: newPriority,
      category: newCategory,
      pinned: false,
      actualDescription: ''
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle, description: encodeMeta(meta) })
      });
      
      if (res.ok) {
        const data: RawTodo = await res.json();
        const newTodo: Todo = { ...data, meta: parseMeta(data.description) };
        setTodos([...todos, newTodo]);
        setNewTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    // Optimistic UI update
    const updatedTodo = { ...todo, ...updates };
    setTodos(todos.map(t => t._id === id ? updatedTodo : t));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/todos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: updatedTodo.title,
          isCompleted: updatedTodo.isCompleted,
          description: encodeMeta(updatedTodo.meta)
        })
      });
    } catch (err) {
      console.error(err);
      // Revert on fail
      setTodos(todos.map(t => t._id === id ? todo : t));
    }
  };

  const togglePin = (id: string) => {
    const todo = todos.find(t => t._id === id);
    if (todo) {
      updateTodo(id, { meta: { ...todo.meta, pinned: !todo.meta.pinned } });
    }
  };

  const deleteTodo = (todo: Todo) => {
    // Optimistic delete
    setTodos(todos.filter(t => t._id !== todo._id));
    setUndoSnackbar({ open: true, todo });

    // Set timeout for actual deletion
    deleteTimeouts.current[todo._id] = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        await fetch(`${apiUrl}/todos/${todo._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to delete", err);
      }
      setUndoSnackbar({ open: false, todo: null });
    }, 5000);
  };

  const undoDelete = () => {
    if (undoSnackbar.todo) {
      const todo = undoSnackbar.todo;
      clearTimeout(deleteTimeouts.current[todo._id]);
      setTodos(prev => [...prev, todo]); // Add back
      setUndoSnackbar({ open: false, todo: null });
    }
  };

  const clearCompleted = async () => {
    const completedTasks = todos.filter(t => t.isCompleted);
    if (completedTasks.length === 0) return;
    
    // Optimistic UI update
    setTodos(todos.filter(t => !t.isCompleted));
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await Promise.all(completedTasks.map(todo => 
        fetch(`${apiUrl}/todos/${todo._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
    } catch (err) {
      console.error("Failed to clear completed tasks", err);
      fetchTodos();
    }
  };

  // Derived state
  const categories = ['All', ...Array.from(new Set(todos.map(t => t.meta.category)))];
  
  const filteredTodos = useMemo(() => {
    let result = todos.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    
    if (filterCategory !== 'All') {
      result = result.filter(t => t.meta.category === filterCategory);
    }
    
    if (filterStatus === 'Active') result = result.filter(t => !t.isCompleted);
    if (filterStatus === 'Completed') result = result.filter(t => t.isCompleted);
    
    // Sort
    result.sort((a, b) => {
      if (a.meta.pinned && !b.meta.pinned) return -1;
      if (!a.meta.pinned && b.meta.pinned) return 1;
      
      if (sortOrder === 'Priority') {
        const p = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return p[b.meta.priority] - p[a.meta.priority];
      }
      return 0; // Fallback to creation order
    });
    
    return result;
  }, [todos, search, filterCategory, filterStatus, sortOrder]);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.isCompleted).length,
    percentage: todos.length ? Math.round((todos.filter(t => t.isCompleted).length / todos.length) * 100) : 0
  };

  if (!isAuthenticated) return null;

  const priorityColors = {
    High: 'bg-red-500/20 text-red-300 border-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Low: 'bg-green-500/20 text-green-300 border-green-500/30',
  };
  
  const priorityIndicator = {
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-green-500',
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-8 pb-20 overflow-y-auto px-4 md:px-8 custom-scrollbar">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#FDE047] tracking-tight mb-2">
            Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, Creator.
          </h1>
          <p className="text-[#FDE047]/60 font-medium text-lg flex items-center gap-3">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="font-mono tracking-widest">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Weather Widget */}
          {weather && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="liquid-glass rounded-2xl px-6 py-4 flex items-center gap-4"
            >
              {getWeatherIcon(weather.code)}
              <div className="flex flex-col">
                <span className="text-2xl font-serif text-[#FDE047] leading-none">{weather.temp}°C</span>
                <span className="text-xs text-[#FDE047]/50 uppercase tracking-widest mt-1">Local</span>
              </div>
            </motion.div>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          {/* Settings Link */}
          <a
            href="/settings"
            className="liquid-glass p-4 rounded-2xl flex items-center justify-center text-[#FDE047]/70 hover:text-[#FDE047] hover:bg-white/10 transition-colors"
            title="Settings"
          >
            <Settings size={28} />
          </a>

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={logout}
            className="liquid-glass rounded-2xl p-4 flex items-center justify-center text-[#FDE047]/70 hover:text-[#FDE047] hover:bg-white/10 transition-colors h-full"
            title="Log out"
          >
            <LogOut size={28} />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Tasks", value: stats.total, icon: <ArrowUpRight /> },
          { label: "Completed", value: stats.completed, icon: <CheckCircle2 /> },
          { label: "Completion Rate", value: `${stats.percentage}%`, icon: <Circle /> }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="liquid-glass rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group"
          >
            <div className="flex justify-between items-center text-[#FDE047]/50">
              <span className="text-sm font-bold uppercase tracking-wider">{stat.label}</span>
              {stat.icon}
            </div>
            <span className="text-4xl font-serif text-[#FDE047]">{stat.value}</span>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Tools & Input Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="liquid-glass rounded-3xl p-2 mb-8 flex flex-col lg:flex-row gap-2"
      >
        <form onSubmit={addTodo} className="flex-1 flex items-center bg-black/20 rounded-full px-4 py-2 border border-white/5">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Type a new task and press Enter..."
            className="bg-transparent border-none outline-none text-[#FDE047] placeholder:text-[#FDE047]/40 flex-1 px-2"
          />
          <select 
            value={newPriority} 
            onChange={e => setNewPriority(e.target.value as any)}
            className="bg-transparent text-[#FDE047]/70 border-none outline-none text-sm cursor-pointer hidden md:block"
          >
            <option value="High" className="bg-[#0a192f]">High Priority</option>
            <option value="Medium" className="bg-[#0a192f]">Medium Priority</option>
            <option value="Low" className="bg-[#0a192f]">Low Priority</option>
          </select>
          <button type="submit" className="ml-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-[#FDE047]">
            <Plus size={20} />
          </button>
        </form>

        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center bg-black/20 rounded-full px-4 py-2 border border-white/5 w-full md:w-auto">
            <Search size={16} className="text-[#FDE047]/40 mr-2" />
            <input
              ref={searchInputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search (Ctrl+K)"
              className="bg-transparent border-none outline-none text-[#FDE047] placeholder:text-[#FDE047]/40 text-sm w-32"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-black/20 text-[#FDE047]/80 rounded-full px-4 py-2 text-sm outline-none border border-white/5"
          >
            <option value="All" className="bg-[#0a192f]">All</option>
            <option value="Active" className="bg-[#0a192f]">Active</option>
            <option value="Completed" className="bg-[#0a192f]">Completed</option>
          </select>
          {todos.some(t => t.isCompleted) && (
            <button 
              onClick={clearCompleted}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full px-4 py-2 text-sm transition-colors border border-red-500/30 flex items-center gap-2"
              title="Clear Completed Tasks"
            >
              <Trash2 size={16} />
              <span className="hidden md:inline">Clear Completed</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar"
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterCategory === cat 
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'liquid-glass text-[#FDE047]/70 hover:text-[#FDE047]'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Task List */}
      <div className="flex flex-col gap-3 relative">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="liquid-glass h-20 rounded-2xl animate-pulse bg-white/5" />
          ))
        ) : filteredTodos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-[#FDE047]/40"
          >
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="font-serif text-2xl">No tasks found</p>
            <p className="text-sm mt-2">Try adjusting your filters or adding a new task.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTodos.map(todo => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.2 }}
                key={todo._id}
                className="liquid-glass rounded-2xl p-4 pr-6 flex items-center group hover:bg-white/[0.03] transition-colors relative overflow-hidden"
              >
                {/* Priority Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityIndicator[todo.meta.priority]}`} />

                <button 
                  onClick={() => updateTodo(todo._id, { isCompleted: !todo.isCompleted })}
                  className="mx-4 text-[#FDE047]/50 hover:text-[#FDE047] transition-colors"
                >
                  {todo.isCompleted ? (
                    <CheckCircle2 size={24} className="text-[#FDE047]" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-medium transition-all ${todo.isCompleted ? 'text-[#FDE047]/40 line-through' : 'text-[#FDE047]'}`}>
                    {todo.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md border ${priorityColors[todo.meta.priority]}`}>
                      {todo.meta.priority}
                    </span>
                    <span className="flex items-center text-xs text-[#FDE047]/40 gap-1">
                      <Tag size={12} /> {todo.meta.category}
                    </span>
                    {todo.reminderEnabled && todo.reminderDateTime && (
                      <span className={`flex items-center text-xs gap-1 ${
                        new Date(todo.reminderDateTime) < new Date() && !todo.reminderSent
                          ? 'text-red-400'
                          : todo.reminderSent
                          ? 'text-[#FDE047]/30'
                          : 'text-green-400'
                      }`}>
                        <Bell size={11} />
                        {new Date(todo.reminderDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Reminder Bell */}
                  <button
                    onClick={() => openReminderModal(todo)}
                    className={`p-2 rounded-full transition-colors ${
                      todo.reminderEnabled
                        ? 'text-[#FDE047] bg-white/10'
                        : 'text-[#FDE047]/40 hover:bg-white/10 hover:text-[#FDE047]'
                    }`}
                    title="Set Reminder"
                  >
                    <Bell size={18} />
                  </button>
                  <button 
                    onClick={() => togglePin(todo._id)}
                    className={`p-2 rounded-full transition-colors ${todo.meta.pinned ? 'text-[#FDE047] bg-white/10' : 'text-[#FDE047]/40 hover:bg-white/10 hover:text-[#FDE047]'}`}
                  >
                    <Pin size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo)}
                    className="p-2 rounded-full text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Undo Delete Snackbar */}
      <AnimatePresence>
        {undoSnackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 liquid-glass rounded-full px-6 py-3 flex items-center gap-4 z-50 shadow-2xl"
          >
            <span className="text-[#FDE047] text-sm">Task deleted</span>
            <button 
              onClick={undoDelete}
              className="text-[#FDE047] font-bold text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition-colors"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {reminderModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setReminderModal({ open: false, todo: null })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(253,224,71,0.2)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#FDE047] font-serif text-2xl">Set Reminder</h2>
                <button onClick={() => setReminderModal({ open: false, todo: null })} className="text-[#FDE047]/40 hover:text-[#FDE047]">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <p className="text-[#FDE047]/60 text-sm mb-6 truncate">
                Task: <span className="text-[#FDE047]">{reminderModal.todo?.title}</span>
              </p>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between mb-5 liquid-glass rounded-2xl px-4 py-3">
                <span className="text-[#FDE047] font-medium">Enable Reminder</span>
                <button
                  onClick={() => setRemEnabled(!remEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    remEnabled ? 'bg-[#FDE047]' : 'bg-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-black rounded-full transition-all ${
                    remEnabled ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {remEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#FDE047]/60 text-xs uppercase tracking-widest mb-1 block">Date</label>
                      <input
                        type="date"
                        value={remDate}
                        onChange={(e) => setRemDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#FDE047] outline-none focus:border-[#FDE047]/40 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[#FDE047]/60 text-xs uppercase tracking-widest mb-1 block">Time</label>
                      <input
                        type="time"
                        value={remTime}
                        onChange={(e) => setRemTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#FDE047] outline-none focus:border-[#FDE047]/40 text-sm"
                      />
                    </div>
                  </div>

                  {/* Remind Before */}
                  <div>
                    <label className="text-[#FDE047]/60 text-xs uppercase tracking-widest mb-1 block">Remind Me</label>
                    <select
                      value={remBefore}
                      onChange={(e) => setRemBefore(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#FDE047] outline-none focus:border-[#FDE047]/40 text-sm"
                    >
                      {REMINDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0a192f]">{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Recurring */}
                  <div>
                    <label className="text-[#FDE047]/60 text-xs uppercase tracking-widest mb-1 block">Recurring</label>
                    <select
                      value={remRecurring}
                      onChange={(e) => setRemRecurring(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#FDE047] outline-none focus:border-[#FDE047]/40 text-sm"
                    >
                      {RECURRING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0a192f]">{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Timezone */}
                  <p className="text-[#FDE047]/30 text-xs">
                    Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setReminderModal({ open: false, todo: null })}
                  className="flex-1 py-3 rounded-2xl border border-white/10 text-[#FDE047]/60 hover:text-[#FDE047] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveReminder}
                  className="flex-1 py-3 rounded-2xl bg-[#FDE047] text-black font-bold hover:bg-[#FDE047]/90 transition-colors"
                >
                  Save Reminder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
