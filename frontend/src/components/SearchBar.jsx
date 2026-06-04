import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(`/api/search?q=${value}`);
        setResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error('Erreur de recherche:', error);
      }
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = (result) => {
    if (result.type === 'vod') {
      navigate(`/video/${result.id}`);
    }
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <input
        type="text"
        placeholder="Rechercher..."
        value={query}
        onChange={handleSearch}
        className="w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-text placeholder-muted focus:outline-none focus:border-accent"
      />
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-primary border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="px-4 py-2 hover:bg-secondary cursor-pointer border-b border-gray-700 last:border-b-0"
            >
              <p className="font-medium text-text">{result.title}</p>
              <p className="text-sm text-muted truncate">{result.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
