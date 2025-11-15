import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';
import { Eye, Target, TrendingUp } from 'lucide-react';

const KeyFindings = () => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-text-primary mb-4">
        Hallazgos Clave
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-chart-blue">
          <CardHeader className="flex-row items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-chart-blue/10 text-chart-blue">
              <Eye />
            </div>
            <CardTitle>Factores Socioeconómicos</CardTitle>
          </CardHeader>
          <CardContent>
            La edad del representante y la cobertura de salud son las barreras
            más predictivas, sugiriendo un fuerte componente socioeconómico en
            el riesgo estudiantil.
          </CardContent>
        </Card>
        <Card className="border-l-4 border-chart-orange">
          <CardHeader className="flex-row items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-chart-orange/10 text-chart-orange">
              <Target />
            </div>
            <CardTitle>Brecha Digital</CardTitle>
          </CardHeader>
          <CardContent>
            La posesión de una laptop tiene un impacto medible en el
            rendimiento, reforzando la necesidad de programas de inclusión
            digital.
          </CardContent>
        </Card>
        <Card className="border-l-4 border-chart-purple">
          <CardHeader className="flex-row items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-chart-purple/10 text-chart-purple">
              <TrendingUp />
            </div>
            <CardTitle>Capital Cultural</CardTitle>
          </CardHeader>
          <CardContent>
            El nivel educativo del representante es un factor clave, lo que
            indica que el capital cultural del hogar influye en el éxito
            académico.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyFindings;
