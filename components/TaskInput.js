"use client";

import { useState } from 'react';

export default function TaskInput({ onAddTask }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        name="task"
        placeholder="e.g., buy groceries tomorrow at 5pm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-grow p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
      />
      <button
        type="submit"
        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Add task"
      >
        Add
      </button>
    </form>
  );
}
