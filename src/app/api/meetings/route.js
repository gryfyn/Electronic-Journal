import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'meetings.json');

const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error reading meetings file:', err);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing meetings file:', err);
  }
};

export async function GET() {
  const meetings = readData();
  return new Response(JSON.stringify(meetings), { status: 200 });
}

export async function POST(request) {
  const meetings = readData();
  const newMeeting = await request.json();
  meetings.push(newMeeting);
  writeData(meetings);
  return new Response(JSON.stringify(newMeeting), { status: 201 });
}

export async function PUT(request) {
  const meetings = readData();
  const updatedMeeting = await request.json();
  const index = meetings.findIndex((meeting) => meeting.id === updatedMeeting.id);
  if (index !== -1) {
    meetings[index] = updatedMeeting;
    writeData(meetings);
    return new Response(JSON.stringify(updatedMeeting), { status: 200 });
  }
  return new Response(JSON.stringify({ error: 'Meeting not found' }), { status: 404 });
}

export async function DELETE(request) {
  const meetings = readData();
  const { id } = await request.json();
  const filteredMeetings = meetings.filter((meeting) => meeting.id !== id);
  writeData(filteredMeetings);
  return new Response(JSON.stringify({ id }), { status: 200 });
}