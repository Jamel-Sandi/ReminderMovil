'use client';

import React, { useState, useEffect } from 'react';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import BackupSection from './components/BackupSection';
import { Bell, Heart, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useDatabase, setUseDatabase] = useState(true);

  // Email fijo para Elenita
  const emailSettings = {
    email: 'jsandi12199@gmail.com',
    enabled: true
  };

  // Cargar recordatorios al inicio
  useEffect(() => {
    loadReminders();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // 📋 Cargar recordatorios (BD o localStorage)
  const loadReminders = async () => {
    try {
      setLoading(true);
      
      if (useDatabase) {
        // Intentar cargar desde la base de datos
        const response = await fetch('/api/reminders');
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Recordatorios cargados desde MySQL:', result.data.length);
          setReminders(result.data);
          // Sincronizar con localStorage como backup
          localStorage.setItem('reminders', JSON.stringify(result.data));
        } else if (result.useLocalStorage) {
          console.log('⚠️ MySQL no disponible, usando localStorage');
          setUseDatabase(false);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error cargando recordatorios:', error);
      console.log('📱 Fallback a localStorage');
      setUseDatabase(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedReminders = localStorage.getItem('reminders');
    setReminders(savedReminders ? JSON.parse(savedReminders) : []);
  };

  // ➕ Agregar recordatorio
  const addReminder = async (newReminder) => {
    try {
      if (useDatabase) {
        // Intentar guardar en BD
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReminder)
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Recordatorio guardado en MySQL');
          setReminders(prev => [...prev, result.data]);
          // Backup en localStorage
          const updatedReminders = [...reminders, result.data];
          localStorage.setItem('reminders', JSON.stringify(updatedReminders));
          return;
        } else if (result.useLocalStorage) {
          console.log('⚠️ MySQL no disponible, guardando en localStorage');
          setUseDatabase(false);
        }
      }
      
      // Fallback a localStorage
      const reminder = {
        ...newReminder,
        id: Date.now(),
        created_at: new Date().toISOString(),
        notified: false,
        status: 'active'
      };
      
      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      console.log('📱 Recordatorio guardado en localStorage');
      
    } catch (error) {
      console.error('Error agregando recordatorio:', error);
      // Fallback a localStorage siempre funciona
      const reminder = {
        ...newReminder,
        id: Date.now(),
        created_at: new Date().toISOString(),
        notified: false
      };
      
      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
    }
  };

  // 🗑️ Eliminar recordatorio
  const deleteReminder = async (id) => {
    try {
      if (useDatabase) {
        // Intentar eliminar de BD
        const response = await fetch(`/api/reminders?id=${id}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Recordatorio eliminado de MySQL');
        } else if (result.useLocalStorage) {
          setUseDatabase(false);
        }
      }
      
      // Actualizar estado local siempre
      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
      
    } catch (error) {
      console.error('Error eliminando recordatorio:', error);
      // Fallback a localStorage
      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
    }
  };

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

  // Programar notificaciones del navegador (PARA TESTING: cada 2 minutos)
  useEffect(() => {
    reminders.forEach(reminder => {
      const reminderTime = new Date(reminder.datetime).getTime();
      const now = Date.now();
      
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime - now;
        
        // PARA TESTING: También enviar cada 2 minutos si es dentro de 2 minutos
        const twoMinutesFromNow = now + (2 * 60 * 1000); // 2 minutos en millisegundos
        
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

        // TESTING: Si el recordatorio es en los próximos 2 minutos, también programar para ahora + 2 min
        if (reminderTime <= twoMinutesFromNow) {
          setTimeout(() => {
            console.log('🧪 TEST: Enviando email de prueba cada 2 minutos');
            if (emailSettings.enabled) {
              sendEmailNotification(reminder);
            }
          }, 2 * 60 * 1000); // 2 minutos
        }
      }
    });
  }, [reminders]);

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
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    },
    loadingContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffc0cb, #ffb6c1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingContent: {
      textAlign: 'center'
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
    heartBeat: {
      animation: 'heartBeat 1.5s infinite'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}>🐝</div>
          <p style={styles.loadingText}>Cargando recordatorios de Elenita...</p>
          <p style={{...styles.loadingText, fontSize: '0.9rem', marginTop: '0.5rem'}}>
            {useDatabase ? 'Conectando a la base de datos...' : 'Cargando desde localStorage...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Elementos decorativos flotantes - SOLO CORAZONES */}
      <div style={styles.floatingHearts}>
        <div style={{...styles.floatingHeart, top: '10%', left: '10%', animationDelay: '0s'}}>💖</div>
        <div style={{...styles.floatingHeart, top: '20%', right: '20%', animationDelay: '1s'}}>💕</div>
        <div style={{...styles.floatingHeart, top: '40%', left: '25%', animationDelay: '2s'}}>🌸</div>
        <div style={{...styles.floatingHeart, bottom: '20%', left: '20%', animationDelay: '4s'}}>🐝</div>
        <div style={{...styles.floatingHeart, bottom: '40%', right: '10%', animationDelay: '5s'}}>💗</div>
        <div style={{...styles.floatingHeart, top: '60%', right: '30%', animationDelay: '3s'}}>💝</div>
      </div>

      <div style={styles.content}>
        {/* Header bonito - SIN ESTRELLAS NI INDICADOR MYSQL */}
        <header style={styles.header}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>
              <Heart className="heart-beat" style={{color: '#ff6b6b'}} />
              Mis Recordatorios
              <Heart className="heart-beat" style={{color: '#ff6b6b'}} />
            </h1>
          </div>
          <p style={styles.subtitle}>Tu asistente personal 💖</p>
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
    </div>
  );
}