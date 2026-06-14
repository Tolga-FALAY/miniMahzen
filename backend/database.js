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
            para_birimi TEXT DEFAULT 'TL',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Currencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL
        );
    `);

    // Seed default categories
    const catCount = db.prepare("SELECT COUNT(*) as count FROM Categories").get().count;
    if (catCount === 0) {
        const insertCat = db.prepare("INSERT INTO Categories (name) VALUES (?)");
        const defaults = ["Viski", "Cin", "Votka", "Rom", "Likör", "Tekila", "Rakı", "Konyak", "Şarap", "Diğer"];
        defaults.forEach(cat => insertCat.run(cat));
    }

    // Seed default materials
    const matCount = db.prepare("SELECT COUNT(*) as count FROM Materials").get().count;
    if (matCount === 0) {
        const insertMat = db.prepare("INSERT INTO Materials (name) VALUES (?)");
        const defaults = ["Cam", "Plastik", "Metal", "Seramik"];
        defaults.forEach(mat => insertMat.run(mat));
    }

    // Seed default currencies
    const curCount = db.prepare("SELECT COUNT(*) as count FROM Currencies").get().count;
    if (curCount === 0) {
        const insertCur = db.prepare("INSERT INTO Currencies (code) VALUES (?)");
        const defaults = ["TL", "USD", "EUR", "GBP"];
        defaults.forEach(cur => insertCur.run(cur));
    }

    // Migration for adding para_birimi column dynamically if it does not exist
    try {
        const tableInfo = db.prepare("PRAGMA table_info(Bottles)").all();
        const existingCols = tableInfo.map(col => col.name);
        if (!existingCols.includes('para_birimi')) {
            console.log("Migrating database: Adding column para_birimi to Bottles table...");
            db.exec("ALTER TABLE Bottles ADD COLUMN para_birimi TEXT DEFAULT 'TL';");
        }
    } catch (e) {
        console.error("Migration error while adding para_birimi to Bottles table:", e);
    }

    console.log("Database initialized. Bottles and parameters tables are ready.");
};

export default db;
