import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/meals', label: 'Repas', icon: 'restaurant' },
  { to: '/sport', label: 'Sport', icon: 'fitness_center' },
  { to: '/stats', label: 'Stats', icon: 'monitoring' },
  { to: '/settings', label: 'Réglages', icon: 'settings' },
] as const;

export default function BottomNav() {
  return (
    <nav className="nav" style={{ display: 'flex' }}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
