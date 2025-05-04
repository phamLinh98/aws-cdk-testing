import mysql from 'mysql2/promise';

export const handler = async (event) => {
  const connection = await mysql.createConnection({
    host: 'YOUR-RDS-ENDPOINT', 
    user: 'YOUR-USERNAME',
    password: 'YOUR-PASSWORD',
    database: 'LINHCLASS',
  });

  try {
    // Tạo bảng Demo nếu chưa có
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Demo (
        id INT PRIMARY KEY,
        name VARCHAR(255),
        value VARCHAR(255)
      )
    `);

    // Thêm dữ liệu mẫu
    await connection.execute(`
      INSERT INTO Demo (id, name, value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name), value=VALUES(value)
    `, [1, 'test', 'test']);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Table created and data inserted.' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to execute operation.' }),
    };
  } finally {
    await connection.end();
  }
};
