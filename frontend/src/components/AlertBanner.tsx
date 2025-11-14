import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertBanner = () => {
  return (
    <div className="mt-6 rounded-lg border-l-4 border-risk-critical-border bg-risk-critical-bg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-risk-critical-text" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-risk-critical-text">Alertas Recientes</h3>
          <div className="mt-2 text-sm text-risk-critical-text">
            <ul className="list-disc space-y-1 pl-5">
              <li>2 estudiantes han superado 5 faltas este mes (↑ vs mes anterior)</li>
              <li>3 estudiantes críticos sin laptop necesitan intervención urgente</li>
              <li>Promedio general de riesgo alto: 53/100 (↑5.2% vs último trimestre)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
