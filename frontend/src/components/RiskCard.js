import React from 'react';
import './RiskCard.css';

export default function RiskCard({ title, data, columns }) {
  return (
    <div className="risk-card">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            {columns.map((col) => <th key={col.key}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((col) => <td key={col.key}>{item[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}