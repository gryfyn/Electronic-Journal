import { useState, useEffect, useRef } from 'react';

const AddTask = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    fetch('/api/tasks')
      .then((response) => response.json())
      .then((data) => setTasks(data));
  }, []);

  const handleAddTask = async () => {
    const newTask = { id: Date.now().toString(), taskName, description, date };
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });
    const savedTask = await response.json();
    setTasks([savedTask, ...tasks]);
    setTaskName('');
    setDescription('');
    setDate('');
  };

  const handleDeleteTask = async (id) => {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setTasks(tasks.filter((task) => task.id !== id));
    setSelectedTask(null);
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;
    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedTask),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    setSelectedTask(null);
  };

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const minSidebarWidth = 200;
      const maxSidebarWidth = 600;
      const minMainWidth = 600;

      const newSidebarWidth = Math.min(
        Math.max(minSidebarWidth, e.clientX),
        maxSidebarWidth
      );

      sidebarRef.current.style.width = `${newSidebarWidth}px`;
      mainContentRef.current.style.flex = `1 1 calc(100% - ${newSidebarWidth}px)`;

      const currentMainWidth = window.innerWidth - newSidebarWidth;
      if (currentMainWidth < minMainWidth) {
        sidebarRef.current.style.width = `${window.innerWidth - minMainWidth}px`;
        mainContentRef.current.style.flex = `1 1 ${minMainWidth}px`;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-[#011936] text-white' : 'bg-white text-black'}`}>
      <aside
        ref={sidebarRef}
        className="bg-gray-200 p-4 overflow-y-auto w-1/4 min-w-[200px] max-w-[600px]"
      >
        <div>
          <h3 className="text-xl font-semibold mb-2">Tasks</h3>
          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                className="mb-2 p-2 cursor-pointer hover:bg-gray-300 border-gray-300"
                onClick={() => setSelectedTask(task)}
              >
                <p className="text-sm truncate">{task.taskName}</p>
                <p className="text-xs text-gray-500">{task.date}</p>
              </li>
            ))}
          </ul>
        </div>
        <div
          className="h-1 bg-gray-300 cursor-ew-resize resize-x resize-y"
          onMouseDown={startResizing}
        ></div>
      </aside>
      <main
        ref={mainContentRef}
        className={`flex-grow p-8 overflow-y-auto ${darkMode ? 'bg-[#011936] text-white' : 'bg-white text-black'}`}
      >
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Add Task</h1>
          <div className="flex items-center">
            <label className="mr-2">Dark Mode</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full p-2 mb-2 border rounded-md"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mb-2 border rounded-md h-32"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 mb-2 border rounded-md"
          />
          <button onClick={handleAddTask} className="px-4 py-2 text-white rounded-md" style={{backgroundColor: '#FBBF24', color: '#000', fontWeight: 'bold'}}>
            Add Task
          </button>
        </div>

        {selectedTask && (
          <div className="p-4 border-t mt-4">
            <h3 className="text-xl font-semibold mb-2">Edit Task</h3>
            <input
              type="text"
              placeholder="Task Name"
              value={selectedTask.taskName}
              onChange={(e) => setSelectedTask({ ...selectedTask, taskName: e.target.value })}
              className="w-full p-2 mb-2 border rounded-md"
            />
            <textarea
              placeholder="Description"
              value={selectedTask.description}
              onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
              className="w-full p-2 mb-2 border rounded-md h-32"
            />
            <input
              type="date"
              value={selectedTask.date}
              onChange={(e) => setSelectedTask({ ...selectedTask, date: e.target.value })}
              className="w-full p-2 mb-2 border rounded-md"
            />
            <button onClick={handleEditTask} className="px-4 py-2 text-white rounded-md" style={{backgroundColor: '#FBBF24', color: '#000', fontWeight: 'bold'}}>
              Save Task
            </button>
            <button onClick={() => handleDeleteTask(selectedTask.id)} className="px-4 py-2 text-white rounded-md ml-2" style={{backgroundColor: '#FF0000', color: '#000', fontWeight: 'bold'}}>
              Delete Task
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddTask;
