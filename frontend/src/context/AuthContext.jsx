import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("wavecape_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(data) {
    localStorage.setItem("wavecape_token", data.token);
    localStorage.setItem("wavecape_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("wavecape_token");
    localStorage.removeItem("wavecape_user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
