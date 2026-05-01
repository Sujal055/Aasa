import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Shield, MapPin, Brain, Users, Star, ChevronDown, Heart, Phone } from 'lucide-react';

const stats = [
  { v: '2,481', l: 'Animals Tagged' },
  { v: '340', l: 'Rescues' },
  { v: '68%', l: 'Health Improved' },
  { v: '18', l: 'NGO Partners' },
];

const features = [
  { icon: '🆔', title: 'Digital Identity', desc: 'Every stray gets a unique AASA ID — tracked across shelters, clinics, and rescue teams.', color: 'var(--am)' },
  { icon: '🤖', title: 'AI Vision Triage', desc: 'Upload a photo and our Gemini-powered AI instantly assesses species, injury, and medical urgency.', color: 'var(--vi)' },
  { icon: '📍', title: 'GPS Rescue Network', desc: 'Real-time map of reported animals, field volunteers, and nearby shelters for instant coordination.', color: 'var(--bl)' },
  { icon: '💉', title: 'Health Registry', desc: 'Complete vaccination, sterilization, and treatment history for every registered animal.', color: 'var(--gr)' },
  { icon: '🏢', title: 'NGO Command Center', desc: 'Campaign management, volunteer coordination, and sector-wise impact analytics for organizations.', color: 'var(--am)' },
  { icon: '🛡️', title: 'District Oversight', desc: 'Municipal administrators monitor real-time data across all wards with audit logs and export tools.', color: 'var(--rose)' },
];

const steps = [
  { n: '01', title: 'Spot & Report', desc: 'A citizen spots an injured stray, snaps a photo, and submits an SOS via the AASA app — location auto-captured.', icon: '📸' },
  { n: '02', title: 'AI Triage + Dispatch', desc: 'Gemini AI analyzes the image, determines urgency, and alerts the nearest volunteer field unit automatically.', icon: '⚡' },
  { n: '03', title: 'Rescue & Register', desc: 'The volunteer rescues the animal, logs treatment, and creates a permanent AASA digital identity for it.', icon: '🏥' },
];

const testimonials = [
  { name: 'Priya Mehta', role: 'Citizen, Ward 5', text: 'I reported a limping dog and within 8 minutes a volunteer called me. AASA made it so easy to actually help.', rating: 5 },
  { name: 'Arjun Desai', role: 'Field Volunteer, Miraj', text: 'The GPS map and case pipeline changed how I manage rescues. I can handle 3x more cases per week now.', rating: 5 },
  { name: 'Dr. Naresh Upreti', role: 'Chief Operating Officer, Animal Rahat', text: 'Our Halter Replacement and ABC campaigns have scaled massively. The analytics and team coordination tools provided by AASA are outstanding.', rating: 5 },
];

const roles = [
  { role: 'CITIZEN', emoji: '👤', title: 'Citizen', desc: 'Report strays, track rescues, register your local animals', color: 'var(--bl)', bg: 'rgba(94,168,212,0.08)', border: 'rgba(94,168,212,0.2)' },
  { role: 'VOLUNTEER', emoji: '🤝', title: 'Volunteer', desc: 'Respond to SOS alerts, manage field rescue operations', color: 'var(--gr)', bg: 'rgba(90,173,110,0.08)', border: 'rgba(90,173,110,0.2)' },
  { role: 'NGO', emoji: '🏢', title: 'NGO', desc: 'Coordinate campaigns, shelters and medical drives', color: 'var(--am)', bg: 'rgba(240,165,0,0.08)', border: 'rgba(240,165,0,0.2)' },
  { role: 'ADMIN', emoji: '🛡️', title: 'Admin', desc: 'District-level oversight, analytics and system control', color: 'var(--rose)', bg: 'rgba(212,113,90,0.08)', border: 'rgba(212,113,90,0.2)' },
];

const faqs = [
  { q: 'Is AASA free to use?', a: 'Yes — AASA is a Sangli Municipal Corporation initiative. All features are free for citizens, volunteers, and partner NGOs.' },
  { q: 'How does the AI scanner work?', a: 'You upload or take a photo of the animal. Our Gemini AI model identifies the species, visible injuries, and assigns a medical urgency level within seconds.' },
  { q: 'What is an AASA ID?', a: 'It is a unique digital identifier assigned to each registered stray animal — similar to Aadhaar for humans — linking all health records, rescues, and updates.' },
  { q: 'How can my NGO partner with AASA?', a: 'Register via the NGO portal or contact the Sangli Municipal Corporation animal welfare department to get your organization onboarded.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-paper/80 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-lg shadow-lg shadow-primary/20">🐾</div>
          <span className="font-serif font-black text-xl tracking-tight">AASA</span>
          <span className="hidden sm:block font-mono text-[9px] text-primary/60 tracking-[3px] uppercase border border-primary/20 px-2 py-0.5 rounded-full">Maharashtra</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</a>
          <a href="#faq" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</a>
          <Link to="/about" className="text-sm text-white/50 hover:text-white transition-colors">About</Link>
        </div>
        <Link to="/auth" className="btn-p text-sm !py-2 !px-5 flex items-center gap-2">
          Enter Platform <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden pattern-bg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-secondary/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-primary/8 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[160px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] font-bold text-primary tracking-[3px] uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Sangli District · Maharashtra · Since 2025
          </div>

          <h1 className="font-serif font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.0] tracking-tighter mb-6">
            Aadhaar for<br />
            <span className="text-shimmer">Stray Animals</span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            A unified digital identity platform where citizens, volunteers, NGOs, and the municipal government work together to rescue, register, and rehabilitate every stray animal in Sangli.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth" className="btn-p !py-4 !px-8 text-base flex items-center gap-3 !rounded-2xl group">
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="btn-g !py-4 !px-8 text-base !rounded-2xl flex items-center gap-2">
              See How It Works <ChevronDown size={18} />
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-4 rounded-2xl text-center">
                <div className="font-serif text-2xl font-black text-primary">{s.v}</div>
                <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-1">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Role entry points ────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">Choose Your Role</div>
            <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight">Join the <span className="text-gradient">AASA Network</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r, i) => (
              <motion.div key={r.role} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to="/auth" state={{ role: r.role }}
                  className="group flex flex-col p-7 rounded-[28px] border transition-all hover:scale-[1.02] hover:shadow-2xl h-full"
                  style={{ background: r.bg, borderColor: r.border }}>
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform inline-block">{r.emoji}</div>
                  <div className="font-serif font-black text-xl mb-2" style={{ color: r.color }}>{r.title}</div>
                  <p className="text-white/40 text-sm leading-relaxed flex-1">{r.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: r.color }}>
                    Enter Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-12 py-24 relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">Platform Capabilities</div>
            <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight">Everything You <span className="text-gradient">Need</span></h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">From AI-powered triage to real-time rescue coordination — AASA covers the full lifecycle of stray animal welfare.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card p-8 rounded-[32px] group hover:border-white/10 transition-all">
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                <h3 className="font-serif font-black text-xl mb-3">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-5 h-0.5 w-10 rounded-full transition-all group-hover:w-20" style={{ background: f.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">The Process</div>
            <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight">How <span className="text-gradient">AASA Works</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-0.5 bg-gradient-to-r from-primary/40 via-accent/40 to-secondary/40" />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="glass-card p-8 rounded-[32px] text-center relative">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-black text-primary mx-auto mb-5">{s.n}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-serif font-black text-xl mb-3">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-secondary/3 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">Community Voices</div>
            <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight">Heard From the <span className="text-gradient">Field</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-[32px] flex flex-col gap-5">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="currentColor" className="text-primary" />)}
                </div>
                <p className="text-white/60 text-sm leading-relaxed italic flex-1">"{t.text}"</p>
                <div>
                  <div className="font-serif font-black">{t.name}</div>
                  <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="px-6 md:px-12 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">Common Questions</div>
            <h2 className="font-serif text-4xl md:text-5xl font-black tracking-tight">FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-card p-7 rounded-[24px]">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs font-black shrink-0 mt-0.5">?</div>
                  <div>
                    <div className="font-serif font-black text-lg mb-2">{f.q}</div>
                    <p className="text-white/50 text-sm leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="glass-card rounded-[48px] p-12 md:p-16 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(240,165,0,0.08) 0%, rgba(90,173,110,0.05) 100%)' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <div className="text-5xl mb-6 animate-[float_3s_ease-in-out_infinite]">🐾</div>
              <h2 className="font-serif font-black text-4xl md:text-5xl tracking-tighter mb-4">
                Every Paw Deserves<br /><span className="text-shimmer">a Name & a Chance.</span>
              </h2>
              <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
                Join thousands of citizens, volunteers, and organizations already making Sangli safer for strays.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" className="btn-p !py-4 !px-10 text-lg !rounded-2xl flex items-center gap-3 group">
                  Join AASA Today <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="btn-g !py-4 !px-10 text-lg !rounded-2xl flex items-center gap-2">
                  <Heart size={18} className="text-rose" /> Learn Our Mission
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="px-6 md:px-12 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-lg">🐾</div>
                <span className="font-serif font-black text-xl">AASA</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed max-w-xs">
                Aadhaar for Stray Animals — a Sangli Municipal Corporation initiative to digitize and improve stray animal welfare across Sangli District.
              </p>
              <div className="flex items-center gap-2 mt-5 text-white/20 text-xs font-mono">
                <Phone size={12} /> +91 233 266 0100 (Animal Welfare Cell)
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold text-white/20 uppercase tracking-[3px] mb-5">Platform</div>
              <div className="space-y-3">
                {[['Citizen Portal', '/auth'], ['Volunteer Hub', '/auth'], ['NGO Operations', '/auth'], ['Admin Oversight', '/auth']].map(([l, h]) => (
                  <Link key={l} to={h} className="block text-sm text-white/40 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold text-white/20 uppercase tracking-[3px] mb-5">Organization</div>
              <div className="space-y-3">
                {[['About AASA', '/about'], ['How It Works', '#how-it-works'], ['FAQ', '#faq'], ['Privacy Policy', '#']].map(([l, h]) => (
                  <Link key={l} to={h} className="block text-sm text-white/40 hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-mono text-[10px] text-white/20 uppercase tracking-[3px]">
              © 2025 Sangli Municipal Corporation · AASA Platform · All Rights Reserved
            </div>
            <div className="flex items-center gap-2 text-white/20 text-[10px] font-mono">
              Made with <Heart size={10} fill="currentColor" className="text-rose" /> for strays of Sangli
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
