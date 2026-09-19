import { addDays, addMinutes, format, startOfDay, subDays } from "date-fns";

import {
  candidateSlotStarts,
  intervalsOverlap,
  isClinicOpenOn,
  minutesToDate,
} from "@/lib/scheduling";
import { createId, createRandom, createReference } from "@/lib/store/ids";
import type {
  Appointment,
  AppointmentStatus,
  BookingChannel,
  Dentist,
  Patient,
  Service,
} from "@/types";

/**
 * Services and dentists keep readable, stable ids: they are referenced from
 * URLs (`/book?service=whitening`) and never created at runtime. Patients and
 * appointments are created by users, so those get generated ids.
 */
export const seedServices: Service[] = [
  {
    id: "svc_check_up",
    slug: "check-up",
    name: "Check-up and digital X-rays",
    category: "general",
    summary: "A full look at teeth, gums and bite, with low-dose digital X-rays.",
    description:
      "Your first appointment with us. We photograph and X-ray what we find, talk you through it on the screen beside the chair, and leave you with a written plan and a price before anything is booked.",
    priceAED: 250,
    durationMinutes: 30,
    popular: true,
    includes: [
      "Low-dose digital X-rays",
      "Gum and bone health check",
      "Oral cancer screening",
      "Written treatment plan and quote",
    ],
  },
  {
    id: "svc_hygiene",
    slug: "hygienist-clean",
    name: "Hygienist clean and polish",
    category: "general",
    summary: "Scale, polish and stain removal, plus a plan for keeping it that way.",
    description:
      "Two visits a year keeps most problems small. Our hygienists remove hard deposits above and below the gumline, lift coffee and tea staining with air-flow, and finish with a fluoride polish.",
    priceAED: 450,
    durationMinutes: 45,
    popular: true,
    includes: [
      "Ultrasonic scaling",
      "Air-flow stain removal",
      "Fluoride polish",
      "Brushing and flossing review",
    ],
  },
  {
    id: "svc_filling",
    slug: "filling",
    name: "Tooth-coloured filling",
    category: "general",
    summary: "A composite filling shade-matched to the tooth around it.",
    description:
      "We remove the decay, rebuild the tooth in layers of composite matched to your natural shade, and adjust the bite so it feels like nothing happened.",
    priceAED: 650,
    durationMinutes: 45,
    popular: false,
    includes: [
      "Local anaesthetic",
      "Decay removal",
      "Shade-matched composite",
      "Bite adjustment and polish",
    ],
  },
  {
    id: "svc_root_canal",
    slug: "root-canal",
    name: "Root canal treatment",
    category: "general",
    summary: "Saves a badly infected tooth and settles the pain, usually in one visit.",
    description:
      "Modern rotary endodontics under magnification. Most single-root teeth are finished in one appointment, and you walk out numb rather than sore.",
    priceAED: 1900,
    durationMinutes: 90,
    popular: false,
    includes: [
      "Rotary endodontics under magnification",
      "Local anaesthetic",
      "Temporary seal",
      "Follow-up X-ray at two weeks",
    ],
  },
  {
    id: "svc_whitening",
    slug: "whitening",
    name: "In-clinic teeth whitening",
    category: "cosmetic",
    summary: "Several shades lighter in one sitting, with take-home trays to top up.",
    description:
      "A supervised in-chair whitening session with the gums fully protected, followed by custom trays so you can maintain the result at home for a year or more.",
    priceAED: 1750,
    durationMinutes: 75,
    popular: true,
    includes: [
      "Shade assessment and photos",
      "Gum protection",
      "Three whitening cycles",
      "Custom take-home top-up trays",
    ],
  },
  {
    id: "svc_veneers",
    slug: "veneers",
    name: "Porcelain veneers",
    category: "cosmetic",
    summary: "Hand-layered porcelain, designed on a mock-up you approve first.",
    description:
      "We design the smile digitally, try it in your mouth as a temporary mock-up, and only prepare teeth once you have seen and approved the shape in the mirror.",
    priceAED: 2900,
    priceNote: "per tooth",
    durationMinutes: 90,
    popular: false,
    includes: [
      "Digital smile design",
      "Intra-oral scan",
      "Temporary veneers to live with",
      "Two fitting visits",
    ],
  },
  {
    id: "svc_invisalign",
    slug: "invisalign",
    name: "Invisalign clear aligners",
    category: "orthodontics",
    summary: "Removable aligners that straighten teeth without anyone noticing.",
    description:
      "A 3D scan, a simulation of the finished result before you commit, then a set of aligners changed at home every week with a review here every six weeks.",
    priceAED: 14500,
    priceNote: "full treatment, paid in stages",
    durationMinutes: 60,
    popular: true,
    includes: [
      "3D scan and outcome simulation",
      "All aligner sets",
      "Six-weekly reviews",
      "Retainers when you finish",
    ],
  },
  {
    id: "svc_wisdom",
    slug: "wisdom-tooth",
    name: "Wisdom tooth removal",
    category: "surgery",
    summary: "Surgical removal by an oral surgeon, with sedation if you want it.",
    description:
      "Planned from a CBCT scan so we know exactly where the nerve sits. Most patients are back at work the next day with dissolvable stitches and a check-in call.",
    priceAED: 2400,
    durationMinutes: 60,
    popular: false,
    includes: [
      "CBCT scan review",
      "Local anaesthetic or IV sedation",
      "Dissolvable stitches",
      "48-hour check-in call",
    ],
  },
];

export const seedDentists: Dentist[] = [
  {
    id: "dr_layla",
    name: "Doctor 1",
    role: "Clinical director, cosmetic dentistry",
    credentials: "BDS, MSc Aesthetic Dentistry",
    bio: "Plans every smile case on a mock-up first, so patients see the result in the mirror before a tooth is touched.",
    languages: ["Arabic", "English", "French"],
    specialties: ["cosmetic", "general"],
    yearsExperience: 16,
    workingDays: [1, 2, 3, 4, 6],
    portrait: 1,
  },
  {
    id: "dr_omar",
    name: "Doctor 2",
    role: "Orthodontist",
    credentials: "BDS, MOrth RCS",
    bio: "Has finished more than 1,400 aligner cases, and is happiest with the adult bites other clinics call a compromise.",
    languages: ["Arabic", "English"],
    specialties: ["orthodontics", "general"],
    yearsExperience: 12,
    workingDays: [1, 2, 3, 4, 5],
    portrait: 2,
  },
  {
    id: "dr_priya",
    name: "Doctor 3",
    role: "Oral surgeon and implantologist",
    credentials: "BDS, MDS Oral & Maxillofacial Surgery",
    bio: "Runs the surgical list. Nervous patients ask for this dentist by name, which tells you most of what you need to know.",
    languages: ["English", "Hindi", "Malayalam"],
    specialties: ["surgery", "general"],
    yearsExperience: 14,
    workingDays: [1, 3, 4, 5, 6],
    portrait: 3,
  },
  {
    id: "dr_yousef",
    name: "Doctor 4",
    role: "General and family dentist",
    credentials: "BDS, MFDS RCPS",
    bio: "Looks after families, from a four-year-old's first visit to a grandparent's new denture, and explains everything twice, on purpose.",
    languages: ["Arabic", "English", "Urdu"],
    specialties: ["general", "cosmetic"],
    yearsExperience: 9,
    workingDays: [1, 2, 3, 4, 5, 6],
    portrait: 4,
  },
];

type PatientSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Age in years, turned into a plausible date of birth at seed time. */
  age: number;
  insurer: string | null;
  notes: string;
};

const patientSeeds: PatientSeed[] = [
  {
    firstName: "Patient",
    lastName: "1",
    email: "patient1@example.com",
    phone: "+971 52 555 1xxx",
    age: 34,
    insurer: "Insurer A",
    notes: "Sensitive to cold on the upper left. Prefers morning appointments.",
  },
  {
    firstName: "Patient",
    lastName: "2",
    email: "patient2@example.com",
    phone: "+971 54 555 2xxx",
    age: 47,
    insurer: "Insurer B",
    notes: "Grinds at night. Night guard fitted March 2025, check wear at each visit.",
  },
  {
    firstName: "Patient",
    lastName: "3",
    email: "patient3@example.com",
    phone: "+971 55 555 3xxx",
    age: 29,
    insurer: "Insurer C",
    notes: "Invisalign case, week 14 of 32. Attachments on 13 and 23.",
  },
  {
    firstName: "Patient",
    lastName: "4",
    email: "patient4@example.com",
    phone: "+971 56 555 4xxx",
    age: 38,
    insurer: null,
    notes: "Self-pay. Asks for a quote in writing before every treatment.",
  },
  {
    firstName: "Patient",
    lastName: "5",
    email: "patient5@example.com",
    phone: "+971 50 555 5xxx",
    age: 52,
    insurer: "Insurer D",
    notes: "On blood thinners — clear extractions with his physician first.",
  },
  {
    firstName: "Patient",
    lastName: "6",
    email: "patient6@example.com",
    phone: "+971 52 555 6xxx",
    age: 41,
    insurer: "Insurer A",
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "7",
    email: "patient7@example.com",
    phone: "+971 54 555 7xxx",
    age: 26,
    insurer: "Insurer E",
    notes: "Anxious in the chair. Books longer slots and likes the hand signal agreement.",
  },
  {
    firstName: "Patient",
    lastName: "8",
    email: "patient8@example.com",
    phone: "+971 55 555 8xxx",
    age: 44,
    insurer: "Insurer B",
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "9",
    email: "patient9@example.com",
    phone: "+971 56 555 9xxx",
    age: 31,
    insurer: "Insurer C",
    notes: "Whitening top-up trays collected January 2026.",
  },
  {
    firstName: "Patient",
    lastName: "10",
    email: "patient10@example.com",
    phone: "+971 50 555 0xxx",
    age: 36,
    insurer: null,
    notes: "Veneer case on 12–22. Shade BL2 approved.",
  },
  {
    firstName: "Patient",
    lastName: "11",
    email: "patient11@example.com",
    phone: "+971 52 555 1xxx",
    age: 58,
    insurer: "Insurer A",
    notes: "Implant 36 placed 2024, review annually.",
  },
  {
    firstName: "Patient",
    lastName: "12",
    email: "patient12@example.com",
    phone: "+971 54 555 2xxx",
    age: 33,
    insurer: "Insurer D",
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "13",
    email: "patient13@example.com",
    phone: "+971 55 555 3xxx",
    age: 45,
    insurer: "Insurer B",
    notes: "Latex allergy — nitrile gloves only.",
  },
  {
    firstName: "Patient",
    lastName: "14",
    email: "patient14@example.com",
    phone: "+971 56 555 4xxx",
    age: 30,
    insurer: "Insurer E",
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "15",
    email: "patient15@example.com",
    phone: "+971 50 555 5xxx",
    age: 39,
    insurer: "Insurer A",
    notes: "Travels often. Confirm by WhatsApp two days ahead.",
  },
  {
    firstName: "Patient",
    lastName: "16",
    email: "patient16@example.com",
    phone: "+971 52 555 6xxx",
    age: 27,
    insurer: null,
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "17",
    email: "patient17@example.com",
    phone: "+971 54 555 7xxx",
    age: 23,
    insurer: "Insurer C",
    notes: "Student rate applied. Parent is the billing contact.",
  },
  {
    firstName: "Patient",
    lastName: "18",
    email: "patient18@example.com",
    phone: "+971 55 555 8xxx",
    age: 49,
    insurer: "Insurer B",
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "19",
    email: "patient19@example.com",
    phone: "+971 56 555 9xxx",
    age: 35,
    insurer: "Insurer A",
    notes: "Pregnant, second trimester. X-rays deferred until after delivery.",
  },
  {
    firstName: "Patient",
    lastName: "20",
    email: "patient20@example.com",
    phone: "+971 50 555 0xxx",
    age: 61,
    insurer: "Insurer D",
    notes: "Partial denture, upper. Reline discussed for next year.",
  },
  {
    firstName: "Patient",
    lastName: "21",
    email: "patient21@example.com",
    phone: "+971 52 555 1xxx",
    age: 42,
    insurer: "Insurer C",
    notes: "",
  },
  {
    firstName: "Patient",
    lastName: "22",
    email: "patient22@example.com",
    phone: "+971 54 555 2xxx",
    age: 37,
    insurer: null,
    notes: "Prefers late slots after 7 pm.",
  },
  {
    firstName: "Patient",
    lastName: "23",
    email: "patient23@example.com",
    phone: "+971 55 555 3xxx",
    age: 19,
    insurer: "Insurer A",
    notes: "Braces debonded January 2026. Retainer check every six months.",
  },
  {
    firstName: "Patient",
    lastName: "24",
    email: "patient24@example.com",
    phone: "+971 56 555 4xxx",
    age: 32,
    insurer: "Insurer E",
    notes: "",
  },
];

export function buildSeedPatients(now: Date): Patient[] {
  const random = createRandom(0x51ce);
  return patientSeeds.map((seed, index) => {
    const birthYear = now.getFullYear() - seed.age;
    const birthMonth = Math.floor(random() * 12);
    const birthDay = 1 + Math.floor(random() * 27);
    return {
      id: createId(),
      firstName: seed.firstName,
      lastName: seed.lastName,
      email: seed.email,
      phone: seed.phone,
      dateOfBirth: format(new Date(birthYear, birthMonth, birthDay), "yyyy-MM-dd"),
      insurer: seed.insurer,
      notes: seed.notes,
      createdAt: subDays(now, 30 + index * 11 + Math.floor(random() * 9)).toISOString(),
    } satisfies Patient;
  });
}

function pick<T>(random: () => number, items: T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error("Cannot pick from an empty list");
  return item;
}

function pickStatus(
  random: () => number,
  startsAt: Date,
  now: Date,
): AppointmentStatus {
  if (startsAt.getTime() < now.getTime()) {
    const roll = random();
    if (roll < 0.76) return "completed";
    if (roll < 0.88) return "cancelled";
    return "no-show";
  }
  const roll = random();
  if (roll < 0.55) return "confirmed";
  if (roll < 0.95) return "scheduled";
  return "cancelled";
}

function pickChannel(random: () => number): BookingChannel {
  const roll = random();
  if (roll < 0.58) return "online";
  if (roll < 0.9) return "phone";
  return "walk-in";
}

/**
 * Walks the fortnight either side of today and books plausible days: only when
 * the clinic is open, only with a dentist who works that weekday and performs
 * that treatment, and never double-booking a chair.
 */
export function buildSeedAppointments(
  now: Date,
  patients: Patient[],
  services: Service[],
  dentists: Dentist[],
): Appointment[] {
  const random = createRandom(0x2f10a7);
  const appointments: Appointment[] = [];
  let patientCursor = Math.floor(random() * patients.length);

  for (let dayOffset = -14; dayOffset <= 14; dayOffset += 1) {
    const day = startOfDay(addDays(now, dayOffset));
    if (!isClinicOpenOn(day)) continue;

    const perDay = 1 + Math.floor(random() * 3);
    for (let index = 0; index < perDay; index += 1) {
      const available = dentists.filter((dentist) =>
        dentist.workingDays.includes(day.getDay()),
      );
      if (available.length === 0) continue;

      const dentist = pick(random, available);
      const performable = services.filter((service) =>
        dentist.specialties.includes(service.category),
      );
      if (performable.length === 0) continue;

      const service = pick(random, performable);
      const slots = candidateSlotStarts(day, service.durationMinutes);
      if (slots.length === 0) continue;

      const startMinutes = pick(random, slots);
      const startsAt = minutesToDate(day, startMinutes);

      const clash = appointments.some(
        (existing) =>
          existing.dentistId === dentist.id &&
          intervalsOverlap(
            new Date(existing.startsAt),
            existing.durationMinutes,
            startsAt,
            service.durationMinutes,
          ),
      );
      if (clash) continue;

      // Round-robin the patient list so nearly everyone has a history, with the
      // occasional repeat visitor.
      patientCursor = (patientCursor + 1 + Math.floor(random() * 2)) % patients.length;
      const patient = patients[patientCursor];
      if (!patient) continue;

      const status = pickStatus(random, startsAt, now);
      const createdAt = subDays(startsAt, 3 + Math.floor(random() * 20)).toISOString();

      appointments.push({
        id: createId(),
        reference: createReference(),
        patientId: patient.id,
        dentistId: dentist.id,
        serviceId: service.id,
        startsAt: startsAt.toISOString(),
        durationMinutes: service.durationMinutes,
        status,
        channel: pickChannel(random),
        notes: "",
        priceAED: service.priceAED,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return appointments.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function buildSeedData(now = new Date()) {
  const patients = buildSeedPatients(now);
  const services = seedServices.map((service) => ({ ...service }));
  const dentists = seedDentists.map((dentist) => ({ ...dentist }));
  const appointments = buildSeedAppointments(now, patients, services, dentists);
  return { services, dentists, patients, appointments };
}

/** Exported for the appointment form, which needs the end time for a summary. */
export function appointmentEnd(appointment: Appointment): Date {
  return addMinutes(new Date(appointment.startsAt), appointment.durationMinutes);
}
