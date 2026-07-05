"use client";

import TextLogo from "../navbar/TextLogo";

import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-border z-2 pt-20 pb-12">
      <div className="flex items-start mx-auto mb-16 max-w-6xl gap-x-4 px-4">
        <div className="flex flex-col shrink w-64 gap-2">
          <TextLogo />
          <p className="font-medium">Your trusted travel pal</p>
          <a href="mailto:hello@sevnmaps.com" className="hover:underline text-muted-foreground hover:text-foreground">
            hello@sevnmaps.com
          </a>
        </div>

        <div className="flex flex-wrap flex-col gap-2 shrink text-muted-foreground">
          <h4 className="font-bold mb-2 text-foreground">Useful Links</h4>

          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/changelog" className="hover:text-foreground">
            Changelog
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </div>

      <div className="text-foreground/60 text-center space-y-1">
        <p>© SevnMaps 2026</p>
        <p>
          Created with ♥️ by{" "}
          <a
            href="https://matthewseaber.com"
            target="_blank"
            className="hover:underline hover:font-semibold"
          >
            Matthew Seaber
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
