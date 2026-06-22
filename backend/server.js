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
            fiyat: b.fiyat !== null ? Number(b.fiyat) : null,
            hacim_cl: b.hacim_cl !== null ? Number(b.hacim_cl) : null,
            para_birimi: b.para_birimi || 'TL'
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
        const { marka, icki_adi, ek_bilgiler, icki_turu, sise_turu, hacim_cl, fotograflar, alinma_tarihi, alindigi_yer, fiyat, para_birimi } = req.body;
        
        if (!icki_adi || !icki_adi.trim()) {
            return res.status(400).json({ error: 'İçki adı zorunludur!' });
        }

        const id = crypto.randomUUID();
        const photosJSON = fotograflar ? JSON.stringify(fotograflar) : '[]';

        const stmt = db.prepare(`
            INSERT INTO Bottles (id, marka, icki_adi, ek_bilgiler, icki_turu, sise_turu, hacim_cl, fotograflar, alinma_tarihi, alindigi_yer, fiyat, para_birimi, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        stmt.run(
            id,
            marka ? marka.trim() : null,
            icki_adi.trim(),
            ek_bilgiler ? ek_bilgiler.trim() : null,
            icki_turu || null,
            sise_turu || null,
            hacim_cl !== undefined && hacim_cl !== '' ? Number(hacim_cl) : null,
            photosJSON,
            alinma_tarihi || null,
            alindigi_yer || null,
            fiyat !== undefined && fiyat !== '' ? Number(fiyat) : null,
            para_birimi || 'TL'
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
        const { marka, icki_adi, ek_bilgiler, icki_turu, sise_turu, hacim_cl, fotograflar, alinma_tarihi, alindigi_yer, fiyat, para_birimi } = req.body;

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
            SET marka = ?, icki_adi = ?, ek_bilgiler = ?, icki_turu = ?, sise_turu = ?, hacim_cl = ?, fotograflar = ?, alinma_tarihi = ?, alindigi_yer = ?, fiyat = ?, para_birimi = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            marka ? marka.trim() : null,
            icki_adi.trim(),
            ek_bilgiler ? ek_bilgiler.trim() : null,
            icki_turu || null,
            sise_turu || null,
            hacim_cl !== undefined && hacim_cl !== '' ? Number(hacim_cl) : null,
            photosJSON,
            alinma_tarihi || null,
            alindigi_yer || null,
            fiyat !== undefined && fiyat !== '' ? Number(fiyat) : null,
            para_birimi || 'TL',
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

// ========================
// CATEGORIES API (İçki Türleri)
// ========================
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM Categories ORDER BY name ASC').all();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Kategori adı boş olamaz!' });
        }
        
        const existing = db.prepare('SELECT * FROM Categories WHERE TRIM(LOWER(name)) = TRIM(LOWER(?))').get(name);
        if (existing) {
            return res.status(400).json({ error: 'Bu kategori zaten mevcut!' });
        }

        const info = db.prepare('INSERT INTO Categories (name) VALUES (?)').run(name.trim());
        res.status(201).json({ id: info.lastInsertRowid, name: name.trim() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Kategori adı boş olamaz!' });
        }

        const category = db.prepare('SELECT name FROM Categories WHERE id = ?').get(id);
        if (!category) {
            return res.status(404).json({ error: 'Kategori bulunamadı.' });
        }

        // Check if new name exists elsewhere
        const existing = db.prepare('SELECT * FROM Categories WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) AND id != ?').get(name, id);
        if (existing) {
            return res.status(400).json({ error: 'Bu isimde başka bir kategori zaten mevcut!' });
        }

        // Transaction to update category and potentially all bottles matching old name
        const updateTransaction = db.transaction((oldName, newName, catId) => {
            db.prepare('UPDATE Categories SET name = ? WHERE id = ?').run(newName, catId);
            db.prepare('UPDATE Bottles SET icki_turu = ? WHERE icki_turu = ?').run(newName, oldName);
        });

        updateTransaction(category.name, name.trim(), id);
        res.json({ message: 'Kategori ve ilgili şişe kayıtları güncellendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    try {
        const { id } = req.params;
        const category = db.prepare('SELECT name FROM Categories WHERE id = ?').get(id);
        if (!category) {
            return res.status(404).json({ error: 'Kategori bulunamadı.' });
        }

        // Check usage in Bottles
        const isUsed = db.prepare('SELECT 1 FROM Bottles WHERE icki_turu = ?').get(category.name);
        if (isUsed) {
            return res.status(400).json({ error: 'Bu parametre bir şişe kaydında mevcut olduğu için öncelikle ilgili şişe kaydını silmelisiniz.' });
        }

        db.prepare('DELETE FROM Categories WHERE id = ?').run(id);
        res.json({ message: 'Kategori başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// MATERIALS API (Şişe Türleri)
// ========================
app.get('/api/materials', (req, res) => {
    try {
        const materials = db.prepare('SELECT * FROM Materials ORDER BY name ASC').all();
        res.json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/materials', (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Materyal adı boş olamaz!' });
        }

        const existing = db.prepare('SELECT * FROM Materials WHERE TRIM(LOWER(name)) = TRIM(LOWER(?))').get(name);
        if (existing) {
            return res.status(400).json({ error: 'Bu materyal zaten mevcut!' });
        }

        const info = db.prepare('INSERT INTO Materials (name) VALUES (?)').run(name.trim());
        res.status(201).json({ id: info.lastInsertRowid, name: name.trim() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/materials/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Materyal adı boş olamaz!' });
        }

        const material = db.prepare('SELECT name FROM Materials WHERE id = ?').get(id);
        if (!material) {
            return res.status(404).json({ error: 'Materyal bulunamadı.' });
        }

        const existing = db.prepare('SELECT * FROM Materials WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) AND id != ?').get(name, id);
        if (existing) {
            return res.status(400).json({ error: 'Bu isimde başka bir materyal zaten mevcut!' });
        }

        const updateTransaction = db.transaction((oldName, newName, matId) => {
            db.prepare('UPDATE Materials SET name = ? WHERE id = ?').run(newName, matId);
            db.prepare('UPDATE Bottles SET sise_turu = ? WHERE sise_turu = ?').run(newName, oldName);
        });

        updateTransaction(material.name, name.trim(), id);
        res.json({ message: 'Materyal ve ilgili şişe kayıtları güncellendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/materials/:id', (req, res) => {
    try {
        const { id } = req.params;
        const material = db.prepare('SELECT name FROM Materials WHERE id = ?').get(id);
        if (!material) {
            return res.status(404).json({ error: 'Materyal bulunamadı.' });
        }

        const isUsed = db.prepare('SELECT 1 FROM Bottles WHERE sise_turu = ?').get(material.name);
        if (isUsed) {
            return res.status(400).json({ error: 'Bu parametre bir şişe kaydında mevcut olduğu için öncelikle ilgili şişe kaydını silmelisiniz.' });
        }

        db.prepare('DELETE FROM Materials WHERE id = ?').run(id);
        res.json({ message: 'Materyal başarıyla silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// CURRENCIES API (Para Birimleri)
// ========================
app.get('/api/currencies', (req, res) => {
    try {
        const currencies = db.prepare('SELECT * FROM Currencies ORDER BY code ASC').all();
        res.json(currencies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/currencies', (req, res) => {
    try {
        const { code } = req.body;
        if (!code || !code.trim()) {
            return res.status(400).json({ error: 'Para birimi kodu boş olamaz!' });
        }

        const existing = db.prepare('SELECT * FROM Currencies WHERE TRIM(LOWER(code)) = TRIM(LOWER(?))').get(code);
        if (existing) {
            return res.status(400).json({ error: 'Bu para birimi zaten mevcut!' });
        }

        const info = db.prepare('INSERT INTO Currencies (code) VALUES (?)').run(code.trim().toUpperCase());
        res.status(201).json({ id: info.lastInsertRowid, code: code.trim().toUpperCase() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/currencies/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { code } = req.body;
        if (!code || !code.trim()) {
            return res.status(400).json({ error: 'Para birimi kodu boş olamaz!' });
        }

        const currency = db.prepare('SELECT code FROM Currencies WHERE id = ?').get(id);
        if (!currency) {
            return res.status(404).json({ error: 'Para birimi bulunamadı.' });
        }

        const existing = db.prepare('SELECT * FROM Currencies WHERE TRIM(LOWER(code)) = TRIM(LOWER(?)) AND id != ?').get(code, id);
        if (existing) {
            return res.status(400).json({ error: 'Bu para birimi zaten mevcut!' });
        }

        const newCode = code.trim().toUpperCase();
        const updateTransaction = db.transaction((oldCode, newCode, curId) => {
            db.prepare('UPDATE Currencies SET code = ? WHERE id = ?').run(newCode, curId);
            db.prepare('UPDATE Bottles SET para_birimi = ? WHERE para_birimi = ?').run(newCode, oldCode);
        });

        updateTransaction(currency.code, newCode, id);
        res.json({ message: 'Para birimi ve ilgili şişe kayıtları güncellendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/currencies/:id', (req, res) => {
    try {
        const { id } = req.params;
        const currency = db.prepare('SELECT code FROM Currencies WHERE id = ?').get(id);
        if (!currency) {
            return res.status(404).json({ error: 'Para birimi bulunamadı.' });
        }

        const isUsed = db.prepare('SELECT 1 FROM Bottles WHERE para_birimi = ?').get(currency.code);
        if (isUsed) {
            return res.status(400).json({ error: 'Bu parametre bir şişe kaydında mevcut olduğu için öncelikle ilgili şişe kaydını silmelisiniz.' });
        }

        db.prepare('DELETE FROM Currencies WHERE id = ?').run(id);
        res.json({ message: 'Para birimi başarıyla silindi.' });
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
