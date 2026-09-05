import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

import StudentDashboard from "../pages/StudentDashboard";
import ApplyOutpass from "../pages/ApplyOutpass";
import MyRequests from "../pages/MyRequests";
import Profile from "../pages/Profile";

import StaffDashboard from "../pages/StaffDashboard";
import StaffRequests from "../pages/StaffRequests";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";

import StudentLayout from "../layouts/StudentLayout";
import StaffLayout from "../layouts/StaffLayout";

import StaffProfile from "../pages/StaffProfile";
import AdminStudents from "../pages/AdminStudents";
import AdminStaff from "../pages/AdminStaff";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ==================== */}

        <Route path="/" element={<Login />} />

        {/* ==================== STUDENT ==================== */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/apply-outpass"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentLayout>
                  <ApplyOutpass />
                </StudentLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/requests"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentLayout>
                  <MyRequests />
                </StudentLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentLayout>
                  <Profile />
                </StudentLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* ==================== STAFF ==================== */}

        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["WARDEN", "PRINCIPAL", "SUPER_ADMIN"]}
              >
                <StaffLayout>
                  <StaffDashboard />
                </StaffLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/requests"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["WARDEN", "PRINCIPAL", "SUPER_ADMIN"]}
              >
                <StaffLayout>
                  <StaffRequests />
                </StaffLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["WARDEN", "PRINCIPAL", "SUPER_ADMIN"]}
              >
                <StaffLayout>
                  <StaffProfile />
                </StaffLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* ==================== ADMIN ==================== */}

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <StaffLayout>
                  <AdminStudents />
                </StaffLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <StaffLayout>
                  <AdminStaff />
                </StaffLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
