import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'tasks.json');

const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing tasks file:', err);
  }
};

export async function GET() {
  const tasks = readData();
  return new Response(JSON.stringify(tasks), { status: 200 });
}

export async function POST(request) {
  const tasks = readData();
  const newTask = await request.json();
  tasks.push(newTask);
  writeData(tasks);
  return new Response(JSON.stringify(newTask), { status: 201 });
}

export async function PUT(request) {
  const tasks = readData();
  const updatedTask = await request.json();
  const index = tasks.findIndex((task) => task.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    writeData(tasks);
    return new Response(JSON.stringify(updatedTask), { status: 200 });
  }
  return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 });
}

export async function DELETE(request) {
  const tasks = readData();
  const { id } = await request.json();
  const filteredTasks = tasks.filter((task) => task.id !== id);
  writeData(filteredTasks);
  return new Response(JSON.stringify({ id }), { status: 200 });
}