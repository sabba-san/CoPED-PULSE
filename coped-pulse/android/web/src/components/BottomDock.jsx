import React from 'react';
import { Compass, Briefcase, BookOpen, User, Search } from './Icons';

const TABS = [
  { id: 'explore', label: 'Explore', Icon: Compass },
  { id: 'career', label: 'Career', Icon: Briefcase },
  { id: 'learn', label: 'Learn', Icon: BookOpen },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'search', label: 'Search', Icon: Search },
];

export function BottomDock({ activeTab, onChangeTab }) {
  return (
    <nav
      aria-label="Navigasi Utama"
      className="absolute bottom-3 left-3 right-3 z-20 bg-white border border-[#E5E7EB] rounded-full px-1.5 py-1.5 flex items-center justify-between"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChangeTab(id)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-transform duration-75 active:translate-y-[2px] ${
              isActive
                ? 'bg-[#111827] text-white'
                : 'bg-transparent text-[#6B7280]'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" strokeWidth={isActive ? 2.4 : 2} />
            <span className="text-xs font-semibold leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

