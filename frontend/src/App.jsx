import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-primary border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-muted">
          <p>&copy; 2024 Web TV Platform. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
