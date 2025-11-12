import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentRow({ student }) {
  const navigate = useNavigate();

  // Función para manejar el clic en la fila
  const handleRowClick = () => {
    navigate(`/student/${student.id}`);
  };

  // Clase de CSS basada en el nivel de riesgo
  const riskClass = `risk-${student.risk_level.toLowerCase()}`;

  return (
    <tr className={`student-row ${riskClass}`} onClick={handleRowClick} title="Clic para ver detalles">
      <td>{student.name}</td>
      <td>{student.course}</td>
      <td>
        <span className={`risk-pill ${riskClass}`}>{student.risk_level}</span>
      </td>
      <td>{student.risk_score}</td>
      <td>{student.alerts}</td>
    </tr>
  );
}