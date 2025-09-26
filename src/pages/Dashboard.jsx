import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/ResultsTable";

export default function Dashboard() {
  const [results, setResults] = useState(null);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-6">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        NAMASTE Mapper
      </h1>

      {/* Reference Links */}
      <div className="mb-6 text-sm text-gray-600 flex space-x-4">
        <a
          href="https://namaste.ayush.gov.in"
          target="_blank"
          className="underline hover:text-blue-700"
        >
          NAMASTE Codes
        </a>
        <a
          href="https://icd.who.int/"
          target="_blank"
          className="underline hover:text-blue-700"
        >
          ICD-11 Codes
        </a>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-xl mb-6">
        <SearchBar setResults={setResults} />
      </div>

      {/* Search Results */}
      <div className="w-full max-w-3xl">
        {results && <SearchResults data={results} />}
      </div>
    </div>
  );
}
