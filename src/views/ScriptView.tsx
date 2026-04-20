import React, { useState } from 'react';
import styles from './ScriptView.module.css';
import { AlignLeft, GripVertical, FileText, Video } from 'lucide-react';

export default function ScriptView() {
  const [scriptContent, setScriptContent] = useState(
    "# L'Origine de la Guerre\n\nTout a commencé lors de l'Ère de l'Abondance..."
  );

  // Fausse base de données de sources pour l'exemple
  const sources = [
    { id: '1', title: 'Snippet Wiki : La Fracture', type: 'wiki', icon: <FileText size={16}/> },
    { id: '2', title: 'Vidéo : Analyse VaatiVidya', type: 'video', icon: <Video size={16}/> },
  ];

  // Gestion du moment où l'utilisateur commence à glisser une carte
  const handleDragStart = (e: React.DragEvent, sourceTitle: string) => {
    // On sauvegarde le texte qu'on veut insérer dans l'éditeur
    e.dataTransfer.setData('text/plain', `[[${sourceTitle}]]`);
  };

  return (
    <div className={styles.container}>
      
      {/* Colonne Centrale : L'Éditeur */}
      <main className={styles.editorSection}>
        <header className={styles.editorHeader}>
          <AlignLeft size={24} className={styles.headerIcon} />
          <input type="text" className={styles.titleInput} defaultValue="Script : Nouvelle Vidéo Lore" />
        </header>
        
        <textarea 
          className={styles.textarea}
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          placeholder="Commencez à écrire votre script ici..."
        />
      </main>

      {/* Colonne Droite : Le Panneau de Contexte (Sources) */}
      <aside className={styles.contextPanel}>
        <div className={styles.panelHeader}>
          <h3>Matériel Source</h3>
          <p>Glissez les éléments dans l'éditeur</p>
        </div>

        <div className={styles.sourceList}>
          {sources.map(source => (
            <div 
              key={source.id} 
              className={styles.sourceCard}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, source.title)}
            >
              <div className={styles.dragHandle}><GripVertical size={16}/></div>
              <div className={styles.sourceIcon}>{source.icon}</div>
              <span className={styles.sourceTitle}>{source.title}</span>
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
}