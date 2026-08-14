import api from "./api";

export const getMyOutpassRequests = async (
  page = 0,
  size = 20,
  search = "",
  status = "",
) => {
  return api.get("/outpass-requests/my", {
    params: {
      page,
      size,
      search,
      status: status || undefined,
    },
  });
};

export const getMyOutpassRequestById = async (id) => {
  return api.get(`/outpass-requests/my/${id}`);
};

export const createOutpassRequest = async (outpassData) => {
  return api.post("/outpass-requests", outpassData);
};

export const cancelOutpassRequest = async (id) => {
  return api.patch(`/outpass-requests/${id}/cancel`);
};

export const getOutpassRequests = async (
  page = 0,
  size = 20,
  search = "",
  status,
) => {
  return api.get("/outpass-requests", {
    params: {
      page,
      size,
      search,
      status,
    },
  });
};

// STAFF ACTIONS

export const approveOutpassRequest = async (id, remark = "") => {
  return api.patch(`/outpass-requests/${id}/approve`, {
    remark,
  });
};

export const denyOutpassRequest = async (id, remark) => {
  return api.patch(`/outpass-requests/${id}/deny`, {
    remark,
  });
};

export const getOutpassStats = async () => {
  return api.get("/outpass-requests/stats");
};

export const getMyOutpassStats = async () => {
  return api.get("/outpass-requests/my/stats");
};
