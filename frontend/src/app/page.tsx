'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Todo {
  _id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function Home() {
  const { token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    } else {
      fetchTodos();
    }
  }, [isAuthenticated, router]);

  const fetchTodos = async () => {
    try {
      const res = await fetch('http://localhost:3001/todos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
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

    try {
      const res = await fetch('http://localhost:3001/todos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle, description: '' })
      });
      if (res.ok) {
        const newTodo = await res.json();
        setTodos([...todos, newTodo]);
        setNewTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
      const res = await fetch(`http://localhost:3001/todos/${todo._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isCompleted: !todo.isCompleted })
      });
      if (res.ok) {
        const updatedTodo = await res.json();
        setTodos(todos.map(t => t._id === updatedTodo._id ? updatedTodo : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTodos(todos.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          My Tasks
        </h1>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
          Logout
        </button>
      </header>

      <form onSubmit={addTodo} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <input 
          type="text" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1.1rem' }}
        />
        <button type="submit" className="btn" style={{ width: 'auto', padding: '0 2rem', borderRadius: '12px' }}>
          Add Task
        </button>
      </form>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        {todos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No tasks yet. Add one above!</p>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {todos.map(todo => (
              <li key={todo._id} className="animate-fade-in" style={{ 
                display: 'flex', alignItems: 'center', padding: '1rem', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease'
              }}>
                <input 
                  type="checkbox" 
                  checked={todo.isCompleted}
                  onChange={() => toggleComplete(todo)}
                  style={{ width: '20px', height: '20px', marginRight: '1rem', cursor: 'pointer' }}
                />
                <span style={{ 
                  flex: 1, 
                  fontSize: '1.1rem',
                  textDecoration: todo.isCompleted ? 'line-through' : 'none',
                  color: todo.isCompleted ? 'var(--text-muted)' : 'white'
                }}>
                  {todo.title}
                </span>
                <button onClick={() => deleteTodo(todo._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
