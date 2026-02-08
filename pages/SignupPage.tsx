
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient';

interface SignupPageProps {
  onMockLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onMockLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        alert("Registration Successful. Please check your email for a verification link if enabled, or proceed to login.");
        navigate('/login');
      }
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message || "Failed to establish identity protocol.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      <div className="hidden lg:block w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1611974717537-4340a5a64b9b?auto=format&fit=crop&q=80&w=1500" className="w-full h-full object-cover grayscale opacity-30 blur-[4px]" alt="Charts" />
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="absolute top-1/2 left-20 -translate-y-1/2">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic leading-none">Join the <span className="text-[#00ff9c]">1%</span></h2>
          <div className="mt-12 space-y-4">
             {['Institutional Grade Logging', 'Behavioral Diagnostics', 'High-Frequency Metadata'].map((feature) => (
               <div key={feature} className="flex items-center space-x-4 text-[10px] uppercase tracking-[0.3em] text-[#00ff9c]/60 font-bold">
                  <div className="w-1.5 h-1.5 bg-[#00ff9c] shadow-[0_0_10px_#00ff9c]"></div>
                  <span>{feature}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 sm:px-12 md:px-20 relative">
        <Link to="/" className="absolute top-10 left-10 flex items-center space-x-2 group">
           <div className="w-5 h-5 border border-white/20 flex items-center justify-center group-hover:border-[#00ff9c] transition-colors">
            <svg className="w-3 h-3 text-white/40 group-hover:text-[#00ff9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </div>
           <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Return to Base</span>
        </Link>

        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Initialize</h1>
            <p className="text-sm text-white/40 tracking-wide font-light">Begin your path to professional execution.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                {error}
              </div>
            )}
            
            <Input label="Operator Name" type="text" placeholder="Alpha Trader" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Input label="Identity (Email)" type="email" placeholder="operator@quantedge.sys" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="Security Key" type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            
            <div className="pt-2">
              <HoverBorderGradient
                containerClassName="w-full rounded-sm"
                className="w-full bg-black text-white flex items-center justify-center py-4 text-sm font-bold uppercase tracking-widest"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Encrypting Credentials...' : 'Establish Session'}
              </HoverBorderGradient>
            </div>
          </form>
          <div className="text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Existing Identity? <Link to="/login" className="text-[#00ff9c] hover:underline">Authorize Session</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
