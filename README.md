# Demo Dental Clinic — demo

A frontend-only marketing and booking site for a fictional Dubai dental clinic,
built to be shown to prospects. Everything works — booking, rescheduling,
patient records — against an in-memory store. There is no backend, no database
and no network calls.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`. Lint and typecheck pass clean.

## What to show in a walkthrough

1. **Home** — the hero's "next available" card is real: it reads the store and
   offers the soonest free slot, and the button deep-links into the booking flow
   with that treatment, dentist, day and time already chosen.
2. **Book** (`/book`) — treatment → dentist → slot → details → confirmation. The
   slot picker is the centrepiece: each day shows how many slots are actually
   free, taken times are struck through rather than hidden, Sundays are closed,
   Monday–Thursday lose 1:30–2:30 pm to the break, and nothing inside the next
   two hours is offered.
3. **Clinic dashboard** (`/admin`) — the appointment booked in step 2 is already
   in the diary, and the patient record has been created alongside it.
4. **Appointments** (`/admin/appointments`) — search, filter, sort, create,
   reschedule, change status, delete. Cancelling is deliberately flaky (see
   below) so the optimistic update and its rollback can be demonstrated.
5. **Patients** (`/admin/patients`) — open a record for history, contact details
   and notes that save on their own.

## Where the data lives

`src/lib/store/` is the demo's "backend": a module-level singleton, plain
TypeScript, no React.

- `seed.ts` — 8 treatments, 4 dentists, 24 patients and roughly 48 appointments
  spread across the fortnight either side of today, with mixed statuses.
- `db.ts` — typed CRUD, plus the rules the UI relies on: a chair cannot be
  double-booked, deleting a patient deletes their appointments, and a duplicate
  email is rejected with a message worth showing a user.
- `ids.ts` — `crypto.randomUUID()` with a fallback for non-secure contexts, so
  the demo survives being opened over a LAN address on a phone.

State lasts for the browser session. A hard refresh re-seeds it. **Reset demo
data** at the bottom of the dashboard sidebar does the same thing on demand, so
a session can be handed to the next prospect clean.

Two behaviours are intentional, not bugs:

- `cancelAppointment` in `src/features/appointments/api.ts` fails about one time
  in ten (`CANCEL_FAILURE_RATE`) to demonstrate the optimistic-update rollback.
- Every read waits ~120 ms and every write ~260 ms, so loading skeletons and
  pending buttons are real rather than theoretical.

## Architecture

Feature-sliced, and the layering only runs one way.

```
src/
  app/         routes only — thin files that render a feature component
  features/    the real code: appointments, patients, services, dentists,
               booking, contact, demo. Each has api.ts, schema.ts, hooks/,
               components/ and an index.ts barrel
  components/  ui/ (shadcn primitives), layout/, shared/, marketing/
  lib/         store/ (the in-memory database), scheduling, tokens, utils
  styles/      tokens.css — every colour, type step, radius and shadow
  types/       cross-feature entity types
```

A component never touches the store. It calls a feature hook, the hook calls
that feature's `api.ts`, and only `api.ts` reaches into `src/lib/store`.
`features/` never imports from `app/`, and cross-feature imports go through the
barrel rather than a deep path. TanStack Query owns server-ish state and
invalidates across features after a write; Zustand holds the small amount of
cross-cutting client state (the "signed-in" clinician, the mobile nav, table
density); zod plus react-hook-form validate every form. No `any`, no
`@ts-ignore`.

## Design

Petrol teal over porcelain neutrals with a mint accent — clinical confidence
without the cold — set in Bricolage Grotesque over Instrument Sans. The
recurring arch shape is a nod to Gulf architecture and carries the hero panel,
the team portraits and the smile gallery. Every value is a token in
`src/styles/tokens.css`; no component hardcodes a colour.

Responsive to 390 px, keyboard navigable, `prefers-reduced-motion` respected,
and clean at WCAG 2.1 AA (checked with axe on every route, plus the dialogs, the
patient drawer and the mobile menu).

## Content

The clinic, its dentists, patients and reviews are invented. There are no
photographs of real people anywhere — portraits and the before/after gallery are
drawn from brand gradients. Prices are plausible Dubai rates in AED. Nothing is
sent anywhere: the contact form and the booking confirmation generate a
reference and stop there.
