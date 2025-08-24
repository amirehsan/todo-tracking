"use client";

import { useState } from 'react';
import * as chrono from 'chrono-node';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Learn Next.js', notes: '', dueDate: null, priority: 'high', completed: false },
    { id: 2, title: 'Build a Todo App', notes: '', dueDate: null, priority: 'high', completed: false },
    { id: 3, title: 'Deploy the App', notes: '', dueDate: null, priority: 'medium', completed: true },
  ]);

  const handleAddTask = (inputText) => {
    const parsedResult = chrono.parse(inputText);
    let title = inputText;
    let dueDate = null;

    if (parsedResult.length > 0) {
      const parsedDate = parsedResult[0].start.date();
      const parsedText = parsedResult[0].text;
      // A simple way to remove the date string from the title
      title = inputText.replace(parsedText, '').trim();
      dueDate = parsedDate;
    }

    const newTask = {
      id: Date.now(),
      title,
      notes: '',
      dueDate,
      priority: 'medium',
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const handleToggleComplete = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleUpdateTask = (id, newTitle) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task
      )
    );
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">
            My Tasks
          </h1>
          <ThemeToggle />
        </div>

        <div className="mb-8">
          <TaskInput onAddTask={handleAddTask} />
        </div>

        <div>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onDeleteTask={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
