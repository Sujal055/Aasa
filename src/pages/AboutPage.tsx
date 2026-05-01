import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Target, Users, MapPin, Shield } from 'lucide-react';

const milestones = [
  { year: '2023', title: 'Problem Identified', desc: 'Sangli Municipal Corporation noted rising stray animal incidents and lack of digital tracking.' },
  { year: '2024', title: 'AASA Conceived', desc: 'A student-led initiative proposed a unified digital identity system for strays, inspired by Aadhaar.' },
  { year: '2025', title: 'Platform Launch & NGO Integration', desc: 'AASA went live with citizen reporting, AI triage, and partnered with local organizations like Animal Rahat Sangli for field operations.' },
];

const values = [
  { icon: Heart, title: 'Compassion First', desc: 'Every decision we make centers on the welfare and dignity of animals who cannot speak for themselves.', color: 'var(--rose)' },
  { icon: Shield, title: 'Accountability', desc: 'Complete digital audit trails ensure every rescue, vaccination, and treatment is documented.', color: 'var(--am)' },
  { icon: Users, title: 'Community Power', desc: 'Citizens, volunteers, NGOs, and government working as one unified network.', color: 'var(--gr)' },
  { icon: Target, title: 'Data-Driven Impact', desc: 'Real analytics let us measure success and continuously improve how we serve animals.', color: 'var(--bl)' },
];

const team = [
  { initials: 'AS', name: 'Aditya Sutake', role: 'Platform Architect & Founder', color: 'var(--am)' },
  { initials: 'DU', name: 'Deepak Udgave', role: 'Animal Welfare Officer, SMC', color: 'var(--bl)' },
  { initials: 'RD', name: 'Rohan Dhole', role: 'NGO Partnership Lead', color: 'var(--gr)' },
  { initials: 'SK', name: 'Swayam Khandelwal', role: 'Veterinary Consultant', color: 'var(--vi)' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-paper/80 backdrop-blur-2xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-lg shadow-lg shadow-primary/20">🐾</div>
          <span className="font-serif font-black text-xl tracking-tight">AASA</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">← Back to Home</Link>
          <Link to="/auth" className="btn-p text-sm !py-2 !px-5 flex items-center gap-2">
            Enter Platform <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-24 text-center relative overflow-hidden pattern-bg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-secondary/8 rounded-full blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] font-bold text-primary tracking-[3px] uppercase mb-8">
            Our Mission
          </div>
          <h1 className="font-serif font-black text-5xl md:text-7xl tracking-tighter mb-6">
            About <span className="text-shimmer">AASA</span>
          </h1>
          <p className="text-white/50 text-xl leading-relaxed">
            We believe every stray animal deserves a name, a record, and a chance at a healthy life. AASA is our answer to the invisible crisis on Sangli's streets.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto glass-card rounded-[48px] p-12 md:p-16"
          style={{ background: 'linear-gradient(135deg, rgba(240,165,0,0.06) 0%, rgba(26,18,8,0.95) 100%)' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">🎯</div>
            <div className="font-mono text-[10px] font-bold text-primary tracking-[4px] uppercase">Mission Statement</div>
          </div>
          <blockquote className="font-serif text-3xl md:text-4xl font-black italic leading-tight text-white/90">
            "To create a digital ecosystem where no stray animal in Sangli District is invisible — giving each one a verifiable identity, a health record, and a path to safety."
          </blockquote>
          <div className="mt-8 flex items-center gap-3">
            <MapPin size={16} className="text-primary" />
            <span className="text-white/40 text-sm font-mono">Sangli Municipal Corporation · Maharashtra, India</span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">What We Stand For</div>
            <h2 className="font-serif text-4xl font-black tracking-tight">Our <span className="text-gradient">Core Values</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-[32px] flex gap-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${v.color}18`, color: v.color }}>
                  <v.icon size={24} />
                </div>
                <div>
                  <div className="font-serif font-black text-xl mb-2">{v.title}</div>
                  <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">Our Journey</div>
            <h2 className="font-serif text-4xl font-black tracking-tight">The <span className="text-gradient">Story So Far</span></h2>
          </div>
          <div className="relative space-y-8 pl-8 border-l border-primary/20">
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative">
                <div className="absolute -left-[2.6rem] w-4 h-4 rounded-full bg-primary border-2 border-paper shadow-[0_0_12px_rgba(240,165,0,0.4)]" />
                <div className="glass-card p-7 rounded-[24px]">
                  <div className="font-mono text-[10px] text-primary font-bold tracking-[3px] uppercase mb-1">{m.year}</div>
                  <div className="font-serif font-black text-xl mb-2">{m.title}</div>
                  <p className="text-white/40 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="font-mono text-[10px] text-primary/60 tracking-[4px] uppercase mb-3">The People</div>
            <h2 className="font-serif text-4xl font-black tracking-tight">Meet the <span className="text-gradient">Team</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-[32px] text-center">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center font-serif text-2xl font-black mx-auto mb-4 shadow-xl"
                  style={{ background: `${t.color}18`, color: t.color }}>{t.initials}</div>
                <div className="font-serif font-black text-lg mb-1">{t.name}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-3xl mx-auto text-center glass-card rounded-[48px] p-12"
          style={{ background: 'linear-gradient(135deg, rgba(90,173,110,0.08) 0%, rgba(26,18,8,0.95) 100%)' }}>
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="font-serif font-black text-4xl tracking-tight mb-4">Ready to Make a Difference?</h2>
          <p className="text-white/40 mb-8">Join the network. Report a stray. Volunteer for a rescue. Launch a campaign.</p>
          <Link to="/auth" className="btn-p !py-4 !px-10 text-base !rounded-2xl inline-flex items-center gap-3">
            Enter AASA Platform <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-[10px] text-white/20 uppercase tracking-[3px]">
            © 2025 Sangli Municipal Corporation · AASA Platform
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs text-white/30 hover:text-white transition-colors">Home</Link>
            <Link to="/auth" className="text-xs text-white/30 hover:text-white transition-colors">Platform</Link>
            <Link to="/about" className="text-xs text-white/30 hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
