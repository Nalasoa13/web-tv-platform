import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="bg-secondary border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto py-3">
          <Link to="/" className="text-text hover:text-accent whitespace-nowrap transition">
            Accueil
          </Link>
          <Link to="/schedule" className="text-text hover:text-accent whitespace-nowrap transition">
            Grille TV
          </Link>
          <Link to="/vod" className="text-text hover:text-accent whitespace-nowrap transition">
            VOD
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
