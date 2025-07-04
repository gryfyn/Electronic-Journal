'use client';

import { useEffect, useState, useRef } from 'react';
import StickyNotes from './StickyNotes';
import AddMeeting from './AddMeeting';
import AddTask from './AddTask'; 
import MoodLogger from './MoodLogger';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';



// Utility function to format date and time
const formatDateTime = () => {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[now.getDay()];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[now.getMonth()];
  const day = now.getDate();
  const year = now.getFullYear();
  const hours = now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

  return {
    date: `${dayName} ${day} ${month}, ${year}`,
    time: `${hours}:${minutes} ${ampm}`,
    today: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
};

// Utility function to generate Tailwind CSS classes dynamically
const tw = (classes) => classes.join(' ');


const prompts = [
  "How are you feeling today?",
  "What's the best thing that happened to you today?",
  "What's one thing you're grateful for today?",
  "What's something new you learned today?",
  "What's a challenge you faced today and how did you overcome it?",
  "What's something you're looking forward to tomorrow?",
  "Describe your day in three words.",
  "What's one thing you'd like to improve about yourself?",
  "What made you smile today?",
  "If you could change one thing about today, what would it be?"
];

const getRandomPrompt = () => {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};


const Home = () => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dateTime, setDateTime] = useState(formatDateTime());
  const [activeView, setActiveView] = useState('home');
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [mood, setMood] = useState(3);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    fetch('/api/entries')
      .then((response) => response.json())
      .then((data) => setEntries(data));

    // Update date and time every minute
    const interval = setInterval(() => {
      setDateTime(formatDateTime());
    }, 60000);

        // Set a new prompt each day
    const storedDate = localStorage.getItem('promptDate');
    const currentDate = new Date().toDateString();
    if (storedDate !== currentDate) {
      const newPrompt = getRandomPrompt();
      setDailyPrompt(newPrompt);
      localStorage.setItem('promptDate', currentDate);
      localStorage.setItem('dailyPrompt', newPrompt);
    } else {
         setDailyPrompt(localStorage.getItem('dailyPrompt') || getRandomPrompt());
        }
  

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      // Don't submit if title or content is empty
      return;
    }
    const newEntry = { 
      title, 
      content, 
      id: editingEntry ? editingEntry.id : Date.now().toString(), 
      date: formatDateTime().today,
      mood,
      prompt: dailyPrompt
    };

    if (editingEntry) {
      await fetch('/api/entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      setEntries(entries.map((entry) => (entry.id === newEntry.id ? newEntry : entry)));
    } else {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      setEntries([newEntry, ...entries]);
    }

    setTitle('');
    setContent('');
    setEditingEntry(null);
    setMood(3);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || 3);
  };

  const handleDeleteEntry = async () => {
    if (!editingEntry) return;

    await fetch('/api/entries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingEntry.id }),
    });
    setEntries(entries.filter((entry) => entry.id !== editingEntry.id));
    setTitle('');
    setContent('');
    setEditingEntry(null);
    setMood(3);
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

      // Calculate new sidebar width and constrain it
      const newSidebarWidth = Math.min(
        Math.max(minSidebarWidth, e.clientX),
        maxSidebarWidth
      );

      // Apply constraints to sidebar and main content
      sidebarRef.current.style.width = `${newSidebarWidth}px`;
      mainContentRef.current.style.flex = `1 1 calc(100% - ${newSidebarWidth}px)`;

      // Ensure main content width is not less than the minimum width
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


  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Separate entries into today and previous days
  const todayDate = dateTime.today;
  const todayEntries = entries.filter(entry => entry.date === todayDate).sort((a, b) => new Date(b.date) - new Date(a.date));
  const previousEntries = entries.filter(entry => entry.date !== todayDate).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex flex-col h-screen">
      <header className={tw([ 'text-white', 'p-6'])} style={{backgroundColor: '#23B5D3'}}>
        <div className={tw(['container', 'mx-auto', 'flex', 'justify-between'])}>
          <h1 className={tw(['text-2xl', 'font-bold'])}>E-Notebook</h1>
          <div className={tw(['text-right'])}>
            <div>{dateTime.date}</div>
            <div>{dateTime.time}</div>
          </div>
        </div>
      </header>
      <div className={tw(['flex', 'justify-between', 'items-center', 'bg-blue-100', 'p-4'])}>
        <div className="flex gap-2">
          
          <button
            onClick={() => setActiveView('home')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#007BFF', width: '140px' }}
          >
            Journal
          </button>
          <button
            onClick={() => setActiveView('stickyNotes')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            style={{ backgroundColor: '#66FF66', color: 'black', fontWeight: 'bold', width: '140px' }}
          >
            Sticky Notes
          </button>
          <button
            onClick={() => setActiveView('addMeeting')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#ED254E', width: '140px' }}
          >
            Add Meeting
          </button>
          <button
            onClick={() => setActiveView('addTask')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#FBBF24', width: '140px' }}
          >
            Add Task
          </button>
        </div>
        <h1 className="text-2xl font-bold">Hey, Griff</h1>
      </div>
      
      {activeView === 'stickyNotes' && <StickyNotes />}
      {activeView === 'addMeeting' && <AddMeeting />}
      {activeView === 'addTask' && <AddTask />}
      {activeView === 'home' && (
        <div className={tw(['flex', 'flex-grow', 'overflow-hidden'])}>
        <aside
            ref={sidebarRef}
            className={tw([
              'bg-gray-200',
              'transition-all',
              'duration-300',
              'ease-in-out',
              isSidebarExpanded ? 'w-1/4' : 'w-12',
              'min-w-[48px]',
              'max-w-[600px]',
              'relative',
            ])}
          >
            <div className={tw(['mb-4'])}>
              <h3 className={tw(['text-xl', 'font-semibold', 'mb-2'])}>Today</h3>
              <ul>
                {todayEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className={tw([
                      'mb-2',
                      'p-2',
                      'cursor-pointer',
                      'hover:bg-gray-300',
                      'border-gray-300'
                    ])}
                    onClick={() => handleEditEntry(entry)}
                  >
                    <p className={tw(['text-sm', 'truncate'])}>{entry.content}</p>
                    <p className={tw(['text-xs', 'text-gray-500'])}>{entry.date}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={tw(['text-xl', 'font-semibold', 'mb-2'])}>Previous Entries</h3>
              <ul>
                {previousEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className={tw([
                      'mb-2',
                      'p-2',
                      'cursor-pointer',
                      'hover:bg-gray-300',
                      'border-gray-300'
                    ])}
                    onClick={() => handleEditEntry(entry)}
                  >
                    <p className={tw(['text-sm', 'truncate'])}>{entry.content}</p>
                    <p className={tw(['text-xs', 'text-gray-500'])}>{entry.date}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={tw([
                'h-1',
                'bg-gray-300',
                'cursor-ew-resize',
                'resize-x',
                'resize-y'
              ])}
              onMouseDown={startResizing}
            ></div>
          </aside>
          <main
            ref={mainContentRef}
            className={tw([
              'bg-white',
              'p-8',
              'overflow-y-auto',
              'flex-grow',
              'transition-all',
              'duration-300',
              'ease-in-out',
              isSidebarExpanded ? 'max-w-[calc(100%-200px)]' : 'max-w-[calc(100%-48px)]'
            ])}
          >
            <div className={tw(['container', 'mx-auto'])}>
              {activeView === 'home' && (
                <form onSubmit={handleAddEntry}>
                  <div className={tw([
                    'mb-8',
                    'p-6',
                    'bg-gradient-to-r',
                    'from-blue-100',
                    'to-purple-100',
                    'rounded-lg',
                    'shadow-md',
                    'border',
                    'border-blue-200'
                  ])}>
                    <h2 className={tw([
                      'text-2xl',
                      'font-bold',
                      'mb-3',
                      'text-blue-800'
                    ])}>
                      Daily Prompt
                    </h2>
                    <p className={tw([ 'text-xl', 'italic', 'text-purple-700', 'font-medium', 'leading-relaxed' ])}>
  &quot;{dailyPrompt}&quot;
</p>

                  </div>
                  <MoodLogger mood={mood} setMood={setMood} />
                  <div className={tw(['mb-4'])}>
                    <label className={tw(['block', 'text-lg', 'font-medium'])}>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={tw(['w-full', 'p-2', 'border', 'rounded-md', 'border-gray-300'])}
                      placeholder="Entry title"
                    />
                  </div>
                  <div className={tw(['mb-4'])}>
                    <label className={tw(['block', 'text-lg', 'font-medium'])}>Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={tw(['w-full', 'p-2', 'border', 'rounded-md', 'border-gray-300'])}
                      rows="10"
                      placeholder="Write your entry here..."
                    ></textarea>
                  </div>
                  <div className={tw(['flex', 'justify-between'])}>
                    <button
                      type="submit"
                      className={tw([
                        'bg-blue-500',
                        'text-white',
                        'px-4',
                        'py-2',
                        'rounded-md',
                        'hover:bg-blue-600'
                      ])}
                    >
                      {editingEntry ? 'Save Changes' : 'Add Entry'}
                    </button>
                    {editingEntry && (
                      <button
                        type="button"
                        onClick={handleDeleteEntry}
                        className={tw([
                          'bg-red-500',
                          'text-white',
                          'px-4',
                          'py-2',
                          'rounded-md',
                          'hover:bg-red-600'
                        ])}
                      >
                        Delete Entry
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Home;