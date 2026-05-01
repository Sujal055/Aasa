import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  AlertCircle, 
  X,
  Zap,
  Activity,
  Dog,
  BrainCircuit,
  Plus,
  Home,
  Navigation,
  Handshake,
  LayoutDashboard,
  Filter,
  Users,
  Search,
  ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Icon } from 'leaflet';
import { User, AnimalRecord } from '../types';
import { analyzeStraysImage } from '../services/geminiService';
import { cn, formatDate } from '../lib/utils';

interface CitizenDashboardProps {
  user: User;
}

const aEmoji = (t: string) => t === "Dog" ? "🐕" : t === "Cow" ? "🐄" : "🐈";
const sdot = (s: string) => s === "stable" ? "bg-emerald-500" : s === "moderate" ? "bg-amber-500" : "bg-rose-500";
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

function QuickAIHub({ onScan, clear, aiAssessment, setView, isScanning }: { onScan: (file: File) => void, clear: () => void, aiAssessment: any, setView: (v: any) => void, isScanning: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ai-banner flex flex-col p-8 rounded-[40px] bg-lavender-dim border border-lavender-600/20 fu relative overflow-hidden group">
      <input 
        type="file" 
        ref={fileRef} 
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onScan(f);
        }} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={camRef} 
        capture="environment"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onScan(f);
        }} 
        accept="image/*" 
        className="hidden" 
      />
      
      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
           <Zap size={40} className="text-lavender-400 animate-pulse" />
           <div className="font-serif text-xl font-bold italic">Neural Computing...</div>
           <p className="text-[10px] text-white/20 uppercase tracking-[4px] font-mono">Analyzing Stray Biometrics</p>
        </div>
      ) : aiAssessment ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-[9px] font-black text-lavender-400 tracking-[3px] uppercase mb-1">Triage Assessment</div>
              <h3 className="font-serif text-3xl font-black italic">{aiAssessment.species}</h3>
            </div>
            <button onClick={clear} className="p-2 rounded-full hover:bg-white/10 text-white/40 transition-colors"><X size={20} /></button>
          </div>
          
          <div className="flex gap-2">
            <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-bold border", ubadge(aiAssessment.urgency))}>
              {aiAssessment.urgency} URGENCY
            </div>
            <div className="px-2 py-0.5 rounded-lg text-[8px] font-bold border bg-white/5 border-white/10 text-white/40">
              {aiAssessment.condition}
            </div>
          </div>

          <p className="text-sm text-white/60 italic line-clamp-2 border-l-2 border-lavender-500/40 pl-4">
            "{aiAssessment.assessment}"
          </p>
          
          <div className="flex items-center gap-3">
             <button onClick={() => setView('report')} className="flex-1 btn-p !bg-rose-600 !text-white !py-3 !rounded-2xl !text-xs shadow-rose-900/40 flex items-center justify-center gap-2">
               <AlertCircle size={14} />
               Report SOS Case
             </button>
             <button onClick={clear} className="btn-g border-white/10 text-white/40 !px-4 hover:bg-white/5 !rounded-2xl">Dismiss</button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-lavender-dim border border-lavender-600/30 flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-all">🤖</div>
            <div>
              <div className="font-serif font-black text-xl">AASA Neural Scanner</div>
              <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-mono">Vision Triage Node</div>
            </div>
          </div>
          <p className="text-sm text-white/40 italic mb-6 leading-relaxed max-w-sm">
            Use AI to instantly identify species and assess medical urgency for strays.
          </p>
          <div className="flex gap-3">
            <button 
              id="quick-scan-cam-btn"
              onClick={() => camRef.current?.click()} 
              className="flex-1 btn-p !bg-lavender-600 !text-white !py-4 shadow-lavender-900/40 transition-all flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] ring-offset-2 ring-lavender-500/20 hover:ring-2"
            >
              <Camera size={18} />
              Open Camera
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-g border-lavender-600/30 text-lavender-400 !px-4 hover:bg-lavender-500/10 !rounded-2xl transition-all">
              Upload
            </button>
          </div>
          <button onClick={() => setView('ai')} className="w-full mt-4 text-center text-[10px] font-mono font-bold text-white/20 hover:text-lavender-400 uppercase tracking-widest transition-colors">Advanced Diagnostics →</button>
        </>
      )}
    </div>
  );
}

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapResizer() {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [map]);
  return null;
}

export default function CitizenDashboard({ user }: CitizenDashboardProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"dash" | "ai" | "report" | "track" | "help">("dash");
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [currentAiImage, setCurrentAiImage] = useState<string | null>(null);

  const [reports, setReports] = useState<any[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/rescues?role=CITIZEN&userId=${user.id}`);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reports", err);
    }
  }, [user.id]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const nearbyCases = [
    { id: "CASE-2491", title: "Limping dog near bus depot", area: "Ward 5", urg: "critical", steps: ["Reported", "Assigned", "Rescued", "Care", "Released"], cur: 0, time: "12m ago", vol: "Priya Mehta" },
    { id: "CASE-2492", title: "Abandoned pups under bridge", area: "Miraj", urg: "moderate", steps: ["Reported", "Assigned", "Rescued", "Care", "Released"], cur: 1, time: "1h ago", vol: "Arjun Desai" },
  ];

  const [userAnimals, setUserAnimals] = useState<any[]>([]);

  const fetchAnimals = useCallback(async () => {
    try {
      const res = await fetch(`/api/animals?citizenId=${user.id}`);
      const data = await res.json();
      setUserAnimals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching animals", err);
    }
  }, [user.id]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<any>(null);

  const handleRegister = async (newAnimal: any) => {
    try {
      if (animalToEdit) {
        await fetch(`/api/animals/${animalToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newAnimal, species: newAnimal.type || newAnimal.species })
        });
        setAnimalToEdit(null);
        setIsRegistering(false);
        await fetchAnimals();
        return;
      }
      await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAnimal,
          species: newAnimal.type || newAnimal.species,
          citizenId: user.id
        })
      });
      setIsRegistering(false);
      await fetchAnimals();
    } catch (err) {
      console.error('Error saving animal', err);
      setIsRegistering(false);
    }
  };

  const handleQuickScan = async (file: File) => {
    setView('ai');
    setIsScanning(true);
    const r = new FileReader();
    r.onloadend = async () => {
      const base64 = (r.result as string).split(',')[1];
      setCurrentAiImage(r.result as string);
      const result = await analyzeStraysImage(base64);
      setAiAssessment(result);
      setIsScanning(false);
    };
    r.readAsDataURL(file);
  };

  const tabs = [
    { id: "dash", icon: <Home size={18} />, label: "Home" },
    { id: "ai", icon: <BrainCircuit size={18} />, label: "Scanner" },
    { id: "report", icon: <AlertCircle size={18} />, label: "SOS" },
    { id: "track", icon: <LayoutDashboard size={18} />, label: "Track" },
    { id: "help", icon: <Handshake size={18} />, label: "Support" }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* Redesigned Hero Header */}
      <div className="hero px-10 py-12 relative overflow-hidden bg-bg-warm" style={{ background: `linear-gradient(160deg, rgba(94, 168, 212, 0.04) 0%, transparent 55%)` }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,240,180,0.022)_1px,transparent_1px)] bg-[length:26px_26px]" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-20 h-20 rounded-[24px] bg-sky-dim border border-sky-600/20 flex items-center justify-center text-3xl shadow-2xl shadow-sky-500/20">
            👤
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-dim text-sky-400 border border-sky-600/20 rounded-full font-mono text-[9px] font-bold uppercase tracking-[2.5px] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Citizen Portal Active
            </div>
            <h1 className="font-serif text-5xl font-black tracking-tight mb-2">Welcome Back, <span className="text-sky-400 italic font-medium">{user.name.split(' ')[0]}</span></h1>
            <p className="text-white/40 font-medium text-lg leading-relaxed max-w-xl">
              You've helped <span className="text-white">2 animals</span> this month. Your reports contribute to a safer Sangli.
            </p>
            <div className="flex gap-10 mt-6">
              {[["3", "Reported"], ["2", "Under Care"], ["12d", "Activity"]].map(([v, l]) => (
                <div key={l}><div className="font-serif text-3xl font-bold text-sky-400">{v}</div><div className="font-mono text-[9px] text-white/20 uppercase tracking-[1.5px] mt-1">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 mt-10">
        <AnimatePresence mode="wait">
          {view === "dash" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   <QuickAIHub 
                     onScan={handleQuickScan} 
                     clear={() => setAiAssessment(null)} 
                     aiAssessment={aiAssessment} 
                     setView={setView} 
                     isScanning={isScanning}
                   />

                   <div className="glass-card p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/10 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl shadow-lg">🆘</div>
                         <div>
                            <div className="font-serif font-black text-xl italic text-rose-500">SOS Emergency</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-mono">Sangli Response Unit</div>
                         </div>
                      </div>
                      <p className="text-sm text-rose-100/40 italic mb-8 leading-relaxed">
                        Seen an animal in critical distress? Tap below to alert the nearest field team.
                      </p>
                    </div>
                    <button onClick={() => setView('report')} className="btn-g border-rose-500/30 text-rose-500 hover:bg-rose-500/10 !py-4">Report Emergency SOS</button>
                  </div>
               </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { v: String(userAnimals.length), l: "My Animals", c: "var(--sky)", i: "🐾", s: "Live" },
                  { v: String(userAnimals.filter(a => a.vacc).length), l: "Vaccinated", c: "var(--forest)", i: "💉", s: "Live" },
                  { v: String(userAnimals.filter(a => a.condition === 'Injured' || a.condition === 'Critical').length), l: "Watchlist", c: "var(--amber)", i: "⚠️", s: "Live" },
                  { v: String(reports.filter(r => r.status === 'Pending').length), l: "Pending SOS", c: "var(--rose)", i: "🚨", s: "Live" }
                ].map((k, i) => (
                  <div key={i} className="glass-card p-6 rounded-[24px] relative border-white/5 transition-all hover:bg-white/5">
                     <div className="absolute top-6 right-6 opacity-20 text-xl">{k.i}</div>
                     <div className="text-4xl font-serif font-black mb-1" style={{ color: k.c }}>{k.v}</div>
                     <div className="font-mono text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">{k.l}</div>
                     <div className="inline-block px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider" style={{ background: `${k.c}18`, color: k.c }}>{k.s}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Dog className="text-sky-400" size={24} />
                    <h2 className="font-serif text-2xl font-black">My Animal Records</h2>
                    <button 
                      onClick={() => setIsRegistering(true)}
                      className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-[#1a1208] transition-all"
                    >
                      <span>+ Register New</span>
                    </button>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  {userAnimals.map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAnimal(a)}
                      className="glass-card p-5 rounded-[28px] border-white/5 flex items-center gap-4 transition-all hover:border-sky-500/20 group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl transition-all group-hover:scale-110 group-hover:bg-sky-500/10">
                        {aEmoji(a.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-serif font-black text-lg">{a.name}</span>
                          <code className="text-[10px] bg-sky-dim text-sky-400 px-2 rounded-lg font-mono">{a.id}</code>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/30">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {a.area}</span>
                          <span className="flex items-center gap-1.5"><div className={cn("w-2 h-2 rounded-full", sdot(a.status))} /> {a.status}</span>
                        </div>
                      </div>
                      <button className="btn-g !p-3 !rounded-xl border-white/5 group-hover:border-sky-500/30">👁</button>
                    </div>
                  ))}
                  <button onClick={() => setView('track')} className="btn-p w-full !py-4 !rounded-2xl !bg-sky-600 !text-white shadow-sky-900/20">View Full Registry →</button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-rose-400" size={24} />
                    <h2 className="font-serif text-2xl font-black">Rescue Status</h2>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  {nearbyCases.map(c => (
                    <div key={c.id} className="glass-card p-6 rounded-[32px] border-l-4 border-rose-500/60 border-white/5 relative overflow-hidden transition-all hover:translate-x-1">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">🆘</div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[3px] mb-1">{c.id}</div>
                          <h3 className="font-serif font-black text-xl">{c.title}</h3>
                        </div>
                        <span className="badge text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">{c.urg}</span>
                      </div>
                      <div className="text-xs text-white/40 mb-4">📍 {c.area} · Responder: <span className="text-sky-400 font-bold">{c.vol}</span> · {c.time}</div>
                      <Steps steps={c.steps} cur={c.cur} />
                    </div>
                  ))}
                  <button onClick={() => setView('report')} className="btn-p w-full !py-5 !rounded-2xl !bg-rose-600 !shadow-rose-900/40 text-lg flex items-center justify-center gap-3">
                    <AlertCircle size={24} />
                    Report Emergency SOS
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "ai" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <AIVisionSuite 
                user={user} 
                setView={setView} 
                setAiAssessment={setAiAssessment} 
                initialImage={currentAiImage} 
                isGlobalScanning={isScanning}
                setGlobalImage={setCurrentAiImage}
                setGlobalScanning={setIsScanning}
               />
            </motion.div>
          )}
          
          {view === "report" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
               <ReportPortal
                onClose={() => { setView('dash'); setAiAssessment(null); }}
                aiAssessment={aiAssessment}
                photo={currentAiImage}
                userId={user.id}
                onSubmit={async (newReport) => {
                  try {
                    await fetch('/api/rescues', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        species: newReport.species,
                        urgency: newReport.urgency,
                        location: newReport.location.address,
                        address: newReport.location.address,
                        lat: newReport.location.lat || 0,
                        lng: newReport.location.lng || 0,
                        condition: newReport.condition || aiAssessment?.condition || 'Unknown',
                        notes: newReport.description || '',
                        photo: currentAiImage || '',
                        aiData: aiAssessment ? JSON.stringify(aiAssessment) : '',
                        citizenId: user.id,
                      })
                    });
                    await fetchReports();
                  } catch (err) {
                    console.error('Error submitting rescue', err);
                  }
                }}
              />
            </motion.div>
          )}

          {view === "track" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
               <TrackPortal user={user} userAnimals={userAnimals} reports={reports} onViewEntity={(item) => {
                 if (item.sourceType === 'registry') {
                   setSelectedAnimal(item);
                 }
               }} />
            </motion.div>
          )}

          {view === "help" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
               <HelpPortal />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedAnimal && (
          <AnimalDetailsModal
            animal={selectedAnimal}
            onClose={() => setSelectedAnimal(null)}
            onDelete={async () => {
              try {
                await fetch(`/api/animals/${selectedAnimal.id}`, { method: 'DELETE' });
                await fetchAnimals();
              } catch (err) {
                console.error('Error deleting animal', err);
              }
              setSelectedAnimal(null);
            }}
            onEdit={() => {
              setAnimalToEdit(selectedAnimal);
              setIsRegistering(true);
              setSelectedAnimal(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => {
                setIsRegistering(false);
                setAnimalToEdit(null);
              }}
              className="absolute inset-0 bg-paper/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl z-[1001]"
            >
              <RegisterAnimalModal 
                onClose={() => {
                  setIsRegistering(false);
                  setAnimalToEdit(null);
                }} 
                onRegister={handleRegister} 
                animalToEdit={animalToEdit}
              />
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

function AIVisionSuite({ 
  user, 
  setView, 
  setAiAssessment, 
  initialImage, 
  isGlobalScanning,
  setGlobalImage,
  setGlobalScanning
}: { 
  user: User, 
  setView: (v: any) => void, 
  setAiAssessment: (a: any) => void,
  initialImage: string | null,
  isGlobalScanning: boolean,
  setGlobalImage: (i: string | null) => void,
  setGlobalScanning: (s: boolean) => void
}) {
  const [image, setImage] = useState<string | null>(initialImage);
  const [isAnalyzing, setIsAnalyzing] = useState(isGlobalScanning);
  const [assessment, setAssessment] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (initialImage) setImage(initialImage); }, [initialImage]);
  useEffect(() => { setIsAnalyzing(isGlobalScanning); }, [isGlobalScanning]);

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setGlobalScanning(true);
    const base64 = image.split(',')[1];
    const result = await analyzeStraysImage(base64);
    setAssessment(result);
    setAiAssessment(result);
    setIsAnalyzing(false);
    setGlobalScanning(false);
  };

  const handleImageInput = (f: File) => {
    const r = new FileReader();
    r.onloadend = () => {
      setImage(r.result as string);
      setGlobalImage(r.result as string);
      setAssessment(null);
    };
    r.readAsDataURL(f);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <h2 className="font-serif text-3xl font-black italic">Launch <span className="text-secondary">AI Diagnostics</span></h2>
        <div 
          className="aspect-square glass-card rounded-[48px] border-4 border-dashed border-white/5 flex flex-col items-center justify-center transition-all group relative overflow-hidden"
        >
          <input type="file" ref={fileRef} onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageInput(f);
          }} accept="image/*" className="hidden" />
          <input type="file" ref={camRef} capture="environment" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageInput(f);
          }} accept="image/*" className="hidden" />
          
          {image ? (
            <img src={image} className="absolute inset-0 w-full h-full object-cover p-2 rounded-[48px]" alt="scan" />
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center text-4xl shadow-inner animate-pulse transition-all group-hover:scale-110">📷</div>
              <div className="flex gap-4">
                 <button onClick={() => camRef.current?.click()} className="btn-p !bg-secondary !text-[#1a1208] !py-3 !px-6 !rounded-2xl flex items-center gap-2">
                   <Camera size={18} /> Take Photo
                 </button>
                 <button onClick={() => fileRef.current?.click()} className="btn-g border-white/10 !py-3 !px-6 !rounded-2xl">
                   Upload
                 </button>
              </div>
              <div className="font-mono text-[9px] text-white/10 uppercase tracking-[4px]">Sangli Neural Mesh Node</div>
            </div>
          )}
        </div>
        {!assessment && image && !isAnalyzing && (
          <button onClick={startAnalysis} className="btn-p w-full !py-6 !text-2xl !bg-secondary !text-[#1a1208] flex items-center justify-center gap-4">
            <BrainCircuit size={32} />
            Analyze Visual Input
          </button>
        )}
      </div>

      <div className="space-y-8">
        {isAnalyzing ? (
          <div className="glass-card p-12 rounded-[48px] border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-10">
               <Zap size={64} className="text-secondary animate-pulse" />
               <div className="absolute inset-0 blur-2xl bg-secondary/40 animate-pulse" />
            </div>
            <div className="font-serif text-3xl font-black italic mb-3">Model Computing...</div>
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-[5px]">Fragmenting Image Data Buffer</div>
          </div>
        ) : assessment ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 rounded-[48px] border border-secondary/20 shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">🧬</div>
             <div>
                <div className="font-mono text-[10px] font-black text-secondary tracking-[5px] uppercase mb-2">Diagnostic Result v3.1</div>
                <h3 className="font-serif text-4xl font-black italic">{assessment.species}</h3>
             </div>
             <p className="text-lg font-serif italic text-white/60 leading-relaxed border-l-4 border-secondary/40 pl-6">
                "{assessment.assessment}"
             </p>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-[28px] bg-white/5 border border-white/5">
                 <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mb-1">Status</div>
                 <div className="font-bold text-emerald-400">{assessment.condition}</div>
               </div>
               <div className={cn("p-6 rounded-[28px] border text-center transition-all", ubadge(assessment.urgency))}>
                 <div className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-widest mb-1">Urgency</div>
                 <div className="font-black text-xl">{assessment.urgency}</div>
               </div>
             </div>
             <button onClick={() => setAssessment(null)} className="btn-g w-full !py-4 border-secondary/30 text-secondary hover:bg-secondary/10">New Visual Scan →</button>
             <button onClick={() => setView('report')} className="btn-p w-full !py-4 !bg-rose-600 !text-white border-none shadow-rose-900/40">Report Emergency with AI Data</button>
          </motion.div>
        ) : (
          <div className="glass-card p-12 rounded-[48px] border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center opacity-40 grayscale">
            <BrainCircuit size={80} className="mb-6 text-white/20" />
            <div className="font-serif text-2xl font-black">Waiting for Data...</div>
            <p className="text-xs text-white/30 mt-4 max-w-xs font-medium">AASA AI will automatically detect species, body condition, relative age, and urgency level once photo is uploaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RegisterAnimalModal({ onClose, onRegister, animalToEdit }: { onClose: () => void, onRegister: (animal: any) => void, animalToEdit?: any }) {
  const [formData, setFormData] = useState({
    name: animalToEdit?.name || "",
    type: animalToEdit?.type || "Dog",
    breed: animalToEdit?.breed || "",
    condition: animalToEdit?.condition || "Fair",
    area: animalToEdit?.area || "",
    marks: animalToEdit?.marks || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(animalToEdit ? { ...animalToEdit, ...formData } : formData);
  };

  return (
    <div className="glass-card p-10 rounded-[48px] border border-white/10 bg-paper/60 backdrop-blur-2xl shadow-2xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-mono text-[10px] font-black text-secondary tracking-[3px] uppercase mb-1">Civilian Portal</div>
          <h2 className="font-serif text-4xl font-black italic tracking-tighter">{animalToEdit ? "Edit" : "Register"} <span className="text-secondary">Stray Animal</span></h2>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1">Species</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-secondary transition-all appearance-none"
            >
              <option value="Dog">Dog</option>
              <option value="Cow">Cow</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1">Condition</label>
            <select 
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-secondary transition-all appearance-none"
            >
              <option value="Healthy">Healthy</option>
              <option value="Fair">Fair</option>
              <option value="Injured">Injured</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1">Nickname (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Sheru, Whitey"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1">Breed / Type</label>
            <input 
              type="text" 
              placeholder="e.g. Indie, Indian Bull"
              value={formData.breed}
              onChange={(e) => setFormData({...formData, breed: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-secondary transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1">Location / Ward</label>
            <input 
              type="text" 
              placeholder="e.g. Ward 5, Vishrambag"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1">Identifying Marks</label>
          <textarea 
            placeholder="e.g. Black patch on left eye, cut ear"
            value={formData.marks}
            onChange={(e) => setFormData({...formData, marks: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-24 focus:outline-none focus:border-secondary transition-all resize-none"
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 btn-g border-white/10 !py-4">Cancel</button>
          <button type="submit" className="flex-[2] btn-p !bg-secondary !text-[#1a1208] !py-4 shadow-secondary/20">{animalToEdit ? "Save Changes" : "Finalize Registration"}</button>
        </div>
      </form>
    </div>
  );
}

function ReportPortal({ onClose, aiAssessment, photo, userId, onSubmit }: { onClose: () => void, aiAssessment?: any, photo?: string | null, userId?: string, onSubmit?: (report: any) => void }) {
  const [desc, setDesc] = useState(aiAssessment ? `[AI ASSESSMENT] Species: ${aiAssessment.species}\nCondition: ${aiAssessment.condition}\nUrgency: ${aiAssessment.urgency}\nDiagnostics: ${aiAssessment.assessment}` : "");
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ lat, lng: lon });
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            if (data && data.display_name) {
              setArea(data.display_name.split(',').slice(0, 3).join(','));
            } else {
              setArea(`Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`);
            }
          } catch (e) {
            setArea(`Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setArea("Location access denied.");
          } else {
            setArea("Could not get location.");
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setArea("Geolocation not supported.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          species: aiAssessment?.species || "Unknown",
          urgency: aiAssessment?.urgency || "HIGH",
          condition: aiAssessment?.condition || "Unknown",
          location: {
            address: area || "Current Location",
            lat: coords?.lat || 0,
            lng: coords?.lng || 0
          },
          description: desc,
          photo: photo || ''
        });
      }
      setIsSuccess(true);
      setTimeout(onClose, 2500);
    } catch (err) {
      console.error('Submit error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-20 rounded-[52px] border border-emerald-500/20 max-w-2xl mx-auto text-center space-y-8 bg-emerald-500/5">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-5xl mx-auto shadow-xl shadow-emerald-500/20">✓</div>
        <div className="space-y-3">
          <h2 className="font-serif text-4xl font-black italic">SOS Report Dispatched</h2>
          <p className="text-white/40 font-medium max-w-sm mx-auto">Field teams in your sector have been alerted. You can track the progress in your dashboard.</p>
          <div className="inline-flex mt-4 pt-4 border-t border-emerald-500/10 px-6 py-3 bg-emerald-500/10 rounded-2xl">
            <p className="text-emerald-400 font-bold text-sm tracking-wide">Estimated Response Time: 5-10 minutes</p>
          </div>
        </div>
        <div className="font-mono text-[10px] font-black text-emerald-400 uppercase tracking-[5px]">Sector Sync Complete</div>
      </motion.div>
    );
  }

  return (
    <div className="glass-card p-12 rounded-[52px] border border-rose-500/20 max-w-3xl mx-auto space-y-10 relative">
      <button onClick={onClose} className="absolute top-10 right-10 text-white/20 hover:text-white transition-all" disabled={isSubmitting}><X size={32} /></button>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full font-mono text-[9px] font-bold tracking-[4px] mb-4">🚨 EMERGENCY NODE</div>
        <h2 className="font-serif text-5xl font-black italic tracking-tight">Report <span className="text-rose-500">SOS Case</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-4 mr-2">
              <label className="text-[11px] font-mono font-bold text-white/20 uppercase tracking-[3px]">Incident Location</label>
              <button 
                type="button" 
                onClick={getLocation} 
                className="text-[10px] text-rose-500 hover:text-rose-400 font-bold tracking-wide"
              >
                {isLocating ? "LOCATING..." : "GET LOCATION"}
              </button>
            </div>
            <div className="relative">
              <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-500/40" />
              <input 
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/20 transition-all outline-none" 
                placeholder={isLocating ? "Getting current location..." : "e.g. Kupwad Road, Ward 5"} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-white/20 uppercase tracking-[3px] ml-4">Issue Description</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-sm focus:border-rose-500/60 transition-all outline-none h-40 resize-none italic" 
              placeholder="Describe animal's condition..." 
            />
          </div>
        </div>
        <div className="space-y-8">
           <div className="glass-card p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/10">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/30 font-serif font-black italic">!</div>
                <div>
                   <div className="font-serif font-black text-xl italic text-rose-500">Red Alert Protocol</div>
                   <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Immediate field team dispatch</div>
                </div>
             </div>
             <p className="text-xs text-rose-100/50 leading-relaxed italic border-l-2 border-rose-500/40 pl-4 py-1">
               AASA emergency responders are alerted across the local mesh network within 5 seconds of report submission.
             </p>
           </div>
           <button 
             onClick={handleSubmit} 
             disabled={isSubmitting}
             className="btn-p w-full !py-6 !text-2xl !bg-rose-600 !shadow-rose-900/40 !rounded-[32px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
           >
             {isSubmitting ? <span className="animate-spin text-3xl">◌</span> : "Launch Emergency SOS"}
           </button>
           <button onClick={onClose} className="btn-g w-full !py-4 border-white/5 hover:border-white/20" disabled={isSubmitting}>Back to Safety Dashboard</button>
        </div>
      </div>
    </div>
  );
}

function TrackPortal({ user, userAnimals, reports, onViewEntity }: { user: User, userAnimals: any[], reports: any[], onViewEntity?: (entity: any) => void }) {
  const [filterSpecies, setFilterSpecies] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterUrgency, setFilterUrgency] = useState<string>("All");
  const [mapMode, setMapMode] = useState<boolean>(true);

  const mockLocations: Record<string, { lat: number, lng: number }> = {
    "Ward 5": { lat: 16.8524, lng: 74.5815 },
    "Miraj": { lat: 16.8424, lng: 74.5915 },
    "Market Yard, Sangli": { lat: 16.8590, lng: 74.6022 },
    "Vishrambag, Sangli": { lat: 16.8524, lng: 74.5815 },
    "Kupwad": { lat: 16.8724, lng: 74.6215 },
    "Ward 2": { lat: 16.8624, lng: 74.5715 },
    "Ward 7": { lat: 16.8424, lng: 74.6115 },
  };

  const combinedItems = [
    ...userAnimals.map(a => ({ ...a, sourceType: 'registry', urgency: 'LOW' })),
    ...reports.map(r => ({ ...r, name: `SOS: ${r.aasaId}`, type: r.species, area: r.location.address, sourceType: 'report' }))
  ].map(item => {
    const loc = mockLocations[item.area] || { lat: 16.8524, lng: 74.5815 };
    return { ...item, ...loc };
  });

  const filteredItems = combinedItems.filter(item => {
    const speciesMatch = filterSpecies === "All" || item.type.toLowerCase() === filterSpecies.toLowerCase();
    const statusMatch = filterStatus === "All" || item.status.toLowerCase() === filterStatus.toLowerCase();
    const urgencyMatch = filterUrgency === "All" || item.urgency.toLowerCase() === filterUrgency.toLowerCase();
    return speciesMatch && statusMatch && urgencyMatch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-serif text-4xl font-black italic">Animal <span className="text-sky-400">Registry</span></h2>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[4px] mt-1">Live Sector Node Monitoring</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
             <button 
               onClick={() => setMapMode(true)}
               className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", mapMode ? "bg-sky-500 text-[#1a1208]" : "text-white/40 hover:text-white")}
             >
               Map
             </button>
             <button 
               onClick={() => setMapMode(false)}
               className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", !mapMode ? "bg-sky-500 text-[#1a1208]" : "text-white/40 hover:text-white")}
             >
               List
             </button>
          </div>
          <button className="flex-1 md:flex-none btn-p !bg-sky-600 shadow-sky-900/20 text-white flex items-center justify-center gap-2">
            <Plus size={18} /> Register New
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-6 rounded-[32px] border-white/5 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-sky-400" />
          <span className="font-mono text-[10px] font-bold text-white/40 uppercase tracking-widest">Filters</span>
        </div>
        
        <div className="h-8 w-px bg-white/5" />

        <div className="flex flex-wrap gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Species:</span>
            <select 
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/80 focus:border-sky-500/60 outline-none"
            >
              <option value="All">All Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Cow">Cow</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/80 focus:border-sky-500/60 outline-none"
            >
              <option value="All">All Status</option>
              <option value="stable">Stable</option>
              <option value="moderate">Moderate</option>
              <option value="critical">Critical</option>
              <option value="REPORTED">Reported</option>
              <option value="RESCUED">Rescued</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Urgency:</span>
            <select 
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/80 focus:border-sky-500/60 outline-none"
            >
              <option value="All">All Urgency</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => { setFilterSpecies("All"); setFilterStatus("All"); setFilterUrgency("All"); }}
          className="text-[10px] font-mono font-bold text-white/20 hover:text-sky-400 uppercase tracking-widest transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {mapMode ? (
        <div className="h-[550px] glass-card rounded-[48px] overflow-hidden relative border-white/10 shadow-2xl">
          <MapContainer center={[16.8524, 74.5815]} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MarkerClusterGroup key={filteredItems.map(i => i.id).join('-')} chunkedLoading>
              {filteredItems.map((item, idx) => (
                <Marker key={`${item.id}-${idx}`} position={[item.lat, item.lng]} icon={defaultIcon}>
                  <Popup>
                    <div className="p-3 min-w-[200px]">
                      <div className="font-mono text-[9px] font-bold text-sky-400 uppercase mb-1">{item.sourceType === 'registry' ? 'REGISTRY NODE' : 'SOS SIGNAL'}</div>
                      <div className="font-serif font-black text-lg italic mb-1">{item.name}</div>
                      <div className="text-[10px] text-white/40 italic mb-4 leading-tight">{item.area}</div>
                      <div className="flex gap-2 mb-4">
                        <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-bold border", ubadge(item.urgency))}>{item.urgency}</div>
                        <div className="px-2 py-0.5 rounded-lg text-[8px] font-bold bg-white/5 text-white/40 border border-white/10">{item.status}</div>
                      </div>
                      <button onClick={() => onViewEntity?.(item)} className="btn-p w-full !py-2 !text-[10px] !bg-sky-600 text-white shadow-none">View Entity Details</button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
            <MapResizer />
          </MapContainer>
          
          <div className="absolute top-6 right-6 z-[100] bg-paper/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
             <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mb-3">Map Legend</div>
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                   <span className="text-[10px] font-bold text-white/60">Registered Animals</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                   <span className="text-[10px] font-bold text-white/60">Active SOS Signals</span>
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-6 left-6 z-[100] bg-paper/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest">
            {filteredItems.length} Entities Indexed in View
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto glass-card rounded-[48px] border-white/5 shadow-2xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 text-left border-b border-white/5">
                <th className="px-10 py-6 text-[10px] font-mono font-bold uppercase tracking-[4px] text-white/30">ID / Node</th>
                <th className="px-10 py-6 text-[10px] font-mono font-bold uppercase tracking-[4px] text-white/30">Entity</th>
                <th className="px-10 py-6 text-[10px] font-mono font-bold uppercase tracking-[4px] text-white/30">Sector</th>
                <th className="px-10 py-6 text-[10px] font-mono font-bold uppercase tracking-[4px] text-white/30">Urgency</th>
                <th className="px-10 py-6 text-[10px] font-mono font-bold uppercase tracking-[4px] text-white/30">Status</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map(a => (
                <tr key={a.id} className="group hover:bg-white/[0.02] transition-all">
                  <td className="px-10 py-8"><code className="text-sm font-mono text-sky-400 font-bold bg-sky-dim px-3 py-1 rounded-lg border border-sky-600/20">{a.id}</code></td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-sky-500/10 transition-all">{aEmoji(a.type)}</div>
                      <div>
                        <div className="font-serif font-black text-xl">{a.name}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{a.type} Entity</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-medium text-white/60 italic">📍 {a.area}</td>
                  <td className="px-10 py-8"><div className={cn("inline-block px-3 py-1 rounded-lg text-[9px] font-black border tracking-widest", ubadge(a.urgency))}>{a.urgency}</div></td>
                  <td className="px-10 py-8"><div className="flex items-center gap-2 font-bold text-xs"><div className={cn("w-2 h-2 rounded-full", sdot(a.status?.toLowerCase()))} /> {a.status}</div></td>
                  <td className="px-10 py-8 text-right"><button className="btn-g !p-3 !rounded-xl border-white/5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">Review Hub →</button></td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="text-white/20 font-serif text-2xl italic">No entities match selected telemetry filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HelpPortal() {
  const centers = [
     { icon: "🏥", name: "Government Veterinary Polyclinic", area: "Rajwada, Sangli", dist: "1.2 km", open: true, type: "Government", col: "var(--sky)" },
     { icon: "🏠", name: "Animal Rahat Sanctuary", area: "Kupwad M.I.D.C", dist: "4.5 km", open: true, type: "NGO Partner", col: "var(--forest)" },
     { icon: "🩺", name: "Jeevdaya Mandal", area: "Market Yard, Sangli", dist: "2.8 km", open: true, type: "Trust/NGO", col: "var(--lavender)" },
  ];
  return (
    <div className="space-y-10">
      <h2 className="font-serif text-4xl font-black italic">Rescue <span className="text-forest">Network</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {centers.map((c, i) => (
           <div key={i} className="glass-card p-10 rounded-[48px] border-white/5 group hover:border-emerald-500/20 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10 font-serif text-6xl group-hover:scale-110 transition-transform">{c.icon}</div>
             <div className="flex gap-2 mb-10">
               <span className="badge text-[9px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">OPEN NOW</span>
               <span className="badge text-[9px] px-3 py-1 rounded-full bg-white/5 text-white/30 border border-white/10 uppercase tracking-widest">{c.type}</span>
             </div>
             <h3 className="font-serif text-2xl font-black mb-1 group-hover:text-emerald-400 transition-colors">{c.name}</h3>
             <div className="text-sm text-white/30 italic mb-8">📍 {c.area} · {c.dist} from current node</div>
             <div className="flex gap-4">
                <button className="flex-1 btn-p !bg-emerald-600 shadow-emerald-900/20 text-[#1a1208]">Call Center</button>
                <button 
                  className="flex-1 btn-g border-white/5 group-hover:border-white/20"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + c.area)}`, '_blank')}
                >
                  Navigate
                </button>
             </div>
           </div>
        ))}
      </div>
      <div className="glass-card p-12 rounded-[52px] border-white/5 flex flex-col md:flex-row items-center gap-12 text-center md:text-left bg-linear-to-br from-white/5 to-transparent">
        <div className="w-24 h-24 rounded-[32px] bg-amber-dim border border-amber-600/20 flex items-center justify-center text-5xl shrink-0">🤝</div>
        <div className="flex-1">
          <h3 className="font-serif text-3xl font-black italic mb-3 text-amber-500">Need Volunteer Support?</h3>
          <p className="text-white/40 font-medium leading-relaxed max-w-xl">
            AASA verified volunteers are available 24/7 for field rescues, transport assistance, and first aid coordination.
          </p>
        </div>
        <button className="btn-p !bg-amber-600 shadow-amber-900/20 !px-10 !py-5 !text-xl !rounded-[24px] text-[#1a1208]">Contact Field Team →</button>
      </div>
    </div>
  );
}

function AnimalDetailsModal({ animal, onClose, onDelete, onEdit }: { animal: any, onClose: () => void, onDelete: () => void, onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-paper/60 backdrop-blur-3xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card w-full max-w-xl rounded-[48px] overflow-hidden relative shadow-[0_32px_120px_-16px_rgba(0,0,0,0.8)] border-white/10"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all z-10">
          <X size={28} />
        </button>

        <div className="p-12 space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[32px] bg-sky-dim border border-sky-600/20 flex items-center justify-center text-4xl shadow-xl">
              {aEmoji(animal.type)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-serif text-4xl font-black italic tracking-tight">{animal.name}</h2>
                <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-bold border", animal.vacc ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20")}>
                  {animal.vacc ? "FULLY VAX'D" : "VAX PENDING"}
                </span>
              </div>
              <p className="font-mono text-[10px] font-black text-sky-400 tracking-[4px] uppercase">{animal.id} · Verified Resident</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 rounded-[32px] bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mb-1">Sector Node</div>
                <div className="font-serif font-black text-xl italic">{animal.area}</div>
             </div>
             <div className="p-6 rounded-[32px] bg-white/5 border border-white/5">
                <div className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest mb-1">Last Inspection</div>
                <div className="font-serif font-black text-xl italic">{formatDate(animal.date)}</div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[40px] bg-sky-dim/10 border border-sky-500/10 space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold italic">Medical Registry</h3>
                <Activity size={18} className="text-sky-400" />
             </div>
             <div className="space-y-3">
                {[
                  { l: "Rabies Vaccination", s: "Completed", d: "12 Oct 2024" },
                  { l: "Parvovirus Shot", s: "Completed", d: "05 Nov 2024" },
                  { l: "Annual Checkup", s: animal.vacc ? "Completed" : "Overdue", d: animal.vacc ? "15 Mar 2025" : "Expired", cl: animal.vacc ? "text-emerald-400" : "text-rose-500" }
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-white/40">{m.l}</span>
                    <span className={cn("font-bold", m.cl || "text-white/80")}>{m.s}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4">
             <button onClick={onEdit} className="flex-1 btn-g border-white/5 hover:border-sky-500/30 !py-4 font-bold">Edit Details</button>
             <button onClick={onDelete} className="flex-1 btn-p !bg-rose-500 shadow-rose-900/40 text-white !py-4 font-bold">Delete Profile</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
