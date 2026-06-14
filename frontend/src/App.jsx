import React, { useState, useEffect } from 'react';
import { api } from './api';
import BottleGrid from './components/BottleGrid';
import BottleDetail from './components/BottleDetail';
import BottleForm from './components/BottleForm';
import ParameterManager from './components/ParameterManager';
import WhiskeyLogo from './components/WhiskeyLogo';

export default function App() {
  const [bottles, setBottles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [selectedBottle, setSelectedBottle] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isParamOpen, setIsParamOpen] = useState(false);
  const [editingBottle, setEditingBottle] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch bottles from API
  const loadBottles = async () => {
    setLoading(true);
    try {
      const data = await api.getBottles();
      setBottles(data);
    } catch (err) {
      console.error("Şişe verileri yüklenirken hata:", err);
      alert("Şişe verileri yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch parameter lists (categories and materials)
  const loadParameters = async () => {
    try {
      const [cats, mats, curs] = await Promise.all([
        api.getCategories(),
        api.getMaterials(),
        api.getCurrencies()
      ]);
      setCategories(cats);
      setMaterials(mats);
      setCurrencies(curs);
    } catch (err) {
      console.error("Parametre verileri yüklenirken hata:", err);
    }
  };

  useEffect(() => {
    loadBottles();
    loadParameters();
  }, []);

  // Save handler (Add/Edit complete)
  const handleSave = () => {
    setIsFormOpen(false);
    setEditingBottle(null);
    loadBottles();
    
    if (selectedBottle) {
      setSelectedBottle(null);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      await api.deleteBottle(id);
      setSelectedBottle(null);
      loadBottles();
    } catch (err) {
      console.error(err);
      alert("Silme işlemi başarısız: " + err.message);
    }
  };

  // Trigger Edit Form
  const handleEditInit = (bottle) => {
    setEditingBottle(bottle);
    setIsFormOpen(true);
  };

  // Triggered when parameters are updated (add, edit, delete categories/materials)
  const handleParametersUpdated = () => {
    loadParameters();
    loadBottles(); // Reload bottles to reflect changed names
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <a href="/" className="app-logo" onClick={(e) => { e.preventDefault(); loadBottles(); }}>
          <span className="logo-icon">
            <WhiskeyLogo size={32} showGlow={true} />
          </span>
          <h1>Mini Mahzen</h1>
        </a>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setIsParamOpen(true)}
          >
            ⚙️ Parametreleri Yönet
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => { setEditingBottle(null); setIsFormOpen(true); }}
          >
            <span className="btn-plus-icon">+</span> Yeni Şişe Ekle
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem', animation: 'spin 1.5s linear infinite' }}>⏳</span>
            Yükleniyor...
          </div>
        ) : (
          <>
            {/* Counter */}
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '1rem'
            }}>
              Koleksiyondaki Toplam Şişe: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{bottles.length}</span>
            </div>
            
            <BottleGrid 
              bottles={bottles} 
              categories={categories}
              materials={materials}
              onSelectBottle={setSelectedBottle} 
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <p>&copy; {new Date().getFullYear()} Mini Mahzen. Tüm Hakları Saklıdır.</p>
      </footer>

      {/* Detail Modal */}
      {selectedBottle && (
        <BottleDetail 
          bottle={selectedBottle}
          onClose={() => setSelectedBottle(null)}
          onEdit={(bottle) => { handleEditInit(bottle); }}
          onDelete={handleDelete}
        />
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <BottleForm 
          bottle={editingBottle}
          onClose={() => { setIsFormOpen(false); setEditingBottle(null); }}
          onSave={handleSave}
        />
      )}

      {/* Dynamic Parameters Modal */}
      {isParamOpen && (
        <ParameterManager 
          onClose={() => setIsParamOpen(false)}
          onUpdate={handleParametersUpdated}
        />
      )}
    </div>
  );
}
