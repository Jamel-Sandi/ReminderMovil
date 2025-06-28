'use client';

import React, { useState, useEffect } from 'react';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import BackupSection from './components/BackupSection';
import { Bell, Heart, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const loadReminders = () => {
    try {
      setLoading(true);
      const savedReminders = localStorage.getItem('reminders');
      setReminders(savedReminders ? JSON.parse(savedReminders) : []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = (newReminder) => {
    const reminder = {
      ...newReminder,
      id: Date.now(),
      created_at: new Date().toISOString(),
      notified: false
    };
    
    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const deleteReminder = (id) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const sendEmailNotification = async (reminder) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

    switch (reminder.recurringType) {
      case 'hours':
        nextDate.setHours(nextDate.getHours() + reminder.recurringInterval);
        break;
      case 'days':
        nextDate.setDate(nextDate.getDate() + reminder.recurringInterval);
        break;
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + (reminder.recurringInterval * 7));
        break;
      case 'months':
        nextDate.setMonth(nextDate.getMonth() + reminder.recurringInterval);
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

  // Programar notificaciones del navegador
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐝</div>
          <p className="text-gray-600">Cargando recordatorios de Elenita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-rose-200 relative overflow-hidden">
      {/* Elementos decorativos flotantes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 text-2xl animate-bounce delay-0 opacity-30">💖</div>
        <div className="absolute top-20 right-20 text-xl animate-bounce delay-1000 opacity-30">💕</div>
        <div className="absolute top-40 left-1/4 text-lg animate-bounce delay-2000 opacity-30">🌸</div>
        <div className="absolute top-60 right-1/3 text-xl animate-bounce delay-3000 opacity-30">✨</div>
        <div className="absolute bottom-20 left-20 text-lg animate-bounce delay-4000 opacity-30">🐝</div>
        <div className="absolute bottom-40 right-10 text-lg animate-bounce delay-5000 opacity-30">💗</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header bonito */}
        <header className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute -top-2 -left-2 text-yellow-400 animate-pulse">✨</div>
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse delay-500">✨</div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-yellow-400 animate-pulse delay-1000">✨</div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-clip-text text-transparent mb-4 animate-pulse">
              <Heart className="inline-block mr-2 text-pink-500 animate-pulse" />
              Mis Recordatorios
              <Heart className="inline-block ml-2 text-pink-500 animate-pulse" />
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">Tu asistente personal ✨</p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
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