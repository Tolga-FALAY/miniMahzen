import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to SQLite DB (creates file if not exists)
const db = new Database(path.join(__dirname, 'mini_mahzen.db'), { verbose: console.log });

// Initialize Tables
export const initializeDB = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Bottles (
            id TEXT PRIMARY KEY,
            icki_adi TEXT NOT NULL,
            icki_turu TEXT,
            sise_turu TEXT,
            fotograflar TEXT, -- Stored as JSON array of base64 images
            alinma_tarihi TEXT,
            alindigi_yer TEXT,
            fiyat REAL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Database initialized. Bottles table is ready.");
};

export default db;
