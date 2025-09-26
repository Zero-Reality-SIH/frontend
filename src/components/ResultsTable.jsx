import { FiCheck, FiSearch } from 'react-icons/fi';

export default function ResultsTable({ results, selected, toggleSelect, loggedIn }) {
  return (
    <div className="professional-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-professional w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[80px]">Select</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">NAMASTE Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[150px]">NAMASTE Term</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">TM2 Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[150px]">TM2 Term</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[140px]">ICD-11 Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[150px]">ICD-11 Term</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[80px]">Version</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Consent</th>
            </tr>
          </thead>
          <tbody>
            {results.map((code, idx) => {
              const isSelected = !!selected.find(c => c.id === code.id);
              return (
                <tr 
                  key={idx} 
                  className={`transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    {loggedIn && (
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(code)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {code.namaste}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{code.namasteTerm}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      {code.tm2}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{code.tm2Term}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {code.biomed}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{code.biomedTerm}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {code.version}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      code.consent === 'consent-given' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {code.consent === 'consent-given' ? '✓ Granted' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {results.length === 0 && (
        <div className="p-16 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <FiSearch className="w-full h-full" />
          </div>
          <p className="text-lg font-medium">No medical codes found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms or browse available categories</p>
        </div>
      )}
    </div>
  );
}
