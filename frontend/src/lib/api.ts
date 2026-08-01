// This file handles sending images to your Python Backend
export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.user_id || user.id) {
        headers['x-user-id'] = String(user.user_id || user.id);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
  return headers;
};

export const analyzeXray = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // 1. Send the file to port 8000 (where Python is running)
    const response = await fetch(BASE_URL + "/analyze", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }

    // 2. Return the JSON answer from Python
    return await response.json();
  } catch (error) {
    console.error("AI Connection Failed:", error);
    throw error;
  }
};

export const analyzePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(BASE_URL + "/api/analyze-photo", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("Photo Analysis Connection Failed:", error);
    throw error;
  }
};

export const analyzePhotoGemini = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(BASE_URL + "/api/analyze-photo-gemini", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini Photo Analysis Connection Failed:", error);
    throw error;
  }
};

export const analyzeReport = async (file: File) => {
  console.log("📤 [API] analyzeReport called with file:", file);
  const formData = new FormData();
  formData.append("file", file);
  console.log("📤 [API] FormData created, file appended:", formData.get("file"));

  try {
    console.log("📤 [API] Sending POST to http://127.0.0.1:8000/api/analyze-report...");
    const response = await fetch(BASE_URL + "/api/analyze-report", {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    console.log("📤 [API] Response status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }

    const json = await response.json();
    console.log("📤 [API] Response JSON:", json);
    return json;
  } catch (error) {
    console.error("❌ [API] Report analysis failed:", error);
    throw error;
  }
};

export const register = async (data: any) => {
  console.log("📤 [API] register called with data:", data);
  try {
    const response = await fetch(BASE_URL + "/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("📤 [API] register response status:", response.status);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Registration failed");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] Registration failed:", error);
    throw error;
  }
};

export const seedDB = async () => {
  console.log("📤 [API] SEED CALLED!");
  try {
    const response = await fetch(BASE_URL + "/api/seed", {
      method: "GET",
    });
    console.log("📤 [API] SEED status:", response.status);
    const seedData = await response.json();
    console.log("📤 [API] SEED data:", seedData);
    if (!response.ok) {
      throw new Error(JSON.stringify(seedData));
    }
    return seedData;
  } catch (e) {
    console.error("❌ [API] SEED FAILED:", e);
    throw e;
  }
};

export const login = async (email: string, password: string, required_role: string) => {
  console.log("📤 [API] login called with:", { email, password, required_role });
  try {
    const response = await fetch(BASE_URL + "/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, required_role }),
    });
    console.log("📤 [API] login response status:", response.status);
    if (!response.ok) {
      const err = await response.json();
      console.error("❌ [API] login error response:", err);
      throw new Error(err.detail || "Login failed");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] Login failed:", error);
    throw error;
  }
};

export const getDoctors = async () => {
  console.log("📤 [API] getDoctors called");
  try {
    const response = await fetch(BASE_URL + "/api/doctors", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getDoctors failed:", error);
    throw error;
  }
};

export const getDoctorStats = async () => {
  console.log("📤 [API] getDoctorStats called");
  try {
    const response = await fetch(BASE_URL + "/api/doctor/stats", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getDoctorStats failed:", error);
    throw error;
  }
};

export const getPendingReports = async () => {
  console.log("📤 [API] getPendingReports called");
  try {
    const response = await fetch(BASE_URL + "/api/doctor/pending-reports", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getPendingReports failed:", error);
    throw error;
  }
};

export const getReviewedReports = async () => {
  console.log("📤 [API] getReviewedReports called");
  try {
    const response = await fetch(BASE_URL + "/api/doctor/reviewed-reports", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getReviewedReports failed:", error);
    throw error;
  }
};

export const getDoctorReportById = async (reportId: number) => {
  console.log("📤 [API] getDoctorReportById called:", reportId);
  try {
    const response = await fetch(`${BASE_URL}/api/doctor/report/${reportId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getDoctorReportById failed:", error);
    throw error;
  }
};

export const updateScanReportStatus = async (reportId: number, status: string) => {
  console.log("📤 [API] updateScanReportStatus called:", { reportId, status });
  try {
    const response = await fetch(`${BASE_URL}/api/doctor/report/${reportId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] updateScanReportStatus failed:", error);
    throw error;
  }
};

export const getDoctorConsultations = async () => {
  console.log("📤 [API] getDoctorConsultations called");
  try {
    const response = await fetch(BASE_URL + "/api/appointments/doctor?approved=true", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getDoctorConsultations failed:", error);
    throw error;
  }
};

export const bookAppointment = async (doctorId: number) => {
  console.log("📤 [API] bookAppointment called with doctorId:", doctorId);
  try {
    const response = await fetch(BASE_URL + "/api/appointments/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ doctor_id: doctorId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to book appointment");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] bookAppointment failed:", error);
    throw error;
  }
};

export const getPatientAppointments = async () => {
  console.log("📤 [API] getPatientAppointments called");
  try {
    const response = await fetch(BASE_URL + "/api/appointments/patient", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getPatientAppointments failed:", error);
    throw error;
  }
};

export const getDoctorAppointments = async () => {
  console.log("📤 [API] getDoctorAppointments called");
  try {
    const response = await fetch(BASE_URL + "/api/appointments/doctor", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] getDoctorAppointments failed:", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId: number, status: string, appointmentDate: string | null = null, doctorNote: string | null = null) => {
  console.log("📤 [API] updateAppointmentStatus called:", { appointmentId, status, appointmentDate, doctorNote });
  try {
    const payload: any = { status };
    if (appointmentDate) {
      payload.appointment_date = appointmentDate;
    }
    if (doctorNote !== undefined && doctorNote !== null) {
      payload.doctor_note = doctorNote;
    }
    const response = await fetch(`${BASE_URL}/api/appointments/${appointmentId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Server error: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ [API] updateAppointmentStatus failed:", error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId: number) => {
    console.log("📤 [API] cancelAppointment called:", appointmentId);
    try {
        const response = await fetch(`${BASE_URL}/api/appointments/${appointmentId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] cancelAppointment failed:", error);
        throw error;
    }
};

export const getPatientReports = async () => {
    console.log("📤 [API] getPatientReports called");
    try {
        const response = await fetch(BASE_URL + "/api/reports/patient", {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error("Server error: " + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] getPatientReports failed:", error);
        throw error;
    }
};

export const deleteReport = async (reportId: number) => {
    console.log("📤 [API] deleteReport called:", reportId);
    try {
        const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] deleteReport failed:", error);
        throw error;
    }
};

export const getReportById = async (reportId: number) => {
    console.log("📤 [API] getReportById called:", reportId);
    try {
        const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] getReportById failed:", error);
        throw error;
    }
};

export const deleteMultipleReports = async (reportIds: number[]) => {
    console.log("📤 [API] deleteMultipleReports called:", reportIds);
    try {
        const response = await fetch(BASE_URL + "/api/reports/delete-multiple", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ report_ids: reportIds }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] deleteMultipleReports failed:", error);
        throw error;
    }
};

export const attachReportToAppointment = async (appointmentId: number, reportId: number, reportType: string) => {
    console.log("📤 [API] attachReportToAppointment called:", { appointmentId, reportId, reportType });
    try {
        const response = await fetch(BASE_URL + "/api/appointments/attach-report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ 
                appointment_id: appointmentId, 
                report_id: reportId, 
                report_type: reportType 
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] attachReportToAppointment failed:", error);
        throw error;
    }
};

export const markAppointmentViewed = async (appointmentId: number) => {
    console.log("📤 [API] markAppointmentViewed called:", appointmentId);
    try {
        const response = await fetch(`${BASE_URL}/api/appointments/${appointmentId}/mark-viewed`, {
            method: "PUT",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] markAppointmentViewed failed:", error);
        throw error;
    }
};

export const getChatMessages = async (appointmentId: number) => {
    console.log("📤 [API] getChatMessages called:", appointmentId);
    try {
        const response = await fetch(`${BASE_URL}/api/chat/${appointmentId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] getChatMessages failed:", error);
        throw error;
    }
};

export const sendChatMessage = async (appointmentId: number, message: string) => {
    console.log("📤 [API] sendChatMessage called:", { appointmentId, message });
    try {
        const response = await fetch(`${BASE_URL}/api/chat/${appointmentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] sendChatMessage failed:", error);
        throw error;
    }
};

export const getDoctorProfile = async () => {
    console.log("📤 [API] getDoctorProfile called");
    try {
        const response = await fetch(BASE_URL + "/api/doctor/profile", {
            headers: {
                ...getAuthHeaders(),
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] getDoctorProfile failed:", error);
        throw error;
    }
};

export const updateDoctorProfile = async (data: any) => {
    console.log("📤 [API] updateDoctorProfile called:", data);
    try {
        const response = await fetch(BASE_URL + "/api/doctor/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Server error");
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [API] updateDoctorProfile failed:", error);
        throw error;
    }
};