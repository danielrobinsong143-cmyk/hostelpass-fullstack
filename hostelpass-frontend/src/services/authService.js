import api from "./api";

export const studentLogin = async (loginData) => {
  return api.post("/auth/student/login", loginData);
};

export const staffLogin = async (loginData) => {
  return api.post("/auth/staff/login", loginData);
};

export const logout = async () => {
  return api.post("/auth/logout", {});
};

export const refreshToken = async () => {
  return api.post("/auth/refresh", {});
};
