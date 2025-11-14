import React from 'react';
import { useParams } from 'react-router-dom';
import { students } from '../data/mockData';
import StudentProfileHero from '../components/StudentProfileHero';
import StudentOverviewCard from '../components/StudentOverviewCard';
import RiskScoreBreakdown from '../components/RiskScoreBreakdown';
import KeyBarriers from '../components/KeyBarriers';
import SubjectPerformance from '../components/SubjectPerformance';
import RecommendedActions from '../components/RecommendedActions';
import AlertHistory from '../components/AlertHistory';
import Notes from '../components/Notes';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return <div>Estudiante no encontrado</div>;
  }

  return (
    <div>
      <StudentProfileHero />
      <StudentOverviewCard student={student} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <RiskScoreBreakdown student={student} />
          <KeyBarriers student={student} />
          <SubjectPerformance student={student} />
        </div>
        <div>
          <RecommendedActions student={student} />
          <AlertHistory />
          <Notes />
        </div>
      </div>
    </div>
  );
}

