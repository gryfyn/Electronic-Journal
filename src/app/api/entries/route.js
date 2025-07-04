import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'entries.json');

const readData = () => {
  const jsonData = fs.readFileSync(dataFilePath);
  return JSON.parse(jsonData);
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const entries = readData();
  return new Response(JSON.stringify(entries), { status: 200 });
}

export async function POST(request) {
  const entries = readData();
  const newEntry = await request.json();
  entries.push(newEntry);
  writeData(entries);
  return new Response(JSON.stringify(newEntry), { status: 201 });
}

export async function PUT(request) {
  const entries = readData();
  const updatedEntry = await request.json();
  const index = entries.findIndex((entry) => entry.id === updatedEntry.id);
  entries[index] = updatedEntry;
  writeData(entries);
  return new Response(JSON.stringify(updatedEntry), { status: 200 });
}

export async function DELETE(request) {
  const entries = readData();
  const { id } = await request.json();
  const filteredEntries = entries.filter((entry) => entry.id !== id);
  writeData(filteredEntries);
  return new Response(JSON.stringify({ id }), { status: 200 });
}
