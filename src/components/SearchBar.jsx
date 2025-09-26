import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ query, onChange, hasResults }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Quick search terms
  const quickSearchTerms = [
    'Prameha',
    'Kasa', 
    'Jvara',
    'Amlapitta',
    'Pandu',
    'Shwasa'
  ];

  // Debounced API call for autocomplete
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=6`);
      const data = await response.json();
      
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(data.suggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    setActiveSuggestion(-1);
  }, [suggestions]);

  const handleSuggestionClick = (suggestion) => {
    // Use the term from the suggestion object
    const selectedTerm = typeof suggestion === 'string' ? suggestion : suggestion.term;
    onChange({ target: { value: selectedTerm } });
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

  const handleQuickSearch = (term) => {
    onChange({ target: { value: term } });
    setShowSuggestions(false);
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
      
      {/* Quick Search Pills */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {quickSearchTerms.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {term}
          </button>
        ))}
      </div>
      
      {/* Autocomplete Suggestions - Only show when no search results are displayed */}
      {(showSuggestions && suggestions.length > 0 && !hasResults) || loading ? (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-professional-lg z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-gray-500 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Searching...</span>
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const displayTerm = typeof suggestion === 'string' ? suggestion : suggestion.term;
              const englishName = suggestion.englishName;
              const code = suggestion.code;
              
              return (
                <button
                  key={suggestion.id || displayTerm}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === activeSuggestion ? 'bg-blue-50 text-blue-900' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{displayTerm}</div>
                      {englishName && englishName !== displayTerm && (
                        <div className="text-sm text-gray-600 truncate">{englishName}</div>
                      )}
                      {code && (
                        <div className="text-xs text-gray-500">{code}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
