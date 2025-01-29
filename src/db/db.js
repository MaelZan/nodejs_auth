import sqlite3 from 'better-sqlite3';

// Open a connection to the SQLite database (this will create the database file if it doesn't exist)
const db = new sqlite3('my_database.db');

// Create the 'users' table if it doesn't already exist
try {
    const createUsersTableStmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fname TEXT NOT NULL,
            lname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);
    createUsersTableStmt.run();  // Execute the query synchronously
    console.log("Table 'users' created successfully (or already exists)");


} catch (err) {
    console.error("Error creating table:", err.message);
}

export default db;
