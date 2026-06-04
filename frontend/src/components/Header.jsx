import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className="bg-primary border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📺</span>
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">Web TV</h1>
          </Link>

          <SearchBar />

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link to="/admin/dashboard" className="btn btn-secondary text-sm">
                  Tableau de bord
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary text-sm">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn btn-primary text-sm">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
