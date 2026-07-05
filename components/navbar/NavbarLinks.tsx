import Link from "next/link";

function NavbarLinks() {
  return (
    <div className="hidden gap-20 md:flex">
      <Link
        href="/features"
        className="text-foreground/60 hover:text-foreground/90  font-semibold hover:-translate-y-px transition-all"
      >
        Features
      </Link>

      <Link
        href="/pricing"
        className="text-foreground/60 hover:text-foreground/90 font-semibold hover:-translate-y-px transition-all"
      >
        Pricing
      </Link>

      <Link
        href="/changelog"
        className="text-foreground/60 hover:text-foreground/90 font-semibold hover:-translate-y-px transition-all"
      >
        Changelog
      </Link>
    </div>
  );
}

export default NavbarLinks;
