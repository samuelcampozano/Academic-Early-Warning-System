import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AlertTriangle, TrendingDown, Laptop, Users } from 'lucide-react';
import { Button } from './ui/Button';

const historyItems = [
  {
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    date: '12 Nov 2024',
    title: '5 faltas injustificadas alcanzadas',
    description: 'Umbral crítico superado',
  },
  {
    icon: <TrendingDown className="w-5 h-5 text-yellow-500" />,
    date: '08 Nov 2024',
    title: 'Nota de Matemáticas en riesgo (< 7.0)',
    description: 'Diferencia de -1.3 puntos',
  },
  {
    icon: <Laptop className="w-5 h-5 text-yellow-500" />,
    date: '01 Nov 2024',
    title: 'Sin laptop detectado',
    description: 'Impacto estimado: -8.5 puntos',
  },
  {
    icon: <Users className="w-5 h-5 text-yellow-500" />,
    date: '28 Oct 2024',
    title: 'Apoyo familiar evaluado como bajo',
    description: 'Reunión con familia recomendada',
  },
];

const AlertHistory = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Historial de Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 h-full border-l-2 border-subtle-divider"></div>
          {historyItems.map((item, index) => (
            <div key={index} className="flex items-start mb-4 pl-8 relative">
              <div className="absolute left-0 top-0 h-full flex items-center">
                <div className="h-6 w-6 bg-background rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary">{item.date}</p>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="tertiary" className="w-full mt-4">
          Ver Historial Completo
        </Button>
      </CardContent>
    </Card>
  );
};

export default AlertHistory;
