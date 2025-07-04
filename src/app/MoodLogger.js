import React from 'react';

const MoodLogger = ({ mood, setMood }) => {
  const moods = [
    { value: 1, icon: '😢', color: 'text-red-500' },
    { value: 2, icon: '😕', color: 'text-orange-500' },
    { value: 3, icon: '😐', color: 'text-yellow-500' },
    { value: 4, icon: '🙂', color: 'text-lime-500' },
    { value: 5, icon: '😄', color: 'text-green-500' },
  ];

  return (
    <div className="flex justify-between items-center mb-4">
      <span className="text-lg font-medium">Mood:</span>
      <div className="flex space-x-2">
        {moods.map((m) => (
          <button
            key={m.value}
            type="button" // Add this to prevent form submission
            onClick={() => setMood(m.value)}
            className={`text-2xl ${mood === m.value ? 'opacity-100' : 'opacity-50'} ${m.color}`}
          >
            {m.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodLogger;