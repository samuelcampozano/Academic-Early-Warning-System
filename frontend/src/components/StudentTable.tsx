import React from 'react';
import StudentRow from './StudentRow';
import { Student } from '../types'; // Assuming you have a types file

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  if (students.length === 0) {
    return <p>No se encontraron estudiantes.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Curso
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nivel de Riesgo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alertas Principales
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <StudentRow key={student.id} student={student} isEven={index % 2 === 0} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;