import React, { useEffect } from 'react';
import { useDealStore, TabId } from './store/useDealStore';
import { Header } from './components/Header';
import { LeftRail } from './components/LeftRail';

// Screen Tabs
import { CommandCenterTab } from './components/tabs/CommandCenterTab';
import { DealStructureTab } from './components/tabs/DealStructureTab';
import { ThreeStatementTab } from './components/tabs/ThreeStatementTab';
import { ReturnsTab } from './components/tabs/ReturnsTab';
import { DebtCapacityTab } from './components/tabs/DebtCapacityTab';
import { QoETab } from './components/tabs/QoETab';
import { CashFlow13WTab } from './components/tabs/CashFlow13WTab';
import { RocmontWipTab } from './components/tabs/RocmontWipTab';
import { PriceLabTab } from './components/tabs/PriceLabTab';
import { RiskMonteCarloTab } from './components/tabs/RiskMonteCarloTab';
import { TaxStructureTab } from './components/tabs/TaxStructureTab';
import { PlanVsActualTab } from './components/tabs/PlanVsActualTab';
import { DataRoomTab } from './components/tabs/DataRoomTab';
import { DiagnosticsTab } from './components/tabs/DiagnosticsTab';

// Modals and Drawers
import { GoalSeekModal } from './components/GoalSeekModal';
import { DiffDrawer } from './components/DiffDrawer';
import { ScenarioCompareModal } from './components/ScenarioCompareModal';
import { TourOverlay } from './components/TourOverlay';

import {
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Landmark,
  Calculator,
  Calendar,
  Briefcase,
  DollarSign,
  ShieldAlert,
  FileCheck,
  TrendingDown,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';

interface TabConfig {
  id: TabId;
  label: string;
  badge?: string;
  icon: React.ReactNode;
  shortcut: string;
}

const TABS: TabConfig[] = [
  { id: 'command', label: 'Command Center', icon: <LayoutDashboard className="w-3.5 h-3.5" />, shortcut: '1' },
  { id: 'deal_structure', label: 'Deal Structure', icon: <Layers className="w-3.5 h-3.5" />, shortcut: '2' },
  { id: 'financial_statements', label: 'Financial Statements', icon: <FileSpreadsheet className="w-3.5 h-3.5" />, shortcut: '3' },
  { id: 'returns', label: 'Returns & Heatmap', icon: <TrendingUp className="w-3.5 h-3.5" />, shortcut: '4' },
  { id: 'debt_capacity', label: 'Debt Capacity', icon: <Landmark className="w-3.5 h-3.5" />, shortcut: '5' },
  { id: 'qoe', label: 'Quality of Earnings', icon: <Calculator className="w-3.5 h-3.5" />, shortcut: '6' },
  { id: 'cash13w', label: '13-Week Cash', icon: <Calendar className="w-3.5 h-3.5" />, shortcut: '7' },
  { id: 'wip', label: 'Rocmont WIP', icon: <Briefcase className="w-3.5 h-3.5" />, shortcut: '8' },
  { id: 'price_lab', label: 'Price Lab', icon: <DollarSign className="w-3.5 h-3.5" />, shortcut: '9' },
  { id: 'risk', label: 'Risk / Monte Carlo', icon: <ShieldAlert className="w-3.5 h-3.5" />, shortcut: 'R' },
  { id: 'tax', label: 'Tax & Structure', icon: <FileCheck className="w-3.5 h-3.5" />, shortcut: 'T' },
  { id: 'plan_vs_actual', label: 'Plan vs Actual', icon: <TrendingDown className="w-3.5 h-3.5" />, shortcut: 'P' },
  { id: 'data_room', label: 'Data Room (11 Flags)', icon: <FolderOpen className="w-3.5 h-3.5" />, shortcut: 'D' },
  { id: 'diagnostics', label: 'Diagnostics', icon: <CheckCircle2 className="w-3.5 h-3.5" />, shortcut: 'X' },
];

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    undo,
    redo,
    setGoalSeekModalOpen,
    setDiffDrawerOpen,
    setScenarioCompareOpen,
    setTourStep,
  } = useDealStore();

  // Route & Hash Listener for direct navigation (e.g. /diagnostics, /financial_statements)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();

      if (path === 'diagnostics' || hash === 'diagnostics') {
        setActiveTab('diagnostics');
      } else if (path === 'financial_statements' || path === 'three_stmt' || hash === 'financial_statements' || hash === 'three_stmt') {
        setActiveTab('financial_statements');
      } else if (path === 'returns' || hash === 'returns') {
        setActiveTab('returns');
      } else if (path === 'deal_structure' || hash === 'deal_structure') {
        setActiveTab('deal_structure');
      } else if (path === 'debt_capacity' || hash === 'debt_capacity') {
        setActiveTab('debt_capacity');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, [setActiveTab]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        const tabIdx = parseInt(e.key, 10) - 1;
        if (tabIdx < TABS.length) {
          setActiveTab(TABS[tabIdx].id);
        }
      } else if (e.key.toLowerCase() === 'g') {
        setGoalSeekModalOpen(true);
      } else if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.metaKey) {
        setDiffDrawerOpen(true);
      } else if (e.key.toLowerCase() === 'c') {
        setScenarioCompareOpen(true);
      } else if (e.key.toLowerCase() === 't') {
        setTourStep(0);
      } else if (e.key.toLowerCase() === 'x') {
        setActiveTab('diagnostics');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, undo, redo, setGoalSeekModalOpen, setDiffDrawerOpen, setScenarioCompareOpen, setTourStep]);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans">
      {/* Sticky Header with scenario switch & sticky KPI strip */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Rail (Inputs & Assumptions) */}
        <LeftRail />

        {/* Primary Content View */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Secondary Tab Bar */}
          <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-6 py-2 overflow-x-auto shrink-0 shadow-sm">
            <div className="flex items-center gap-1.5 min-w-max">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id || (tab.id === 'financial_statements' && activeTab === 'three_stmt');
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.shortcut && (
                      <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-blue-700 text-blue-200' : 'bg-slate-800/80 text-slate-500'}`}>
                        {tab.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Component Container */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fade-in">
            {activeTab === 'command' && <CommandCenterTab />}
            {activeTab === 'deal_structure' && <DealStructureTab />}
            {(activeTab === 'financial_statements' || activeTab === 'three_stmt') && <ThreeStatementTab />}
            {activeTab === 'returns' && <ReturnsTab />}
            {activeTab === 'debt_capacity' && <DebtCapacityTab />}
            {activeTab === 'qoe' && <QoETab />}
            {activeTab === 'cash13w' && <CashFlow13WTab />}
            {activeTab === 'wip' && <RocmontWipTab />}
            {activeTab === 'price_lab' && <PriceLabTab />}
            {activeTab === 'risk' && <RiskMonteCarloTab />}
            {activeTab === 'tax' && <TaxStructureTab />}
            {activeTab === 'plan_vs_actual' && <PlanVsActualTab />}
            {activeTab === 'data_room' && <DataRoomTab />}
            {activeTab === 'diagnostics' && <DiagnosticsTab />}
          </main>
        </div>
      </div>

      {/* Global Modals & Drawers */}
      <GoalSeekModal />
      <DiffDrawer />
      <ScenarioCompareModal />
      <TourOverlay />
    </div>
  );
};

export default App;
