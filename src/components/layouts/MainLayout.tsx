// src/components/layouts/MainLayout.tsx
import React from 'react';
import Header from '../shared/Header';
import Footer from '../shared/Footer';


interface Props {
  children: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header />
      <main className="flex-grow-1">
        <div className="container py-4 pb-5">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
