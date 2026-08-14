import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";

function ProtectedRoute({ children }) {
  const { accessToken } = useContext(AuthContext);

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
