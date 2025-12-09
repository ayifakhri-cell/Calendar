import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarMode, CalendarEvent, ThemeState } from './types';
import { generateCalendarGrid, getNextMonth, getPrevMonth, getMonthName } from './utils/dateUtils';
import { generateThemeBanner, interpretHandwriting } from './services/geminiService';
import { GenerativeBanner } from './components/GenerativeBanner';
import { CalendarGrid } from './components/CalendarGrid';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import { 
  Pencil, 
  Eraser, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles,
  Check,
  X,
  Loader2,
  Hand
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [mode, setMode] = useState<CalendarMode>(CalendarMode.VIEW);
  const [theme, setTheme] = useState<ThemeState>({ imageUrl: null, prompt: '', isLoading: false });
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  // Refs
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Derived State
  const calendarDays = generateCalendarGrid(currentDate, events);
  const monthName = getMonthName(currentDate);

  // Initial Theme Load
  useEffect(() => {
    updateTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]); // Intentionally not depending on events to save API calls, update only on month change

  // Resize observer for canvas overlay
  useEffect(() => {
    const updateDimensions = () => {
      if (gridContainerRef.current) {
        setGridDimensions({
          width: gridContainerRef.current.offsetWidth,
          height: gridContainerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const updateTheme = async () => {
    setTheme(prev => ({ ...prev, isLoading: true }));
    const url = await generateThemeBanner(currentDate, events);
    setTheme({ imageUrl: url, prompt: '', isLoading: false });
  };

  const handlePrevMonth = () => setCurrentDate(getPrevMonth(currentDate));
  const handleNextMonth = () => setCurrentDate(getNextMonth(currentDate));

  const toggleDrawingMode = () => {
    if (mode === CalendarMode.VIEW) {
      setMode(CalendarMode.DRAW);
    } else {
      setMode(CalendarMode.VIEW);
      canvasRef.current?.clearCanvas();
    }
  };

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  const processHandwriting = async () => {
    if (mode !== CalendarMode.DRAW || !canvasRef.current) return;
    
    const imageData = canvasRef.current.getCanvasData();
    if (!imageData) {
      alert("Canvas is empty!");
      return;
    }

    setMode(CalendarMode.LOADING);

    try {
      const newEvents = await interpretHandwriting(imageData, currentDate);
      if (newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents]);
        canvasRef.current.clearCanvas();
        // Optional: Trigger theme update if significant events added
      } else {
        alert("Could not recognize any events. Try writing clearly, e.g., 'Dinner on Friday'.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process handwriting. Check console/API Key.");
    } finally {
      setMode(CalendarMode.VIEW);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header & Theme Banner */}
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-stone-800">
            <CalendarIcon className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">CalPal AI</span>
          </div>
          
          {/* Gesture/Nav Controls (Mocked visually as requested) */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-stone-200">
             <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <div className="px-3 py-1 text-sm font-medium text-stone-500 flex items-center gap-1 border-x border-stone-100">
                <Hand className="w-3 h-3" />
                <span className="hidden sm:inline">Gesture Nav Ready</span>
             </div>
             <button onClick={handleNextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600">
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        <GenerativeBanner 
          imageUrl={theme.imageUrl} 
          isLoading={theme.isLoading} 
          monthName={monthName}
        />
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="flex justify-end mb-4 gap-3 sticky top-4 z-30">
           {mode === CalendarMode.DRAW ? (
             <div className="bg-stone-900 text-white p-1.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
               <button 
                onClick={handleClearCanvas}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Clear Canvas"
               >
                 <Eraser className="w-5 h-5" />
               </button>
               <div className="w-px h-6 bg-white/20"></div>
               <button 
                onClick={toggleDrawingMode}
                className="p-2 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-full transition-colors"
                title="Cancel"
               >
                 <X className="w-5 h-5" />
               </button>
               <button 
                onClick={processHandwriting}
                className="bg-white text-stone-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-stone-100 transition-colors"
               >
                 <Sparkles className="w-4 h-4 text-indigo-600" />
                 Process AI
               </button>
             </div>
           ) : (
             <button
               onClick={toggleDrawingMode}
               disabled={mode === CalendarMode.LOADING}
               className="bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 font-medium"
             >
               {mode === CalendarMode.LOADING ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <Pencil className="w-5 h-5" />
               )}
               <span>{mode === CalendarMode.LOADING ? 'Analyzing...' : 'Add Event'}</span>
             </button>
           )}
        </div>

        {/* Grid Container with Overlay */}
        <div className="relative flex-1 rounded-xl shadow-sm border border-stone-200 bg-white" ref={gridContainerRef}>
          {/* The Calendar Grid */}
          <div className="absolute inset-0">
             <CalendarGrid days={calendarDays} />
          </div>

          {/* The Drawing Overlay */}
          <DrawingCanvas 
            ref={canvasRef}
            isActive={mode === CalendarMode.DRAW}
            width={gridDimensions.width}
            height={gridDimensions.height}
          />
          
          {/* Mode Indicator Overlay */}
          {mode === CalendarMode.DRAW && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
               <div className="bg-stone-900/5 backdrop-blur-[1px] absolute inset-0"></div>
               <div className="bg-white/90 px-6 py-3 rounded-xl shadow-lg border border-stone-200 flex flex-col items-center gap-1 z-20">
                 <Pencil className="w-8 h-8 text-stone-800" />
                 <p className="font-handwritten text-xl font-bold text-stone-800">Draw on the calendar!</p>
                 <p className="text-xs text-stone-500">Circle dates or write events (e.g. "Lunch Fri")</p>
               </div>
            </div>
          )}
        </div>

      </main>

      <footer className="mt-8 text-center text-stone-400 text-sm">
        <p>Powered by Google Gemini 2.5 & Imagen 3 • React 18 • Tailwind</p>
      </footer>
    </div>
  );
};

export default App;