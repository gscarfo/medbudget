
import { Transaction, DoctorProfile } from '../types.ts';

export const apiService = {
  async getProfile(): Promise<DoctorProfile | null> {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        console.error(`Profile API error: ${res.status}`);
        return null;
      }
      const data = await res.json();
      if (!data || !data.first_name) return null;
      return {
        firstName: data.first_name,
        lastName: data.last_name,
        specialization: data.specialization,
        studioName: data.studio_name
      };
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  },

  async saveProfile(profile: DoctorProfile): Promise<DoctorProfile> {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Errore nel salvataggio del profilo');
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
      const res = await fetch('/api/transactions');
      if (!res.ok) {
        console.error(`Transactions API error: ${res.status}`);
        return [];
      }
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return [];
    }
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Errore nel salvataggio della transazione');
    return await res.json();
  }
};
