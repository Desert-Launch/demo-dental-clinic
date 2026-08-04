import type { Metadata } from "next";

import { AppointmentsBoard } from "@/features/appointments/components/appointments-board";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function AdminAppointmentsPage() {
  return <AppointmentsBoard />;
}
