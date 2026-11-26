export interface DataRoomItem {
  id: string;
  category: 'discrepancy' | 'finding' | 'missing' | 'balance_sheet' | 'unmodeled';
  title: string;
  severity: 'high' | 'medium' | 'low';
  sourceFile: string;
  description: string;
  impactOnModel: string;
}

export const DATA_ROOM_ITEMS: DataRoomItem[] = [
  {
    id: 'FLAG-A',
    category: 'discrepancy',
    title: 'Plan vs Actual: 2026 Run-rate is ~23% below Management Plan',
    severity: 'high',
    sourceFile: 'Fixed - FP Combined Financials 2025-Sep 2026.xlsx, Rocmont P&Ls, Salisbury ProfitandLoss.pdf',
    description: 'Jan-Sep 2026 revenue and EBITDA are materially below the May 2026 model for all operating entities. Run-rate EBITDA is ~$1.1M vs $2.7M planned.',
    impactOnModel: 'Platform cannot support the $4.8M senior debt under Base case without follow-on equity injections ($2.13M needed).',
  },
  {
    id: 'FLAG-B',
    category: 'discrepancy',
    title: 'Salisbury LOI: Signed LOI differs from Platform Analysis Memo',
    severity: 'high',
    sourceFile: 'Salisbury Signed LOI (Sep 10, 2025) vs Consolidated Platform Analysis Memo (May 2026)',
    description: 'Signed LOI specifies $1.5M upfront cash, 30% rollover ($1.5M), and remaining $2.0M deferred in 5 equal annual installments. Memo uses 40% rollover ($2.0M) and $1.2M earnout.',
    impactOnModel: 'Model faithfully implements signed LOI terms (30% rollover, $2.0M deferred consideration over 5 years).',
  },
  {
    id: 'FLAG-C',
    category: 'discrepancy',
    title: 'Rocmont LOI: Exclusivity expired April 30, 2026 (Unsigned Extension)',
    severity: 'high',
    sourceFile: 'Rocmont LOI (Oct 15, 2025) & Rocmont LOI Extension letter (unsigned)',
    description: 'Rocmont exclusivity expired 4/30/2026. Extension letter in data room is unsigned. Treat deal as potentially lapsed or exposed to re-trading.',
    impactOnModel: 'Deal terms could re-price or seller could walk; model provides Price Lab to evaluate re-traded terms.',
  },
  {
    id: 'FLAG-D',
    category: 'discrepancy',
    title: 'Flood Pros + FIX 2025 EBITDA Discrepancy ($251K vs $132K vs -$46K)',
    severity: 'medium',
    sourceFile: 'FP Consolidated Model-May 2026.xlsx vs Fixed - FP Combined Financials 2025-Sep 2026.xlsx',
    description: 'Consolidated model shows $251K 2025 EBITDA; combined financials show $132K (includes $222K other income). True operating EBITDA was -$46K, and 2026 YTD operating is -$312K.',
    impactOnModel: 'FP/FIX is an operating drag; normalized Base margin set to 5.0% rather than historical negative numbers.',
  },
  {
    id: 'FLAG-E',
    category: 'finding',
    title: 'Rocmont 2024 EBITDA is 108% Management Add-Backs',
    severity: 'high',
    sourceFile: 'FP Consolidated Model-May 2026.xlsx (tab Consolidated Model)',
    description: 'Rocmont 2024 model EBITDA of $1.57M is net income of -$124K plus $1.70M of add-backs ($1.46M in "other add-backs"). Add-backs exceed 100% of reported EBITDA with zero support schedule.',
    impactOnModel: 'QoE diligence haircut at 50% cuts 2024 EBITDA down to $723K.',
  },
  {
    id: 'FLAG-F',
    category: 'balance_sheet',
    title: 'Rocmont Balance Sheet: $820K Stale Overbillings & $2.45M Shareholder Balances',
    severity: 'high',
    sourceFile: 'Rocmont Oct 2026 BS.pdf',
    description: 'Balance sheet carries $820,185 in overbillings (contract liabilities) unchanged since July 2026, plus $1.36M loan to shareholder and $1.10M stockholder receivable ($2.45M total), and $1.79M SBA EIDL.',
    impactOnModel: 'Overbillings are cash already spent on unfinished work; net cash to seller drops to -$1.16M if shareholder balances are settled.',
  },
  {
    id: 'FLAG-G',
    category: 'balance_sheet',
    title: 'Salisbury A/R Aging: $943K of $1.64M Over 90 Days (57% Overdue)',
    severity: 'high',
    sourceFile: 'Salisbury Plumbing LLC A_R Aging Summary Report - 03.31.2026.xlsx',
    description: 'Salisbury A/R over 90 days is $942,540.24 out of $1,640,043.29. A single homebuilder (Mark 25 Homes) accounts for $905,693.39 (96% of over-90 balances).',
    impactOnModel: 'QoE reserves 50% ($471K); net cash to seller at close drops to only $35K after debt payoffs and reserves.',
  },
  {
    id: 'FLAG-H',
    category: 'finding',
    title: 'Salisbury Cash Goes Negative in Week 3 of 13-Week Forecast',
    severity: 'high',
    sourceFile: 'Salisbury Plumbing BalanceSheet.pdf (May 31, 2026) & Aging Reports',
    description: 'Driven by heavy collection lag (10 weeks) and high operating costs (92.5%), Salisbury burns through its $218K opening cash and goes -$73K in Week 3, bottoming at -$291K in Week 10.',
    impactOnModel: 'Platform must fund Salisbury cash deficit or provide liquidity lines immediately upon closing.',
  },
  {
    id: 'FLAG-I',
    category: 'finding',
    title: 'Customer Concentration: Rocmont Top 4 = 81% of Revenue; Knighthawk Lennar = 37-41%',
    severity: 'medium',
    sourceFile: 'Rocmont 2025 Revenue by Client file & Knighthawk Ten Largest Customers file',
    description: 'Rocmont is highly reliant on KK Mechanical ($1.89M, 30%), DFCM State of Utah ($1.27M, 20%), USU ($1.18M, 19%), and Anderson Geneva ($818K, 13%). Knighthawk gets 37-41% from Lennar.',
    impactOnModel: 'Loss of any major account would trigger Downside scenario; Downside models 10% revenue drop and 3% margin loss.',
  },
  {
    id: 'FLAG-J',
    category: 'finding',
    title: 'Rocmont Real Estate: $3.69M Appraised vs $335K on Books (Collateral Upside)',
    severity: 'medium',
    sourceFile: 'Rocmont RE Appraisal (9/10/2026)',
    description: 'Appraisal values Rocmont facility at $3.69M as-is fee simple vs $335,609 book value ($3.35M unrecorded value). Unclear if real estate is included in the $5.05M LOI enterprise value.',
    impactOnModel: 'Offers strong collateral for senior lender advance, but must clarify ownership before closing.',
  },
  {
    id: 'FLAG-K',
    category: 'missing',
    title: 'Missing Documents in Data Room',
    severity: 'high',
    sourceFile: 'Datasite Data Room index',
    description: 'Data room lacks: Rocmont August 2026 P&L; Salisbury monthly P&Ls after May; Salisbury depreciation schedules; signed Rocmont LOI extension; lender term sheet; FP/FIX 2026 balance sheet.',
    impactOnModel: 'Estimates used for Rocmont Aug (interpolated) and FP 2026 balance sheet ($250k PP&E assumption).',
  },
];
