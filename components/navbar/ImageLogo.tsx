import Image from "next/image";

function ImageLogo() {
  return (
      <Image
        src="/logo.png"
        alt="SevnMaps Logo"
        width={35}
        height={35}
        loading="eager"
        priority
        className="w-auto h-auto"
      />
  );
}

export default ImageLogo;
