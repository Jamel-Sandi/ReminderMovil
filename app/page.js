'use client';

import React, { useState, useEffect } from 'react';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import BackupSection from './components/BackupSection';
import { Bell, Heart, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Email fijo para Elenita
  const emailSettings = {
    email: 'jsandi12199@gmail.com',
    enabled: true
  };

  // ✅ Cargar recordatorios AL INICIO
  useEffect(() => {
    loadReminders();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // 📋 SOLO SUPABASE - Cargar recordatorios
  const loadReminders = async () => {
    console.log('🔄 Cargando recordatorios de Supabase...');
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('📊 Respuesta de API:', result);
      
      if (result.success) {
        console.log(`✅ ${result.data.length} recordatorios cargados de Supabase`);
        setReminders(result.data);
        setConnectionStatus('connected');
      } else {
        console.error('❌ Error en respuesta de API:', result.message);
        setError(`Error cargando recordatorios: ${result.message}`);
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Error conectando con API:', error);
      setError(`Error de conexión: ${error.message}`);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // ➕ SOLO SUPABASE - Agregar recordatorio
  const addReminder = async (newReminderData) => {
    console.log('➕ Agregando recordatorio a Supabase...');
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReminderData)
      });
      
      const result = await response.json();
      console.log('📊 Respuesta crear:', result);
      
      if (result.success) {
        console.log('✅ Recordatorio creado en Supabase');
        setReminders(prev => [...prev, result.data]);
        setConnectionStatus('connected');
      } else {
        console.error('❌ Error creando recordatorio:', result.message);
        alert(`Error creando recordatorio: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error en addReminder:', error);
      alert(`Error de conexión: ${error.message}`);
    }
  };

  // 🗑️ SOLO SUPABASE - Eliminar recordatorio
  const deleteReminder = async (id) => {
    console.log('🗑️ Eliminando recordatorio de Supabase:', id);
    
    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      console.log('📊 Respuesta eliminar:', result);
      
      if (result.success) {
        console.log('✅ Recordatorio eliminado de Supabase');
        setReminders(prev => prev.filter(r => r.id !== id));
        setConnectionStatus('connected');
      } else {
        console.error('❌ Error eliminando recordatorio:', result.message);
        alert(`Error eliminando recordatorio: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error en deleteReminder:', error);
      alert(`Error de conexión: ${error.message}`);
    }
  };

  // 📧 Enviar email de notificación
  const sendEmailNotification = async (reminder) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailSettings.email,
          reminder: reminder
        }),
      });
      
      if (response.ok) {
        console.log('📧 Email enviado exitosamente a Elenita! 🐝');
      } else {
        console.error('❌ Error enviando email');
      }
    } catch (error) {
      console.error('❌ Error enviando email:', error);
    }
  };

  // 🔄 Programar siguiente recordatorio recurrente
  const scheduleNextRecurring = (reminder) => {
    const currentDate = new Date(reminder.datetime);
    let nextDate = new Date(currentDate);

    switch (reminder.recurringType || reminder.recurring_type) {
      case 'hours':
        nextDate.setHours(nextDate.getHours() + (reminder.recurringInterval || reminder.recurring_interval));
        break;
      case 'days':
        nextDate.setDate(nextDate.getDate() + (reminder.recurringInterval || reminder.recurring_interval));
        break;
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + ((reminder.recurringInterval || reminder.recurring_interval) * 7));
        break;
      case 'months':
        nextDate.setMonth(nextDate.getMonth() + (reminder.recurringInterval || reminder.recurring_interval));
        break;
    }

    const updatedReminder = {
      ...reminder,
      datetime: nextDate.toISOString().slice(0, 16)
    };

    setReminders(prev => prev.map(r => 
      r.id === reminder.id ? updatedReminder : r
    ));
  };

  // 🔔 Programar notificaciones del navegador
  useEffect(() => {
    reminders.forEach(reminder => {
      const reminderTime = new Date(reminder.datetime).getTime();
      const now = Date.now();
      
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime - now;
        
        setTimeout(() => {
          // Notificación del navegador
          if (Notification.permission === 'granted') {
            new Notification(reminder.title, {
              body: reminder.description || 'Recordatorio de Elenita',
              icon: '/favicon.ico'
            });
          }
          
          // Enviar email
          if (emailSettings.enabled) {
            sendEmailNotification(reminder);
          }
          
          // Si es recurrente, programar el siguiente
          if (reminder.recurring) {
            scheduleNextRecurring(reminder);
          }
        }, timeUntilReminder);
      }
    });
  }, [reminders]);

  // 🎨 Estilos del componente
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 75%, #ff9a9e 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem 1rem'
    },
    floatingHearts: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0
    },
    floatingHeart: {
      position: 'absolute',
      fontSize: '1.5rem',
      opacity: 0.3,
      animation: 'float 6s ease-in-out infinite'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    titleContainer: {
      position: 'relative',
      display: 'inline-block'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      background: 'linear-gradient(45deg, #ff6b6b, #ee5a52, #ff8e8e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    subtitle: {
      color: '#666',
      fontSize: '1.2rem',
      fontWeight: '500'
    },
    connectionStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '25px',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginTop: '1rem'
    },
    connected: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    connecting: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    loadingSpinner: {
      fontSize: '3rem',
      marginBottom: '1rem',
      animation: 'spin 1s linear infinite'
    },
    loadingText: {
      color: '#666',
      fontSize: '1.1rem'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '3rem 2rem',
      backgroundColor: 'rgba(254, 226, 226, 0.9)',
      borderRadius: '1.5rem',
      border: '2px solid #fca5a5',
      marginBottom: '2rem'
    },
    errorIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      color: '#dc2626'
    },
    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#991b1b',
      marginBottom: '0.5rem'
    },
    errorText: {
      color: '#7f1d1d',
      marginBottom: '1.5rem'
    },
    retryButton: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.3s'
    }
  };

  // 🔄 Componente de carga
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>🐝</div>
            <p style={styles.loadingText}>
              Conectando con Supabase...
            </p>
            <p style={{...styles.loadingText, fontSize: '0.9rem', marginTop: '0.5rem'}}>
              Cargando recordatorios de Elenita 💖
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Componente de error
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.errorContainer}>
            <AlertCircle size={48} style={styles.errorIcon} />
            <h2 style={styles.errorTitle}>Error de Conexión</h2>
            <p style={styles.errorText}>{error}</p>
            <button 
              onClick={loadReminders}
              style={styles.retryButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#b91c1c';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'scale(1)';
              }}
            >
              🔄 Reintentar Conexión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Elementos decorativos flotantes */}
      <div style={styles.floatingHearts}>
        <div style={{...styles.floatingHeart, top: '10%', left: '10%', animationDelay: '0s'}}>💖</div>
        <div style={{...styles.floatingHeart, top: '20%', right: '20%', animationDelay: '1s'}}>💕</div>
        <div style={{...styles.floatingHeart, top: '40%', left: '25%', animationDelay: '2s'}}>🌸</div>
        <div style={{...styles.floatingHeart, bottom: '20%', left: '20%', animationDelay: '4s'}}>🐝</div>
        <div style={{...styles.floatingHeart, bottom: '40%', right: '10%', animationDelay: '5s'}}>💗</div>
        <div style={{...styles.floatingHeart, top: '60%', right: '30%', animationDelay: '3s'}}>💝</div>
      </div>

      <div style={styles.content}>
        {/* Header bonito */}
        <header style={styles.header}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>
              <Heart style={{color: '#ff6b6b', animation: 'pulse 2s infinite'}} />
              Mis Recordatorios
              <Heart style={{color: '#ff6b6b', animation: 'pulse 2s infinite'}} />
            </h1>
          </div>
          <p style={styles.subtitle}>
            Tu asistente personal 💖
          </p>
          
          {/* Estado de conexión */}
          <div style={{
            ...styles.connectionStatus,
            ...(connectionStatus === 'connected' && styles.connected),
            ...(connectionStatus === 'error' && styles.error),
            ...(connectionStatus === 'connecting' && styles.connecting)
          }}>
            {connectionStatus === 'connected' && (
              <>
                <span style={{color: '#16a34a'}}>●</span>
                Conectado a Supabase
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <span style={{color: '#dc2626'}}>●</span>
                Error de conexión
              </>
            )}
            {connectionStatus === 'connecting' && (
              <>
                <span style={{color: '#ca8a04'}}>●</span>
                Conectando...
              </>
            )}
          </div>
        </header>

        <div style={styles.mainContent}>
          {/* Formulario para agregar recordatorios */}
          <ReminderForm onAddReminder={addReminder} />
          
          {/* Sección de backup y reportes */}
          <BackupSection reminders={reminders} setReminders={setReminders} />
          
          {/* Lista de recordatorios */}
          <ReminderList 
            reminders={reminders} 
            onDeleteReminder={deleteReminder} 
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .heart-beat {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}