import { apiFetch } from './api';

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface DoctorUserRef {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface DoctorRef {
  _id: string;
  specialty: string;
  subSpecialty?: string;
  hospital: string;
  location: string;
  consultationFee: number;
  rating?: number;
  reviewCount?: number;
  userId: DoctorUserRef;
}

export interface PatientRef {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Appointment {
  _id: string;
  patientId: PatientRef;
  doctorId: DoctorRef;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  symptoms?: string;
  status: AppointmentStatus;
  doctorNotes?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPayload {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  symptoms?: string;
}

export const appointmentApi = {
  // Book an appointment (Patient)
  book: async (data: BookingPayload): Promise<Appointment> => {
    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // Get current patient's appointments
  getMyAppointments: async (): Promise<Appointment[]> => {
    const res = await apiFetch('/appointments/my');
    return res.data || [];
  },

  // Get doctor's assigned appointments (Doctor/Admin)
  getDoctorAppointments: async (): Promise<Appointment[]> => {
    const res = await apiFetch('/appointments/doctor');
    return res.data || [];
  },

  // Get appointment by ID
  getById: async (id: string): Promise<Appointment> => {
    const res = await apiFetch(`/appointments/${id}`);
    return res.data;
  },

  // Cancel appointment
  cancel: async (id: string, reason?: string): Promise<Appointment> => {
    const res = await apiFetch(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancellationReason: reason }),
    });
    return res.data;
  },

  // Doctor confirms appointment
  confirm: async (id: string, notes?: string): Promise<Appointment> => {
    const res = await apiFetch(`/appointments/${id}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify({ doctorNotes: notes }),
    });
    return res.data;
  },

  // Doctor rejects appointment
  reject: async (id: string, reason?: string): Promise<Appointment> => {
    const res = await apiFetch(`/appointments/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason: reason }),
    });
    return res.data;
  },

  // Doctor completes appointment
  complete: async (id: string, doctorNotes?: string): Promise<Appointment> => {
    const res = await apiFetch(`/appointments/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ doctorNotes }),
    });
    return res.data;
  },
};
