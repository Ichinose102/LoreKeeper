import React from 'react';
import styles from './TimelineView.module.css';

export default function TimelineView() {
  const events = [
    { date: "Ère Ancienne", title: "Création de l'Arbre" },
    { date: "An 0", title: "The Shattering" },
    { date: "An 120", title: "Guerre de Liurnia" },
    { date: "An 500", title: "L'Exil" }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chronologie Narrative</h1>
      </header>

      <div className={styles.timelineWrapper}>
        <div className={styles.mainLine}></div>
        <div className={styles.eventsContainer}>
          {events.map((ev, i) => (
            <div key={i} className={styles.eventPoint}>
              <div className={styles.dateLabel}>{ev.date}</div>
              <div className={styles.circle}></div>
              <div className={styles.eventCard}>
                <h4>{ev.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}