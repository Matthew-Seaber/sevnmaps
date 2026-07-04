import Link from "next/link";

function TextLogo() {
  return (
    <Link href="/">
      <div className="flex gap-3">
        {/* Logo image */}
        <h1 className="text-xl font-bold">SevnMaps</h1>
      </div>
    </Link>
  );
}

export default TextLogo;