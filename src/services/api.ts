export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (isFormData: boolean = false) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (!isFormData) { // Do not set Content-Type for FormData, browser sets it automatically
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic function to handle API responses
// It will parse JSON and throw an error if 'success' is false in the payload,
// regardless of the HTTP status code.
const handleApiResponse = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response is not valid JSON, it's a critical error
    console.error("handleApiResponse - Failed to parse JSON response:", e, "Raw response text:", await response.text());
    throw new Error(`API Response Error: Could not parse JSON. Status: ${response.status}`);
  }

  console.log("handleApiResponse - Parsed Data:", data); // NEW DEBUG LOG
  console.log("handleApiResponse - response.ok:", response.ok); // Existing DEBUG LOG
  console.log("handleApiResponse - data.success:", data.success); // NEW DEBUG LOG

  if (response.ok || data.success === true) {
    console.log("handleApiResponse - Returning SUCCESS data."); // NEW DEBUG LOG
    return data;
  } else {
    console.log("handleApiResponse - Throwing ERROR. Data message:", data.message); // NEW DEBUG LOG
    // If response.ok is false AND data.success is false/undefined, then it's a real error.
    throw new Error(data.message || 'An unknown error occurred');
  }
};

// Job Applications API
export const jobsApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; company?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.company) searchParams.append('company', params.company);
    
    const response = await fetch(`${API_BASE_URL}/jobs?${searchParams}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/stats`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  }
};

// Weekly Reviews API
export const weeklyApi = {
  getAll: async (params?: { page?: number; limit?: number; projectId?: string; year?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.year) searchParams.append('year', params.year);
    
    const response = await fetch(`${API_BASE_URL}/weekly?${searchParams}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/weekly`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/weekly/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/weekly/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  }
};

// Daily Entries API
export const dailyApi = {
  getAll: async (params?: { page?: number; limit?: number; projectId?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const response = await fetch(`${API_BASE_URL}/daily?${searchParams}`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  },

  // Modified to accept FormData for file uploads
  create: async (data: FormData | any) => {
    // If data is FormData, getAuthHeaders should not set 'Content-Type'
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders(isFormData);

    const response = await fetch(`${API_BASE_URL}/daily`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  },

  update: async (id: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders(isFormData);

    const response = await fetch(`${API_BASE_URL}/daily/${id}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/daily/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  }
};

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders()
    });
    return handleApiResponse(response); // Use the new handler
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleApiResponse(response); // Use the new handler
  }
};
