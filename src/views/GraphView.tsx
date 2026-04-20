import React, { useRef, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import styles from './GraphView.module.css';
import { Search, Filter, Maximize2 } from 'lucide-react';

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Ajustement auto du canvas à la taille de l'écran
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  // Fausse base de données pour le Graphe (Tu pourras relier ça à SQLite plus tard)
  const graphData = {
    nodes: [
      { id: 'Elden Ring', group: 1, val: 30, color: '#c9a84c' }, // Nœud Central
      { id: 'Marika', group: 2, val: 15, color: '#4aa8a0' },
      { id: 'The Shattering', group: 3, val: 15, color: '#a0a0a0' },
      { id: 'Lands Between', group: 4, val: 15, color: '#a0a0a0' },
      { id: 'Radagon', group: 2, val: 10, color: '#4aa8a0' }
    ],
    links: [
      { source: 'Elden Ring', target: 'Marika' },
      { source: 'Elden Ring', target: 'The Shattering' },
      { source: 'Elden Ring', target: 'Lands Between' },
      { source: 'Marika', target: 'Radagon' },
      { source: 'The Shattering', target: 'Marika' }
    ]
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cartographie du Lore</h1>
        <div className={styles.controls}>
          <button className={styles.controlBtn}><Search size={18}/></button>
          <button className={styles.controlBtn}><Filter size={18}/></button>
          <button className={styles.controlBtn}><Maximize2 size={18}/></button>
        </div>
      </header>

      <div className={styles.graphArea} ref={containerRef}>
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="id"
          nodeColor="color"
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkColor={() => 'rgba(255,255,255,0.2)'}
          backgroundColor="var(--bg-sidebar)"
        />
        
        <div className={styles.legend}>
          <h3>Entités</h3>
          <div className={styles.legendItem}><span className={styles.dotTeal}></span> Personnages</div>
          <div className={styles.legendItem}><span className={styles.dotGold}></span> Événements</div>
        </div>
      </div>
    </div>
  );
}