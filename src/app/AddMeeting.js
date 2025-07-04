import { useState, useEffect, useRef } from 'react';

const AddMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [meetingId, setMeetingId] = useState('');
  const [date, setDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    fetch('/api/meetings')
      .then((response) => response.json())
      .then((data) => setMeetings(data));
  }, []);

  const handleAddMeeting = async () => {
    const newMeeting = { id: Date.now().toString(), meetingId, date };
    const response = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeeting),
    });
    const savedMeeting = await response.json();
    setMeetings([savedMeeting, ...meetings]);
    setMeetingId('');
    setDate('');
  };

  const handleDeleteMeeting = async (id) => {
    await fetch('/api/meetings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setMeetings(meetings.filter((meeting) => meeting.id !== id));
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
          <h3 className="text-xl font-semibold mb-2">Past Meetings</h3>
          <ul>
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="mb-2 p-2 cursor-pointer hover:bg-gray-300 border-gray-300"
              >
                <p className="text-sm truncate">{meeting.meetingId}</p>
                <p className="text-xs text-gray-500">{meeting.date}</p>
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
          <h1 className="text-2xl font-bold">Add Meeting</h1>
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
            placeholder="Meeting ID or URL"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="w-full p-2 mb-2 border rounded-md"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 mb-2 border rounded-md"
          />
          <button onClick={handleAddMeeting} className="px-4 py-2 bg-red-500 text-white rounded-md" style={{ backgroundColor: '#ED254E'}}>
            Add Meeting
          </button>
        </div>
       
      </main>
    </div>
  );
};

export default AddMeeting;
