import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';

const notes = [
  {
    author: 'Prof. María García',
    date: '10 Nov 2024, 14:30',
    content:
      'Se realizó reunión con la madre. Comprometida a mejorar seguimiento de tareas. Acordamos revisión semanal.',
  },
  {
    author: 'Inspector Gral.',
    date: '05 Nov 2024, 09:15',
    content:
      'Estudiante faltó 3 días consecutivos sin justificación. Contactar urgentemente.',
  },
];

const Notes = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Notas</CardTitle>
        <p className="text-sm text-text-secondary">
          Registro de observaciones y seguimiento
        </p>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Añadir una nota sobre el estudiante..."
          rows={4}
        />
        <Button variant="primary" className="w-full mt-2">
          Guardar Nota
        </Button>

        <div className="mt-6">
          <h4 className="font-bold mb-2">Notas Recientes</h4>
          {notes.map((note, index) => (
            <div key={index} className="bg-hover-bg p-3 rounded-lg mb-2">
              <div className="flex justify-between text-xs text-text-secondary">
                <span className="font-bold">{note.author}</span>
                <span>{note.date}</span>
              </div>
              <p className="text-sm mt-1">{note.content}</p>
              <div className="flex space-x-2 text-xs mt-2">
                <button className="text-blue-500 hover:underline">
                  Editar
                </button>
                <button className="text-red-500 hover:underline">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="tertiary" className="w-full mt-4">
          Ver Todas las Notas (12)
        </Button>
      </CardContent>
    </Card>
  );
};

export default Notes;
