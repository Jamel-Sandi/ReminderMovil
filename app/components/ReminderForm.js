'use client';

import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, Repeat } from 'lucide-react';

const ReminderForm = ({ onAddReminder }) => {
  const [showForm, setShowForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    datetime: '',
    recurring: false,
    recurringType: 'hours',
    recurringInterval: 1,
    color: 'pink'
  });

  const colors = [
    { name: 'pink', label: '💖 Rosa' },
    { name: 'purple', label: '💜 Lila' },
    { name: 'blue', label: '💙 Azul' },
    { name: 'green', label: '💚 Verde' },
    { name: 'orange', label: '🧡 Naranja' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.datetime) {
      alert('Por favor completa el título y la fecha/hora');
      return;
    }

    onAddReminder(newReminder);
    
    // Reset form
    setNewReminder({
      title: '',
      description: '',
      datetime: '',
      recurring: false,
      recurringType: 'hours',
      recurringInterval: 1,
      color: 'pink'
    });
    setShowForm(false);
  };

  // Obtener fecha mínima (ahora)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Al menos 1 minuto en el futuro
    return now.toISOString().slice(0, 16);
  };

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

  const formStyles = {
    container: {
      width: '100%'
    },
    buttonContainer: {
      textAlign: 'center'
    },
    showFormButton: {
      background: 'linear-gradient(to right, #ec4899, #f43f5e)',
      color: 'white',
      fontWeight: '600',
      padding: '1rem 2rem',
      borderRadius: '9999px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'inline-flex',
      alignItems: 'center'
    },
    formCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(4px)',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center'
    },
    closeButton: {
      padding: '0.5rem',
      borderRadius: '9999px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '1rem',
      border: '2px solid #fecdd3',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      transition: 'border-color 0.3s',
      boxSizing: 'border-box'
    },
    colorSelector: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem'
    },
    colorButton: {
      width: '3rem',
      height: '3rem',
      borderRadius: '9999px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: 'none', // Removido conflicto
      outline: 'none'
    },
    colorButtonSelected: {
      transform: 'scale(1.1)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px #1f2937'
    },
    recurringSection: {
      backgroundColor: '#fdf2f8',
      borderRadius: '0.75rem',
      padding: '1rem'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer'
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      accentColor: '#ec4899',
      borderRadius: '0.25rem',
      marginRight: '0.75rem'
    },
    recurringInputs: {
      marginTop: '1rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '1rem'
    },
    submitButton: {
      width: '100%',
      background: 'linear-gradient(to right, #ec4899, #f43f5e)',
      color: 'white',
      fontWeight: '600',
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={formStyles.container}>
      {!showForm ? (
        <div style={formStyles.buttonContainer}>
          <button 
            onClick={() => setShowForm(true)}
            style={formStyles.showFormButton}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to right, #db2777, #e11d48)';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(to right, #ec4899, #f43f5e)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <Plus size={24} style={{ marginRight: '0.5rem' }} />
            Nuevo Recordatorio
          </button>
        </div>
      ) : (
        <div style={formStyles.formCard}>
          <div style={formStyles.header}>
            <h2 style={formStyles.title}>
              <Calendar style={{ marginRight: '0.5rem', color: '#ec4899' }} />
              ✨ Crear Recordatorio
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              style={formStyles.closeButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <X size={24} style={{ color: '#6b7280' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={formStyles.form}>
            {/* Título */}
            <div style={formStyles.inputGroup}>
              <label style={formStyles.label}>
                💝 ¿Qué quieres recordar?
              </label>
              <input
                type="text"
                value={newReminder.title}
                onChange={(e) => setNewReminder(prev => ({...prev, title: e.target.value}))}
                placeholder="Ej: Tomar agua, Sacar el pan del horno..."
                style={formStyles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fecdd3';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Descripción */}
            <div style={formStyles.inputGroup}>
              <label style={formStyles.label}>
                📝 Detalles (opcional)
              </label>
              <input
                type="text"
                value={newReminder.description}
                onChange={(e) => setNewReminder(prev => ({...prev, description: e.target.value}))}
                placeholder="Agregar más información..."
                style={formStyles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fecdd3';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Fecha y Hora */}
            <div style={formStyles.inputGroup}>
              <label style={formStyles.label}>
                ⏰ ¿Cuándo?
              </label>
              <input
                type="datetime-local"
                value={newReminder.datetime}
                onChange={(e) => setNewReminder(prev => ({...prev, datetime: e.target.value}))}
                min={getMinDateTime()}
                style={formStyles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ec4899';
                  e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fecdd3';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Selector de color ARREGLADO */}
            <div style={formStyles.inputGroup}>
              <label style={formStyles.label}>
                🎨 Elige tu color favorito
              </label>
              <div style={formStyles.colorSelector}>
                {colors.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setNewReminder(prev => ({...prev, color: color.name}))}
                    style={{
                      ...formStyles.colorButton,
                      background: getColorGradient(color.name),
                      ...(newReminder.color === color.name ? formStyles.colorButtonSelected : {})
                    }}
                    title={color.label}
                    onMouseEnter={(e) => {
                      if (newReminder.color !== color.name) {
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newReminder.color !== color.name) {
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {newReminder.color === color.name && (
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Recordatorio recurrente */}
            <div style={formStyles.recurringSection}>
              <label style={formStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newReminder.recurring}
                  onChange={(e) => setNewReminder(prev => ({...prev, recurring: e.target.checked}))}
                  style={formStyles.checkbox}
                />
                <span style={{ color: '#374151', fontWeight: '500', display: 'flex', alignItems: 'center' }}>
                  <Repeat style={{ marginRight: '0.5rem' }} size={20} />
                  🔄 Repetir este recordatorio
                </span>
              </label>

              {newReminder.recurring && (
                <div style={formStyles.recurringInputs}>
                  <div>
                    <label style={formStyles.label}>
                      Cada:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newReminder.recurringInterval}
                      onChange={(e) => setNewReminder(prev => ({...prev, recurringInterval: parseInt(e.target.value)}))}
                      style={{
                        ...formStyles.input,
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={formStyles.label}>
                      Tipo:
                    </label>
                    <select
                      value={newReminder.recurringType}
                      onChange={(e) => setNewReminder(prev => ({...prev, recurringType: e.target.value}))}
                      style={{
                        ...formStyles.input,
                        padding: '0.75rem',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <option value="hours">Horas</option>
                      <option value="days">Días</option>
                      <option value="weeks">Semanas</option>
                      <option value="months">Meses</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <button 
              type="submit" 
              style={formStyles.submitButton}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to right, #db2777, #e11d48)';
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to right, #ec4899, #f43f5e)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <Plus size={24} style={{ marginRight: '0.5rem' }} />
              Crear Recordatorio ✨
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReminderForm;