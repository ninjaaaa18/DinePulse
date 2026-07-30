const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
];

const socialLinks = [
  { label: "Twitter", href: "#", icon: "𝕏" },
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "GitHub", href: "#", icon: "⌘" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-surface/50 to-surface/30">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.3)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-grid-sm opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald/10 blur-[120px] animate-float" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/8 blur-[100px] animate-glow-drift" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <a
              href="#home"
              className="flex items-center gap-2 text-lg font-semibold text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-sm">
                🍽️
              </span>
              DinePulse
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              AI-powered restaurant health and customer wellness platform —
              helping restaurants thrive while keeping diners safe and healthy.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-emerald-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Connect
            </h3>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.04] text-sm text-muted shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-emerald/40 hover:bg-emerald/15 hover:text-emerald-light hover:shadow-xl hover:shadow-emerald/10"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} DinePulse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-muted transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted transition-colors hover:text-white"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
