"use client";

import TextLogo from "../navbar/TextLogo";

function Footer() {
  return (
    <footer className="border-t border-border z-2 pt-20 pb-15">
      <div className="flex max-w-30 items-start mx-auto mb-16 gap-x-16">
        <div className="flex flex-col shrink w-64">
          <TextLogo />
          <p>Your trusted travel pal</p>
          <a href="mailto:hello@sevnmaps.com" className="hover:underline">
            hello@sevnmaps.com
          </a>
        </div>

        <div className="flex flex-wrap">
          <div>
            <h4>Useful Links</h4>
          </div>
        </div>
      </div>

      <p className="text-foreground/60 text-center">
        Created with ♥️ by{" "}
        <a
          href="https://matthewseaber.com"
          target="_blank"
          className="hover:underline hover:font-semibold"
        >
          Matthew Seaber
        </a>
      </p>
    </footer>
  );
}

export default Footer;
