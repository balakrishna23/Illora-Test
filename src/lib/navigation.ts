export type NavLink = {
  label: string;
  href: string;
};

export const primaryNavLinks: NavLink[] = [
  { label: "For Employers", href: "/employers" },
  { label: "For Candidates", href: "/candidates" },
  { label: "Jobs", href: "/jobs" },
  { label: "Industries", href: "/industries" },
  { label: "About", href: "/about" },
  { label: "Knowledge Hub", href: "/knowledge-hub" },
  { label: "Contact", href: "/contact" },
];

export const footerLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];
