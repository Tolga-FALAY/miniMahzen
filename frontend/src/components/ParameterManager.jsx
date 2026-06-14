import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function ParameterManager({ onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'materials', 'currencies'
  const [items, setItems] = useState([]);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      if (activeTab === 'categories') {
        data = await api.getCategories();
      } else if (activeTab === 'materials') {
        data = await api.getMaterials();
      } else if (activeTab === 'currencies') {
        data = await api.getCurrencies();
      }
      setItems(data);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    setNewValue('');
    setEditingId(null);
    setEditingValue('');
  }, [activeTab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    setLoading(true);
    setError('');
    try {
      if (activeTab === 'categories') {
        await api.createCategory({ name: newValue.trim() });
      } else if (activeTab === 'materials') {
        await api.createMaterial({ name: newValue.trim() });
      } else if (activeTab === 'currencies') {
        await api.createCurrency({ code: newValue.trim() });
      }
      setNewValue('');
      await loadItems();
      onUpdate(); // Refresh main lists
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditingValue(activeTab === 'currencies' ? item.code : item.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editingValue.trim()) return;

    setLoading(true);
    setError('');
    try {
      if (activeTab === 'categories') {
        await api.updateCategory(id, { name: editingValue.trim() });
      } else if (activeTab === 'materials') {
        await api.updateMaterial(id, { name: editingValue.trim() });
      } else if (activeTab === 'currencies') {
        await api.updateCurrency(id, { code: editingValue.trim() });
      }
      setEditingId(null);
      setEditingValue('');
      await loadItems();
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, valueName) => {
    if (!window.confirm(`"${valueName}" parametresini silmek istediğinize emin misiniz?`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (activeTab === 'categories') {
        await api.deleteCategory(id);
      } else if (activeTab === 'materials') {
        await api.deleteMaterial(id);
      } else if (activeTab === 'currencies') {
        await api.deleteCurrency(id);
      }
      await loadItems();
      onUpdate();
    } catch (err) {
      // Show the specific error if it's used in bottles
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '500px', height: '80vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Parametreleri Yönet</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Dynamic Parameter Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('categories')}
          >
            İçki Türleri
          </button>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'materials' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'materials' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('materials')}
          >
            Şişe Türleri
          </button>
          <button 
            type="button" 
            style={{
              flex: 1,
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'currencies' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'currencies' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('currencies')}
          >
            Para Birimleri
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flexGrow: 1, padding: '1.25rem' }}>
          {error && (
            <div style={{ 
              color: 'var(--danger)', 
              background: 'rgba(239, 68, 68, 0.1)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)', 
              marginBottom: '1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(239, 68, 68, 0.2)',
              lineHeight: 1.4
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Add New Value Form */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder={activeTab === 'currencies' ? 'Örn: EUR, USD' : 'Yeni ekle...'} 
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={loading}
              maxLength={activeTab === 'currencies' ? 5 : 50}
              style={{ flex: 1, padding: '0.75rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }} disabled={loading}>
              Ekle
            </button>
          </form>

          {/* List of current values */}
          {loading && items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Yükleniyor...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((item) => {
                const displayName = activeTab === 'currencies' ? item.code : item.name;
                const isEditing = editingId === item.id;

                return (
                  <div 
                    key={item.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.75rem',
                      minHeight: '48px'
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <input 
                          type="text" 
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                          maxLength={activeTab === 'currencies' ? 5 : 50}
                        />
                        <button 
                          type="button" 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleSaveEdit(item.id)}
                          style={{ padding: '0 0.75rem' }}
                        >
                          Kaydet
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline btn-sm" 
                          onClick={() => setEditingId(null)}
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{displayName}</span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm" 
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleStartEdit(item)}
                          >
                            📝 Düzenle
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm" 
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => handleDelete(item.id, displayName)}
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {!loading && items.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Kayıt bulunamadı.</div>
              )}
            </div>
          )}
        </div>

        <div className="form-footer" style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
