import React, { createContext, useState, useContext } from 'react';

interface AppContextType {
  chosen: string;
  setChosen: (value: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chosen, setChosen] = useState(" ");

  return (
    <AppContext.Provider value={{ chosen, setChosen }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
