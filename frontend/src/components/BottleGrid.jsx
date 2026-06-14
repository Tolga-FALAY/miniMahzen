import React, { useState } from 'react';

export default function BottleGrid({ bottles, categories = [], materials = [], onSelectBottle }) {
  const [quickSearch, setQuickSearch] = useState('');
  const [freeSearch, setFreeSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'alpha_asc', 'alpha_desc', 'price_asc', 'price_desc'

  const clearFilters = () => {
    setQuickSearch('');
    setFreeSearch('');
    setCategoryFilter('');
    setMaterialFilter('');
    setSortBy('newest');
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
    // 1. Quick Search: matches ONLY name (case-insensitive, Turkish locale aware)
    if (quickSearch.trim()) {
      const q = quickSearch.toLocaleLowerCase('tr-TR').trim();
      const name = (bottle.icki_adi || '').toLocaleLowerCase('tr-TR');
      if (!name.includes(q)) {
        return false;
      }
    }

    // 2. Free Search: matches name, category, material, location, date, price (all fields)
    if (freeSearch.trim()) {
      const q = freeSearch.toLocaleLowerCase('tr-TR').trim();
      const name = (bottle.icki_adi || '').toLocaleLowerCase('tr-TR');
      const cat = (bottle.icki_turu || '').toLocaleLowerCase('tr-TR');
      const mat = (bottle.sise_turu || '').toLocaleLowerCase('tr-TR');
      const loc = (bottle.alindigi_yer || '').toLocaleLowerCase('tr-TR');
      const date = (bottle.alinma_tarihi || '').toLocaleLowerCase('tr-TR');
      const price = bottle.fiyat !== null ? String(bottle.fiyat) : '';

      const matchesAny = name.includes(q) || 
                         cat.includes(q) || 
                         mat.includes(q) || 
                         loc.includes(q) || 
                         date.includes(q) || 
                         price.includes(q);
      if (!matchesAny) {
        return false;
      }
    }

    // 3. Category Filter
    if (categoryFilter) {
      if (bottle.icki_turu !== categoryFilter) {
        return false;
      }
    }

    // 4. Material Filter
    if (materialFilter) {
      if (bottle.sise_turu !== materialFilter) {
        return false;
      }
    }

    return true;
  });

  // Sort bottles
  const sortedBottles = [...filteredBottles].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'alpha_asc':
        return (a.icki_adi || '').toLocaleLowerCase('tr-TR').localeCompare((b.icki_adi || '').toLocaleLowerCase('tr-TR'), 'tr');
      case 'alpha_desc':
        return (b.icki_adi || '').toLocaleLowerCase('tr-TR').localeCompare((a.icki_adi || '').toLocaleLowerCase('tr-TR'), 'tr');
      case 'price_asc':
        if (a.fiyat === null) return 1;
        if (b.fiyat === null) return -1;
        return a.fiyat - b.fiyat;
      case 'price_desc':
        if (a.fiyat === null) return 1;
        if (b.fiyat === null) return -1;
        return b.fiyat - a.fiyat;
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div>
      {/* Search and Filters Panel */}
      <div className="search-filter-panel">
        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="İsimden hızlı arama..." 
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </div>
          <div className="search-input-wrapper">
            <span className="search-icon">🔎</span>
            <input 
              type="text" 
              placeholder="Serbest Arama (Tüm alanlarda ara...)" 
              value={freeSearch}
              onChange={(e) => setFreeSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <label>İçki Türü</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Tüm Türler</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Şişe Türü (Materyal)</label>
            <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}>
              <option value="">Tüm Materyaller</option>
              {materials.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Sıralama</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">En Yeni Eklenenler</option>
              <option value="oldest">En Eski Eklenenler</option>
              <option value="alpha_asc">İsim (A-Z)</option>
              <option value="alpha_desc">İsim (Z-A)</option>
              <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn btn-outline" style={{ height: '43px' }} onClick={clearFilters}>
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {sortedBottles.length > 0 ? (
        <div className="bottles-grid">
          {sortedBottles.map((bottle) => {
            const hasPhotos = bottle.fotograflar && bottle.fotograflar.length > 0;
            const mainPhoto = hasPhotos ? bottle.fotograflar[0] : null;

            return (
              <div 
                key={bottle.id} 
                className="bottle-card"
                onClick={() => onSelectBottle(bottle)}
              >
                {bottle.sise_turu && (
                  <span className="bottle-type-badge">{bottle.sise_turu}</span>
                )}
                
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
                      background: '#09090b',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ fontSize: '2.5rem' }}>🥃</span>
                      <span style={{ fontSize: '0.65rem', marginTop: '0.5rem', fontWeight: 700 }}>RESİM YOK</span>
                    </div>
                  )}
                </div>

                <div className="bottle-info">
                  <div>
                    <div className="bottle-meta">
                      <span className="bottle-category">{bottle.icki_turu || 'Diğer'}</span>
                      {bottle.fiyat && (
                        <span className="bottle-price">{formatPrice(bottle.fiyat, bottle.para_birimi)}</span>
                      )}
                    </div>
                    <h3 className="bottle-name">{bottle.icki_adi}</h3>
                  </div>
                  
                  {bottle.alindigi_yer && (
                    <div className="bottle-origin">
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
          <div className="empty-state-icon">🥃</div>
          <h3>Şişe Bulunamadı</h3>
          <p>Seçilen filtrelere veya arama kriterlerine uygun kayıt bulunmuyor.</p>
          {(quickSearch || freeSearch || categoryFilter || materialFilter) && (
            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={clearFilters}>
              Filtreleri Sıfırla
            </button>
          )}
        </div>
      )}
    </div>
  );
}
