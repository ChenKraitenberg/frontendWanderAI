// Modified NavigationBar.tsx
import { FC } from 'react';
import { NavLink } from 'react-router-dom';

const NavigationBar: FC = () => {
  // Special handler for profile navigation that ensures proper scrolling
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    
    // First force scroll to top
    window.scrollTo(0, 0);
    
    // Then use a small delay before navigation to ensure scroll is complete
    setTimeout(() => {
      window.location.href = '/profile';
    }, 10);
  };

  return (
    <nav className="navbar fixed-bottom navbar-light bg-white shadow-lg" style={{ 
      zIndex: 1030,
      borderTop: '1px solid rgba(0,0,0,0.1)',
      padding: '0.5rem 0'
    }}>
      <div className="container-fluid d-flex justify-content-around">
        <NavLink to="/" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-muted'}`}>
          <span style={{ fontSize: '1.5rem' }}>🏠</span>
          <small>Home</small>
        </NavLink>
        
        <NavLink to="/generate-trip" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-muted'}`}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <small>Generate</small>
        </NavLink>
        
        <NavLink to="/add-post" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-muted'}`}>
          <span style={{ fontSize: '1.5rem' }}>➕</span>
          <small>Add</small>
        </NavLink>
        
        {/* Special handling for Profile link */}
        <a 
          href="/profile"
          onClick={handleProfileClick}
          className={`nav-link d-flex flex-column align-items-center ${window.location.pathname === '/profile' ? 'text-primary' : 'text-muted'}`}
        >
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <small>Profile</small>
        </a>
      </div>
    </nav>
  );
};

export default NavigationBar;