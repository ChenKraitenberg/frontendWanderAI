import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '✨', label: 'Generate', path: '/generate-trip' },
    { icon: '➕', label: 'Add', path: '/add-post' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  return (
    <footer className="py-3 bg-white border-top mt-auto">
      <div className="container">
        <div className="row justify-content-around align-items-center g-3">
          {navigationItems.map((item) => (
            <div key={item.path} className="col-3 text-center">
              <button
                onClick={() => navigate(item.path)}
                className={`btn btn-link p-0 d-flex flex-column align-items-center gap-1 text-decoration-none ${location.pathname === item.path ? 'text-primary' : 'text-dark'}`}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <small className={location.pathname === item.path ? 'text-primary' : 'text-muted'}>{item.label}</small>
              </button>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
