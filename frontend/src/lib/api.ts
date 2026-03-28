import { mockDiseases } from '@/data/mock/diseases';
import { mockDoctors } from '@/data/mock/doctors';
import { mockReports } from '@/data/mock/reports';
import { mockUsers } from '@/data/mock/users';

export const BASE_URL = 'http://localhost:5000/api';

export const getAuthToken = () => {
  return localStorage.getItem('jeevansh_token');
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  // MOCK LOGIC: Intercept all calls to remove backend dependency temporarily
  await delay(500); // simulate network latency

  // 1. Auth & Users
  if (endpoint === '/users/login' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const userRole = body.role || 'patient';
    const mockUser = mockUsers.find(u => u.role === userRole) || mockUsers[0];
    return {
      success: true,
      data: {
        token: `mock-token-${mockUser.id}`,
        _id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        avatar: mockUser.avatar
      }
    };
  }
  if (endpoint === '/users/create' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    return {
      success: true,
      data: {
        token: `mock-token-new`,
        _id: 'new-id',
        name: body.name,
        email: body.email,
        role: body.role || 'patient',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name)}&background=0B3C5D&color=fff&size=128`
      }
    };
  }
  if (endpoint === '/users/profile') {
    // If we have a token, just return a mock user (e.g., patient)
    const mockUser = mockUsers[0];
    return {
      success: true,
      data: {
        _id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        avatar: mockUser.avatar
      }
    };
  }

  // 2. Diseases
  if (endpoint === '/diseases' && (!options.method || options.method === 'GET')) {
    return {
      success: true,
      data: mockDiseases.map(d => ({ ...d, _id: d.id }))
    };
  }
  if (endpoint.startsWith('/diseases/') && (!options.method || options.method === 'GET')) {
    const id = endpoint.split('/').pop();
    const disease = mockDiseases.find(d => d.id === id);
    if (disease) {
      return { success: true, data: { ...disease, _id: disease.id } };
    }
    throw new Error('Disease Not Found');
  }

  // 3. Doctors
  if (endpoint === '/doctors' && (!options.method || options.method === 'GET')) {
    return {
      success: true,
      data: mockDoctors.map(d => ({
        ...d,
        _id: d.id,
        // The frontend expects the nested userId object for doctors
        userId: { _id: d.id, name: d.name, avatar: d.avatar }
      }))
    };
  }

  // 4. Reports
  if (endpoint === '/reports/myreports' && (!options.method || options.method === 'GET')) {
    return {
      success: true,
      data: mockReports.map(r => ({ ...r, _id: r.id }))
    };
  }
  if (endpoint === '/reports' && (!options.method || options.method === 'GET')) {
    return {
      success: true,
      data: mockReports.map(r => ({ ...r, _id: r.id }))
    };
  }
  if (endpoint === '/reports' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newReport = {
      ...body,
      _id: `new-report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      patientName: "Arjun Mehta",
      status: "pending",
    };
    return { success: true, data: newReport };
  }
  if (endpoint.startsWith('/reports/') && endpoint.endsWith('/status') && options.method === 'PUT') {
    const id = endpoint.split('/')[2];
    const body = JSON.parse(options.body as string);
    const report = mockReports.find(r => r.id === id);
    if (!report) throw new Error("Not Found");
    return {
      success: true,
      data: {
        ...report,
        _id: report.id,
        status: body.status,
        doctorNotes: body.doctorNotes
      }
    };
  }

  // Fallback for real fetch if somehow not mocked
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }
    return data;
  } catch (err) {
    console.error(`Mock endpoint fallback failed for ${endpoint}`, err);
    throw err;
  }
};
