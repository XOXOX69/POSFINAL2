import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { syncFromStorage, CUSTOMER_DISPLAY_STORAGE_KEY } from "../../redux/rtk/features/customerDisplay/customerDisplaySlice";
import { loadActiveCfdAds } from "../../redux/rtk/features/cfdAds/cfdAdsSlice";
import "./CustomerScreen.css";

const CustomerScreen = () => {
  const dispatch = useDispatch();
  
  // Get order data from Redux store
  const { items, subtotal, tax, discount, total } = 
    useSelector((state) => state.customerDisplay) || {};
  
  // Get CFD ads from Redux
  const { activeAds } = useSelector((state) => state.cfdAds) || { activeAds: [] };
  
  // Get store settings
  const settings = useSelector((state) => state.setting?.data);

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const videoRef = useRef(null);

  // Default promotional content (used if no ads configured)
  const defaultPromos = [
    {
      media_type: "text",
      badge: "WELCOME",
      title: "Welcome!",
      subtitle: "Thank you for your order",
      description: "Please wait while we\nprepare your items",
      price: "",
      duration: 5000,
    },
  ];

  // Use active ads from API, or default promos
  const promotionalContent = activeAds.length > 0 ? activeAds : defaultPromos;

  // Function to sync from localStorage
  const syncFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_DISPLAY_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        dispatch(syncFromStorage(data));
      }
    } catch (e) {
      console.error('Failed to load customer display state:', e);
    }
  }, [dispatch]);

  // Load ads from API
  useEffect(() => {
    dispatch(loadActiveCfdAds());
    
    // Refresh ads every 30 seconds to get new content quickly
    const refreshInterval = setInterval(() => {
      dispatch(loadActiveCfdAds());
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Listen for cross-tab updates via localStorage
  useEffect(() => {
    syncFromLocalStorage();

    const handleStorageChange = (event) => {
      if (event.key === CUSTOMER_DISPLAY_STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          dispatch(syncFromStorage(data));
        } catch (e) {
          console.error('Failed to parse customer display state:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling fallback every 500ms
    const pollInterval = setInterval(() => {
      syncFromLocalStorage();
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [dispatch, syncFromLocalStorage]);

  // Rotate ads based on their individual duration
  useEffect(() => {
    if (promotionalContent.length === 0) return;
    
    const currentAd = promotionalContent[currentAdIndex];
    const duration = currentAd?.duration || 5000;
    
    const interval = setTimeout(() => {
      setCurrentAdIndex((prev) => (prev + 1) % promotionalContent.length);
    }, duration);
    
    return () => clearTimeout(interval);
  }, [currentAdIndex, promotionalContent]);

  // Handle video playback
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentAdIndex]);

  const orderItems = items || [];
  const hasItems = orderItems.length > 0;

  const formatPrice = (price) => {
    return Number(price || 0).toFixed(2);
  };

  const currentPromo = promotionalContent[currentAdIndex] || defaultPromos[0];

  // Get full media URL - backend serves files at http://127.0.0.1:8000/storage/...
  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Backend base URL (remove trailing slash and /v1 if present)
    const apiUrl = import.meta.env.VITE_APP_API || 'http://127.0.0.1:8000';
    const baseUrl = apiUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '');
    return `${baseUrl}${url}`;
  };

  // Render ad content based on type
  const renderAdContent = () => {
    const mediaUrl = getMediaUrl(currentPromo.media_url);
    
    if (currentPromo.media_type === 'image' && mediaUrl) {
      return (
        <div className="media-container">
          <img 
            src={mediaUrl} 
            alt={currentPromo.title || 'Promotion'} 
            className="ad-media-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Overlay text if has title */}
          {currentPromo.title && (
            <div className="media-overlay">
              {currentPromo.badge && <div className="promo-badge">{currentPromo.badge}</div>}
              <div className="promo-title">{currentPromo.title}</div>
              {currentPromo.price && <div className="promo-price">{currentPromo.price}</div>}
            </div>
          )}
        </div>
      );
    }
    
    if (currentPromo.media_type === 'video' && mediaUrl) {
      return (
        <div className="media-container">
          <video
            ref={videoRef}
            src={mediaUrl}
            className="ad-media-video"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Overlay text if has title */}
          {currentPromo.title && (
            <div className="media-overlay">
              {currentPromo.badge && <div className="promo-badge">{currentPromo.badge}</div>}
              <div className="promo-title">{currentPromo.title}</div>
              {currentPromo.price && <div className="promo-price">{currentPromo.price}</div>}
            </div>
          )}
        </div>
      );
    }
    
    // Default: Text-based promo card
    return (
      <div className="promo-card">
        {currentPromo.badge && <div className="promo-badge">{currentPromo.badge}</div>}
        {currentPromo.title && <div className="promo-title">{currentPromo.title}</div>}
        {currentPromo.subtitle && <div className="promo-subtitle">{currentPromo.subtitle}</div>}
        {currentPromo.description && (
          <div className="promo-description">
            {currentPromo.description.split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
        {currentPromo.price && <div className="promo-price">{currentPromo.price}</div>}
      </div>
    );
  };

  return (
    <div className="customer-screen">
      {/* Left Section - Promotional Content (50%) */}
      <div className="ad-section">
        <div className="ad-container">
          {renderAdContent()}
          
          {promotionalContent.length > 1 && (
            <div className="ad-indicators">
              {promotionalContent.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${index === currentAdIndex ? "active" : ""}`}
                  onClick={() => setCurrentAdIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Order Display (50%) */}
      <div className="order-section">
        {/* Amount Due Header */}
        <div className="amount-header">
          <span className="amount-label">AMOUNT DUE</span>
          <span className="amount-value">{formatPrice(total)}</span>
        </div>

        {/* Order Items */}
        {hasItems ? (
          <>
            <div className="order-items-wrapper">
              <div className="order-divider">--- DINE IN ---</div>
              
              {orderItems.map((item, idx) => {
                const name = item.productName || item.name || "Item";
                const quantity = item.productQuantity || item.quantity || 1;
                const unitPrice = item.productSalePrice || item.unitPrice || item.price || 0;
                const itemTotal = quantity * unitPrice;
                
                return (
                  <div key={item.productId || item.id || idx} className="order-item-row">
                    <div className="item-details">
                      <span className="item-quantity">{quantity}</span>
                      <span className="item-name">{name}</span>
                    </div>
                    <span className="item-price">{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="order-summary-footer">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span className="summary-label">Discount</span>
                  <span className="summary-value">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span className="summary-label">Tax</span>
                <span className="summary-value">{formatPrice(tax)}</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">TOTAL</span>
                <span className="summary-value">{formatPrice(total)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-order-state">
            <div className="empty-icon">🛒</div>
            <div className="empty-message">Waiting for order...</div>
            <div className="empty-submessage">Items will appear here</div>
          </div>
        )}

        {/* Thank You Bar */}
        <div className="thank-you-bar">
          <span className="thank-you-text">Thank you for choosing {settings?.companyName || "SALEFLOW POS"}!</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerScreen;
