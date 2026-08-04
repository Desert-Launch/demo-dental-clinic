import { create } from "zustand";

/**
 * Cross-cutting client state for the admin shell. There is no real auth — the
 * "signed-in" clinician is a demo convenience, and switching them re-labels the
 * dashboard so a prospect can see the idea.
 */
interface SessionState {
  /** Id of the dentist the demo is "signed in" as. */
  staffId: string;
  setStaffId: (staffId: string) => void;

  /** Mobile sidebar. */
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;

  /** Appointments table density, remembered while the session lasts. */
  compactTable: boolean;
  toggleCompactTable: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  staffId: "dr_layla",
  setStaffId: (staffId) => set({ staffId }),

  navOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),

  compactTable: false,
  toggleCompactTable: () => set((state) => ({ compactTable: !state.compactTable })),
}));
