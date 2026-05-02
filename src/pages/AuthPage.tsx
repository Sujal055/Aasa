import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dog, 
  Shield, 
  User as UserIcon, 
  Landmark, 
  ArrowRight, 
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { UserRole, User } from '../types';
import { cn } from '../lib/utils';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const roles: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
  { role: 'CITIZEN',   title: 'Citizen Resident', desc: 'Report injuries & track strays in your neighborhood.',   icon: UserIcon, color: 'var(--bl)' },
  { role: 'VOLUNTEER', title: 'Rescue Volunteer', desc: 'Respond to alerts and manage local rescue cases.',        icon: Dog,      color: 'var(--gr)' },
  { role: 'NGO',       title: 'NGO Organization', desc: 'Coordinate teams, shelters, and medical campaigns.',     icon: Shield,   color: 'var(--vi)' },
  { role: 'ADMIN',     title: 'District Official', desc: 'Monitor district health and manage platform metrics.', icon: Landmark, color: 'var(--am)' },
];

export default function AuthPage({ onLogin }: AuthPageProps) {
  const location = useLocation();
  const initialRole = location.state?.role as UserRole | null;
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole);
  const [step, setStep] = useState(initialRole ? 2 : 1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auth state is handled by the handleNext popup logic and App.tsx listener.
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleNext = async () => {
    if (step === 1 && selectedRole) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      console.log('[Auth] Starting login for role:', selectedRole);
      
      try {
        let firebaseUser;
        if (selectedRole === 'CITIZEN' || selectedRole === 'VOLUNTEER') {
          const result = await signInWithPopup(auth, googleProvider);
          firebaseUser = result.user;
        } else {
          const result = await signInWithEmailAndPassword(auth, email, password);
          firebaseUser = result.user;
        }

        const idToken = await firebaseUser.getIdToken();
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ 
            email: firebaseUser.email,
            name: firebaseUser.displayName || email.split('@')[0],
            role: selectedRole
          })
        });
        
        const data = await response.json();
        if (data.success) {
          onLogin(data.user);
        } else {
          // Show the specific error from the backend (e.g. "Invalid token", "Key mismatch")
          alert(`Backend login failed: ${data.error || data.message || 'Unknown error'}`);
        }
      } catch (err: any) {
        console.error('[Auth] Login Error:', err);
        alert(err.message || 'Authentication error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email first to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to send reset email: " + err.message);
    }
  };

  const SelectedRoleData = selectedRole ? roles.find(r => r.role === selectedRole) : null;
  const SelectedIcon = SelectedRoleData?.icon;

  if (loading && step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20" />
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-[4px] animate-pulse">Authenticating with AASA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-paper pattern-bg">
      <div 
        className="absolute top-0 left-0 w-full h-[3px] bg-white/5 transition-all duration-700" 
        style={{ background: SelectedRoleData?.color }}
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: step === 1 ? '50%' : '100%' }}
          className="h-full bg-white/20"
        />
      </div>

      {/* Back to home */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors font-mono uppercase tracking-widest">
        ← Home
      </Link>

      <div className="max-w-[480px] w-full">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-10"
            >
              <div className="text-center">
                <h2 className="font-serif text-4xl font-black tracking-tight mb-3">Choose your <span className="italic text-primary">Role</span></h2>
                <p className="text-white/40 text-[0.95rem]">Select how you want to participate in the AASA network.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => setSelectedRole(item.role)}
                    className={cn(
                      "flex items-center gap-5 p-5 rounded-[24px] text-left transition-all border-2 group relative overflow-hidden",
                      selectedRole === item.role 
                        ? "border-white/20 bg-white/5 ring-1 ring-white/10 shadow-2xl" 
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    )}
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 relative z-10"
                      style={{ 
                        backgroundColor: selectedRole === item.role ? item.color : 'rgba(255,255,255,0.05)',
                        color: selectedRole === item.role ? 'black' : 'rgba(255,255,255,0.3)'
                      }}
                    >
                      <item.icon size={28} />
                    </div>
                    <div className="flex-1 relative z-10 transition-transform duration-300 transform group-hover:translate-x-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-lg leading-none">{item.title}</span>
                        {selectedRole === item.role && (
                          <motion.div layoutId="check" className="text-primary"><CheckCircle2 size={16} /></motion.div>
                        )}
                      </div>
                      <p className="text-xs text-white/30 font-medium mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    
                    {/* Decorative hover glow */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at center, ${item.color} 0%, transparent 70%)` }}
                    />
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedRole}
                onClick={handleNext}
                className="btn-p w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all"
              >
                Continue <ArrowRight size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-12 rounded-[40px] space-y-10 relative"
            >
              <button 
                onClick={() => setStep(1)}
                className="absolute top-8 left-8 text-white/30 hover:text-white transition-all p-2 rounded-full hover:bg-white/5"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl"
                  style={{ backgroundColor: SelectedRoleData?.color, color: 'black' }}
                >
                  {SelectedIcon && <SelectedIcon size={40} />}
                </div>
                <h2 className="font-serif text-3xl font-black tracking-tight mb-2">Welcome Back</h2>
                <div className="font-mono text-[10px] text-primary tracking-[2px] uppercase font-bold">
                  {selectedRole?.toLowerCase()} portal
                </div>
              </div>

              {(selectedRole === 'CITIZEN' || selectedRole === 'VOLUNTEER') ? (
                <div className="space-y-6">
                  <p className="text-center text-white/50 text-sm mb-4">
                    Sign in with your Google account to access your {selectedRole.toLowerCase()} dashboard.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-white/20 ml-1">Email Access</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="official@sangli.gov" 
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 focus:ring-4 focus:ring-white/5 outline-none text-sm font-medium placeholder:text-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1 mb-1">
                      <label className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-white/20">Security Key</label>
                      <button onClick={handlePasswordReset} type="button" className="text-[10px] text-primary hover:underline">Forgot?</button>
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 focus:ring-4 focus:ring-white/5 outline-none text-sm font-medium placeholder:text-white/10 text-white"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'ADMIN' && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">🔒</div>
                  <p className="text-[10px] font-mono leading-tight text-rose-500/80 font-bold uppercase tracking-wider">
                    Restricted Access · Authorized Personnel Only
                  </p>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-p w-full py-5 text-lg flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  (selectedRole === 'CITIZEN' || selectedRole === 'VOLUNTEER') 
                    ? <>Continue with Google <ArrowRight size={20} /></> 
                    : <>Sign In to AASA Platform <ArrowRight size={20} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
