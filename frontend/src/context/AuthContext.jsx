import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("wavecape_user");
    try { return saved ? JSON.parse(saved) : null; }
    catch { localStorage.removeItem("wavecape_user"); localStorage.removeItem("wavecape_token"); return null; }
  });

  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, []);

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
