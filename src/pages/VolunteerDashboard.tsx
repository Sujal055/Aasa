import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Icon } from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  MapPin,
  List, 
  CheckCircle2, 
  Navigation, 
  AlertTriangle,
  ArrowRight,
  Phone,
  MessageSquare,
  Dog,
  Activity,
  X,
  Clock,
  Home,
  Handshake,
  LayoutDashboard,
  Shield,
  Zap
} from 'lucide-react';
import { User, AnimalRecord, RescueStatus } from '../types';
import { cn, formatDate } from '../lib/utils';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface VolunteerDashboardProps {
  user: User;
}

const ubadge = (u: string) => u === "critical" || u === "HIGH" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : u === "moderate" || u === "MEDIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

function Steps({ steps, cur }: { steps: string[], cur: number }) {
  return (
    <div className="flex items-center gap-1 flex-wrap mt-2">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={cn(
            "text-[8px] px-2 py-0.5 rounded-full font-mono font-bold border transition-all",
            i < cur ? "bg-emerald-500/12 text-emerald-500 border-emerald-500/28" : 
            i === cur ? "bg-amber-500/18 text-amber-500 border-amber-500/28 animate-pulse" : 
            "bg-white/5 text-white/20 border-white/5"
          )}>{s}</span>
          {i < steps.length - 1 && <span className="text-[8px] text-white/10 italic">▶</span>}
        </span>
      ))}
    </div>
  );
}

export default function VolunteerDashboard({ user }: VolunteerDashboardProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"dash" | "map" | "cases" | "connect">("dash");
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const [cases, setCases] = useState<any[]>([]);

  const [vets, setVets] = useState([
    { id: 1, n: "Dr. Suresh Patil", r: "Ward 3 Clinic", status: "Open / Available", col: "var(--sky)" },
    { id: 2, n: "Dr. Anita Joshi", r: "Ward 5 Gov Hospital", status: "Surgery in progress", col: "var(--lavender)" },
    { id: 3, n: "Muni Vet Team", r: "Mobile Unit", status: "0.8km away", col: "var(--forest)" }
  ]);
  const [selectedVetToCall, setSelectedVetToCall] = useState<any>(null);

  const handleConfirmCall = () => {
    if (!selectedVetToCall) return;
    const origStatus = selectedVetToCall.status;
    setVets(prev => prev.map(v => v.id === selectedVetToCall.id ? { ...v, status: 'BUSY' } : v));
    setTimeout(() => {
      setVets(prev => prev.map(v => v.id === selectedVetToCall.id && v.status === 'BUSY' ? { ...v, status: origStatus } : v));
    }, 5 * 60 * 1000);
    setSelectedVetToCall(null);
  };

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch('/api/rescues?role=VOLUNTEER');
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const mapped = data.map((r: any) => ({
        id: r.id,
        aasaId: r.aasaId || r.id,
        title: `SOS: ${r.species} — ${r.condition || 'Unknown condition'}`,
        species: r.species,
        status: r.status,
        urgency: r.urgency,
        condition: r.condition,
        photo: r.photo || r.image || '',
        notes: r.notes || '',
        location: {
          lat: r.lat || 16.8524,
          lng: r.lng || 74.5815,
          address: r.address || r.location || 'Sangli, Maharashtra'
        },
        createdAt: r.date,
        reporter: 'Citizen Portal',
        volunteerId: r.volunteerId,
        steps: ['Reported', 'Assigned', 'Rescued', 'Care', 'Released'],
        cur: r.cur ?? (r.status === 'Pending' ? 0 : r.status === 'In Progress' ? 1 : r.status === 'Resolved' ? 4 : 0)
      }));
      setCases(mapped);
    } catch (err) {
      console.error('Error fetching cases', err);
    }
  }, []);

  // Initial fetch + 15s polling
  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 15000);
    return () => clearInterval(interval);
  }, [fetchCases]);

  const tabs = [
    { id: "dash", icon: <Home size={18} />, label: "Grid" },
    { id: "map", icon: <MapIcon size={18} />, label: "Live Map" },
    { id: "cases", icon: <LayoutDashboard size={18} />, label: "Pipeline" },
    { id: "connect", icon: <Handshake size={18} />, label: "Coord" }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-32">
       {/* Redesigned Hero Header */}
       <div className="hero px-10 py-12 relative overflow-hidden bg-bg-warm" style={{ background: `linear-gradient(160deg, rgba(90, 173, 110, 0.04) 0%, transparent 55%)` }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,240,180,0.022)_1px,transparent_1px)] bg-[length:26px_26px]" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-[24px] bg-forest-dim border border-forest-600/20 flex items-center justify-center text-3xl shadow-2xl shadow-forest-500/20">
            🤝
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-dim text-forest-400 border border-forest-600/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-[2.5px] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" />
              Field Operations Active
            </div>
            <h1 className="font-serif text-5xl font-black tracking-tight mb-2">Rescue <span className="text-forest italic font-medium">Operations</span></h1>
            <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl">
              Monitor the district for incoming reports. Your response rate is <span className="text-white">98% across 142 rescues</span>.
            </p>
            <div className="flex gap-10 mt-6">
              {[["142", "Rescues"], ["3", "Active"], ["12m", "ETA"]].map(([v, l]) => (
                <div key={l}><div className="font-serif text-3xl font-bold text-forest">{v}</div><div className="font-mono text-[9px] text-white/20 uppercase tracking-[1.5px] mt-1">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 mt-10">
        <AnimatePresence mode="wait">
          {view === "dash" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { v: String(cases.filter(c => c.urgency === 'High' && c.status !== 'Resolved').length), l: "Critical Cases", c: "var(--rose)", i: "🚨", s: "Live" },
                  { v: String(cases.filter(c => c.status === 'In Progress').length), l: "Active Rescues", c: "var(--forest)", i: "✅", s: "Live" },
                  { v: String(cases.length), l: "Open Cases", c: "var(--sky)", i: "📊", s: "Live" },
                  { v: String(cases.filter(c => c.cur >= 3).length), l: "In Care", c: "var(--lavender)", i: "🏠", s: "Live" }
                ].map((k, i) => (
                  <div key={i} className="glass-card p-6 rounded-[24px] relative border-white/5 transition-all hover:bg-white/5">
                     <div className="absolute top-6 right-6 opacity-20 text-xl">{k.i}</div>
                     <div className="text-4xl font-serif font-black mb-1" style={{ color: k.c }}>{k.v}</div>
                     <div className="font-mono text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">{k.l}</div>
                     <div className="inline-block px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider" style={{ background: `${k.c}18`, color: k.c }}>{k.s}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-2xl font-black flex items-center gap-2">
                      <Shield size={24} className="text-forest" />
                      Assigned Field Cases
                    </h2>
                    <button onClick={() => setView('map')} className="btn-g !py-2 !px-4 text-[10px] uppercase font-bold tracking-widest border-white/5">Launch Tactical Map</button>
                  </div>

                  <div className="grid gap-4">
                    {cases.map((c) => (
                      <div key={c.id} className={cn(
                        "glass-card p-6 rounded-[32px] border-l-4 border-white/5 hover:translate-x-1 transition-all group cursor-pointer relative overflow-hidden",
                        c.urgency === 'HIGH' ? "border-l-rose-500/60" : "border-l-amber-500/60"
                      )} onClick={() => setSelectedCase(c)}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 italic font-black text-4xl">COORD</div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <code className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-lg text-white/40">{c.id}</code>
                               <span className={cn("badge text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md", ubadge(c.urgency))}>{c.urgency}</span>
                            </div>
                            <h3 className="font-serif font-black text-xl">{c.title}</h3>
                          </div>
                          <button onClick={() => setSelectedCase(c)} className="btn-g !p-3 !rounded-xl border-white/5 group-hover:border-forest/30">
                            <Navigation size={18} className="text-forest" />
                          </button>
                        </div>
                        <div className="text-xs text-white/40 mb-4 font-medium italic">📍 {c.location.address} · Reporter: <span className="text-sky-400 font-bold">{c.reporter}</span></div>
                        <Steps steps={c.steps} cur={c.cur} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8 rounded-[40px] border-white/5 space-y-8">
                    <h3 className="font-serif text-lg font-bold">Patrol Log Today</h3>
                    <div className="space-y-4 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5" />
                      {[
                        { t: "09:00", task: "Pickup Kaali from Ward 5", done: true },
                        { t: "10:30", task: "Drop at PawCare Shelter", done: true },
                        { t: "12:00", task: "Vet appt — Dr. Patil", done: false },
                        { t: "14:00", task: "Ward 3 patrol + tagging", done: false },
                      ].map((s, i) => (
                        <div key={i} className="flex gap-6 relative z-10">
                          <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors", s.done ? "bg-forest border-forest text-[#1a1208]" : "bg-bg-warm border-white/10 text-white/20")}>
                            {s.done ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                          </div>
                          <div className="flex-1 pt-1 pb-4 border-b border-white/5">
                            <div className={cn("text-xs font-bold font-mono tracking-widest leading-none mb-1", s.done ? "text-white/20" : "text-forest")}>{s.t}</div>
                            <div className={cn("text-sm font-medium", s.done ? "text-white/20 line-through italic" : "text-white/80")}>{s.task}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-[40px] border-white/5">
                    <h3 className="font-serif text-lg font-bold mb-6 italic">Quick Connect</h3>
                    <div className="space-y-3">
                         {[
                           { n: "PawCare NGO", r: "Shelter Node", col: "var(--forest)" },
                           { n: "Rajesh Kumar", r: "Reporter · CASE-2481", col: "var(--sky)" },
                           { n: "Admin Sanjay", r: "System Dispatch", col: "var(--amber)" }
                         ].map((p, i) => (
                           <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110" style={{ background: `${p.col}18`, color: p.col }}>{p.n.slice(0,2)}</div>
                             <div className="flex-1">
                               <div className="text-sm font-bold">{p.n}</div>
                               <div className="text-[10px] text-white/30 font-medium">{p.r}</div>
                             </div>
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           </div>
                         ))}
                    </div>
                    <button onClick={() => setView('connect')} className="btn-p w-full mt-6 !py-4 border-none !bg-forest shadow-forest-900/40 text-[#1a1208]">Open Command Center →</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === "map" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="font-serif text-3xl font-black italic">Tactical <span className="text-forest">Map Viewer</span></h2>
                 <div className="flex gap-3">
                    <button className="btn-g !rounded-xl !py-2 border-white/5">Filter Critical</button>
                    <button onClick={() => setView('dash')} className="btn-g !rounded-xl !py-2 border-white/5">Back to Grid</button>
                 </div>
              </div>
              <div className="h-[600px] glass-card rounded-[48px] overflow-hidden relative border-white/10 shadow-2xl">
                <MapContainer center={[16.8524, 74.5815]} zoom={14} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MarkerClusterGroup key={cases.length} chunkedLoading>
                    {cases.map((c) => (
                      <Marker key={c.id} position={[c.location.lat, c.location.lng]} icon={defaultIcon}>
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                             <div className="font-mono text-[9px] font-bold text-forest uppercase mb-1">AASA CASE NODE</div>
                             <div className="font-serif font-black text-base italic mb-1">{c.species} Alert</div>
                             <div className="text-[10px] text-white/40 italic mb-4 leading-tight">{c.location.address}</div>
                             <button onClick={() => setSelectedCase(c)} className="btn-p w-full !py-2 !text-[10px] !bg-forest text-[#1a1208] shadow-none">Go Inside Case →</button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MarkerClusterGroup>
                  <MapResizer />
                </MapContainer>
                <div className="absolute bottom-10 left-10 z-[100] glass-card p-6 rounded-[32px] border-forest/20 shadow-2xl max-w-xs">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-forest/20 text-forest flex items-center justify-center font-black">!</div>
                      <div className="font-serif font-black italic">Map Protocol</div>
                   </div>
                   <p className="text-[10px] text-white/40 leading-relaxed font-medium italic border-l-2 border-forest/40 pl-3">
                     Nodes are color-coded by urgency. Red nodes indicate high priority rescue operations needing immediate field dispatch.
                   </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === "cases" && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <h2 className="font-serif text-3xl font-black italic">Rescue <span className="text-forest">Pipeline</span></h2>
                <div className="grid gap-6">
                  {cases.map(c => (
                    <div key={c.id} className="glass-card p-10 rounded-[48px] border-white/5 group hover:border-forest/20 transition-all flex flex-col md:flex-row gap-10">
                       <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform shrink-0">
                         {c.species === 'Dog' ? '🐕' : '🐄'}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                               <div className="font-mono text-[10px] font-black text-forest tracking-[5px] uppercase mb-2">Live Operation Node</div>
                               <h3 className="font-serif text-3xl font-black italic">{c.title}</h3>
                             </div>
                             <span className={cn("badge text-[9px] font-black p-2 rounded-xl border tracking-widest leading-none", ubadge(c.urgency))}>{c.urgency} URGENCY</span>
                          </div>
                          <div className="text-sm text-white/40 italic flex items-center gap-4 mb-6">
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-forest" /> {c.location.address}</span>
                            <span className="flex items-center gap-1.5"><Activity size={14} className="text-forest" /> Stage: {c.steps[c.cur]}</span>
                          </div>
                          <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                             <div className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[4px] mb-4">Pipeline Status</div>
                             <Steps steps={c.steps} cur={c.cur} />
                          </div>
                       </div>
                       <div className="flex flex-col gap-3 shrink-0 justify-center">
                          <button onClick={() => setSelectedCase(c)} className="btn-p !bg-forest text-[#1a1208] !py-4 !px-8 !rounded-2xl">Update Status</button>
                          <button 
                            onClick={() => {
                              const { lat, lng } = c.location;
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                            }}
                            className="btn-g border-white/5 !py-4 !px-8 !rounded-2xl hover:bg-white/10"
                          >
                             Navigate
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

          {view === "connect" && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <h2 className="font-serif text-4xl font-black italic">Operations <span className="text-forest">Command</span></h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="glass-card p-10 rounded-[48px] border-white/5 space-y-8">
                      <div className="flex items-center gap-4 mb-2">
                         <div className="w-12 h-12 rounded-2xl bg-forest/20 text-forest flex items-center justify-center text-xl">🩺</div>
                         <h3 className="font-serif font-black text-2xl italic">Veterinary Coordination</h3>
                      </div>
                      <div className="space-y-4">
                        {vets.map((v) => (
                           <div key={v.id} className="flex items-center gap-5 p-4 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm" style={{ background: `${v.col}18`, color: v.col }}>DR</div>
                              <div className="flex-1">
                                 <div className="font-serif font-black text-lg">{v.n}</div>
                                 <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{v.r}</div>
                              </div>
                              <div className="text-right">
                                 <div className={cn("text-[10px] font-bold mb-1", v.status === 'BUSY' ? 'text-amber-500' : 'text-emerald-400')}>{v.status}</div>
                                 <button onClick={() => setSelectedVetToCall(v)} className="text-[9px] text-white/20 font-black tracking-widest leading-none border-b border-white/5 pb-0.5 hover:text-white hover:border-white transition-all">ESTABLISH LINK</button>
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="glass-card p-10 rounded-[48px] border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl">🛡️</div>
                         <h3 className="font-serif font-black text-2xl italic text-amber-500 mb-6">Escalate to Admin</h3>
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[4px] ml-4">Escalation Reason</label>
                               <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-amber-500/60 outline-none appearance-none">
                                  <option>Resource Shortage — Shelter Full</option>
                                  <option>Security Risk — Hostile Crowd</option>
                                  <option>Critical Medical Emergency</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[4px] ml-4">Detail Protocol</label>
                               <textarea className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-sm focus:border-amber-500/60 transition-all outline-none h-32 resize-none italic" placeholder="Request additional support node..." />
                            </div>
                            <button className="btn-p w-full !py-4 !bg-amber-600 !shadow-amber-900/40 text-[#1a1208]">Launch Admin Override</button>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedCase && (
          <CaseDetailsModal 
            caseData={selectedCase} 
            onClose={() => setSelectedCase(null)} 
            onUpdateCase={(updatedCase) => {
              setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
              setSelectedCase(updatedCase);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVetToCall && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-paper/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card max-w-sm w-full p-8 rounded-[32px] border-white/10 space-y-6">
               <h3 className="font-serif font-black text-2xl italic text-sky-400">Establish Link</h3>
               <p className="text-white/60 text-sm">Are you sure you want to initiate a call with <span className="font-bold text-white">{selectedVetToCall.n}</span>?</p>
               <div className="flex gap-4">
                 <button onClick={() => setSelectedVetToCall(null)} className="flex-1 btn-g border-white/10 !py-3">Cancel</button>
                 <button onClick={handleConfirmCall} className="flex-1 btn-p !bg-sky-500 text-[#1a1208] !py-3 shadow-sky-900/40">Confirm</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-[200] bg-bg-warm/88 backdrop-blur-3xl border-t border-white/5 pb-env(safe-area-inset-bottom, 0px)">
        <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-around px-4">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all flex-1 py-1 group",
                view === tab.id ? "text-forest" : "text-white/20 hover:text-white/60"
              )}
            >
              <div className={cn("transition-transform duration-300", view === tab.id && "-translate-y-1 scale-110")}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-[1.5px]">{tab.label}</span>
              {view === tab.id && <div className="absolute top-0 w-8 h-1 bg-forest rounded-full shadow-[0_0_12px_var(--color-forest)]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseDetailsModal({ caseData, onClose, onUpdateCase, user }: { caseData: any, onClose: () => void, onUpdateCase: (c: any) => void, user?: User }) {
  const [step, setStep] = useState(caseData.cur);
  const steps = caseData.steps || ['REPORTED', 'ASSIGNED', 'RESCUED', 'CARE', 'RELEASED'];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-paper/60 backdrop-blur-3xl">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="glass-card w-full max-w-2xl rounded-[48px] overflow-hidden relative shadow-[0_32px_120px_-16px_rgba(0,0,0,0.8)] border-white/10"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all z-10">
          <X size={28} />
        </button>

        <div className="p-12 space-y-10">
           <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-linear-to-br from-forest to-forest-600 text-[#1a1208] shadow-xl shrink-0">
                 <Activity size={24} />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-black tracking-tight">{caseData.species} Rescue Operation</h2>
                <p className="font-mono text-[9px] font-bold text-forest tracking-[4px] uppercase mt-1">{caseData.aasaId} · Sangli Operations Node</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-white/20">Location Details</label>
                 <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-3">
                   <MapPin size={24} className="text-secondary shrink-0" />
                   <p className="text-sm font-bold text-white/80 leading-relaxed">{caseData.location.address}</p>
                 </div>
              </div>

              <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-3 mb-2">
                   <AlertTriangle size={20} className="text-rose-500" />
                   <span className="font-serif font-bold text-rose-500 italic">Priority Triage</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-500/60 font-medium italic">
                  {caseData.urgency} urgency reported. AI assessment mentions possible external injury. Proceed with stabilization gear.
                </p>
              </div>
            </div>

            <div className="space-y-4">
               <label className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-white/20 text-center block">Rescue Pipeline</label>
               <div className="space-y-3 relative pl-6">
                 {steps.map((s, i) => (
                   <div key={s} className="relative flex items-center gap-4 py-2 group">
                     {/* Connector line */}
                     {i < steps.length - 1 && (
                       <div className={cn(
                         "absolute top-5 left-[-13px] w-0.5 h-[calc(100%+0.75rem)]",
                         i < step ? "bg-forest" : "bg-white/10"
                       )} />
                     )}
                     
                     <div className={cn(
                        "absolute left-[-19px] w-3.5 h-3.5 rounded-full border-2 transition-all duration-500",
                        i < step ? "bg-forest border-forest shadow-[0_0_8px_rgba(90,173,110,0.5)]" : 
                        i === step ? "bg-[#1a1208] border-forest animate-pulse" : "bg-[#1a1208] border-white/20"
                     )} />

                     <span className={cn(
                       "font-mono text-[10px] font-bold tracking-widest uppercase transition-colors duration-300",
                       i <= step ? "text-white" : "text-white/20"
                     )}>
                       {s.replace('_', ' ')}
                     </span>
                     {i < step && <CheckCircle2 size={12} className="text-emerald-500" />}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
               onClick={() => {
                 const { lat, lng } = caseData.location;
                 window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
               }}
               className="btn-g flex-1 flex items-center justify-center gap-2 !py-4 border-white/5 hover:bg-white/10"
            >
              <Navigation size={20} /> Open Track
            </button>
            <button 
               onClick={async () => {
                 const nextStep = Math.min(step + 1, steps.length - 1);
                 const newStatus = nextStep === 0 ? 'Pending' : nextStep === 1 ? 'In Progress' : nextStep >= 4 ? 'Resolved' : 'In Progress';
                 try {
                   await fetch(`/api/rescues/${caseData.id}`, {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ status: newStatus, volunteerId: user?.id, cur: nextStep })
                   });
                 } catch (err) {
                   console.error('Error updating case', err);
                 }
                 setStep(nextStep);
                 onUpdateCase({ ...caseData, cur: nextStep, status: newStatus });
               }}
               className="btn-p !bg-forest text-[#1a1208] flex-1 flex items-center justify-center gap-2 !py-4"
             >
                Validate Stage <ArrowRight size={20} />
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}
