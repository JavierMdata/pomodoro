
import React from 'react';
import { Profile } from '../types';
import { GraduationCap, Briefcase, User } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onClick }) => {
  const Icon = profile.type === 'universidad' ? GraduationCap : profile.type === 'trabajo' ? Briefcase : User;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-3xl transition-all hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 w-full max-w-xs aspect-square"
    >
      <div className={`p-6 rounded-full mb-6 transition-colors group-hover:bg-indigo-50`} style={{ backgroundColor: `${profile.color}20` }}>
        <Icon size={64} style={{ color: profile.color }} />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">{profile.name}</h3>
      <span className="text-slate-500 uppercase tracking-widest text-xs font-semibold">{profile.type}</span>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
      </div>
    </button>
  );
};

export default ProfileCard;
