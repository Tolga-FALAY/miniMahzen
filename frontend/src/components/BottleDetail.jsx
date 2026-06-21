import React, { useState, useEffect } from 'react';
import WhiskeyLogo from './WhiskeyLogo';

export default function BottleDetail({ bottle, onClose, onEdit, onDelete }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const overlayRef = React.useRef(null);
  const touchStateRef = React.useRef({ initialDist: 0, initialScale: 1 });

  if (!bottle) return null;

  const { id, marka, icki_adi, ek_bilgiler, icki_turu, sise_turu, fotograflar, alinma_tarihi, alindigi_yer, fiyat, para_birimi } = bottle;
  const hasPhotos = fotograflar && fotograflar.length > 0;

  const resetZoom = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetZoom();
  }, [activePhotoIndex, isFullscreenOpen]);

  useEffect(() => {
    const overlayElement = overlayRef.current;
    if (!overlayElement || !isFullscreenOpen) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomIntensity = 0.05;
        const delta = -e.deltaY;
        setZoomScale((prevScale) => {
          const newScale = Math.max(1, Math.min(5, prevScale + delta * zoomIntensity * 0.1));
          return newScale;
        });
      }
    };

    overlayElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      overlayElement.removeEventListener('wheel', handleWheel);
    };
  }, [isFullscreenOpen]);

  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomPosition.x, y: e.clientY - zoomPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setZoomPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && zoomScale > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - zoomPosition.x, y: touch.clientY - zoomPosition.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStateRef.current = {
        initialDist: dist,
        initialScale: zoomScale,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      const touch = e.touches[0];
      setZoomPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const { initialDist, initialScale } = touchStateRef.current;
      if (initialDist > 0) {
        const factor = dist / initialDist;
        const newScale = Math.max(1, Math.min(5, initialScale * factor));
        setZoomScale(newScale);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      } else if (e.key === 'ArrowLeft') {
        if (hasPhotos && fotograflar.length > 1) {
          setActivePhotoIndex((prev) => (prev === 0 ? fotograflar.length - 1 : prev - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (hasPhotos && fotograflar.length > 1) {
          setActivePhotoIndex((prev) => (prev === fotograflar.length - 1 ? 0 : prev + 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenOpen, hasPhotos, fotograflar]);
  
  // Format price
  const formatPrice = (val, currencyCode) => {
    if (val === null || val === undefined || val === '') return 'Belirtilmemiş';
    const code = currencyCode || 'TL';
    const isISO = ['USD', 'EUR', 'GBP', 'TRY'].includes(code);
    if (isISO) {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: code }).format(val);
    }
    // For custom codes or 'TL'
    const displayCode = code === 'TL' ? 'TL' : code;
    return `${val} ${displayCode}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Belirtilmemiş';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('tr-TR', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Şişe Detayları</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="detail-layout">
            {/* Sol Taraf: Görsel Galerisi */}
            <div className="detail-gallery">
              <div 
                className="detail-main-image"
                style={{ cursor: hasPhotos ? 'pointer' : 'default' }}
                onClick={() => {
                  if (hasPhotos) {
                    setIsFullscreenOpen(true);
                  }
                }}
              >
                {hasPhotos ? (
                  <img src={fotograflar[activePhotoIndex]} alt={icki_adi} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-main)',
                    color: 'var(--text-muted)'
                  }}>
                    <WhiskeyLogo size={56} showGlow={true} />
                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>FOTOĞRAF YOK</span>
                  </div>
                )}
              </div>

              {/* Küçük Resimler (Thumbnails) */}
              {hasPhotos && fotograflar.length > 1 && (
                <div className="detail-thumbnails">
                  {fotograflar.map((photo, idx) => (
                    <div 
                      key={idx} 
                      className={`detail-thumb ${activePhotoIndex === idx ? 'active' : ''}`}
                      onClick={() => setActivePhotoIndex(idx)}
                    >
                      <img src={photo} alt={`Küçük Resim ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sağ Taraf: Detay Bilgileri */}
            <div className="detail-info">
              <div className="detail-header-group">
                <div className="detail-category">{icki_turu || 'Diğer'}</div>
                <h3 className="detail-title">{icki_adi}</h3>
              </div>

              {/* Ek Bilgiler (Şişe türü ve fiyat maliyet alanının üzerinde) */}
              <div className="detail-description-section" style={{
                background: 'var(--bg-main)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '0.5rem'
              }}>
                <span className="field-label" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Ek Bilgiler</span>
                <span className="field-value" style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                  {ek_bilgiler || 'Belirtilmemiş'}
                </span>
              </div>

              <div className="detail-fields-grid">
                <div className="detail-field">
                  <span className="field-label">Şişe Türü (Materyal)</span>
                  <span className="field-value">{sise_turu || 'Belirtilmemiş'}</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Fiyat / Maliyet</span>
                  <span className="field-value" style={{ color: fiyat ? 'var(--primary)' : 'inherit' }}>
                    {formatPrice(fiyat, para_birimi)}
                  </span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Alınma Tarihi</span>
                  <span className="field-value">{formatDate(alinma_tarihi)}</span>
                </div>

                <div className="detail-field">
                  <span className="field-label">Alındığı Yer / Kişi</span>
                  <span className="field-value">{alindigi_yer || 'Belirtilmemiş'}</span>
                </div>
              </div>

              <div className="detail-actions">
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }} 
                  onClick={() => { onEdit(bottle); }}
                >
                  📝 Düzenle
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    if (window.confirm(`"${icki_adi}" şişesini koleksiyonunuzdan silmek istediğinizden emin misiniz?`)) {
                      onDelete(bottle.id);
                    }
                  }}
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFullscreenOpen && hasPhotos && (
        <div 
          className="fullscreen-image-overlay" 
          ref={overlayRef} 
          onClick={() => setIsFullscreenOpen(false)}
        >
          <button 
            className="fullscreen-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreenOpen(false);
            }}
            title="Kapat (ESC)"
          >
            &times;
          </button>
          
          {fotograflar.length > 1 && (
            <button 
              className="fullscreen-nav-btn prev-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) => (prev === 0 ? fotograflar.length - 1 : prev - 1));
              }}
              title="Önceki Görsel"
            >
              &#10094;
            </button>
          )}

          <div 
            className="fullscreen-image-container" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
          >
            <img 
              src={fotograflar[activePhotoIndex]} 
              alt={icki_adi} 
              className="fullscreen-image" 
              style={{
                transform: `translate(${zoomPosition.x}px, ${zoomPosition.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                transformOrigin: 'center center',
              }}
              draggable={false}
            />
          </div>

          <div className="fullscreen-zoom-controls" onClick={(e) => e.stopPropagation()}>
            <button 
              className="zoom-btn" 
              onClick={() => {
                setZoomScale((prev) => Math.min(5, prev + 0.25));
              }}
              title="Yakınlaştır"
            >
              ➕
            </button>
            <span className="zoom-text">{Math.round(zoomScale * 100)}%</span>
            <button 
              className="zoom-btn" 
              onClick={() => {
                setZoomScale((prev) => {
                  const s = Math.max(1, prev - 0.25);
                  if (s === 1) setZoomPosition({ x: 0, y: 0 });
                  return s;
                });
              }}
              title="Uzaklaştır"
            >
              ➖
            </button>
            {zoomScale > 1 && (
              <button 
                className="zoom-btn reset-btn" 
                onClick={resetZoom}
                title="Sıfırla"
              >
                ⟲
              </button>
            )}
          </div>

          {fotograflar.length > 1 && (
            <button 
              className="fullscreen-nav-btn next-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) => (prev === fotograflar.length - 1 ? 0 : prev + 1));
              }}
              title="Sonraki Görsel"
            >
              &#10095;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
