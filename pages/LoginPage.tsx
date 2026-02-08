
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient';

interface LoginPageProps {
  onMockLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onMockLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (data.session) {
        navigate('/terminal');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Invalid credentials. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      <div className="hidden lg:block w-1/2 relative">
        <img src="https://cdn.prod.website-files.com/688223fb2d6a052d34e51263/688360c625f7f01603723a97_Frame%202147227072.avif" className="w-full h-full object-cover grayscale opacity-40 blur-[2px]" alt="Markets" />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="absolute top-1/2 left-20 -translate-y-1/2">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Access <span className="text-[#00ff9c]">Terminal</span></h2>
          <p className="text-white/40 text-sm max-w-xs font-light tracking-wide leading-relaxed italic">"The market is a device for transferring money from the impatient to the patient."</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 sm:px-12 md:px-20 relative">
        <Link to="/" className="absolute top-10 left-10 flex items-center space-x-2 group">
           <div className="w-5 h-5 border border-white/20 flex items-center justify-center group-hover:border-[#00ff9c] transition-colors">
            <svg className="w-3 h-3 text-white/40 group-hover:text-[#00ff9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </div>
           <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Exit Authorization</span>
        </Link>

        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Welcome Back</h1>
            <p className="text-sm text-white/40 tracking-wide font-light">Continue your systematic refinement.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                {error}
              </div>
            )}
            
            <Input label="Identity (Email)" type="email" placeholder="operator@tradevo.sys" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <div className="space-y-1">
              <Input label="Security Key (Password)" type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <div className="flex justify-end"><button type="button" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-[#00ff9c]">Lost Access Key?</button></div>
            </div>
            
            <div className="mt-8">
              <HoverBorderGradient
                containerClassName="w-full rounded-sm"
                className="w-full bg-black text-white flex items-center justify-center py-4 text-sm font-bold uppercase tracking-widest"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Verifying Protocol...' : 'Authorize Session'}
              </HoverBorderGradient>
            </div>
          </form>

          <div className="text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">New Operator? <Link to="/signup" className="text-[#00ff9c] hover:underline">Initialize Identity</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
