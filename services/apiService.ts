
import { Transaction, DoctorProfile, AuthResponse, HealthStatus } from '../types.ts';

const getHeaders = () => {
  const user = localStorage.getItem('medbudget_user');
  const headers: any = { 'Content-Type': 'application/json' };
  if (user) {
    headers['x-user-id'] = JSON.parse(user).id;
  }
  return headers;
};

export const apiService = {
  async checkHealth(): Promise<HealthStatus & { message?: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (err) {
      return { 
        status: 'offline', 
        message: 'Connessione al database non disponibile. Verifica DATABASE_URL sulla tua VPS.' 
      };
    }
  },

  async login(credentials: any): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Credenziali non valide');
    }
    return await res.json();
  },

  async register(credentials: any): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Errore durante la creazione dell\'account');
    }
    return await res.json();
  },

  async getProfile(): Promise<DoctorProfile | null> {
    try {
      const res = await fetch('/api/profile', { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.first_name) return null;
      return {
        firstName: data.first_name,
        lastName: data.last_name,
        specialization: data.specialization,
        studioName: data.studio_name
      };
    } catch { return null; }
  },

  async saveProfile(profile: DoctorProfile): Promise<DoctorProfile> {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Impossibile salvare il profilo');
    const data = await res.json();
    return {
      firstName: data.first_name,
      lastName: data.last_name,
      specialization: data.specialization,
      studioName: data.studio_name
    };
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await fetch('/api/transactions', { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch { return []; }
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Errore durante il salvataggio del movimento');
    return await res.json();
  }
};
