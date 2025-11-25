
import React, { useState, useEffect } from 'react';
import { Planner, DayEntry } from './types';
import DayModal from './components/DayModal';
import { Calendar, PenLine, Flag, HelpCircle, Menu, Plus, Trash2, X, ChevronRight } from 'lucide-react';

// Helper to generate IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Initial empty planner factory
const createNewPlanner = (title: string = '새로운 플래너'): Planner => ({
  id: generateId(),
  title,
  startDate: '',
  goal: '',
  entries: {},
});

const App: React.FC = () => {
  // State for list of planners
  const [planners, setPlanners] = useState<Planner[]>(() => {
    try {
      // 1. Try to load new multi-planner format
      const savedPlanners = localStorage.getItem('selfCarePlanners');
      if (savedPlanners) {
        return JSON.parse(savedPlanners);
      }
      
      // 2. Fallback: Check for old single-planner format and migrate
      const oldState = localStorage.getItem('selfCareState');
      if (oldState) {
        const parsed = JSON.parse(oldState);
        return [{
          id: generateId(),
          title: '나의 자기 관리',
          startDate: parsed.startDate || '',
          goal: parsed.goal || '',
          entries: parsed.entries || {}
        }];
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }

    // 3. Default: Return one new planner
    return [createNewPlanner()];
  });

  // State for active planner ID
  const [activePlannerId, setActivePlannerId] = useState<string>(() => {
    const savedId = localStorage.getItem('activePlannerId');
    // Verify the saved ID actually exists in our planners list
    if (savedId) return savedId;
    return ''; // Will be set in effect if empty
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Ensure there is always an active planner
  useEffect(() => {
    if (planners.length > 0) {
      const exists = planners.find(p => p.id === activePlannerId);
      if (!exists) {
        setActivePlannerId(planners[0].id);
      }
    }
  }, [planners, activePlannerId]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('selfCarePlanners', JSON.stringify(planners));
    localStorage.setItem('activePlannerId', activePlannerId);
  }, [planners, activePlannerId]);

  // Get current planner object
  const currentPlanner = planners.find(p => p.id === activePlannerId) || planners[0];

  // --- Handlers ---

  const handleAddPlanner = () => {
    const newPlanner = createNewPlanner(`플래너 ${planners.length + 1}`);
    setPlanners([...planners, newPlanner]);
    setActivePlannerId(newPlanner.id);
    setIsSidebarOpen(false); // Optional: close sidebar on create
  };

  const handleDeletePlanner = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (planners.length <= 1) {
      alert("최소 하나의 플래너는 있어야 합니다.");
      return;
    }
    if (window.confirm("정말로 이 플래너를 삭제하시겠습니까? 복구할 수 없습니다.")) {
      const newPlanners = planners.filter(p => p.id !== id);
      setPlanners(newPlanners);
      if (activePlannerId === id) {
        setActivePlannerId(newPlanners[0].id);
      }
    }
  };

  const updateCurrentPlanner = (updates: Partial<Planner>) => {
    setPlanners(prev => prev.map(p => 
      p.id === activePlannerId ? { ...p, ...updates } : p
    ));
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleSaveEntry = (entry: DayEntry) => {
    const updatedEntries = {
      ...currentPlanner.entries,
      [entry.dayNumber]: entry,
    };
    updateCurrentPlanner({ entries: updatedEntries });
  };

  const handleStartDateChange = (date: string) => {
    updateCurrentPlanner({ startDate: date });
  };

  const handleGoalChange = (goal: string) => {
    updateCurrentPlanner({ goal });
  };

  const handleTitleChange = (title: string) => {
    updateCurrentPlanner({ title });
  };

  // Helper to calculate End Date
  const getEndDate = () => {
    if (!currentPlanner?.startDate) return '';
    const start = new Date(currentPlanner.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 99);
    return end.toISOString().split('T')[0];
  };

  // Helper to calculate progress percentage
  const getProgress = () => {
    if (!currentPlanner) return 0;
    // Explicitly type 'e' as DayEntry
    const completedCount = Object.values(currentPlanner.entries).filter((e: DayEntry) => e.completed).length;
    return completedCount; 
  };

  const renderGrid = () => {
    const rows = [];
    if (!currentPlanner) return null;

    for (let i = 0; i < 10; i++) {
      const startDay = i * 10 + 1;
      const endDay = (i + 1) * 10;
      const cells = [];

      for (let day = startDay; day <= endDay; day++) {
        const entry = currentPlanner.entries[day];
        const isCompleted = entry?.completed;
        const mood = entry?.mood;

        let bgClass = "bg-slate-100 hover:bg-blue-50 text-slate-400"; // Default empty
        if (isCompleted) {
          switch (mood) {
            case 'happy': bgClass = "bg-rose-200 text-rose-700 border-rose-300"; break;
            case 'calm': bgClass = "bg-sky-200 text-sky-700 border-sky-300"; break;
            case 'neutral': bgClass = "bg-slate-200 text-slate-700 border-slate-300"; break;
            case 'tired': bgClass = "bg-amber-100 text-amber-700 border-amber-300"; break;
            case 'sad': bgClass = "bg-indigo-200 text-indigo-700 border-indigo-300"; break;
            case 'stressed': bgClass = "bg-red-200 text-red-700 border-red-300"; break;
            default: bgClass = "bg-blue-300 text-blue-800 border-blue-400";
          }
        }

        cells.push(
          <button
            key={day}
            onClick={() => handleDayClick(day)}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 
              flex items-center justify-center 
              rounded-md border border-transparent
              text-sm sm:text-base font-bold transition-all duration-200
              ${bgClass}
              ${!isCompleted && 'hover:scale-105 hover:shadow-md'}
            `}
          >
            {day}
          </button>
        );
      }

      rows.push(
        <div key={i} className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-20 sm:w-28 text-xs sm:text-sm font-medium text-slate-500 bg-rose-200/50 px-2 py-1 rounded-full text-center whitespace-nowrap">
            {startDay} - {endDay}일
          </div>
          <div className="flex gap-1.5 sm:gap-2 lg:gap-3">
            {cells}
          </div>
        </div>
      );
    }
    return rows;
  };

  if (!currentPlanner) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 pb-20 font-sans">
      
      {/* Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
           {/* Backdrop */}
           <div 
             className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
             onClick={() => setIsSidebarOpen(false)}
           />
           
           {/* Sidebar Content */}
           <div className="relative w-80 bg-white shadow-2xl h-full flex flex-col animate-slide-in-left">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-blue-600" />
                  내 플래너 목록
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {planners.map(planner => (
                  <div 
                    key={planner.id}
                    onClick={() => {
                      setActivePlannerId(planner.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                      ${activePlannerId === planner.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold truncate ${activePlannerId === planner.id ? 'text-blue-700' : 'text-slate-700'}`}>
                        {planner.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        진행률: {Object.values(planner.entries).filter((e: any) => e.completed).length}%
                      </p>
                    </div>
                    {activePlannerId === planner.id && (
                       <ChevronRight className="w-4 h-4 text-blue-400 mr-2" />
                    )}
                    <button 
                      onClick={(e) => handleDeletePlanner(e, planner.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="플래너 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={handleAddPlanner}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  새 플래너 만들기
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
               title="플래너 목록 열기"
             >
                <Menu className="w-6 h-6" />
             </button>

             <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

             <div className="flex-1">
               <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-400 font-medium hidden sm:inline-block uppercase tracking-wider">Planner:</span>
                 <input 
                    type="text" 
                    value={currentPlanner.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-lg sm:text-xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors w-full sm:w-64 placeholder-slate-400"
                    placeholder="플래너 제목 입력"
                 />
                 <PenLine className="w-4 h-4 text-slate-300" />
               </div>
             </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3 h-3" /> Start
              </label>
              <input 
                type="date" 
                value={currentPlanner.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              />
            </div>
            <div className="hidden sm:block text-slate-300">|</div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                 <Flag className="w-3 h-3" /> End
              </label>
              <div className="text-sm font-medium text-slate-700 px-2 py-1 min-w-[80px] sm:min-w-[100px] text-right sm:text-left">
                {getEndDate() || '-'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Board Section */}
          <section className="xl:col-span-8 bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-700">100-DAY SELF-CARE BOARD</h2>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                진행률: {getProgress()}%
              </div>
            </div>
            
            {/* The Grid Container - Horizontal scroll on mobile */}
            <div className="overflow-x-auto grid-scroll pb-4">
              <div className="min-w-[600px]">
                {renderGrid()}
              </div>
            </div>
            
            <p className="mt-6 text-center text-sm text-slate-400">
              * 숫자를 클릭하여 오늘의 활동과 기분을 기록하세요.
            </p>
          </section>

          {/* Sidebar: Goal & Info */}
          <section className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Goal Card */}
            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Flag className="w-24 h-24 text-indigo-600" />
               </div>
               
               <div className="relative z-10">
                 <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                   <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">Q</span>
                   목표 설정
                 </h3>
                 <p className="text-sm text-slate-600 mb-4 font-medium">
                   이 플래너에서 이루고 싶은 자기 관리 목표는 무엇인가요?
                 </p>
                 <textarea
                   className="w-full h-40 p-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-300 resize-none text-slate-700 placeholder-slate-400 bg-white"
                   placeholder="예: 매일 30분 산책하기, 물 2L 마시기, 하루 한 번 칭찬하기..."
                   value={currentPlanner.goal}
                   onChange={(e) => handleGoalChange(e.target.value)}
                 />
               </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <HelpCircle className="w-5 h-5 text-blue-400" />
                 사용 가이드
               </h3>
               <ul className="space-y-3 text-sm text-slate-600">
                 <li className="flex gap-2">
                   <span className="text-blue-500 font-bold">1.</span>
                   좌측 상단 메뉴 <Menu className="w-3 h-3 inline" /> 를 눌러 여러 플래너를 관리할 수 있습니다.
                 </li>
                 <li className="flex gap-2">
                   <span className="text-blue-500 font-bold">2.</span>
                   상단의 제목을 클릭하여 플래너 이름을 수정하세요.
                 </li>
                 <li className="flex gap-2">
                   <span className="text-blue-500 font-bold">3.</span>
                   매일 해당 숫자를 눌러 완료 여부와 기분을 기록하세요.
                 </li>
                 <li className="flex gap-2">
                   <span className="text-blue-500 font-bold">4.</span>
                   'AI 코치' 버튼을 눌러 내 상태에 맞는 자기 관리 팁을 받아보세요.
                 </li>
               </ul>
            </div>
            
          </section>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedDay && (
        <DayModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          dayNumber={selectedDay}
          entry={currentPlanner.entries[selectedDay] || { dayNumber: selectedDay, completed: false, content: '' }}
          goal={currentPlanner.goal}
          onSave={handleSaveEntry}
        />
      )}
    </div>
  );
};

export default App;
