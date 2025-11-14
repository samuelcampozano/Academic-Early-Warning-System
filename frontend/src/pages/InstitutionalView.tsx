import React from 'react';
import BarrierChart from '../components/charts/BarrierChart';
import LaptopImpactChart from '../components/charts/LaptopImpactChart';
import EducationLevelChart from '../components/charts/EducationLevelChart';
import KeyFindings from '../components/KeyFindings';

export default function InstitutionalView() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-32 font-bold text-text-primary">Visión Institucional</h1>
        <p className="text-text-secondary mt-1">Análisis de barreras y factores de riesgo a nivel institucional.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <BarrierChart />
        <LaptopImpactChart />
        <EducationLevelChart />
      </div>

      <KeyFindings />
    </div>
  );
}
