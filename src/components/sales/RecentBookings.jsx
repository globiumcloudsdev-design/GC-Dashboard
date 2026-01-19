"use client";

import React, { useState } from 'react';
import SaleDetailsModal from './SaleDetailsModal';

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'confirmed': return '#10B981';
    case 'pending': return '#F59E0B';
    case 'cancelled':
    case 'canceled': return '#EF4444';
    case 'rescheduled': return '#6366F1';
    default: return '#6B7280';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const RecentBookings = ({ bookings = [], theme = {}, agent = null }) => {
  const colors = {
    text: theme.colors?.text || '#000',
    textSecondary: theme.colors?.textSecondary || '#666',
    primary: theme.colors?.primary || '#1D4ED8',
    surface: theme.colors?.surface || '#fff',
    success: theme.colors?.success || '#10B981',
    border: theme.colors?.border || '#ddd',
  };

  const [selectedBooking, setSelectedBooking] = useState(null);

  const openBookingDetails = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);

  // Helper to format currency based on agent's target type
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    
    let currencySymbol = agent?.targetCurrency || 'PKR';
    
    // If target type is 'digit', use Dollar ($)
    if (agent?.monthlyTargetType === 'digit') {
      currencySymbol = '$';
    } 
    // If target type is 'amount', use targetCurrency (already set as default)
    // If target type is 'both' or 'none', use targetCurrency
    
    // Convert common codes to symbols if needed
    if (currencySymbol === 'USD') currencySymbol = '$';
    else if (currencySymbol === 'EUR') currencySymbol = '€';
    else if (currencySymbol === 'GBP') currencySymbol = '£';
    // For PKR, we keep 'PKR' or use 'Rs' if preferred, but user said "Currency ki Price us Currency mein ayegi"
    
    return `${currencySymbol} ${Number(amount).toLocaleString('en-IN')}`;
  };



  return (
    <>
      <section style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: 16,
          color: colors.text,
          textAlign: "left",
        }}>
          Recent Sales ({bookings.length})
        </h2>

        {!bookings.length ? (
          <p style={{
            fontSize: "14px",
            color: colors.textSecondary,
            textAlign: "center",
          }}>
            No recent sales
          </p>
        ) : (
          bookings.map((item) => (
            <div
              key={item._id || item.bookingId}
              onClick={() => openBookingDetails(item)}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "12px",
                backgroundColor: colors.surface,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') openBookingDetails(item); }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
                  {item.type === 'project' ? `📁 ${item.title || 'Project'}` : `#${item.bookingId || '-'}`}
                </p>
                <div style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: getStatusColor(item.status),
                }}>
                  {(item.status || '-').toUpperCase()}
                </div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: colors.textSecondary,
                flexWrap: "wrap",
                gap: "8px",
              }}>
                <p>{formatDate(item.createdAt)}</p>
                <p>
                  {item.type === 'project' 
                    ? (item.category || 'Project')
                    : `${item.formData?.firstName || '-'} ${item.formData?.lastName || ''}`
                  }
                </p>
                {(agent?.monthlyTargetType === 'amount' || agent?.monthlyTargetType === 'both') && (
                  <p style={{ fontWeight: 600, color: colors.primary }}>
                    {formatCurrency(item.type === 'project' ? (item.price || item.amount || 0) : (item.totalPrice || item.amount || item.totalAmount || 0))}
                  </p>
                )}
              </div>

              {item.type === 'project' && item.shortDescription && (
                <p style={{ fontSize: "12px", color: colors.textSecondary, marginTop: 6 }}>
                  {item.shortDescription}
                </p>
              )}
              {item.type !== 'project' && item.promoCode && (
                <p style={{ fontSize: "12px", color: colors.textSecondary, marginTop: 6 }}>
                  Promo: {item.promoCode}
                </p>
              )}
            </div>
          ))
        )}
      </section>

      <SaleDetailsModal
        isOpen={!!selectedBooking}
        onClose={closeModal}
        saleData={selectedBooking}
        currencySymbol={
          agent?.monthlyTargetType === 'digit' ? '$' : (agent?.targetCurrency || 'PKR')
        }
      />
    </>
  );
};

export default RecentBookings;
