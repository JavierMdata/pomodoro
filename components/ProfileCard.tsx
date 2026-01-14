
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
      className="group relative flex flex-col items-center justify-center p-10 bg-gradient-to-br from-white via-white to-slate-50 border-2 border-slate-200 rounded-[2.5rem] transition-all duration-500 hover:border-transparent hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-3 hover:scale-105 w-full max-w-xs aspect-square overflow-hidden card-hover-effect"
      style={{
        background: `linear-gradient(135deg, ${profile.color}08 0%, white 50%, ${profile.color}05 100%)`
      }}
    >
      {/* Animated gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700"
        style={{
          background: `linear-gradient(-45deg, ${profile.color}, ${profile.color}88, ${profile.color}44, ${profile.color})`
        }}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Glow effect */}
      <div
        className="absolute -inset-1 rounded-[2.5rem] opacity-0 group-hover:opacity-70 blur-xl transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${profile.color}40, ${profile.color}20)` }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="relative p-8 rounded-[2rem] mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${profile.color}15, ${profile.color}30)`,
            boxShadow: `0 10px 30px -10px ${profile.color}40`
          }}
        >
          {/* Icon glow */}
          <div
            className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-50 blur-md transition-opacity"
            style={{ background: profile.color }}
          />
          <Icon size={72} style={{ color: profile.color }} className="relative z-10 drop-shadow-lg" />
        </div>

        <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
          {profile.name}
        </h3>
        <span
          className="text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full transition-all duration-300 group-hover:scale-110"
          style={{
            color: profile.color,
            background: `${profile.color}15`,
            boxShadow: `0 4px 12px ${profile.color}20`
          }}
        >
          {profile.type}
        </span>
      </div>

      {/* Animated indicator */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="relative">
          <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: profile.color }} />
          <div className="absolute inset-0 w-3 h-3 rounded-full" style={{ backgroundColor: profile.color }} />
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${profile.color}, transparent)`
        }}
      />
    </button>
  );
};

export default ProfileCard;
