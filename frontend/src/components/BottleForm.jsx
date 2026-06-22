import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export default function BottleForm({ bottle, onClose, onSave }) {
  const [formData, setFormData] = useState({
    marka: '',
    icki_adi: '',
    ek_bilgiler: '',
    icki_turu: '',
    sise_turu: '',
    hacim_cl: '',
    fotograflar: [],
    alinma_tarihi: '',
    alindigi_yer: '',
    fiyat: '',
    para_birimi: 'TL'
  });
  
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load parameters on mount
  useEffect(() => {
    const fetchParams = async () => {
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
        console.error("Parametreler yüklenemedi:", err);
      }
    };
    fetchParams();
  }, []);

  // Sync bottle data in edit mode
  useEffect(() => {
    if (bottle) {
      setFormData({
        marka: bottle.marka || '',
        icki_adi: bottle.icki_adi || '',
        ek_bilgiler: bottle.ek_bilgiler || '',
        icki_turu: bottle.icki_turu || '',
        sise_turu: bottle.sise_turu || '',
        hacim_cl: bottle.hacim_cl !== null && bottle.hacim_cl !== undefined ? bottle.hacim_cl : '',
        fotograflar: bottle.fotograflar || [],
        alinma_tarihi: bottle.alinma_tarihi || '',
        alindigi_yer: bottle.alindigi_yer || '',
        fiyat: bottle.fiyat !== null ? bottle.fiyat : '',
        para_birimi: bottle.para_birimi || 'TL'
      });
    }
  }, [bottle]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVolumeBlur = () => {
    if (formData.hacim_cl) {
      const parsed = parseFloat(formData.hacim_cl);
      if (!isNaN(parsed)) {
        setFormData(prev => ({
          ...prev,
          hacim_cl: parsed.toFixed(2)
        }));
      }
    }
  };

  // Client-side image compression using canvas
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Multiple Image selection handler
  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const compressPromises = files.map(file => compressImage(file));
      const compressedBase64s = await Promise.all(compressPromises);
      
      setFormData(prev => ({
        ...prev,
        fotograflar: [...prev.fotograflar, ...compressedBase64s]
      }));
    } catch (err) {
      console.error(err);
      setError('Görseller yüklenirken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Remove a photo from list
  const handleRemovePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      fotograflar: prev.fotograflar.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Make a photo showcase/main image (moves to index 0)
  const handleMakeShowcase = (indexToMakeMain) => {
    setFormData(prev => {
      const newPhotos = [...prev.fotograflar];
      const mainPhoto = newPhotos.splice(indexToMakeMain, 1)[0];
      newPhotos.unshift(mainPhoto);
      return {
        ...prev,
        fotograflar: newPhotos
      };
    });
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.icki_adi.trim()) {
      setError('İçki adı zorunludur!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        marka: null, // Merged into icki_adi
        fiyat: formData.fiyat !== '' ? Number(formData.fiyat) : null,
        hacim_cl: formData.hacim_cl !== '' ? Number(formData.hacim_cl) : null
      };

      if (bottle) {
        await api.updateBottle(bottle.id, payload);
      } else {
        await api.createBottle(payload);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      {/* Scroll bug fixed: The form acts directly as the modal-content container */}
      <form className="modal-content" onSubmit={handleSubmit} style={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2>{bottle ? 'İçki Kartını Düzenle' : 'Koleksiyona Şişe Ekle'}</h2>
          <button type="button" className="close-btn" onClick={onClose} disabled={loading}>&times;</button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flexGrow: 1 }}>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{error}</div>}

          {/* Temel Alanlar */}
          <div className="form-group">
            <label>Marka / İçki Adı <span className="required">*</span></label>
            <input 
              type="text" 
              name="icki_adi" 
              value={formData.icki_adi} 
              onChange={handleChange} 
              placeholder="Örn: Drum Shanbo Gunpowder Irish Gin" 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Ek Bilgiler</label>
            <input 
              type="text" 
              name="ek_bilgiler" 
              value={formData.ek_bilgiler} 
              onChange={handleChange} 
              placeholder="Örn: with Californian Orange Citrus, Sherry Cask Finish" 
              disabled={loading}
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>İçki Türü (Kategori)</label>
              <select name="icki_turu" value={formData.icki_turu} onChange={handleChange} disabled={loading}>
                <option value="">Seçiniz...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div></div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Şişe Türü (Materyal)</label>
              <select name="sise_turu" value={formData.sise_turu} onChange={handleChange} disabled={loading}>
                <option value="">Seçiniz...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Şişe Hacmi (CL)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="hacim_cl"
                value={formData.hacim_cl}
                onChange={handleChange}
                onBlur={handleVolumeBlur}
                placeholder="Örn: 5.00"
                disabled={loading}
              />
            </div>
          </div>

          {/* Opsiyonel Alanlar */}
          <div className="form-group-row">
            <div className="form-group">
              <label>Satın Alım/Hediye Tarihi</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="date" 
                  name="alinma_tarihi" 
                  value={formData.alinma_tarihi} 
                  onChange={handleChange} 
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setFormData({ ...formData, alinma_tarihi: '' })}
                  style={{ 
                    width: '90px', 
                    padding: '0 0.5rem', 
                    fontSize: '0.85rem',
                    borderColor: 'var(--border-color)',
                    color: formData.alinma_tarihi ? 'var(--danger)' : 'var(--text-muted)',
                    cursor: formData.alinma_tarihi ? 'pointer' : 'default',
                    opacity: formData.alinma_tarihi ? 1 : 0.5
                  }}
                  disabled={loading || !formData.alinma_tarihi}
                >
                  Temizle
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Fiyat (Maliyet)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  name="fiyat" 
                  value={formData.fiyat} 
                  onChange={handleChange} 
                  placeholder="Örn: 250" 
                  step="any" 
                  min="0"
                  disabled={loading}
                  style={{ flex: 1 }}
                />
                <select 
                  name="para_birimi" 
                  value={formData.para_birimi} 
                  onChange={handleChange} 
                  disabled={loading}
                  style={{ width: '90px', paddingRight: '1.5rem' }}
                >
                  {currencies.map(c => (
                    <option key={c.id} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Alındığı Yer / Hediye Eden Kişi</label>
            <input 
              type="text" 
              name="alindigi_yer" 
              value={formData.alindigi_yer} 
              onChange={handleChange} 
              placeholder="Örn: Duty Free, London Shop, Ahmet Yılmaz" 
              disabled={loading}
            />
          </div>

          {/* Görsel Yükleme Bölümü */}
          <div className="form-group">
            <label>Şişe Görselleri (Çoklu Yüklenebilir)</label>
            <div 
              className="photo-upload-section" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📸</div>
              <div className="upload-text">Fotoğraf yüklemek için buraya tıklayın</div>
              <div className="upload-text" style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                (İlk yüklenen görsel otomatik olarak ana vitrin resmi olur)
              </div>
            </div>

            <div className="upload-methods-grid">
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                disabled={loading}
              >
                📷 Fotoğraf Çek
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                disabled={loading}
              >
                📂 Galeriden Seç
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (!navigator.clipboard || !navigator.clipboard.read) {
                      throw new Error("Tarayıcı doğrudan pano okumayı desteklemiyor. Ctrl+V kullanabilirsiniz.");
                    }
                    const items = await navigator.clipboard.read();
                    for (const item of items) {
                      for (const type of item.types) {
                        if (type.startsWith('image/')) {
                          const blob = await item.getType(type);
                          setLoading(true);
                          const compressed = await compressImage(blob);
                          setFormData(prev => ({
                            ...prev,
                            fotograflar: [...prev.fotograflar, compressed]
                          }));
                          setLoading(false);
                          return;
                        }
                      }
                    }
                    alert("Panoda kopyalanmış bir görsel bulunamadı!");
                  } catch (err) {
                    alert("Panodan okuma başarısız: " + err.message);
                  }
                }}
                disabled={loading}
              >
                📋 Pano'dan Yapıştır
              </button>
            </div>

            {/* Gizli Input'lar */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              style={{ display: 'none' }} 
              onChange={handlePhotosUpload} 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onChange={handlePhotosUpload} 
            />

            {/* Görsel Önizleme Listesi */}
            {formData.fotograflar.length > 0 && (
              <div className="photos-previews-list">
                {formData.fotograflar.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={photo} alt={`Şişe Önizleme ${index}`} />
                    <button 
                      type="button" 
                      className="photo-delete-badge" 
                      onClick={() => handleRemovePhoto(index)}
                      title="Görseli Sil"
                      disabled={loading}
                    >
                      &times;
                    </button>
                    
                    {index === 0 ? (
                      <div className="main-photo-indicator">Vitrin Resmi</div>
                    ) : (
                      <button 
                        type="button" 
                        className="make-main-button" 
                        onClick={() => handleMakeShowcase(index)}
                        disabled={loading}
                      >
                        Vitrin Yap
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>İptal</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Kaydediliyor...' : bottle ? 'Değişiklikleri Kaydet' : 'Koleksiyona Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
}
