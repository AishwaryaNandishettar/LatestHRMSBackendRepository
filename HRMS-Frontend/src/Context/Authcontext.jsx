import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  /* =============================
     STATE INITIALIZATION
  ============================== */

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("loggedUser");
      if (!storedUser) return null;

      const parsed = JSON.parse(storedUser);
      console.log("🔥 INITIAL USER FROM STORAGE:", parsed); // Debug
      
      return {
        ...parsed,
        role: (parsed.role || "").toLowerCase(), // ✅ Ensure lowercase
        empId: parsed.empId || parsed.employeeId, // ✅ Add empId fallback
        employeeId: parsed.employeeId || parsed.empId, // ✅ Add employeeId fallback
      };
    } catch (e) {
      console.error("❌ Error parsing stored user:", e);
      localStorage.removeItem("loggedUser");
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  /* =============================
     SYNC STORAGE → STATE
  ============================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsed = JSON.parse(storedUser);

      setUser({
        ...parsed,
        role: parsed.role?.toLowerCase(),
        empId: parsed.empId || parsed.employeeId, // ✅ Add empId fallback
        employeeId: parsed.employeeId || parsed.empId, // ✅ Add employeeId fallback
      });
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  /* =============================
     LOGIN
  ============================== */
  const login = (userData) => {
    if (!userData) return;

    const normalizedUser = {
      ...userData,
      role: userData.role?.toLowerCase(),
      empId: userData.empId || userData.employeeId, // ✅ Ensure empId is set
      employeeId: userData.employeeId || userData.empId, // ✅ Ensure employeeId is set
       companyId: userData.companyId   // ✅ ADD THIS LINE HERE
    };

    console.log("🔥 LOGIN USER DATA BEFORE STORE:", normalizedUser); // Debug

    setUser(normalizedUser);
    setToken(userData.token);

    localStorage.setItem("loggedUser", JSON.stringify(normalizedUser));
    localStorage.setItem("token", userData.token);
    localStorage.setItem("role", normalizedUser.role);
    
    console.log("✅ STORED IN LOCALSTORAGE:", {
      loggedUser: JSON.parse(localStorage.getItem("loggedUser")),
      token: localStorage.getItem("token"),
      role: localStorage.getItem("role")
    });
  };

  /* =============================
     LOGOUT
  ============================== */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // ✅ ADD THIS
  };

  /* =============================
     CONTEXT VALUE
  ============================== */
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
