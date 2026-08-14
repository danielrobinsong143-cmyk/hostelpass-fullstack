import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";

function RoleProtectedRoute({ children, allowedRoles }) {
  const { accessToken, principal } = useContext(AuthContext);

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  if (!principal || !allowedRoles.includes(principal.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleProtectedRoute;
