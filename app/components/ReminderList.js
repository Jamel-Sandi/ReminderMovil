'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Calendar, Repeat, Bell } from 'lucide-react';

const ReminderList = ({ reminders, onDeleteReminder }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getColorGradient = (colorName) => {
    const gradients = {
      pink: 'linear-gradient(to right, #ec4899, #f43f5e)',
      purple: 'linear-gradient(to right, #a855f7, #ec4899)',
      blue: 'linear-gradient(to right, #3b82f6, #06b6d4)',
      green: 'linear-gradient(to right, #10b981, #14b8a6)',
      orange: 'linear-gradient(to right, #f97316, #ec4899)'
    };
    return gradients[colorName] || gradients.pink;
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (datetime) => {
    const now = currentTime.getTime();
    const target = new Date(datetime).getTime();
    const diff = target - now;
    
    if (diff < 0) return { text: '¡Vencido!', status: 'overdue' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h`, status: 'normal' };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, status: hours < 2 ? 'soon' : 'normal' };
    if (minutes > 30) return { text: `${minutes}m`, status: 'soon' };
    if (minutes > 0) return { text: `${minutes}m`, status: 'urgent' };
    
    return { text: '¡Ahora!', status: 'now' };
  };

  const getRecurringText = (reminder) => {
    const recurringInterval = reminder.recurringInterval || reminder.recurring_interval;
    const recurringType = reminder.recurringType || reminder.recurring_type;
    
    const typeMap = {
      'hours': 'hora(s)',
      'days': 'día(s)',
      'weeks': 'semana(s)',
      'months': 'mes(es)'
    };
    
    return `Cada ${recurringInterval} ${typeMap[recurringType]}`;
  };

  const sortedReminders = reminders
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    header: {
      textAlign: 'center'
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(4px)',
      borderRadius: '1.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      padding: '3rem',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    emptyIcon: {
      marginBottom: '1.5rem'
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280',
      fontSize: '1.125rem'
    },
    remindersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    reminderCard: {
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    },
    reminderCardHover: {
      transform: 'scale(1.02)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    glowEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
      transform: 'skewX(-12deg)',
      animation: 'pulse 2s infinite'
    },
    reminderContent: {
      position: 'relative',
      zIndex: 10
    },
    reminderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    reminderTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      paddingRight: '1rem',
      lineHeight: 1.25
    },
    deleteButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(4px)',
      padding: '0.5rem',
      borderRadius: '9999px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    deleteButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      transform: 'scale(1.1)'
    },
    reminderDescription: {
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      lineHeight: 1.625
    },
    reminderDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.875rem'
    },
    timeUntil: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    recurringBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.875rem',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px'
    },
    statusIndicator: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      fontSize: '1.5rem'
    },
    sparkleContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    sparkle: {
      fontSize: '1.5rem',
      animation: 'bounce 2s infinite'
    }
  };

  if (reminders.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>
          <Bell size={64} style={{ margin: '0 auto', color: '#fbb6ce', animation: 'pulse 2s infinite' }} />
          <div style={styles.sparkleContainer}>
            <span style={{...styles.sparkle, animationDelay: '0s'}}>✨</span>
            <span style={{...styles.sparkle, animationDelay: '0.1s'}}>💫</span>
            <span style={{...styles.sparkle, animationDelay: '0.2s'}}>⭐</span>
          </div>
        </div>
        <h3 style={styles.emptyTitle}>
          No tienes recordatorios aún
        </h3>
        <p style={styles.emptyText}>
          ¡Crea tu primer recordatorio arriba! 💖
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          <Calendar style={{ marginRight: '0.5rem', color: '#ec4899' }} />
          Mis Recordatorios ({reminders.length})
        </h2>
      </div>

      <div style={styles.remindersList}>
        {sortedReminders.map((reminder, index) => {
          const timeInfo = getTimeUntil(reminder.datetime);
          
          return (
            <div 
              key={reminder.id} 
              style={{
                ...styles.reminderCard,
                background: getColorGradient(reminder.color),
                opacity: timeInfo.status === 'overdue' ? 0.7 : 1,
                animation: timeInfo.status === 'urgent' ? 'pulse 2s infinite' : 
                          timeInfo.status === 'now' ? 'bounce 1s infinite' : 'none',
                animationDelay: `${index * 0.1}s`,
                ...(timeInfo.status === 'now' && {
                  border: '4px solid #f87171'
                })
              }}
              onMouseEnter={(e) => {
                if (timeInfo.status !== 'urgent' && timeInfo.status !== 'now') {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (timeInfo.status !== 'urgent' && timeInfo.status !== 'now') {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* Efecto de brillo para recordatorios urgentes */}
              {(timeInfo.status === 'urgent' || timeInfo.status === 'now') && (
                <div style={styles.glowEffect}></div>
              )}

              <div style={styles.reminderContent}>
                <div style={styles.reminderHeader}>
                  <h3 style={styles.reminderTitle}>
                    {reminder.title}
                  </h3>
                  <button
                    onClick={() => onDeleteReminder(reminder.id)}
                    style={styles.deleteButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.transform = 'scale(1)';
                    }}
                    aria-label="Eliminar recordatorio"
                  >
                    <Trash2 size={18} style={{ color: 'white' }} />
                  </button>
                </div>

                {reminder.description && (
                  <p style={styles.reminderDescription}>
                    {reminder.description}
                  </p>
                )}

                <div style={styles.reminderDetails}>
                  <div style={styles.detailItem}>
                    <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                    <span>{formatDateTime(reminder.datetime)}</span>
                  </div>

                  <div style={{
                    ...styles.timeUntil,
                    color: timeInfo.status === 'overdue' ? 'rgba(255, 255, 255, 0.6)' :
                           timeInfo.status === 'now' ? '#fef08a' :
                           timeInfo.status === 'urgent' ? '#fecaca' :
                           'rgba(255, 255, 255, 0.9)'
                  }}>
                    <Clock size={16} style={{ marginRight: '0.5rem' }} />
                    <span>{timeInfo.text}</span>
                    {timeInfo.status === 'urgent' && <span style={{ marginLeft: '0.5rem', animation: 'pulse 1s infinite' }}>⚡</span>}
                    {timeInfo.status === 'now' && <span style={{ marginLeft: '0.5rem', animation: 'bounce 1s infinite' }}>🚨</span>}
                  </div>

                  {reminder.recurring && (
                    <div style={styles.recurringBadge}>
                      <Repeat size={14} style={{ marginRight: '0.5rem' }} />
                      <span>{getRecurringText(reminder)}</span>
                    </div>
                  )}
                </div>

                {/* Indicador de estado en la esquina */}
                <div style={styles.statusIndicator}>
                  {timeInfo.status === 'overdue' && '⏰'}
                  {timeInfo.status === 'now' && '🔥'}
                  {timeInfo.status === 'urgent' && '⚡'}
                  {timeInfo.status === 'soon' && '⏳'}
                  {timeInfo.status === 'normal' && '✅'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReminderList;