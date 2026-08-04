import type { Metadata } from "next";

import { PatientsBoard } from "@/features/patients/components/patients-board";

export const metadata: Metadata = {
  title: "Patients",
};

export default function AdminPatientsPage() {
  return <PatientsBoard />;
}
