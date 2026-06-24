import React, { useState } from 'react';
import WhiskeyLogo from './WhiskeyLogo';

export default function BottleGrid({ bottles, categories = [], materials = [], onSelectBottle, cols = 4 }) {
  const [freeSearch, setFreeSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');

  const clearFilters = () => {
    setFreeSearch('');
    setCategoryFilter('');
    setMaterialFilter('');
  };

  const formatCl = (cl) => {
    if (cl === null || cl === undefined || cl === '') return '';
    const num = Number(cl);
    return isNaN(num) ? cl : num.toString();
  };

  const getMaterialVolumeText = (bottle) => {
    const clText = formatCl(bottle.hacim_cl);
    if (bottle.sise_turu && clText) {
      return `${bottle.sise_turu} (${clText} cl)`;
    } else if (bottle.sise_turu) {
      return bottle.sise_turu;
    } else if (clText) {
      return `${clText} cl`;
    }
    return '';
  };

  // Format currency helper
  const formatPrice = (val, currencyCode) => {
    if (val === null || val === undefined || val === '') return '';
    const code = currencyCode || 'TL';
    const isISO = ['USD', 'EUR', 'GBP', 'TRY'].includes(code);
    if (isISO) {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(val);
    }
    const displayCode = code === 'TL' ? 'TL' : code;
    return `${val} ${displayCode}`;
  };

  // Filter bottles
  const filteredBottles = bottles.filter(bottle => {
    // Free Search: matches brand, name, extra info, category, material, location, date, price
    if (freeSearch.trim()) {
      const q = freeSearch.toLocaleLowerCase('tr-TR').trim();
      const brand = (bottle.marka || '').toLocaleLowerCase('tr-TR');
      const name = (bottle.icki_adi || '').toLocaleLowerCase('tr-TR');
      const details = (bottle.ek_bilgiler || '').toLocaleLowerCase('tr-TR');
      const cat = (bottle.icki_turu || '').toLocaleLowerCase('tr-TR');
      const mat = (bottle.sise_turu || '').toLocaleLowerCase('tr-TR');
      const loc = (bottle.alindigi_yer || '').toLocaleLowerCase('tr-TR');
      const date = (bottle.alinma_tarihi || '').toLocaleLowerCase('tr-TR');
      const price = bottle.fiyat !== null ? String(bottle.fiyat) : '';
      const volume = bottle.hacim_cl !== null ? String(bottle.hacim_cl) : '';

      const matchesAny = brand.includes(q) ||
                         name.includes(q) ||
                         details.includes(q) ||
                         cat.includes(q) ||
                         mat.includes(q) ||
                         loc.includes(q) ||
                         date.includes(q) ||
                         price.includes(q) ||
                         volume.includes(q);
      if (!matchesAny) {
        return false;
      }
    }

    // Category Filter
    if (categoryFilter) {
      if (bottle.icki_turu !== categoryFilter) {
        return false;
      }
    }

    // Material Filter
    if (materialFilter) {
      if (bottle.sise_turu !== materialFilter) {
        return false;
      }
    }

    return true;
  });

  // Sort bottles alphabetically by icki_adi (Drink Name) using Turkish locale
  const sortedBottles = [...filteredBottles].sort((a, b) => {
    const nameA = a.icki_adi || '';
    const nameB = b.icki_adi || '';
    return nameA.localeCompare(nameB, 'tr', { sensitivity: 'base', numeric: true });
  });

  return (
    <div>
      {/* Search and Filters Panel - Combined in a single row on desktop */}
      <div className="search-filter-panel">
        <div className="filters-row">
          
          {/* Serbest Arama (Genel Arama) */}
          <div className="filter-item" style={{ flex: '2 1 250px' }}>
            <label>Serbest Arama</label>
            <div className="search-input-wrapper" style={{ width: '100%' }}>
              <span className="search-icon">🔎</span>
              <input 
                type="text" 
                placeholder="Marka, isim, kategori, yer vb. ara..." 
                value={freeSearch}
                onChange={(e) => setFreeSearch(e.target.value)}
              />
            </div>
          </div>

          {/* İçki Türü Filtresi */}
          <div className="filter-item" style={{ flex: '1 1 150px' }}>
            <label>İçki Türü</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Tüm Türler</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Şişe Türü Filtresi */}
          <div className="filter-item" style={{ flex: '1 1 150px' }}>
            <label>Şişe Türü (Materyal)</label>
            <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}>
              <option value="">Tüm Materyaller</option>
              {materials.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Temizle Butonu */}
          <div className="filter-actions" style={{ marginBottom: '1px' }}>
            <button className="btn btn-outline" style={{ height: '45px', padding: '0 1.5rem' }} onClick={clearFilters}>
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {sortedBottles.length > 0 ? (
        <div className="bottles-grid" style={{ '--grid-cols': cols }}>
          {sortedBottles.map((bottle) => {
            const hasPhotos = bottle.fotograflar && bottle.fotograflar.length > 0;
            const mainPhoto = hasPhotos ? bottle.fotograflar[0] : null;

            return (
              <div 
                key={bottle.id} 
                className="bottle-card"
                onClick={() => onSelectBottle(bottle)}
              >
                <div className="bottle-image-container">
                  {mainPhoto ? (
                    <img src={mainPhoto} alt={bottle.icki_adi} loading="lazy" />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-main)',
                      color: 'var(--text-muted)'
                    }}>
                      <WhiskeyLogo size={96} showGlow={true} />
                      <span style={{ fontSize: '0.65rem', marginTop: '0.5rem', fontWeight: 700 }}>RESİM YOK</span>
                    </div>
                  )}
                </div>

                <div className="bottle-info">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div className="bottle-meta" style={{ marginBottom: '0.15rem' }}>
                      <span className="bottle-category">{bottle.icki_turu || 'Diğer'}</span>
                      {getMaterialVolumeText(bottle) && (
                        <span className="bottle-category" style={{ textTransform: 'none' }}>
                          {getMaterialVolumeText(bottle)}
                        </span>
                      )}
                    </div>
                    
                    {/* İçki Adı (Name) */}
                    <h3 className="bottle-name" style={{ margin: 0 }}>{bottle.icki_adi}</h3>
                    
                    {/* Ek Bilgiler (Extra Info) */}
                    {bottle.ek_bilgiler && (
                      <div 
                        style={{ 
                          fontSize: '0.72rem', 
                          color: 'var(--text-muted)', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          marginTop: '0.25rem'
                        }} 
                        title={bottle.ek_bilgiler}
                      >
                        {bottle.ek_bilgiler}
                      </div>
                    )}
                  </div>
                  
                  {bottle.alindigi_yer && (
                    <div className="bottle-origin" style={{ marginTop: '0.5rem' }}>
                      📍 {bottle.alindigi_yer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', opacity: 0.6 }}>
            <WhiskeyLogo size={120} showGlow={true} />
          </div>
          <h3>Şişe Bulunamadı</h3>
          <p>Seçilen filtrelere veya arama kriterlerine uygun kayıt bulunmuyor.</p>
          {(freeSearch || categoryFilter || materialFilter) && (
            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={clearFilters}>
              Filtreleri Sıfırla
            </button>
          )}
        </div>
      )}
    </div>
  );
}
