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

app.get('/crud', async (req, res) => {
  try {
    const db = await open({
      filename: join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });

    const users = await db.all('SELECT * FROM users');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRUD Users</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          header {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-align: center;
          }
          main {
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
          img {
            border-radius: 50%;
          }
          button {
            margin-bottom: 10px;
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>CRUD Users</h1>
        </header>
        <main>
          <button onclick="window.location.href='/create-user'">Create User</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Avatar</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>${user.name}</td>
                  <td>${user.role}</td>
                  <td><img src="${user.avatar}" alt="Avatar" width="50"></td>
                  <td>${user.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </main>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error generating CRUD HTML:', error);
    res.status(500).send('Error generating CRUD HTML.');
  }
});

app.get('/create-user', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Create User</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        header {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-align: center;
        }
        main {
          padding: 20px;
        }
        form {
          display: flex;
          flex-direction: column;
          width: 300px;
          margin: 0 auto;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        label {
          margin-bottom: 5px;
          font-weight: bold;
        }
        input {
          margin-bottom: 15px;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        button {
          padding: 10px 15px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Create User</h1>
      </header>
      <main>
        <form action="/create-user" method="POST">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required>
          
          <label for="role">Role:</label>
          <input type="text" id="role" name="role" required>
          
          <label for="avatar">Avatar URL:</label>
          <input type="text" id="avatar" name="avatar" required>
          
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
          
          <button type="submit">Create</button>
        </form>
      </main>
    </body>
    </html>
  `;
  res.send(html);
});

app.post('/create-user', express.urlencoded({ extended: true }), async (req, res) => {
  const { name, role, avatar, email } = req.body;

  try {
    const db = await open({
      filename: join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });

    await db.run(
      `INSERT INTO users (name, role, avatar, email) VALUES (?, ?, ?, ?)`,
      [name, role, avatar, email]
    );

    res.redirect('/crud');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});