import express from 'express';
import multer, { diskStorage } from 'multer';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const uploadDir = join(__dirname, 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

async function saveToDatabase(records) {
  // Open or create the database
  const db = await open({
    filename: join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      name TEXT PRIMARY KEY,
      role TEXT,
      avatar TEXT,
      email TEXT
    )
  `);

  // Insert or update each record
  const insertStmt = await db.prepare(
    `INSERT INTO users (name, role, avatar, email) 
     VALUES (?, ?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET 
       role = excluded.role,
       avatar = excluded.avatar,
       email = excluded.email`
  );
  for (const record of records) {
    await insertStmt.run(record.name, record.role, record.avatar, record.email);
  }
  await insertStmt.finalize();
}

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  try {
    const filePath = join(uploadDir, req.file.filename);
    const fileContent = await readFile(filePath, 'utf8');

    // CSV to object
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index] ? values[index].trim() : null;
        return obj;
      }, {});
    });

    const defaultRole = 'user';
    const modifiedData = data.map(item => ({
      ...item,
      role: defaultRole,
      avatar: 'https://example.com/default-avatar-' + item.name.replace(/\s+/g, '').toLowerCase() + '.png',
      email: `${item.name.replace(/\s+/g, '').toLowerCase()}@example.com`,
    }));

    // Save to db
    await saveToDatabase(modifiedData);

  } catch (error) {
    console.error('Error reading file:', error);
    return res.status(500).send('Error reading file.');
  }

  res.send('File uploaded successfully.');
});

app.get('/users', async (req, res) => {
  try {
    const db = await open({
      filename: join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });

    const users = await db.all('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users.');
  }
});



// Add 1000 other routes here if you want

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});