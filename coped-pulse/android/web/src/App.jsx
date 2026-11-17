import React, { useRef, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { COURSES, INITIAL_CERTIFICATES } from './data/curriculum';
import { LessonPlayer } from './screens/LessonPlayer';
import { SplashScreen } from './screens/SplashScreen';
import { WelcomeLoginScreen } from './screens/WelcomeLoginScreen';
import { CareerTab } from './screens/tabs/CareerTab';
import { ExploreTab } from './screens/tabs/ExploreTab';
import { LearnTab } from './screens/tabs/LearnTab';
import { ProfileTab } from './screens/tabs/ProfileTab';
import { SearchTab } from './screens/tabs/SearchTab';

const FTUE_STORAGE_KEY = 'coped_pulse_ftue_done';

export default function App() {
  const shellRef = useRef(null);

  const [phase, setPhase] = useState('splash');
  const [activeTab, setActiveTab] = useState('learn');
  const [user, setUser] = useState({
    name: 'Ahmad Abbas',
    email: 'ahmad.t1@moe-dl.edu.my',
    roleLabel: 'Pelajar KSSM · Tingkatan 1',
  });

  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [completedNodeIds, setCompletedNodeIds] = useState({});
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(1);
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);

  const [activeLesson, setActiveLesson] = useState(null);
  const [ftueActive, setFtueActive] = useState(false);
  const [ftueStep, setFtueStep] = useState(0);

  const handleLogin = (loggedUser) => {
    setUser({
      name: loggedUser.name,
      email: loggedUser.email,
      roleLabel: loggedUser.roleLabel,
    });
    setXp(loggedUser.xp ?? 120);
    setStreak(loggedUser.streak ?? 1);

    if (loggedUser.defaultCourseId) {
      setEnrolledIds([loggedUser.defaultCourseId]);
      setActiveCourseId(loggedUser.defaultCourseId);
      setActiveTab('learn');
    } else {
      setEnrolledIds([]);
      setActiveCourseId(null);
      setActiveTab('learn');
    }
    setPhase('shell');
  };

  const handleEnrollCourse = (courseId) => {
    setEnrolledIds((prev) => (prev.includes(courseId) ? prev : [...prev, courseId]));
    setActiveCourseId(courseId);
    setActiveTab('learn');
  };

  const handleEnrollTrack = (courseIds) => {
    setEnrolledIds((prev) => {
      const merged = new Set([...prev, ...courseIds]);
      return Array.from(merged);
    });
    if (courseIds.length > 0) {
      setActiveCourseId(courseIds[0]);
    }
    setActiveTab('learn');
  };

  const handleUnenrollCourse = (courseId) => {
    setEnrolledIds((prev) => {
      const next = prev.filter((id) => id !== courseId);
      if (activeCourseId === courseId) {
        setActiveCourseId(next[0] || null);
      }
      return next;
    });
  };

  const openLessonWithOptionalFtue = (course, node, forceTutorial = false) => {
    const done = localStorage.getItem(FTUE_STORAGE_KEY) === 'true';
    setActiveLesson({ course, node });
    if (forceTutorial || !done) {
      setFtueStep(0);
      setFtueActive(true);
    } else {
      setFtueActive(false);
    }
  };

  const handleFtueNext = () => {
    if (ftueStep >= 2) {
      localStorage.setItem(FTUE_STORAGE_KEY, 'true');
      setFtueActive(false);
      setFtueStep(0);
      return;
    }
    setFtueStep((prev) => prev + 1);
  };

  const handleFtueSkip = () => {
    localStorage.setItem(FTUE_STORAGE_KEY, 'true');
    setFtueActive(false);
    setFtueStep(0);
  };

  const handleCompleteNode = (courseId, nodeId, gainedXp) => {
    setXp((prev) => prev + gainedXp);
    setCompletedNodeIds((prev) => {
      const existing = prev[courseId] || [];
      if (existing.includes(nodeId)) return prev;
      return { ...prev, [courseId]: [...existing, nodeId] };
    });

    if (nodeId === 'n5') {
      const course = COURSES.find((c) => c.id === courseId);
      if (course) {
        setCertificates((prev) => {
          const alreadyHas = prev.some((cert) => cert.title === course.title);
          if (alreadyHas) return prev;
          return [
            {
              id: `cert-${course.id}-${Date.now()}`,
              title: course.title,
              issuer: course.institution,
              completedAt: '17 November 2026',
              grade: '100%',
              verifyCode: `PULSE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            },
            ...prev,
          ];
        });
      }
    }

    setActiveLesson(null);
  };

  const handleResetTutorial = () => {
    localStorage.removeItem(FTUE_STORAGE_KEY);
  };

  const handleClearEnrollments = () => {
    setEnrolledIds([]);
    setActiveCourseId(null);
    setActiveTab('learn');
  };

  const handleLogout = () => {
    setActiveLesson(null);
    setFtueActive(false);
    setPhase('auth');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F3F4F6] flex items-center justify-center">
      <div
        ref={shellRef}
        className="h-[100dvh] w-full max-w-[430px] mx-auto overflow-hidden select-none bg-white border-x border-[#E5E7EB] relative"
      >
        {phase === 'splash' && (
          <SplashScreen onComplete={() => setPhase('auth')} />
        )}

        {phase === 'auth' && <WelcomeLoginScreen onLogin={handleLogin} />}

        {phase === 'shell' && !activeLesson && (
          <>
            <main className="h-full w-full overflow-hidden">
              {activeTab === 'explore' && (
                <ExploreTab
                  enrolledIds={enrolledIds}
                  onEnrollCourse={handleEnrollCourse}
                  onOpenCourse={(id) => {
                    setActiveCourseId(id);
                    setActiveTab('learn');
                  }}
                />
              )}

              {activeTab === 'career' && (
                <CareerTab
                  enrolledIds={enrolledIds}
                  onEnrollTrack={handleEnrollTrack}
                />
              )}

              {activeTab === 'learn' && (
                <LearnTab
                  enrolledIds={enrolledIds}
                  activeCourseId={activeCourseId}
                  onSelectCourse={setActiveCourseId}
                  onUnenrollCourse={handleUnenrollCourse}
                  completedNodeIds={completedNodeIds}
                  xp={xp}
                  streak={streak}
                  onGoExplore={() => setActiveTab('explore')}
                  onStartNode={(course, node) =>
                    openLessonWithOptionalFtue(course, node, false)
                  }
                  onReplayTutorial={(course) =>
                    openLessonWithOptionalFtue(
                      course,
                      course.nodes[1] || course.nodes[0],
                      true
                    )
                  }
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  xp={xp}
                  streak={streak}
                  certificates={certificates}
                  onResetTutorial={handleResetTutorial}
                  onClearEnrollments={handleClearEnrollments}
                  onLogout={handleLogout}
                />
              )}

              {activeTab === 'search' && (
                <SearchTab
                  enrolledIds={enrolledIds}
                  onEnrollCourse={handleEnrollCourse}
                  onOpenCourse={(id) => {
                    setActiveCourseId(id);
                    setActiveTab('learn');
                  }}
                />
              )}
            </main>

            <BottomDock activeTab={activeTab} onChangeTab={setActiveTab} />
          </>
        )}

        {phase === 'shell' && activeLesson && (
          <LessonPlayer
            course={activeLesson.course}
            node={activeLesson.node}
            xp={xp}
            ftueActive={ftueActive}
            ftueStep={ftueStep}
            containerRef={shellRef}
            onFtueNext={handleFtueNext}
            onFtueSkip={handleFtueSkip}
            onReplayTutorial={() => {
              setFtueStep(0);
              setFtueActive(true);
            }}
            onClose={() => {
              setFtueActive(false);
              setActiveLesson(null);
            }}
            onCompleteNode={handleCompleteNode}
          />
        )}
      </div>
    </div>
  );
}

