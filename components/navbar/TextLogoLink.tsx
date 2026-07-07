import Link from "next/link";
import Image from "next/image";

function TextLogo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="SevnMaps Logo"
          width={35}
          height={35}
          loading="eager"
          priority
          className="w-auto h-auto"
        />
        <h1 className="text-xl md:text-2xl font-medium">
          <span className="font-bold">Sevn</span>Maps
        </h1>
      </div>
    </Link>
  );
}

export default TextLogo;
