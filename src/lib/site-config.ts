/**
 * Central site configuration.
 *
 * NOTE: every value marked PLACEHOLDER is intentionally generic - no real
 * school facts have been invented. Replace them (or override them from the
 * `site_settings` table in the backend) before going live.
 */
export const siteConfig = {
  name: "Sample1 School",
  shortName: "Sample1",
  tagline: "Learning that lasts a lifetime",
  description:
    "Sample1 School is a K-12 learning community focused on academic excellence, character and care. Explore our programmes, news, events and campus life.",
  /** PLACEHOLDER contact details - replace with the school's real details. */
  contact: {
    addressLines: ["[PLACEHOLDER] 1 Example Road", "[PLACEHOLDER] City, Region 00000"],
    phone: "[PLACEHOLDER] +00 000 000 0000",
    email: "[PLACEHOLDER] hello@example.edu",
    officeHours: "[PLACEHOLDER] Mon–Fri, 08:00–16:00",
  },
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
  ],
} as const;

export type NavItem = { label: string; to: string };

export const mainNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Academics", to: "/academics" },
  { label: "Admissions", to: "/admissions" },
  { label: "News", to: "/news" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Staff", to: "/staff" },
  { label: "Contact", to: "/contact" },
];
