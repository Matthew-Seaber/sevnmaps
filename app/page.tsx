import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default async function Home() {
  return (
    <>
      <Navbar />

      <p className="mt-4 text-2xl font-bold text-center select-none mb-15">
        SevnMaps
      </p>

      <Footer />
    </>
  );
}
