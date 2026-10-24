const BASE_URL = "http://127.0.0.1:8000";

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};


export const getToken = () => {
  return localStorage.getItem("token");
};

// Generic helper for authenticated API requests (used by TodoApp)
export const apiRequest = async (path, method = "GET", body) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `API error ${res.status}: ${res.statusText || ""} ${errorBody}`.trim()
    );
  }

  // Some endpoints might return no JSON
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};



