import { useState, useEffect } from 'react';
import { User, AnimalRecord, SOSReport } from '../types';
import { User as UserIcon, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfilePageProps {
  user: User;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/rescues?role=${user.role}&userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/${user.role.toLowerCase()}`} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-white/50" />
        </Link>
        <h1 className="text-3xl font-serif font-black tracking-tight">My Profile</h1>
      </div>

      <div className="glass-card p-8 rounded-[32px] flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-5xl font-black shrink-0 border-4 border-white/5 shadow-2xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-3xl font-serif font-bold">{user.name}</h2>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase">
              {user.role}
            </div>
          </div>
          
          <div className="space-y-2 text-white/60">
            <div className="flex items-center gap-3">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-serif font-bold flex items-center gap-3">
          <Calendar size={20} className="text-primary" />
          History
        </h3>
        
        {loading ? (
          <div className="glass-card p-8 rounded-2xl flex items-center justify-center text-white/30 text-sm">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl flex items-center justify-center text-white/30 text-sm">
            No history found.
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-colors">
                <div>
                  <div className="font-bold text-lg">{item.species} <span className="text-white/40 text-sm font-normal">({item.urgency || item.condition})</span></div>
                  <div className="text-white/50 text-xs mt-1">{item.address || item.location}</div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/5 text-xs font-mono uppercase font-bold tracking-wider">
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
