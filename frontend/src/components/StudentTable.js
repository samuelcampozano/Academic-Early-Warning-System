import React from 'react';
import StudentRow from './StudentRow';
import './StudentTable.css'; // Crearemos este archivo

export default function StudentTable({ students }) {
  if (students.length === 0) {
    return <p>No se encontraron estudiantes.</p>;
  }

  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Curso</th>
          <th>Nivel de Riesgo</th>
          <th>Score (de 100)</th>
          <th>Alertas Principales</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <StudentRow key={student.id} student={student} />
        ))}
      </tbody>
    </table>
  );
}