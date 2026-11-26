import React, { useEffect } from 'react';
import { useDealStore } from '../store/useDealStore';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface TourStepInfo {
  title: string;
  description: string;
  targetArea: string;
  tabToOpen?: any;
}

const TOUR_STEPS: TourStepInfo[] = [
  {
    title: 'Welcome to Project Cliff Deal Lab',
    description:
      'A real-time financial calculation engine for an M&A roll-up of four contractors. Every formula from the financial model runs client-side with instant updates.',
    targetArea: 'Top Navigation & Brand',
    tabToOpen: 'command',
  },
  {
    title: 'Scenario Engine & Presets',
    description:
      'Instantly toggle between the optimistic Management Plan, the realistic Run-Rate Base case, and the Downside stress test. Select "Lender-friendly" or "Reprice to 4.5x" presets from the top bar.',
    targetArea: 'Top Header Controls',
    tabToOpen: 'command',
  },
  {
    title: 'Global Controls Rail',
    description:
      'The left sidebar houses all model inputs: Senior debt financing, signed LOI terms for Rocmont & Salisbury, operating margins, and deal toggles (Knighthawk, Real Estate). Every slider recalculates the model instantly.',
    targetArea: 'Left Rail Levers',
    tabToOpen: 'deal_structure',
  },
  {
    title: 'Returns & 7x7 Valuation Heatmaps',
    description:
      'Inspect sponsor MOIC and IRR factoring in follow-on cash shortfall capital calls. Click any cell in the 7x7 Exit Multiple vs EBITDA matrix to immediately apply that valuation assumption.',
    targetArea: 'Returns Tab & Heatmaps',
    tabToOpen: 'returns',
  },
  {
    title: 'Debt Capacity & Covenant Solvers',
    description:
      'Model 2 sizes max senior debt capacity across 3, 5, 7, and 10-year amortization periods. Use the Goal Seek solver to automatically calculate the maximum loan supported at a 1.25x DSCR covenant.',
    targetArea: 'Debt Capacity Screen',
    tabToOpen: 'debt_capacity',
  },
  {
    title: 'Live Engine Diagnostics & Export',
    description:
      'Run all 10 acceptance tests live in your browser to verify mathematical parity against the Excel benchmark. When finished, export a comprehensive multi-tab Excel workbook or summary JSON.',
    targetArea: 'Diagnostics & Exports',
    tabToOpen: 'diagnostics',
  },
];

export const TourOverlay: React.FC = () => {
  const { tourStep, setTourStep, setActiveTab } = useDealStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tourStep !== null) {
        setTourStep(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tourStep, setTourStep]);

  if (tourStep === null || tourStep < 0 || tourStep >= TOUR_STEPS.length) {
    return null;
  }

  const step = TOUR_STEPS[tourStep];
  const isFirst = tourStep === 0;
  const isLast = tourStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setTourStep(null);
    } else {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      if (TOUR_STEPS[nextStep].tabToOpen) {
        setActiveTab(TOUR_STEPS[nextStep].tabToOpen);
      }
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevStep = tourStep - 1;
      setTourStep(prevStep);
      if (TOUR_STEPS[prevStep].tabToOpen) {
        setActiveTab(TOUR_STEPS[prevStep].tabToOpen);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>
              STEP {tourStep + 1} OF {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={() => setTourStep(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Body */}
        <div>
          <h3 className="text-lg font-bold text-white">{step.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-2 font-mono">{step.targetArea}</p>
          <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-2">
          {TOUR_STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === tourStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => setTourStep(null)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow"
            >
              <span>{isLast ? 'Get Started' : 'Next'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
