import { createContext, useContext, useState } from 'react';

const SearchContext = createContext({
  cache: { query: null, results: [], location: null },
  updateCache: () => {},
  symptomCache: { symptoms: '', explanation: '', tests: [], selectedTest: null, labs: [] },
  updateSymptomCache: () => {},
});

export function SearchProvider({ children }) {
  const [cache, setCache] = useState({
    query: null,
    results: [],
    location: null,
  });

  const [symptomCache, setSymptomCache] = useState({
    symptoms: '',
    explanation: '',
    tests: [],
    selectedTest: null,
    labs: [],
  });

  const updateCache = (query, results, location) => {
    setCache({ query, results, location });
  };

  const updateSymptomCache = (data) => {
    setSymptomCache(prev => ({ ...prev, ...data }));
  };

  return (
    <SearchContext.Provider value={{ cache, updateCache, symptomCache, updateSymptomCache }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchCache() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchCache must be used within a SearchProvider');
  }
  return context;
}
