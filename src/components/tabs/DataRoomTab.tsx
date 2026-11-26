import React, { useState } from 'react';
import { DATA_ROOM_ITEMS, DataRoomItem } from '../../engine/dataRoomFlags';
import { AlertCircle, Search, Filter, ShieldAlert, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export const DataRoomTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredItems = DATA_ROOM_ITEMS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceFile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.impactOnModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const highCount = DATA_ROOM_ITEMS.filter((i) => i.severity === 'high').length;
  const medCount = DATA_ROOM_ITEMS.filter((i) => i.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Headline Takeaway */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wider font-semibold text-amber-400">
          Due Diligence Audit & Findings (Sheet: Data_V3)
        </div>
        <h1 className="text-xl font-bold text-white mt-1">
          11 Critical Data Room Discrepancies & Underwriting Risks Identified
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Rigorous reconciliation across QuickBooks exports, signed LOIs, platform memos, tax returns, and WIP schedules.
        </p>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium uppercase">Total Discrepancies</div>
          <div className="text-2xl font-bold text-white mt-1">{DATA_ROOM_ITEMS.length} Items</div>
          <div className="text-xs text-slate-500 mt-1">Reconciled in Data_V3</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-rose-400 font-medium uppercase">High Severity</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{highCount} Critical</div>
          <div className="text-xs text-slate-500 mt-1">Immediate model impact</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-amber-400 font-medium uppercase">Medium Severity</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{medCount} Warnings</div>
          <div className="text-xs text-slate-500 mt-1">Contractual / timing gaps</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-blue-400 font-medium uppercase">Audited Files</div>
          <div className="text-2xl font-bold text-white mt-1">15 Files</div>
          <div className="text-xs text-slate-500 mt-1">Verified data room citations</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search findings, sources, or impacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="discrepancy">Discrepancy</option>
            <option value="finding">Finding</option>
            <option value="missing">Missing Data</option>
            <option value="balance_sheet">Balance Sheet</option>
            <option value="unmodeled">Unmodeled Asset</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0 ml-2">
            <span>Severity:</span>
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isHigh = item.severity === 'high';
          const isMed = item.severity === 'medium';

          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {item.id}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                      isHigh
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : isMed
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        : 'bg-blue-950 text-blue-400 border border-blue-800/60'
                    }`}
                  >
                    {item.severity} severity
                  </span>
                  <span className="text-xs text-slate-500 capitalize bg-slate-800/50 px-2 py-0.5 rounded">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-md">
                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{item.sourceFile}</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mt-1 mb-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {item.description}
              </p>

              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs">
                <span className="font-semibold text-blue-300">Model Impact & Underwriting Implication: </span>
                <span className="text-slate-300">{item.impactOnModel}</span>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 rounded-xl border border-slate-800">
            No data room flags match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
