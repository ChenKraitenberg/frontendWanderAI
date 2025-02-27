import { FC } from 'react';
import { NavLink } from 'react-router-dom';

const NavigationBar: FC = () => {
  return (
    <nav className="navbar fixed-bottom navbar-light bg-light">
      <div className="container-fluid d-flex justify-content-around">
        <NavLink to="/" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-secondary'}`}>
          <i className="bi bi-house" style={{ fontSize: '1.5rem' }}></i>
          <small>Home</small>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-secondary'}`}>
          <i className="bi bi-search" style={{ fontSize: '1.5rem' }}></i>
          <small>Search</small>
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-secondary'}`}>
          <i className="bi bi-calendar" style={{ fontSize: '1.5rem' }}></i>
          <small>Schedule</small>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'text-primary' : 'text-secondary'}`}>
          <i className="bi bi-person" style={{ fontSize: '1.5rem' }}></i>
          <small>Profile</small>
        </NavLink>
      </div>
    </nav>
  );
};

export default NavigationBar;
