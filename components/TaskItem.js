"use client";

import { useState } from 'react';

export default function TaskItem({ task, onDeleteTask, onToggleComplete, onUpdateTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onUpdateTask(task.id, editedTitle.trim());
      setIsEditing(false);
    }
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-3 flex-grow">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex-shrink-0"
        />
        <div className="flex-grow">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full p-1 border border-gray-300 dark:border-gray-700 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div>
              <span className={task.completed ? 'line-through text-gray-500' : ''}>
                {task.title}
              </span>
              {formattedDate && (
                <span className={`ml-2 text-sm ${task.completed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formattedDate}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-2">
        {isEditing ? (
          <button onClick={handleSave} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-green-500">
            Save
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500">
            Edit
          </button>
        )}
        <button
          onClick={() => onDeleteTask(task.id)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
