import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initializeDB } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001; // Port 5001 for miniMahzen

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve React production build static assets
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Initialize the database on startup
initializeDB();

// ========================
// BOTTLES API
// ========================

// GET - List all bottles
app.get('/api/bottles', (req, res) => {
    try {
        const bottles = db.prepare('SELECT * FROM Bottles').all();
        // Parse the fotograflar JSON array back to array for each bottle
        const formattedBottles = bottles.map(b => ({
            ...b,
            fotograflar: b.fotograflar ? JSON.parse(b.fotograflar) : [],
            fiyat: b.fiyat !== null ? Number(b.fiyat) : null
        }));

        // Sort by createdAt desc by default (newest first)
        formattedBottles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(formattedBottles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Create a new bottle
app.post('/api/bottles', (req, res) => {
    try {
        const { icki_adi, icki_turu, sise_turu, fotograflar, alinma_tarihi, alindigi_yer, fiyat } = req.body;
        
        if (!icki_adi || !icki_adi.trim()) {
            return res.status(400).json({ error: 'İçki adı zorunludur!' });
        }

        const id = crypto.randomUUID();
        const photosJSON = fotograflar ? JSON.stringify(fotograflar) : '[]';

        const stmt = db.prepare(`
            INSERT INTO Bottles (id, icki_adi, icki_turu, sise_turu, fotograflar, alinma_tarihi, alindigi_yer, fiyat, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        stmt.run(
            id,
            icki_adi.trim(),
            icki_turu || null,
            sise_turu || null,
            photosJSON,
            alinma_tarihi || null,
            alindigi_yer || null,
            fiyat !== undefined && fiyat !== '' ? Number(fiyat) : null
        );

        res.status(201).json({ id, message: 'İçki kartı başarıyla oluşturuldu.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Update a bottle
app.put('/api/bottles/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { icki_adi, icki_turu, sise_turu, fotograflar, alinma_tarihi, alindigi_yer, fiyat } = req.body;

        if (!icki_adi || !icki_adi.trim()) {
            return res.status(400).json({ error: 'İçki adı zorunludur!' });
        }

        const existing = db.prepare('SELECT 1 FROM Bottles WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'İçki kartı bulunamadı.' });
        }

        const photosJSON = fotograflar ? JSON.stringify(fotograflar) : '[]';

        const stmt = db.prepare(`
            UPDATE Bottles 
            SET icki_adi = ?, icki_turu = ?, sise_turu = ?, fotograflar = ?, alinma_tarihi = ?, alindigi_yer = ?, fiyat = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            icki_adi.trim(),
            icki_turu || null,
            sise_turu || null,
            photosJSON,
            alinma_tarihi || null,
            alindigi_yer || null,
            fiyat !== undefined && fiyat !== '' ? Number(fiyat) : null,
            id
        );

        res.json({ message: 'İçki kartı başarıyla güncellendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove a bottle
app.delete('/api/bottles/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existing = db.prepare('SELECT 1 FROM Bottles WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'İçki kartı bulunamadı.' });
        }

        db.prepare('DELETE FROM Bottles WHERE id = ?').run(id);
        res.json({ message: 'İçki kartı başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback for React Router single-page navigation
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
