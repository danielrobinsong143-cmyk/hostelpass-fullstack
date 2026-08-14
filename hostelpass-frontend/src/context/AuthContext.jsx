import { useEffect, useState } from "react";
import { logout as logoutApi } from "../services/authService";
import { AuthContext } from "./authContextDefinition";

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken"),
  );

  const [principal, setPrincipal] = useState(
    JSON.parse(localStorage.getItem("principal")),
  );

  const login = (token, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("principal", JSON.stringify(user));

    setAccessToken(token);
    setPrincipal(user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("principal");

      setAccessToken(null);
      setPrincipal(null);
    }
  };

  useEffect(() => {
    const clearAuthentication = () => {
      setAccessToken(null);
      setPrincipal(null);
    };

    window.addEventListener("auth:logout", clearAuthentication);
    return () => window.removeEventListener("auth:logout", clearAuthentication);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        principal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
