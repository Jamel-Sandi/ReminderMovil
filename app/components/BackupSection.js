'use client';

import React, { useState } from 'react';
import { Download, FileText, Upload, Trash2, Heart } from 'lucide-react';
import jsPDF from 'jspdf';

const BackupSection = ({ reminders, setReminders }) => {
  const [showBackup, setShowBackup] = useState(false);

  const formatDateForPDF = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Configurar encoding para caracteres especiales
    doc.setFont('helvetica');
    
    // ===== HEADER SÚPER CUTE =====
    // Fondo rosa suave para el header
    doc.setFillColor(255, 240, 245);
    doc.rect(0, 0, 210, 70, 'F');
    
    // Título principal para Elenita con emojis
    doc.setFontSize(24);
    doc.setTextColor(236, 72, 153); // Rosa fuerte
    doc.text('Reportes de Elenita', 105, 25, { align: 'center' });
    
    // Emojis decorativos alrededor del título
    doc.setFontSize(20);
    doc.text('💖', 60, 25);
    doc.text('🐝', 75, 25);
    doc.text('🌸', 135, 25);
    doc.text('✨', 150, 25);
    
    // Subtítulo bonito
    doc.setFontSize(16);
    doc.setTextColor(255, 193, 7); // Amarillo dorado
    doc.text('Mis Recordatorios Especiales', 105, 40, { align: 'center' });
    
    // Fecha de generación
    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    const fecha = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generado el: ${fecha}`, 105, 52, { align: 'center' });
    
    // Decoración con corazones
    doc.setFontSize(14);
    doc.setTextColor(255, 182, 193);
    doc.text('💕', 20, 60);
    doc.text('💕', 190, 60);
    
    // Línea decorativa
    doc.setLineWidth(2);
    doc.setDrawColor(255, 193, 7);
    doc.line(30, 65, 180, 65);
    
    let yPosition = 85;
    
    if (reminders.length === 0) {
      // Mensaje cute cuando no hay recordatorios
      doc.setFontSize(18);
      doc.setTextColor(200, 150, 200);
      doc.text('Aun no hay recordatorios,', 105, yPosition, { align: 'center' });
      doc.text('pero pronto habra muchos! 💖', 105, yPosition + 15, { align: 'center' });
      
      // Decoración extra
      doc.setFontSize(30);
      doc.text('🌟', 105, yPosition + 40, { align: 'center' });
    } else {
      // Contador de recordatorios con decoración
      doc.setFillColor(255, 248, 250);
      doc.roundedRect(40, yPosition - 8, 130, 20, 5, 5, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(236, 72, 153);
      doc.text(`Total de recordatorios: ${reminders.length} 💝`, 105, yPosition + 5, { align: 'center' });
      yPosition += 25;
      
      // Ordenar recordatorios por fecha
      const sortedReminders = [...reminders].sort((a, b) => 
        new Date(a.datetime) - new Date(b.datetime)
      );
      
      sortedReminders.forEach((reminder, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 230) {
          doc.addPage();
          
          // Header de nueva página
          doc.setFillColor(255, 240, 245);
          doc.rect(0, 0, 210, 50, 'F');
          
          doc.setFontSize(18);
          doc.setTextColor(236, 72, 153);
          doc.text('Reportes de Elenita (continuacion) 🌸', 105, 30, { align: 'center' });
          
          yPosition = 60;
        }
        
        // Fondo alternado para cada recordatorio
        const bgColor = index % 2 === 0 ? [255, 252, 254] : [254, 242, 242];
        doc.setFillColor(...bgColor);
        doc.roundedRect(20, yPosition - 5, 170, 35, 3, 3, 'F');
        
        // Emoji según el tipo de recordatorio
        let emoji = '💖';
        if (reminder.title.toLowerCase().includes('agua')) emoji = '💧';
        else if (reminder.title.toLowerCase().includes('comida') || reminder.title.toLowerCase().includes('comer')) emoji = '🍽️';
        else if (reminder.title.toLowerCase().includes('medicina') || reminder.title.toLowerCase().includes('pastilla')) emoji = '💊';
        else if (reminder.title.toLowerCase().includes('ejercicio') || reminder.title.toLowerCase().includes('deporte')) emoji = '🏃‍♀️';
        else if (reminder.title.toLowerCase().includes('trabajo')) emoji = '💼';
        else if (reminder.title.toLowerCase().includes('dormir') || reminder.title.toLowerCase().includes('descansar')) emoji = '😴';
        
        // Número del recordatorio con emoji
        doc.setFontSize(16);
        doc.setTextColor(236, 72, 153);
        const titleText = `${index + 1}. ${reminder.title} ${emoji}`;
        doc.text(titleText, 25, yPosition + 8);
        yPosition += 15;
        
        // Descripción si existe
        if (reminder.description) {
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          const descLines = doc.splitTextToSize(`   💬 ${reminder.description}`, 160);
          doc.text(descLines, 30, yPosition);
          yPosition += descLines.length * 5 + 3;
        }
        
        // Fecha y hora con iconos
        doc.setFontSize(10);
        doc.setTextColor(130, 130, 130);
        doc.text(`   📅 Fecha: ${formatDateForPDF(reminder.datetime)}`, 30, yPosition);
        yPosition += 8;
        
        // Información de recurrencia
        if (reminder.recurring) {
          const recurringInterval = reminder.recurringInterval || reminder.recurring_interval || 1;
          const recurringType = reminder.recurringType || reminder.recurring_type || 'days';
          
          const typeEmojis = {
            'hours': '⏰',
            'days': '📅',
            'weeks': '🗓️',
            'months': '📆'
          };
          
          const typeNames = {
            'hours': 'hora(s)',
            'days': 'dia(s)', 
            'weeks': 'semana(s)',
            'months': 'mes(es)'
          };
          
          const recurringText = `   ${typeEmojis[recurringType]} Se repite cada ${recurringInterval} ${typeNames[recurringType]}`;
          doc.setTextColor(147, 51, 234); // Morado
          doc.text(recurringText, 30, yPosition);
          yPosition += 8;
        }
        
        // Línea separadora decorativa
        doc.setLineWidth(0.5);
        doc.setDrawColor(255, 193, 7);
        doc.line(25, yPosition + 3, 185, yPosition + 3);
        
        // Pequeños corazones al final de cada recordatorio
        doc.setFontSize(8);
        doc.setTextColor(255, 182, 193);
        doc.text('💕', 185, yPosition);
        
        yPosition += 18;
      });
    }
    
    // ===== FOOTER SÚPER CUTE =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Fondo del footer
      doc.setFillColor(255, 248, 250);
      doc.rect(0, 270, 210, 27, 'F');
      
      // Información de página
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Pagina ${i} de ${pageCount}`, 25, 285);
      
      // Mensaje bonito
      doc.setTextColor(236, 72, 153);
      doc.text('Generado con mucho amor para Elenita 💖🐝', 105, 285, { align: 'center' });
      
      // Decoración del footer
      doc.setFontSize(12);
      doc.setTextColor(255, 193, 7);
      doc.text('✨', 15, 285);
      doc.text('✨', 195, 285);
    }
    
    // Descargar PDF con nombre personalizado y fecha
    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`Recordatorios-de-Elenita-${fechaArchivo}.pdf`);
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(reminders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recordatorios-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const importJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedReminders = JSON.parse(e.target.result);
        
        // Validar que sea un array válido
        if (Array.isArray(importedReminders)) {
          // Confirmar importación
          if (window.confirm(`¿Quieres importar ${importedReminders.length} recordatorios? Esto se agregará a tus recordatorios existentes.`)) {
            // Agregar IDs únicos para evitar conflictos
            const newReminders = importedReminders.map(reminder => ({
              ...reminder,
              id: Date.now() + Math.random()
            }));
            
            // Combinar con recordatorios existentes
            const allReminders = [...reminders, ...newReminders];
            setReminders(allReminders);
            localStorage.setItem('reminders', JSON.stringify(allReminders));
          }
        } else {
          alert('El archivo no contiene datos válidos de recordatorios.');
        }
      } catch (error) {
        alert('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Limpiar input
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ ¿Estás segura de que quieres eliminar TODOS los recordatorios? Esta acción no se puede deshacer.')) {
      if (window.confirm('🚨 ¡Última oportunidad! ¿Realmente quieres borrar todo?')) {
        setReminders([]);
        localStorage.removeItem('reminders');
      }
    }
  };

  const styles = {
    container: {
      width: '100%'
    },
    toggleButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(4px)',
      color: '#374151',
      fontWeight: '600',
      padding: '0.75rem 1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto'
    },
    backupCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(4px)',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '1.5rem'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      borderRadius: '1rem',
      padding: '1rem',
      textAlign: 'center',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statNumber: {
      fontSize: '1.875rem',
      fontWeight: 'bold'
    },
    statLabel: {
      fontSize: '0.875rem',
      opacity: 0.9
    },
    sectionsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    section: {
      borderRadius: '1rem',
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center'
    },
    actionButton: {
      width: '100%',
      fontWeight: '600',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    actionButtonDisabled: {
      background: 'linear-gradient(to right, #9ca3af, #d1d5db)',
      cursor: 'not-allowed'
    },
    sectionDescription: {
      color: '#4b5563',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      textAlign: 'center'
    },
    fileInput: {
      display: 'none'
    },
    dangerSection: {
      backgroundColor: '#fef2f2',
      border: '2px solid #fecaca'
    },
    dangerText: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      textAlign: 'center',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button 
          onClick={() => setShowBackup(!showBackup)}
          style={styles.toggleButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <FileText size={20} style={{ marginRight: '0.5rem' }} />
          <span>Respaldo y Opciones</span>
          <div style={{ marginLeft: '0.5rem', fontSize: '1.125rem' }}>💾</div>
        </button>
      </div>

      {showBackup && (
        <div style={styles.backupCard}>
          <div style={styles.header}>
            <Heart style={{ color: '#ec4899', marginRight: '0.5rem', animation: 'pulse 2s infinite' }} />
            <h3 style={styles.title}>Gestión de Recordatorios</h3>
          </div>

          {/* Estadísticas bonitas */}
          <div style={styles.statsGrid}>
            <div style={{
              ...styles.statCard,
              background: 'linear-gradient(to right, #ec4899, #f43f5e)',
              color: 'white'
            }}>
              <div style={styles.statNumber}>{reminders.length}</div>
              <div style={styles.statLabel}>Recordatorios</div>
            </div>
            <div style={{
              ...styles.statCard,
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              color: 'white'
            }}>
              <div style={styles.statNumber}>
                {reminders.filter(r => r.recurring).length}
              </div>
              <div style={styles.statLabel}>Recurrentes</div>
            </div>
            <div style={{
              ...styles.statCard,
              background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
              color: 'white'
            }}>
              <div style={styles.statNumber}>
                {reminders.filter(r => new Date(r.datetime) > new Date()).length}
              </div>
              <div style={styles.statLabel}>Activos</div>
            </div>
          </div>

          {/* Acciones */}
          <div style={styles.sectionsContainer}>
            {/* Generar PDF */}
            <div style={{
              ...styles.section,
              backgroundColor: '#fdf2f8'
            }}>
              <h4 style={styles.sectionTitle}>
                <FileText style={{ marginRight: '0.5rem', color: '#ec4899' }} />
                📄 Generar Reporte PDF Súper Cute
              </h4>
              <button 
                onClick={generatePDF}
                disabled={reminders.length === 0}
                style={{
                  ...styles.actionButton,
                  background: reminders.length === 0 ? 
                    'linear-gradient(to right, #9ca3af, #d1d5db)' :
                    'linear-gradient(to right, #ec4899, #f43f5e)',
                  ...(reminders.length === 0 && styles.actionButtonDisabled)
                }}
                onMouseEnter={(e) => {
                  if (reminders.length > 0) {
                    e.target.style.background = 'linear-gradient(to right, #db2777, #e11d48)';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (reminders.length > 0) {
                    e.target.style.background = 'linear-gradient(to right, #ec4899, #f43f5e)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                <FileText size={20} style={{ marginRight: '0.5rem' }} />
                Descargar PDF Bonito de Elenita ✨
              </button>
              <p style={styles.sectionDescription}>
                Genera un PDF súper bonito y femenino con todos tus recordatorios 💖
              </p>
            </div>

            {/* Exportar datos */}
            <div style={{
              ...styles.section,
              backgroundColor: '#f0fdf4'
            }}>
              <h4 style={styles.sectionTitle}>
                <Download style={{ marginRight: '0.5rem', color: '#10b981' }} />
                💾 Respaldo de Datos
              </h4>
              <button 
                onClick={exportJSON}
                disabled={reminders.length === 0}
                style={{
                  ...styles.actionButton,
                  background: reminders.length === 0 ? 
                    'linear-gradient(to right, #9ca3af, #d1d5db)' :
                    'linear-gradient(to right, #10b981, #14b8a6)',
                  ...(reminders.length === 0 && styles.actionButtonDisabled)
                }}
                onMouseEnter={(e) => {
                  if (reminders.length > 0) {
                    e.target.style.background = 'linear-gradient(to right, #059669, #0d9488)';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (reminders.length > 0) {
                    e.target.style.background = 'linear-gradient(to right, #10b981, #14b8a6)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                <Download size={20} style={{ marginRight: '0.5rem' }} />
                Exportar Datos
              </button>
              <p style={styles.sectionDescription}>
                Guarda una copia de seguridad de todos tus recordatorios
              </p>
            </div>

            {/* Importar datos */}
            <div style={{
              ...styles.section,
              backgroundColor: '#eff6ff'
            }}>
              <h4 style={styles.sectionTitle}>
                <Upload style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
                📥 Importar Datos
              </h4>
              <label style={{
                ...styles.actionButton,
                background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to right, #2563eb, #0891b2)';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to right, #3b82f6, #06b6d4)';
                e.target.style.transform = 'scale(1)';
              }}>
                <Upload size={20} style={{ marginRight: '0.5rem' }} />
                Importar Recordatorios
                <input 
                  type="file" 
                  accept=".json"
                  onChange={importJSON}
                  style={styles.fileInput}
                />
              </label>
              <p style={styles.sectionDescription}>
                Restaura recordatorios desde un archivo de respaldo
              </p>
            </div>

            {/* Zona peligrosa */}
            <div style={{
              ...styles.section,
              ...styles.dangerSection
            }}>
              <h4 style={styles.sectionTitle}>
                <Trash2 style={{ marginRight: '0.5rem', color: '#dc2626' }} />
                🗑️ Zona Peligrosa
              </h4>
              <button 
                onClick={clearAllData}
                style={{
                  ...styles.actionButton,
                  background: 'linear-gradient(to right, #dc2626, #ec4899)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #b91c1c, #db2777)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #dc2626, #ec4899)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <Trash2 size={20} style={{ marginRight: '0.5rem' }} />
                Borrar Todo
              </button>
              <p style={styles.dangerText}>
                ⚠️ Elimina TODOS los recordatorios permanentemente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupSection;