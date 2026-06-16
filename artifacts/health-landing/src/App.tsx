import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, Activity, Sun, Moon, CheckCircle2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Images
import heroImg from "./assets/hero.png";
import mockupImg from "./assets/mockup.png";
import feature1Img from "./assets/feature-1.png";
import feature2Img from "./assets/feature-2.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Leaf size={18} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Vitalize</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors" data-testid="link-features">Features</a>
          <a href="#approach" className="hover:text-foreground transition-colors" data-testid="link-approach">Our Approach</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors" data-testid="link-testimonials">Stories</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="hidden lg:flex" data-testid="button-login">Log in</Button>
          <Button className="rounded-full px-6" data-testid="button-nav-download">Download App</Button>
        </div>

        <button 
          className="md:hidden text-foreground" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-4">
          <a href="#features" className="p-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#approach" className="p-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Our Approach</a>
          <a href="#testimonials" className="p-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Stories</a>
          <hr className="border-border" />
          <Button className="w-full rounded-full" data-testid="button-mobile-download">Download App</Button>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Your personal wellness companion
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-display font-medium text-foreground leading-[1.1] tracking-tight mb-6">
              Breathe in. <br />
              <span className="text-primary italic">Live intentionally.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Vitalize helps you track habits, manage energy, and build a routine that feels like fresh air. Not another tracker, but a quiet companion for your well-being.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full px-8 h-14 text-base w-full sm:w-auto" data-testid="button-hero-download">
                Get started for free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base w-full sm:w-auto bg-background/50 backdrop-blur-sm" data-testid="button-hero-tour">
                Take a tour
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p>Join <strong className="text-foreground">10,000+</strong> mindful members</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none h-[500px] md:h-[600px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background aesthetic image */}
            <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-[80%] h-[80%] rounded-3xl overflow-hidden shadow-2xl">
              <img src={heroImg} alt="Morning sunlight" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
            </motion.div>
            
            {/* Foreground mockup image */}
            <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 w-[60%] h-[85%] rounded-3xl overflow-hidden shadow-2xl border-4 border-background/50 backdrop-blur-sm">
              <img src={mockupImg} alt="App Mockup" className="w-full h-full object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
          {[
            { value: "4.9", label: "App Store Rating" },
            { value: "2M+", label: "Habits Formed" },
            { value: "85%", label: "Report More Energy" },
            { value: "10k+", label: "Active Members" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col justify-center"
            >
              <div className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Sun className="w-6 h-6 text-primary" />,
      title: "Morning Clarity",
      desc: "Start your day with gentle prompts that help you set intentions without overwhelming you."
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "Energy Tracking",
      desc: "Track how you feel, not just what you do. Understand your natural rhythms."
    },
    {
      icon: <Moon className="w-6 h-6 text-primary" />,
      title: "Evening Wind Down",
      desc: "Disconnect from the noise with structured reflections that prepare you for rest."
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-display font-medium mb-6">A rhythm for your life</h2>
          <p className="text-lg text-muted-foreground">
            We believe wellness shouldn't feel like a chore. Vitalize is designed to flow naturally with your day, gently nudging you toward better habits.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Highlight1() {
  return (
    <section id="approach" className="py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="aspect-square rounded-[2.5rem] overflow-hidden relative">
              <img src={feature2Img} alt="Fresh morning water" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.5rem]"></div>
            </div>
            {/* Floating badge */}
            <motion.div 
              className="absolute -bottom-6 -right-6 lg:-right-12 bg-background p-6 rounded-2xl shadow-xl border border-border max-w-[240px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="text-primary w-5 h-5" />
                <span className="font-medium">Hydration</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary w-[75%] h-full rounded-full"></div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Daily goal: 75% reached</div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 lg:pl-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-medium mb-6">Clarity in the small things.</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              True wellness isn't found in dramatic overhauls. It's built in the quiet, simple choices you make every day. Vitalize helps you focus on the fundamentals—water, movement, rest—without the noise of complex metrics.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Minimalist interface that reduces anxiety",
                "Customizable core habits tailored to you",
                "Gentle reminders that don't feel like nagging"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <Button variant="outline" className="rounded-full px-6" data-testid="button-learn-more">
              Learn more about our philosophy
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Highlight2() {
  return (
    <section className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            className="flex-1 lg:pr-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-medium mb-6">Designed to center you.</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Every interaction in Vitalize is crafted to induce a sense of calm. From our warm color palette to our fluid animations, opening the app should feel like taking a deep breath.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-display font-medium text-foreground mb-2">0%</div>
                <div className="text-sm text-muted-foreground">Dark patterns or guilt-tripping notifications.</div>
              </div>
              <div>
                <div className="text-3xl font-display font-medium text-foreground mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Your data, private and secure on your device.</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 relative w-full max-w-lg mx-auto"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative shadow-2xl">
              <img src={feature1Img} alt="Abstract calm shapes" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-4 border-2 border-primary/20 rounded-[3rem] -z-10 hidden md:block"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Leaf className="w-10 h-10 text-primary mx-auto mb-8 opacity-50" />
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-medium leading-tight mb-10 text-foreground">
            "I've tried dozens of habit trackers. Vitalize is the only one that doesn't make me feel stressed when I miss a day. It feels like a supportive friend."
          </h2>
          
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-background shadow-md">
              <img src="https://i.pravatar.cc/150?img=32" alt="Sarah J." className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground">Sarah Jenkins</div>
              <div className="text-sm text-muted-foreground">Using Vitalize since 2023</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="bg-foreground text-background rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-medium mb-6">Ready to find your rhythm?</h2>
            <p className="text-xl text-background/80 mb-10">
              Download Vitalize today and start your journey toward a more intentional, energized life. Free for 14 days.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground border-none" data-testid="button-final-download">
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-background/20 hover:bg-background/10 text-background" data-testid="button-final-android">
                Download for Android
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Leaf size={18} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Vitalize</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Your personal wellness companion designed to help you track habits, manage energy, and live intentionally.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Download</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vitalize Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Highlight1 />
        <Highlight2 />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
