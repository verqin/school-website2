/**
 * Central site configuration.
 *
 * NOTE: every value marked PLACEHOLDER is intentionally generic - no real
 * school facts have been invented. Replace them (or override them from the
 * `site_settings` table in the backend) before going live.
 */
export const siteConfig = {
  name: "Cresta Reign Academy",
  shortName: "Cresta Reign",
  tagline: "Rise with purpose. Lead with distinction.",
  description:
    "Cresta Reign Academy is an educational and vocational training institution in Bulawayo, Zimbabwe, shaping confident scholars and capable professionals.",
  contact: {
    addressLines: ["Hillside West, Bulawayo", "Corner 11th Avenue and Jason Moyo (2nd Floor)", "Alledeloyd Building, Room 10B, J. Tongogara Street"],
    phone: "+263 779 739 148 or +263 775 656 322",
    email: "admissions@crestareign.ac.zw",
    officeHours: "Mon-Fri, 08:00-16:00",
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
