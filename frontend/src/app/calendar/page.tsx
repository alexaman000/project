'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, Bell, Tag } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameMonth, isSameDay, addMonths, subMonths, eachDayOfInterval } from 'date-fns';

interface Todo {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  reminderEnabled?: boolean;
  reminderDateTime?: string | null;
  meta?: any;
}

export default function CalendarPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    fetch(`${apiUrl}/todos`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const parsedData = data.map((t: any) => {
          let meta = {};
          try { meta = JSON.parse(t.description || '{}'); } catch (e) {}
          return { ...t, meta };
        });
        setTodos(parsedData);
      })
      .catch(console.error);
  }, [isAuthenticated, token, apiUrl, router]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const startDate = startOfWeek(startOfMonth(currentDate));
  const endDate = endOfWeek(endOfMonth(currentDate));
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getTodosForDate = (date: Date) => {
    return todos.filter(t => {
      if (!t.reminderDateTime) return false;
      return isSameDay(new Date(t.reminderDateTime), date);
    });
  };

  const selectedTodos = getTodosForDate(selectedDate);

  return (
    <div className="w-full flex-1 flex flex-col pt-8 pb-20 overflow-y-auto px-4 md:px-8 custom-scrollbar">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#FDE047]/50 hover:text-[#FDE047] transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-4xl md:text-5xl font-serif text-[#FDE047] tracking-tight">Calendar View</h1>
        <p className="text-[#FDE047]/50 mt-2">Manage your scheduled tasks and reminders.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Grid */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 liquid-glass rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-[#FDE047]">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10 text-[#FDE047] transition-colors"><ChevronLeft /></button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10 text-[#FDE047] transition-colors"><ChevronRight /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[#FDE047]/50 text-xs font-semibold uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dateRange.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dayTodos = getTodosForDate(day);
              
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[80px] p-2 rounded-2xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-[#FDE047]/20 border-[#FDE047]/50 shadow-[0_0_15px_rgba(253,224,71,0.2)]'
                      : isCurrentMonth 
                        ? 'bg-white/5 border-transparent hover:bg-white/10'
                        : 'bg-transparent border-transparent opacity-30 hover:bg-white/5'
                  }`}
                >
                  <div className={`text-sm font-medium ${isSelected ? 'text-[#FDE047]' : 'text-[#FDE047]/70'} mb-1`}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayTodos.slice(0, 2).map(t => (
                      <div key={t._id} className="text-[10px] leading-tight truncate text-[#FDE047]/60 bg-black/20 rounded px-1.5 py-0.5">
                        {t.title}
                      </div>
                    ))}
                    {dayTodos.length > 2 && (
                      <div className="text-[10px] text-[#FDE047]/40 pl-1">+{dayTodos.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Date Tasks */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-96 liquid-glass rounded-3xl p-6 flex flex-col h-[600px]"
        >
          <h3 className="text-xl font-serif text-[#FDE047] mb-6">
            {format(selectedDate, 'EEEE, MMMM do')}
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
            {selectedTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-[#FDE047]/30">
                <Bell size={48} className="mb-4 opacity-40" />
                <p>No reminders for this day.</p>
              </div>
            ) : (
              <AnimatePresence>
                {selectedTodos.map(todo => (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/20 rounded-2xl p-4 border border-white/5 relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      todo.meta?.priority === 'High' ? 'bg-red-500' :
                      todo.meta?.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <h4 className={`text-[#FDE047] font-medium ${todo.isCompleted ? 'line-through opacity-50' : ''}`}>
                      {todo.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#FDE047]/50">
                      <span className="flex items-center gap-1">
                        <Bell size={12} />
                        {format(new Date(todo.reminderDateTime!), 'hh:mm a')}
                      </span>
                      {todo.meta?.category && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {todo.meta.category}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
