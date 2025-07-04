import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'stickyNotes.json');

const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error reading stickyNotes file:', err);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing stickyNotes file:', err);
  }
};

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const notes = readData();
        res.status(200).json(notes);
      } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;
    case 'POST':
      try {
        const notes = readData();
        const newNote = req.body;
        notes.push(newNote);
        writeData(notes);
        res.status(201).json(newNote);
      } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;
    case 'PUT':
      try {
        const notes = readData();
        const updatedNote = req.body;
        const index = notes.findIndex(note => note.id === updatedNote.id);
        if (index === -1) {
          res.status(404).json({ error: 'Note not found' });
        } else {
          notes[index] = updatedNote;
          writeData(notes);
          res.status(200).json(updatedNote);
        }
      } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;
    case 'DELETE':
      try {
        const notes = readData();
        const { id } = req.body;
        const filteredNotes = notes.filter(note => note.id !== id);
        writeData(filteredNotes);
        res.status(200).json({ id });
      } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
