const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data && data.error ? data.error : `Request gagal (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getWilayah() {
  return request('/wilayah');
}

export function getTanam() {
  return request('/tanam');
}

export function getStats() {
  return request('/stats');
}

// ── Proposal Submissions ───────────────────────────────────
export async function submitProposal(formData) {
  // When body is FormData, do not set Content-Type header
  const response = await fetch(`${API_BASE}/proposals`, {
    method: 'POST',
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data && data.error ? data.error : `Gagal mengirim proposal (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

// ── Admin Authentication ───────────────────────────────────
export function adminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
}

export function getAdminProfile(token) {
  return request('/admin/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ── Admin Proposal Management ──────────────────────────────
export function getAdminProposals(token, params = {}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.append('q', params.q);
  if (params.status && params.status !== 'Semua') searchParams.append('status', params.status);

  const queryString = searchParams.toString();
  const path = `/proposals${queryString ? `?${queryString}` : ''}`;

  return request(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateProposalStatus(token, id, status) {
  return request(`/proposals/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export function deleteProposal(token, id) {
  return request(`/proposals/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getProposalDownloadUrl(id) {
  return `${API_BASE}/proposals/${id}/download`;
}
