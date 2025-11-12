import React from 'react';
import './ProfileHeader.css';

export default function ProfileHeader({ name, course, risk_level, risk_score }) {
  const riskClass = `risk-${risk_level?.toLowerCase()}`;

  return (
    <div className="profile-header">
      <div>
        <h2>{name}</h2>
        <p>{course}</p>
      </div>
      <div className="profile-score">
        <span className={`risk-pill ${riskClass}`}>{risk_level}</span>
        <div className="score-circle">
          <strong>{risk_score}</strong>
          <span>/ 100</span>
        </div>
        <span className="score-label">Score de Riesgo</span>
      </div>
    </div>
  );
}