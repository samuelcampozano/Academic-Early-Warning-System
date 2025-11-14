import React from 'react';
import Navigation from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto p-8">{children}</main>
    </div>
  );
};

export default MainLayout;
