
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Markets } from "@/components/landing/Markets";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Markets />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
