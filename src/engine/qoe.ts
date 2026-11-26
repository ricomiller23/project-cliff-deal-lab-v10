import { Assumptions, QoEResult } from './types';

export const QOE_DATA = {
  rocmont: {
    reportedNetIncome: [1117997.03, 1865789.44, -124487.04, 1631852.28], // 2022, 2023, 2024, 2025
    managementAddbacks: [-94941.41, 442225.72, 1695288.92, -48940.56],
    modelEbitda: [1023055.62, 2308015.16, 1570801.88, 1582911.72],
    // Balance sheet (Data_V3)
    eidlDebt: 1791638.98,
    otherDebt: 142993.34,
    creditCards: -155776.18, // net credit balance -> MAX(0, CC) = 0
    overbillings: 820185.0,
    arOver90: 296084.27,
    loanToShareholder: 1359868.38,
    stockholderReceivable: 1095100.0,
  },
  salisbury: {
    reportedNetIncome: [-800415.53, 1024852.40, 605998.99, 1005254.79],
    managementAddbacks: [291863.82, -308396.15, 193464.97, 62901.0],
    modelEbitda: [-508551.71, 716456.25, 799463.96, 1068155.79],
    // Balance sheet (Data_V3)
    totalNotes: 692448.77,
    creditCards: 300787.89,
    overbillings: 0,
    arOver90: 942540.24,
  },
};

export function calcQoE(a: Assumptions): QoEResult {
  const haircut = a.diligenceHaircutAddbacks;
  const years = ['2022A', '2023A', '2024A', '2025A'];

  // Rocmont bridge
  const rocmontBridge = years.map((yr, idx) => {
    const ni = QOE_DATA.rocmont.reportedNetIncome[idx];
    const add = QOE_DATA.rocmont.managementAddbacks[idx];
    const modelEbitda = QOE_DATA.rocmont.modelEbitda[idx];
    const hc = -haircut * Math.max(0, add);
    const adjustedEbitda = modelEbitda + hc;
    const addPct = modelEbitda <= 0 ? 0 : add / modelEbitda;
    return {
      year: yr,
      netIncome: ni,
      addbacks: add,
      modelEbitda,
      haircut: hc,
      adjustedEbitda,
      addbacksPct: addPct,
    };
  });

  // Salisbury bridge
  const salisburyBridge = years.map((yr, idx) => {
    const ni = QOE_DATA.salisbury.reportedNetIncome[idx];
    const add = QOE_DATA.salisbury.managementAddbacks[idx];
    const modelEbitda = QOE_DATA.salisbury.modelEbitda[idx];
    const hc = -haircut * Math.max(0, add);
    const potentialAddback = (idx === 3 && a.includeSalisburyBadDebtAddback) ? a.salisburyBadDebtAmount : 0;
    const adjustedEbitda = modelEbitda + hc + potentialAddback;
    const addPct = modelEbitda <= 0 ? 0 : add / modelEbitda;
    return {
      year: yr,
      netIncome: ni,
      addbacks: add,
      modelEbitda,
      haircut: hc,
      adjustedEbitda,
      addbacksPct: addPct,
    };
  });

  // Net cash to seller after debt-like items
  // Rocmont
  const rocmontLoiCash = a.rocmontLoi.cashAtClosing;
  const rocmontDebt = -(QOE_DATA.rocmont.eidlDebt + QOE_DATA.rocmont.otherDebt);
  const rocmontCc = -Math.max(0, QOE_DATA.rocmont.creditCards);
  const rocmontOverbillings = -a.contractLiabilitiesDebtLikePct * QOE_DATA.rocmont.overbillings;
  const rocmontArReserve = -a.arOver90ReservePct * QOE_DATA.rocmont.arOver90;
  const rocmontNetCash = rocmontLoiCash + rocmontDebt + rocmontCc + rocmontOverbillings + rocmontArReserve;
  const rocmontShareholderNetting = -(QOE_DATA.rocmont.loanToShareholder + QOE_DATA.rocmont.stockholderReceivable);

  // Salisbury
  const salisburyLoiCash = a.salisburyLoi.cashAtClosing;
  const salisburyDebt = -QOE_DATA.salisbury.totalNotes;
  const salisburyCc = -QOE_DATA.salisbury.creditCards;
  const salisburyOverbillings = 0;
  const salisburyArReserve = -a.arOver90ReservePct * QOE_DATA.salisbury.arOver90;
  const salisburyNetCash = salisburyLoiCash + salisburyDebt + salisburyCc + salisburyOverbillings + salisburyArReserve;

  return {
    rocmontBridge,
    salisburyBridge,
    salisburyNetCashToSeller: {
      loiCash: salisburyLoiCash,
      lessDebt: salisburyDebt,
      lessCreditCards: salisburyCc,
      lessOverbillings: salisburyOverbillings,
      lessArReserve: salisburyArReserve,
      netCashToSeller: salisburyNetCash,
    },
    rocmontNetCashToSeller: {
      loiCash: rocmontLoiCash,
      lessDebt: rocmontDebt,
      lessCreditCards: rocmontCc,
      lessOverbillings: rocmontOverbillings,
      lessArReserve: rocmontArReserve,
      netCashToSeller: rocmontNetCash,
      shareholderBalancesNetting: rocmontShareholderNetting,
    },
  };
}
