import React, { useState } from 'react';
import { BrandMark } from '../components/BrandMark';
import { DEMO_PERSONAS } from '../data/curriculum';

export function WelcomeLoginScreen({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoFill = (persona) => {
    setIsRegisterMode(false);
    setSelectedPersonaId(persona.id);
    setFullName(persona.name);
    setEmail(persona.email);
    setPassword(persona.password);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Sila masukkan emel atau pilih akaun demo di atas.');
      return;
    }

    const matchedPersona = DEMO_PERSONAS.find((p) => p.id === selectedPersonaId) || null;
    if (matchedPersona) {
      onLogin({
        name: matchedPersona.name,
        email: trimmedEmail,
        roleLabel: matchedPersona.roleLabel,
        defaultCourseId: matchedPersona.defaultCourseId,
        xp: matchedPersona.xp,
        streak: matchedPersona.streak,
        isNewAccount: false,
      });
      return;
    }

    onLogin({
      name: fullName.trim() || 'Ahmad Abbas',
      email: trimmedEmail,
      roleLabel: isRegisterMode ? 'Pelajar Baharu · CoPED PULSE' : 'Pelajar · CoPED PULSE',
      defaultCourseId: null,
      xp: 0,
      streak: 1,
      isNewAccount: true,
    });
  };

  const handleGoogleContinue = () => {
    const activePersona = DEMO_PERSONAS.find((p) => p.id === selectedPersonaId);
    if (activePersona) {
      onLogin({
        name: activePersona.name,
        email: activePersona.email,
        roleLabel: activePersona.roleLabel,
        defaultCourseId: activePersona.defaultCourseId,
        xp: activePersona.xp,
        streak: activePersona.streak,
        isNewAccount: false,
      });
      return;
    }
    onLogin({
      name: 'Ahmad Abbas',
      email: 'abbas.google@uum.edu.my',
      roleLabel: 'Google Account · One Stop Learn Center',
      defaultCourseId: 'kssm-t1-math',
      xp: 120,
      streak: 1,
      isNewAccount: false,
    });
  };

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between px-5 pt-6 pb-5 overflow-hidden">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" />
          <div className="text-left">
            <p className="text-xs font-semibold text-[#6B7280]">UUM · KPM</p>
            <p className="text-sm font-bold text-[#111827]">CoPED PULSE</p>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-[#111827] leading-tight">
            Welcome to CoPED PULSE
          </h1>
          <p className="text-sm font-medium text-[#4B5563]">
            One Stop Learn Center
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#6B7280]">
            Isi Pantas Akaun Demo (1-Sentuhan)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_PERSONAS.map((persona) => {
              const active = selectedPersonaId === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleDemoFill(persona)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-transform duration-75 active:translate-y-[2px] ${
                    active
                      ? 'bg-[#111827] text-white border-[#111827]'
                      : 'bg-[#F3F4F6] text-[#111827] border-[#E5E7EB]'
                  }`}
                >
                  {persona.label}
                </button>
              );
            })}
          </div>
        </div>

        <form id="auth-form" onSubmit={handleSubmit} className="space-y-3 pt-1">
          {isRegisterMode && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#4B5563]">
                Nama Penuh
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ahmad Abbas"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#4B5563]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedPersonaId(null);
                setErrorMsg('');
              }}
              placeholder="nama@moe-dl.edu.my atau uum.edu.my"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#4B5563]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata laluan"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-[#DC2626]">{errorMsg}</p>
          )}
        </form>
      </div>

      <div className="space-y-2.5 pt-3">
        <button
          type="submit"
          form="auth-form"
          className="w-full min-h-[48px] rounded-xl bg-[#111827] text-white text-sm font-semibold border border-[#111827] active:translate-y-[2px] transition-transform duration-75"
        >
          {isRegisterMode ? 'Daftar Akaun Baharu' : 'Log Masuk'}
        </button>

        <button
          type="button"
          onClick={handleGoogleContinue}
          className="w-full min-h-[48px] rounded-xl bg-white text-[#111827] text-sm font-semibold border border-[#E5E7EB] flex items-center justify-center gap-2.5 active:translate-y-[2px] transition-transform duration-75"
        >
          <span className="w-5 h-5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center text-xs font-extrabold text-[#3B82F6]">
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegisterMode((prev) => !prev);
            setSelectedPersonaId(null);
            setErrorMsg('');
          }}
          className="w-full py-2 text-center text-xs font-semibold text-[#6B7280] active:translate-y-[1px]"
        >
          {isRegisterMode
            ? 'Sudah ada akaun? Log Masuk'
            : 'Belum ada akaun? Daftar Sekarang'}
        </button>
      </div>
    </div>
  );
}

