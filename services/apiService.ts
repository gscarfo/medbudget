
import { Transaction, DoctorProfile } from '../types.ts';

export const apiService = {
  async getProfile(): Promise<DoctorProfile | null> {
    const res = await fetch('/api/profile');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    return {
      firstName: data.first_name,
      lastName: data.last_name,
      specialization: data.specialization,
      studioName: data.studio_name
    };
  },

  async saveProfile(profile: DoctorProfile): Promise<DoctorProfile> {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return res.json();
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions');
    if (!res.ok) return [];
    return res.json();
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return res.json();
  }
};
