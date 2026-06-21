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
