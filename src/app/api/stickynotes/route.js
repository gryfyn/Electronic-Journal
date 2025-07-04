import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'stickynotes.json');

const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error reading sticky notes file:', err);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing sticky notes file:', err);
  }
};

export async function GET() {
  const notes = readData();
  return new Response(JSON.stringify(notes), { status: 200 });
}

export async function POST(request) {
  const notes = readData();
  const newNote = await request.json();
  notes.push(newNote);
  writeData(notes);
  return new Response(JSON.stringify(newNote), { status: 201 });
}

export async function DELETE(request) {
  const notes = readData();
  const { id } = await request.json();
  const filteredNotes = notes.filter((note) => note.id !== id);
  writeData(filteredNotes);
  return new Response(JSON.stringify({ id }), { status: 200 });
}