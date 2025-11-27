import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useStudentProfile, {
  RiskFactor,
  KeyGrade,
} from '../hooks/useStudentProfile';
import {
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
} from '../components/ui/Feedback';
import KeyBarriers from '../components/KeyBarriers';
import SubjectPerformance from '../components/SubjectPerformance';
import RecommendedActions from '../components/RecommendedActions';
import AlertHistory from '../components/AlertHistory';
import Notes from '../components/Notes';
import CircularProgress from '../components/ui/CircularProgress';

const StudentProfile = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = useParams<{ id: string }>();
  const { profile, loading, error } = useStudentProfile();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!profile) {
    return (
      <EmptyState message="No se pudo cargar el perfil del estudiante. Asegúrate de que el ID es correcto." />
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Dashboard
        </Link>
        <span className="text-slate-400">›</span>
        <span className="text-slate-600 font-medium">
          Perfil del Estudiante
        </span>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 md:p-8 mb-6 md:mb-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              {profile.name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
              {profile.course}
            </p>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase ${
                profile.risk_level === 'Critical'
                  ? 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600'
                  : profile.risk_level === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600'
                    : 'bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600'
              }`}
            >
              {profile.risk_level === 'Critical'
                ? '⚠️'
                : profile.risk_level === 'Medium'
                  ? '🔶'
                  : '✅'}
              {profile.risk_level}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <CircularProgress
              value={profile.risk_score}
              max={100}
              size={140}
              strokeWidth={12}
              color={
                profile.risk_level === 'Critical'
                  ? 'text-red-600'
                  : profile.risk_level === 'Medium'
                    ? 'text-yellow-500'
                    : 'text-green-500'
              }
              label={profile.risk_score.toString()}
              subLabel="/ 100"
            />
            <div className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              Score de Riesgo
            </div>
          </div>
        </div>
      </div>

      {/* Student Overview Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8 border-2 border-blue-200 dark:border-blue-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> Perfil del Estudiante
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Risk Factors */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              Factores de Riesgo
            </h3>
            {profile.risk_factors.map((factor: RiskFactor, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {factor.name}:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {factor.value} ({factor.weight})
                </span>
              </div>
            ))}
          </div>

          {/* Academic Situation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-4">
              Situación Académica
            </h3>
            {profile.key_grades.map((grade: KeyGrade, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {grade.subject}:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {grade.grade.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Risk Score Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Desglose del Score de Riesgo
            </h2>
            <div className="space-y-6">
              {profile.risk_factors.map((factor: RiskFactor, index: number) => (
                <div
                  key={index} // Changed from factor.name as it's not unique in backend
                  className={`rounded-xl p-5 border ${
                    parseFloat(factor.weight) > 0.2 // Assuming weight is '20%'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                  }`}
                >
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {factor.name}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Valor Actual:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {factor.value}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Ponderación:
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {factor.weight}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar for weight contribution */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${parseFloat(factor.weight) > 0.2 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}
                      style={{ width: factor.weight }}
                    ></div>
                  </div>
                  {/* No explanation in current API response, so removing that part */}
                </div>
              ))}
            </div>
          </div>
          <KeyBarriers student={profile} />
          <SubjectPerformance student={profile} />
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <RecommendedActions student={profile} />
          <AlertHistory />
          <Notes />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
