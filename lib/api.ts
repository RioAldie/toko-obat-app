export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || 'An error occurred while fetching data');
    }

    // Handle empty responses
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error: any) {
    // If the error is a connection refused (backend down), throw a cleaner error
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Koneksi ke backend gagal. Pastikan server NestJS berjalan.');
    }
    throw error;
  }
}
