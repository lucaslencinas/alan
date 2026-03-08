import Header from "@/components/shared/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import TwoDevices from "@/components/landing/TwoDevices";
import ForTeachers from "@/components/landing/ForTeachers";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HowItWorks />
      <TwoDevices />
      <ForTeachers />
      <Footer />
    </div>
  );
}
