import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Database,
  Users,
  Shield,
  Activity,
  ArrowRight,
  Settings,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"analytics" | "users" | "logs">("analytics");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/rescues').then(r => r.json()).then(data => setReports(Array.isArray(data) ? data : [])).catch(() => {});
    fetch('/api/analytics').then(r => r.json()).then(data => setAnalytics(data)).catch(() => {});
    fetch('/api/users').then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const tabs = [
    { id: "analytics", icon: <Activity size={18} />, label: "Pulse" },
    { id: "users", icon: <Users size={18} />, label: "Directory" },
    { id: "logs", icon: <Shield size={18} />, label: "Security" }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-32">
       {/* Redesigned Hero Header */}
       <div className="hero px-10 py-12 relative overflow-hidden bg-bg-warm" style={{ background: `linear-gradient(160deg, rgba(212, 113, 90, 0.04) 0%, transparent 55%)` }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,240,180,0.022)_1px,transparent_1px)] bg-[length:26px_26px]" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-[24px] bg-rose-dim border border-rose-600/20 flex items-center justify-center text-3xl shadow-2xl shadow-rose-500/20">
            📊
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-dim text-rose-400 border border-rose-600/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-[2.5px] mb-3">
              <Lock size={12} className="text-rose-400" />
              Root Surveillance Authorized
            </div>
            <h1 className="font-serif text-5xl font-black tracking-tight mb-2">District <span className="text-rose italic font-medium">Oversight</span></h1>
            <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl">
              Monitoring the <span className="text-white">AASA Global Registry</span>, inter-agency coordination, and system integrity.
            </p>
          </div>
          <div className="flex gap-10">
             {[["4.8k", "Entries"], ["18", "Units"], ["99.9%", "Uptime"]].map(([v, l]) => (
                <div key={l}><div className="font-serif text-3xl font-bold text-rose">{v}</div><div className="font-mono text-[9px] text-white/20 uppercase tracking-[1.5px] mt-1">{l}</div></div>
             ))}
          </div>
        </div>
      </div>

      <div className="px-10 mt-10">
        <AnimatePresence mode="wait">
          {view === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { l: 'Total Rescues', v: String(analytics.totalRescues ?? '—'), c: 'Updated', i: Database, cl: 'text-primary' },
                   { l: 'Field Volunteers', v: String(analytics.activeVolunteers ?? '—'), c: 'Updated', i: Shield, cl: 'text-secondary' },
                   { l: 'Registered Citizens', v: String(analytics.totalCitizens ?? '—'), c: 'Updated', i: Users, cl: 'text-accent' },
                   { l: 'Network Health', v: '100%', i: Activity, cl: 'text-emerald-500' }
                 ].map((s, i) => (
                    <div key={i} className="glass-card p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <s.i size={64} />
                       </div>
                       <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6", s.cl)}>
                          <s.i size={20} />
                       </div>
                       <p className="font-mono text-[9px] font-bold text-white/20 uppercase tracking-[3px] mb-1">{s.l}</p>
                       <h4 className="font-serif text-3xl font-black">{s.v}</h4>
                       {s.c && <p className="text-[10px] font-medium text-white/30 italic mt-1">{s.c}</p>}
                    </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="glass-card p-10 rounded-[48px] border-white/5">
                        <div className="flex justify-between items-center mb-10">
                           <h3 className="font-serif text-2xl font-bold italic">Registration <span className="text-rose">Velocity</span></h3>
                           <div className="flex gap-2">
                              <button className="px-4 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest font-mono">Archive</button>
                              <button className="px-4 py-1.5 rounded-lg bg-rose shadow-lg shadow-rose-900/40 text-[10px] font-bold text-[#1a1208] transition-colors uppercase tracking-widest font-mono">Live</button>
                           </div>
                        </div>
                        <div className="h-[300px] flex items-end gap-2 px-2">
                           {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                             <motion.div 
                               key={i}
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               transition={{ duration: 1, delay: i * 0.05 }}
                               className="flex-1 bg-linear-to-t from-rose/10 via-rose/40 to-rose rounded-t-xl relative group cursor-pointer"
                             >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-[#1a1208] px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                   {Math.round(h * 12)}
                                </div>
                             </motion.div>
                           ))}
                        </div>
                     </div>

                     <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                           <h3 className="font-serif text-2xl font-bold italic">Critical <span className="text-rose">Exceptions</span></h3>
                           <button onClick={() => setView('logs')} className="text-[10px] font-mono font-bold text-white/20 hover:text-rose transition-colors uppercase tracking-[3px]">Full Secure Log →</button>
                        </div>
                        <div className="space-y-3">
                           {reports.slice(0, 2).map((report, i) => (
                             <div key={i} className="flex items-center gap-5 p-4 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                  "bg-rose-500/10 text-rose-500"
                                )}>
                                   <Activity size={24} />
                                </div>
                                <div className="flex-1">
                                   <div className="font-serif font-black text-lg">SOS Report: {report.species}</div>
                                   <div className="text-[10px] text-white/30 font-medium italic leading-none truncate max-w-sm">Loc: {report.location.address || 'Unknown'} - {report.urgency}</div>
                                </div>
                                <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest text-right">
                                  {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                             </div>
                           ))}
                           {reports.length === 0 && (
                             <div className="text-white/40 italic text-sm text-center py-4">No recent exceptions</div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
                        <h3 className="font-serif text-xl font-bold italic">System Node Health</h3>
                        <div className="space-y-6">
                           {[
                             { label: 'Cloud Gateway', status: 'Optimal', p: 98, c: 'text-emerald-500' },
                             { label: 'AI Inference', status: 'Stable', p: 85, c: 'text-primary' },
                             { label: 'Maps Services', status: 'Optimal', p: 92, c: 'text-sky-400' }
                           ].map((sys, i) => (
                             <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                   <div className="text-xs font-bold text-white/80">{sys.label}</div>
                                   <div className={cn("text-[8px] font-mono font-bold uppercase tracking-widest", sys.c)}>{sys.status}</div>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${sys.p}%` }}
                                     className={cn("h-full transition-all duration-1000", sys.c.replace('text-', 'bg-'))} 
                                   />
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                           <h4 className="font-mono text-[10px] font-bold text-white/20 uppercase tracking-[3px] ml-2">Protocol Controls</h4>
                           <div className="grid gap-3">
                              <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs font-bold text-white/60">
                                 <Download size={16} /> Audit Data Export
                              </button>
                              <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs font-bold text-white/60">
                                 <Settings size={16} /> System Settings
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="glass-card p-8 rounded-[40px] border-rose-500/20 bg-rose-500/5">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-xl bg-rose/20 text-rose flex items-center justify-center text-xl">🛡️</div>
                           <h3 className="font-serif font-black text-xl italic text-rose">Root Policy</h3>
                        </div>
                        <p className="text-sm italic text-white/40 leading-relaxed font-medium mb-6">
                          All administrative actions are encrypted and logged at the Sangli Operations Node. unauthorized access attempts will trigger an immediate quarantine.
                        </p>
                        <button className="btn-p w-full !bg-rose-600 !shadow-rose-900/40 text-[#1a1208]">Revoke Live Access</button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {view === "users" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <div className="flex justify-between items-center">
                  <h2 className="font-serif text-4xl font-black italic">Directory <span className="text-rose">Console</span></h2>
                  <div className="flex gap-4">
                    <div className="relative hidden sm:block">
                       <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                       <input placeholder="Search directory..." className="pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm focus:ring-1 focus:ring-rose/20 outline-none w-64 text-white" />
                    </div>
                    <button className="btn-p !bg-rose text-[#1a1208]">Add Identity +</button>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.length > 0 ? users.map((u, i) => (
                    <div key={u.id || i} className="glass-card p-10 rounded-[48px] border-white/5 group hover:border-rose/20 transition-all cursor-pointer">
                       <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center font-serif text-2xl font-black shadow-xl" style={{ background: u.role === 'CITIZEN' ? 'rgba(94,168,212,0.12)' : u.role === 'VOLUNTEER' ? 'rgba(90,173,110,0.12)' : u.role === 'NGO' ? 'rgba(155,130,196,0.12)' : 'rgba(240,165,0,0.12)', color: u.role === 'CITIZEN' ? 'var(--bl)' : u.role === 'VOLUNTEER' ? 'var(--gr)' : u.role === 'NGO' ? 'var(--vi)' : 'var(--am)' }}>{u.name?.slice(0,2).toUpperCase()}</div>
                          <div>
                             <div className="font-serif font-black text-2xl italic leading-none mb-1">{u.name}</div>
                             <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[4px]">{u.role}</div>
                          </div>
                       </div>
                       <div className="flex justify-between items-center p-4 rounded-3xl bg-white/5 border border-white/10">
                          <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">{u.email}</div>
                          <button className="text-[9px] font-black text-rose border-b border-rose/10 pb-0.5 tracking-[2px]">MANAGE</button>
                       </div>
                    </div>
                  )) : [
                     { n: "B. Desai", r: "NGO Admin", s: "PAWCARE HUB", col: "var(--sky)" },
                     { n: "S. Patil", r: "Lead Vol", s: "WARD 3 FIELD", col: "var(--forest)" },
                     { n: "A. Joshi", r: "Citizen", s: "VERIFIED", col: "var(--amber)" },
                     { n: "K. Shah", r: "Vet Officer", s: "GOVT CLINIC", col: "var(--lavender)" }
                   ].map((u, i) => (
                     <div key={i} className="glass-card p-10 rounded-[48px] border-white/5 group hover:border-rose/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-6 mb-8">
                           <div className="w-16 h-16 rounded-[24px] flex items-center justify-center font-serif text-2xl font-black shadow-xl" style={{ background: `${u.col}18`, color: u.col }}>{u.n.slice(0,2)}</div>
                           <div>
                              <div className="font-serif font-black text-2xl italic leading-none mb-1">{u.n}</div>
                              <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[4px]">{u.r}</div>
                           </div>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-3xl bg-white/5 border border-white/10">
                           <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">{u.s}</div>
                           <button className="text-[9px] font-black text-rose border-b border-rose/10 pb-0.5 tracking-[2px]">MANAGE</button>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          )}

          {view === "logs" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
               <h2 className="font-serif text-4xl font-black italic text-center">Encrypted <span className="text-rose">Surveillance Logs</span></h2>
               <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                     <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[5px]">Sector: ALL · Mode: LIVE</div>
                     <button className="btn-g !rounded-xl !py-2 border-white/5 text-[10px] font-bold uppercase tracking-widest">Wipe Terminal</button>
                  </div>
                  <div className="space-y-4 font-mono">
                     {[
                       { t: "12:42:04", a: "AUTH_GEN", d: "Admin sub-session key established for NODE_01", cl: "text-emerald-500" },
                       { t: "12:40:15", a: "SYS_ALERT", d: "Inference engine reports 98% confidence on AASA-1022", cl: "text-primary" },
                       { t: "12:38:55", a: "DB_SYNC", d: "Global registry updated via PawCare Hub", cl: "text-sky-400" },
                       { t: "12:35:12", a: "SEC_FLAG", d: "Non-standard login attempt detected in Miraj sector", cl: "text-rose" },
                       { t: "12:30:11", a: "SYS_DAEMON", d: "Periodic cleanup of expired field nodes complete", cl: "text-white/20" },
                     ].map((l, i) => (
                       <div key={i} className="flex gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] leading-relaxed group hover:bg-white/10 transition-all">
                          <div className="text-white/20 shrink-0 font-bold">{l.t}</div>
                          <div className={cn("font-black tracking-widest shrink-0 uppercase", l.cl)}>{l.a}</div>
                          <div className="text-white/40 italic font-medium group-hover:text-white/80">{l.d}</div>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] bg-bg-warm/88 backdrop-blur-3xl border-t border-white/5 pb-env(safe-area-inset-bottom, 0px)">
        <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-around px-4">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all flex-1 py-1 group",
                view === tab.id ? "text-rose" : "text-white/20 hover:text-white/60"
              )}
            >
              <div className={cn("transition-transform duration-300", view === tab.id && "-translate-y-1 scale-110")}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-[1.5px]">{tab.label}</span>
              {view === tab.id && <div className="absolute top-0 w-8 h-1 bg-rose rounded-full shadow-[0_0_12px_var(--color-rose)]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
