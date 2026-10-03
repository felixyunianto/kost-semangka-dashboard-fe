export type TDashboardBillStat = {
  count: number;
  payableAmount: string | number;
};

export type TDashboardSummary = {
  properties: {
    total: number;
  };
  rooms: {
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  occupants: {
    active: number;
  };
  bills: {
    unpaid: TDashboardBillStat;
    overdue: TDashboardBillStat;
    pending: TDashboardBillStat;
    paidThisMonth: TDashboardBillStat;
  };
};
