import React from 'react';
import Navigation from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const MainLayout = ({
  children,
  currentPage,
  setCurrentPage,
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto p-8">{children}</main>
    </div>
  );
};

export default MainLayout;
