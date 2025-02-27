// src/components/shared/Header.tsx
import React from 'react';
import Logo from './Logo';

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-2">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Logo />
        </div>
      </div>
    </header>
  );
};

export default Header;
