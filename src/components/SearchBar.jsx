import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

// Sample autocomplete suggestions
const autocompleteTerms = [
  "Prameha", "Diabetes", "Type 2 diabetes", "Shita Jvara", "Common cold", "Cold",
  "Kasa", "Cough", "Acute cough", "Jvara", "Fever", "Amlapitta", "Acid", "GERD",
  "Sandhivata", "Joint", "Osteoarthritis", "Arthritis", "Yakrit", "Liver", 
  "Hridroga", "Heart", "Heart failure", "Shwasa", "Asthma", "Respiratory",
  "Pandu", "Anemia", "Iron deficiency", "Unmada", "Mental", "Schizophrenia",
  "Kushtha", "Skin", "Dermatitis", "Arsha", "Hemorrhoids", "Mutrakrichha",
  "Urinary", "UTI", "Kamala", "Jaundice", "A01", "B02", "C03", "D04", "E05"
];

export default function SearchBar({ query, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = autocompleteTerms.filter(term =>
        term.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestion(-1);
  }, [query]);

  const handleSuggestionClick = (suggestion) => {
    onChange({ target: { value: suggestion } });
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const clearSearch = () => {
    onChange({ target: { value: '' } });
    setShowSuggestions(false);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search medical codes (NAMASTE, TM2, ICD-11)..."
          className="input-professional w-full pl-10 pr-10 py-3 text-base rounded-lg focus-ring placeholder-gray-500"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-professional-lg z-50 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === activeSuggestion ? 'bg-blue-50 text-blue-900' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
