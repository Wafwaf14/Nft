import React, { useState, FC, ReactNode, createContext } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [hasNft, setHasNft] = useState(false);
  const [aptosWallet, setAptosWallet] = useState<any>(null);

  return (
    <AuthContext.Provider
      value={{
        hasNft,
        setHasNft,
        aptosWallet,
        setAptosWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
