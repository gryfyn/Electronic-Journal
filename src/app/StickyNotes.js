import { useState, useEffect, useRef } from 'react';

const colorPalette = [
  '#FFFF88', '#FFFF99', '#FFFF66', '#FFFF33', // Neutral shades of yellow
  '#FFDDDD', '#FFCCCC', '#FF9999', '#FF6666', // Neutral shades of red
  '#DDFFDD', '#CCFFCC', '#99FF99', '#66FF66', // Neutral shades of green
  '#DDDDFF', '#CCCCFF', '#9999FF', '#6666FF', // Neutral shades of blue
];

const StickyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#FFFF88');

  useEffect(() => {
    fetch('/api/stickynotes')
      .then((response) => response.json())
      .then((data) => setNotes(data));
  }, []);

  const addNote = async () => {
    const newNote = { id: Date.now().toString(), content: noteContent, color: noteColor };
    const response = await fetch('/api/stickynotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    });
    const savedNote = await response.json();
    setNotes([savedNote, ...notes]);
    setNoteContent('');
    setNoteColor('#FFFF88');
  };

  const deleteNote = async (id) => {
    await fetch('/api/stickynotes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: '	#011936',}}>
      {/* Left section */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '10px' }}>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom:'4px'}}>Sticky Notes</h2>
        <textarea
          placeholder="Add Note"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          style={{
            marginBottom: '10px',
            width: '190px', // Match the width of the color picker
            height: '120px', // Increased height
            padding: '10px',
            boxSizing: 'border-box',
            borderRadius: '2px'
          }}
        />
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
            {colorPalette.map((color, index) => (
              <div
                key={index}
                onClick={() => setNoteColor(color)}
                style={{
                  backgroundColor: color,
                  width: '37px',
                  height: '37px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: color === noteColor ? '2px solid black' : 'none',
                  boxShadow: color === noteColor ? '0 0 5px rgba(0, 0, 0, 0.3)' : 'none',
                }}
              />
            ))}
          </div>
          <button
            onClick={addNote}
            style={{
              width: '200px', // Match the width of the color picker
              padding: '10px',
              border: 'none',
              backgroundColor: '#66FF66',
              color: '#000',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
              transition: 'background-color 0.3s',
              marginTop:'4px',
            }}
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '4px', backgroundColor: '#000', height: '100%',  boxShadow: 'inherit', marginLeft: '-230px'}}></div>

      {/* Right section for past notes */}
      <div style={{ flex: '2', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
      <h2 style={{fontSize: '50px', fontWeight: 'bold', color: 'white'}}>Latest Notes</h2>
        {notes.map(note => (
          <div
            key={note.id}
            style={{
              backgroundColor: note.color,
              width: '220px',
              height: '200px',
              padding: '10px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              borderRadius: '3px'
            }}
          >
            <p style={{ margin: 0 }}>{note.content}</p>
            <button onClick={() => deleteNote(note.id)} style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor:'#ff007b', padding: '5px 25px', borderRadius: '3px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickyNotes;
