export const setToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
};

/**
 * Wipes ALL auth-related data from localStorage.
 * Call this on logout and before a new login to prevent
 * stale session data from bleeding between accounts.
 */
export const clearAllAuthData = () => {
  localStorage.removeItem("access_token");
  // Remove any other auth-related keys that may be stored
  sessionStorage.clear();
};
