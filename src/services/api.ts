const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/stats`, {
      headers: getAuthHeaders()
    });
    return response.json();
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
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/weekly`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/weekly/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/weekly/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
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
    return response.json();
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
    return response.json();
  },

  update: async (id: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders(isFormData);

    const response = await fetch(`${API_BASE_URL}/daily/${id}`, {
      method: 'PUT',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/daily/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
