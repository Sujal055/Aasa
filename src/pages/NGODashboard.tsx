import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp,
  Shield,
  Home,
  Users,
  Syringe,
  Scissors,
  Calendar,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface NGODashboardProps {
  user: User;
}

export default function NGODashboard({ user }: NGODashboardProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"overview" | "campaigns" | "team">("overview");

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(data => setCampaigns(data));
    fetch('/api/team').then(r => r.json()).then(data => setTeam(data));
  }, []);

  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignToEdit, setCampaignToEdit] = useState<any>(null);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('VACCINATION');
  const [newCampaignTarget, setNewCampaignTarget] = useState('100');

  const [isAddingVolunteer, setIsAddingVolunteer] = useState(false);
  const [volunteerToEdit, setVolunteerToEdit] = useState<any>(null);
  const [newVolunteerName, setNewVolunteerName] = useState('');
  const [newVolunteerRole, setNewVolunteerRole] = useState('Field Unit');

  // Removing localStorage side-effects since we have a real backend now

  const handleCreateCampaign = async () => {
    if (!newCampaignTitle.trim()) return;
    if (campaignToEdit) {
      await fetch(`/api/campaigns/${campaignToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newCampaignTitle, type: newCampaignType, target: parseInt(newCampaignTarget) || 100 })
      });
      setCampaigns(prev => prev.map(c => c.id === campaignToEdit.id ? { ...c, title: newCampaignTitle, type: newCampaignType, target: parseInt(newCampaignTarget) || 100 } : c));
      setCampaignToEdit(null);
      setIsAddingCampaign(false);
      setNewCampaignTitle('');
      setNewCampaignTarget('100');
      return;
    }
    
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newCampaignTitle, type: newCampaignType, target: parseInt(newCampaignTarget) || 100 })
    });
    const newEntry = await response.json();
    setCampaigns(prev => [newEntry, ...prev]);
    setNewCampaignTitle('');
    setNewCampaignTarget('100');
    setIsAddingCampaign(false);
  };

  const handleCreateVolunteer = async () => {
    if (!newVolunteerName.trim()) return;
    if (volunteerToEdit) {
      await fetch(`/api/team/${volunteerToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVolunteerName, role: newVolunteerRole })
      });
      setTeam(prev => prev.map(v => v.id === volunteerToEdit.id ? { ...v, name: newVolunteerName, role: newVolunteerRole } : v));
      setVolunteerToEdit(null);
      setIsAddingVolunteer(false);
      setNewVolunteerName('');
      setNewVolunteerRole('Field Unit');
      return;
    }
    
    const col = ['var(--forest)', 'var(--sky)', 'var(--amber)', 'var(--rose)', 'var(--lavender)'][Math.floor(Math.random() * 5)];
    const response = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newVolunteerName, role: newVolunteerRole, color: col })
    });
    const newVol = await response.json();
    setTeam(prev => [newVol, ...prev]);
    setNewVolunteerName('');
    setNewVolunteerRole('Field Unit');
    setIsAddingVolunteer(false);
  };

  const handleLogImpact = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const nextCurrent = Math.min(c.current + 1, c.target);
        return {
          ...c,
          current: nextCurrent,
          progress: Math.round((nextCurrent / c.target) * 100)
        };
      }
      return c;
    }));
  };

  const tabs = [
    { id: "overview", icon: <TrendingUp size={18} />, label: "Strategy" },
    { id: "campaigns", icon: <Shield size={18} />, label: "Campaigns" },
    { id: "team", icon: <Users size={18} />, label: "Field Team" }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-32">
       {/* Redesigned Hero Header */}
       <div className="hero px-10 py-12 relative overflow-hidden bg-bg-warm" style={{ background: `linear-gradient(160deg, rgba(94, 168, 212, 0.04) 0%, transparent 55%)` }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,240,180,0.022)_1px,transparent_1px)] bg-[length:26px_26px]" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-[24px] bg-sky-dim border border-sky-600/20 flex items-center justify-center text-3xl shadow-2xl shadow-sky-500/20">
            🏢
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-dim text-sky-400 border border-sky-600/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-[2.5px] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Organizational Command
            </div>
            <h1 className="font-serif text-5xl font-black tracking-tight mb-2">Operations <span className="text-sky-400 italic font-medium">Headquarters</span></h1>
            <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl">
              Coordinating <span className="text-white">12 active campaigns</span> across Miraj and Sangli municipal wards.
            </p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setIsAddingCampaign(true)} className="btn-p !bg-sky-500 text-[#1a1208] shadow-sky-900/40">Launch Campaign +</button>
          </div>
        </div>
      </div>

      <div className="px-10 mt-10">
        <AnimatePresence mode="wait">
          {view === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { l: "Total Rescues/Impact", v: campaigns.reduce((acc, c) => acc + c.current, 0).toString(), i: "📈", c: "var(--sky)" },
                   { l: "Active Campaigns", v: campaigns.length.toString(), i: "🎯", c: "var(--amber)" },
                   { l: "Active Volunteers", v: team.length.toString(), i: "🤝", c: "var(--forest)" }
                 ].map((s, i) => (
                   <div key={i} className="glass-card p-8 rounded-[32px] border-white/5 relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">{s.i}</div>
                      <div className="font-mono text-[10px] font-bold text-white/20 uppercase tracking-[3px] mb-2">{s.l}</div>
                      <div className="font-serif text-5xl font-black italic" style={{ color: s.c }}>{s.v}</div>
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                 <div className="lg:col-span-3 space-y-8">
                    <h2 className="font-serif text-3xl font-black italic">Strategic <span className="text-sky-400">Roadmap</span></h2>
                    <div className="space-y-4">
                      {campaigns.map(c => (
                        <div key={c.id} className="glass-card p-8 rounded-[40px] border-white/5 group hover:border-sky-500/20 transition-all cursor-pointer" onClick={() => setSelectedCampaign(c)}>
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-6">
                                 <div className={cn(
                                   "w-16 h-16 rounded-[24px] flex items-center justify-center text-white shrink-0 shadow-2xl",
                                   c.type === 'VACCINATION' ? "bg-sky-500 text-[#1a1208]" : "bg-amber-500 text-[#1a1208]"
                                 )}>
                                    {c.type === 'VACCINATION' ? <Syringe size={32} /> : <Scissors size={32} />}
                                 </div>
                                 <div>
                                    <h3 className="font-serif font-black text-2xl mb-1">{c.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-bold text-white/20 uppercase font-mono tracking-widest">
                                       <span>{c.deadline}</span>
                                       <span>·</span>
                                       <span className="text-sky-400">{c.current} / {c.target} IMPACTED</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="text-4xl font-serif font-black opacity-40">{c.progress}%</div>
                              </div>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className={cn("h-full transition-all duration-1000", c.type === 'VACCINATION' ? "bg-sky-500" : "bg-amber-500")} style={{ width: `${c.progress}%` }} />
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 rounded-[40px] border-white/5">
                       <h3 className="font-serif text-xl font-bold mb-6 italic">Field Resource Status</h3>
                       <div className="space-y-6">
                          {[
                            { n: "Field Unit", l: team.filter(t => t.r === "Field Unit").length, total: team.length || 1, c: "var(--forest)" },
                            { n: "Rescue Coord", l: team.filter(t => t.r === "Rescue Coord").length, total: team.length || 1, c: "var(--sky)" },
                            { n: "Vet Officer", l: team.filter(t => t.r === "Vet Officer").length, total: team.length || 1, c: "var(--lavender)" },
                          ].map((r, i) => (
                            <div key={i} className="space-y-2">
                               <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                  <span className="text-white/60">{r.n}</span>
                                  <span style={{ color: r.c }}>{r.l} Members</span>
                               </div>
                               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full transition-all" style={{ width: `${(r.l / r.total) * 100}%`, backgroundColor: r.c }} />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border-sky-500/20 bg-sky-500/5">
                       <h3 className="font-serif text-xl font-bold mb-4 italic text-sky-400 text-center">Executive Intelligence</h3>
                       <p className="text-sm italic text-white/40 leading-relaxed text-center font-medium">
                         Weekly rescue trends show a 14% increase in the Miraj sector. Suggesting shifting of two mobile vaccination units to Ward 4.
                       </p>
                       <button onClick={() => alert('Generating Comprehensive Strategic Audit...')} className="btn-g w-full mt-6 !py-4 border-sky-500/20 hover:bg-sky-500/10 text-sky-400">Generate Full Audit →</button>
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          {view === "campaigns" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <div className="flex justify-between items-center">
                  <h2 className="font-serif text-4xl font-black italic">Active <span className="text-sky-400">Campaigns</span></h2>
                  <button onClick={() => setIsAddingCampaign(true)} className="btn-p !bg-sky-500 text-[#1a1208]">Launch Node +</button>
               </div>
               <div className="grid gap-6">
                  {campaigns.map(c => (
                     <div key={c.id} className="glass-card p-10 rounded-[48px] border-white/5 flex flex-col md:flex-row gap-10 items-center">
                        <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
                           {c.type === 'VACCINATION' ? '💉' : '✂️'}
                        </div>
                        <div className="flex-1">
                           <h3 className="font-serif text-3xl font-black italic mb-2">{c.title}</h3>
                           <div className="flex gap-6 items-center text-xs font-mono font-bold uppercase tracking-[2px] text-white/20">
                              <span>Target: {c.target}</span>
                              <span className="text-sky-400">Impacted: {c.current}</span>
                           </div>
                        </div>
                        <div className="w-32 text-center">
                           <div className="text-4xl font-serif font-black text-sky-400">{c.progress}%</div>
                           <div className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[2px]">Pipeline</div>
                        </div>
                        <button onClick={() => setSelectedCampaign(c)} className="btn-g !py-4 !px-8 !rounded-2xl border-white/5 hover:bg-white/10">Manage Node</button>
                     </div>
                  ))}
               </div>
            </motion.div>
          )}

          {view === "team" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="flex justify-between items-center">
                  <h2 className="font-serif text-4xl font-black italic">Field <span className="text-sky-400">Force</span></h2>
                  <button onClick={() => setIsAddingVolunteer(true)} className="btn-p !bg-forest text-white shadow-forest/40">Recruit Volunteer +</button>
               </div>
               
               {team.length === 0 ? (
                 <div className="glass-card p-12 rounded-[40px] border-white/5 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="text-6xl mb-2">🧑‍🤝‍🧑</div>
                    <div className="font-serif text-2xl font-black">No Volunteers Yet</div>
                    <div className="text-white/40 max-w-sm">Build your ground team to execute campaigns faster. Click the recruit button to get started.</div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map((member) => (
                      <div key={member.id} className="glass-card p-8 rounded-[40px] border-white/5 group hover:border-sky-500/20 transition-all cursor-pointer relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 flex gap-2">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setVolunteerToEdit(member);
                               setNewVolunteerName(member.name);
                               setNewVolunteerRole(member.role);
                               setIsAddingVolunteer(true);
                             }}
                             className="text-white/10 hover:text-sky-400 transition-colors"
                           >✎</button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setTeam(prev => prev.filter(v => v.id !== member.id));
                             }}
                             className="text-white/10 hover:text-rose-500 transition-colors"
                           >✕</button>
                         </div>
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center font-serif text-xl font-black shrink-0" style={{ background: `${member.color}20`, color: member.color }}>{member.name.charAt(0)}</div>
                            <div>
                               <div className="font-serif font-black text-lg mb-1">{member.name}</div>
                               <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{member.role}</div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/5 bg-white/5">{member.status || "Active"}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {isAddingCampaign && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-paper/60 backdrop-blur-3xl">
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-lg w-full p-10 rounded-[40px] space-y-8 relative">
            <button onClick={() => {
              setIsAddingCampaign(false);
              setCampaignToEdit(null);
              setNewCampaignTitle('');
              setNewCampaignType('VACCINATION');
              setNewCampaignTarget('100');
            }} className="absolute top-8 right-8 text-white/20 hover:text-white">✕</button>
            <h2 className="font-serif text-3xl font-black italic">{campaignToEdit ? "Edit" : "Initiate"} <span className="text-sky-400">Campaign</span></h2>
            <div className="space-y-6">
               <div className="group">
                 <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[3px] block mb-2 transition-colors group-focus-within:text-sky-400">Campaign Title</label>
                 <input 
                  autoFocus
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  placeholder="e.g. Ward 4 Sterilization" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-sky-500/60 focus:bg-white/10 text-base text-white transition-all shadow-inner" 
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="group">
                   <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[3px] block mb-2 transition-colors group-focus-within:text-sky-400">Type</label>
                   <select 
                    value={newCampaignType}
                    onChange={(e) => setNewCampaignType(e.target.value)}
                    className="w-full p-5 rounded-3xl bg-transparent border border-white/10 outline-none focus:border-sky-500/60 focus:bg-white/5 text-base text-white transition-all" 
                   >
                     <option value="VACCINATION" className="bg-paper text-white">Vaccination</option>
                     <option value="STERILIZATION" className="bg-paper text-white">Sterilization</option>
                     <option value="AWARENESS" className="bg-paper text-white">Awareness</option>
                     <option value="WELFARE" className="bg-paper text-white">Welfare Intervention</option>
                   </select>
                 </div>
                 <div className="group">
                   <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[3px] block mb-2 transition-colors group-focus-within:text-sky-400">Target Count</label>
                   <input 
                    type="number"
                    value={newCampaignTarget}
                    onChange={(e) => setNewCampaignTarget(e.target.value)}
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-sky-500/60 focus:bg-white/10 text-base text-white transition-all shadow-inner" 
                   />
                 </div>
               </div>
               <div className="flex gap-4">
                  <button className="flex-1 btn-g !py-4 border-white/5 hover:bg-white/10" onClick={() => {
                    setIsAddingCampaign(false);
                    setCampaignToEdit(null);
                    setNewCampaignTitle('');
                    setNewCampaignType('VACCINATION');
                    setNewCampaignTarget('100');
                  }}>Cancel</button>
                  <button className="flex-[2] btn-p !py-4 !bg-sky-500 text-[#1a1208] shadow-sky-900/40" onClick={handleCreateCampaign} disabled={!newCampaignTitle.trim()}>
                    {campaignToEdit ? 'Save Changes' : 'Launch Node'}
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {isAddingVolunteer && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-paper/60 backdrop-blur-3xl">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-lg w-full p-10 rounded-[40px] space-y-8 relative">
            <button onClick={() => {
              setIsAddingVolunteer(false);
              setVolunteerToEdit(null);
              setNewVolunteerName('');
              setNewVolunteerRole('Field Unit');
            }} className="absolute top-8 right-8 text-white/20 hover:text-white">✕</button>
            <h2 className="font-serif text-3xl font-black italic">{volunteerToEdit ? "Edit" : "Recruit"} <span style={{color: 'var(--forest)'}}>Volunteer</span></h2>
            <div className="space-y-6">
               <div className="group">
                 <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[3px] block mb-2 transition-colors">Full Name</label>
                 <input 
                  autoFocus
                  value={newVolunteerName}
                  onChange={(e) => setNewVolunteerName(e.target.value)}
                  placeholder="e.g. Meera Patil" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:bg-white/10 text-base text-white transition-all shadow-inner" 
                 />
               </div>
               <div className="group">
                 <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[3px] block mb-2 transition-colors">Role</label>
                 <select 
                  value={newVolunteerRole}
                  onChange={(e) => setNewVolunteerRole(e.target.value)}
                  className="w-full p-5 rounded-3xl bg-transparent border border-white/10 outline-none focus:bg-white/5 text-base text-white transition-all" 
                 >
                   <option value="Field Unit" className="bg-paper text-white">Field Case Unit</option>
                   <option value="Rescue Coord" className="bg-paper text-white">Rescue Coordinator</option>
                   <option value="Vet Officer" className="bg-paper text-white">Veterinary Officer</option>
                   <option value="Humane Educator" className="bg-paper text-white">Humane Educator</option>
                   <option value="Sanctuary Caretaker" className="bg-paper text-white">Sanctuary Caretaker</option>
                 </select>
               </div>
               <div className="flex gap-4">
                  <button className="flex-1 btn-g !py-4 border-white/5 hover:bg-white/10" onClick={() => {
                    setIsAddingVolunteer(false);
                    setVolunteerToEdit(null);
                    setNewVolunteerName('');
                    setNewVolunteerRole('Field Unit');
                  }}>Cancel</button>
                  <button className="flex-[2] btn-p !py-4" style={{ backgroundColor: 'var(--forest)', color: '#1a1208' }} onClick={handleCreateVolunteer} disabled={!newVolunteerName.trim()}>
                    {volunteerToEdit ? "Save Changes" : "Add Volunteer"}
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedCampaign && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-paper/60 backdrop-blur-3xl">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card max-w-2xl w-full p-12 rounded-[48px] space-y-10 relative">
            <button onClick={() => setSelectedCampaign(null)} className="absolute top-10 right-10 text-white/20 hover:text-white">✕</button>
            <div>
              <div className="font-mono text-[10px] font-bold text-sky-400 tracking-[5px] uppercase mb-2">Live Campaign Tracking</div>
              <h2 className="font-serif text-4xl font-black italic">{selectedCampaign.title}</h2>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 rounded-[32px] bg-white/5 border border-white/5">
                 <div className="text-4xl font-serif font-black mb-1">{selectedCampaign.current}</div>
                 <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Total Tagged</div>
              </div>
              <div className="p-8 rounded-[32px] bg-white/5 border border-white/5">
                 <div className="text-4xl font-serif font-black mb-1">{selectedCampaign.target}</div>
                 <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Sector Target</div>
              </div>
            </div>
            <div className="flex gap-4">
               <button 
                 className="flex-[2] btn-p !bg-sky-500 text-[#1a1208] !py-4 shadow-sky-900/40" 
                 onClick={() => {
                   handleLogImpact(selectedCampaign.id);
                   setSelectedCampaign(prev => ({...prev, current: Math.min(prev.current + 1, prev.target), progress: Math.round(((prev.current + 1) / prev.target) * 100)}));
                 }}
               >
                 Log New Impact +1
               </button>
               <button className="flex-1 btn-g py-4 border-white/10" onClick={() => {
                 setCampaignToEdit(selectedCampaign);
                 setNewCampaignTitle(selectedCampaign.title);
                 setNewCampaignType(selectedCampaign.type);
                 setNewCampaignTarget(selectedCampaign.target.toString());
                 setIsAddingCampaign(true);
                 setSelectedCampaign(null);
               }}>Edit Info</button>
               <button className="flex-1 btn-g py-4 border-white/10 text-rose-500" onClick={() => {
                 setCampaigns(prev => prev.filter(c => c.id !== selectedCampaign.id));
                 setSelectedCampaign(null);
               }}>End Campaign</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] bg-bg-warm/88 backdrop-blur-3xl border-t border-white/5 pb-env(safe-area-inset-bottom, 0px)">
        <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-around px-4">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all flex-1 py-1 group",
                view === tab.id ? "text-sky-400" : "text-white/20 hover:text-white/60"
              )}
            >
              <div className={cn("transition-transform duration-300", view === tab.id && "-translate-y-1 scale-110")}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-[1.5px]">{tab.label}</span>
              {view === tab.id && <div className="absolute top-0 w-8 h-1 bg-sky-500 rounded-full shadow-[0_0_12px_var(--color-sky)]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
