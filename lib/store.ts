import { create } from 'zustand';

interface UserState {
  profile: {
    name: string;
    age: string;
    height: string;
    weight: string;
    goals: string[];
    duration: number;
    injuries: string;
  };
  setProfile: (data: Partial<UserState['profile']>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    name: '',
    age: '',
    height: '',
    weight: '',
    goals: [],
    duration: 20,
    injuries: '',
  },
  setProfile: (data) =>
    set((state) => ({ profile: { ...state.profile, ...data } })),
}));