export const LOGIN_ROUTE = '/login'
export const FORGOT_PASSWORD_ROUTE = '/forgot-password'
export const HOME_ROUTE = '/'
export const PROPERTIES_ROUTE = '/properties'
export const NEW_PROPERTY_ROUTE = `${PROPERTIES_ROUTE}/new`
export const ROOMS_ROUTE = '/rooms'

export const getPropertyRoomsRoute = (propertyId: string) => {
  return `${ROOMS_ROUTE}/${propertyId}`;
};

export const getNewRoomRoute = (propertyId: string) => {
  return `${ROOMS_ROUTE}/${propertyId}/new`;
};

export const getRoomEditRoute = (propertyId: string, roomId: string) => {
  return `${ROOMS_ROUTE}/${propertyId}/${roomId}/edit`;
};

export const getPropertyEditRoute = (propertyId: string) => {
  return `${PROPERTIES_ROUTE}/${propertyId}/edit`;
};
export const OCCUPANTS_ROUTE = '/occupants'
export const NEW_OCCUPANT_ROUTE = `${OCCUPANTS_ROUTE}/new`

export const getOccupantEditRoute = (occupantId: string) => {
  return `${OCCUPANTS_ROUTE}/${occupantId}/edit`;
};
export const BILLS_ROUTE = '/bills'
export const NEW_BILL_ROUTE = `${BILLS_ROUTE}/new`

export const getBillEditRoute = (billId: string) => {
  return `${BILLS_ROUTE}/${billId}/edit`;
};
export const PAYMENTS_ROUTE = '/payments'

export const getPaymentDetailRoute = (paymentId: string) => {
  return `${PAYMENTS_ROUTE}/${paymentId}`;
};
export const INCOMES_ROUTE = '/incomes'
export const NEW_INCOME_ROUTE = `${INCOMES_ROUTE}/new`
export const EXPENSES_ROUTE = '/expenses'
export const NEW_EXPENSE_ROUTE = `${EXPENSES_ROUTE}/new`
export const REPORTS_ROUTE = '/reports'
export const SETTINGS_ROUTE = '/settings'

export const getIncomeEditRoute = (entryId: string) => {
  return `${INCOMES_ROUTE}/${entryId}/edit`;
};

export const getExpenseEditRoute = (entryId: string) => {
  return `${EXPENSES_ROUTE}/${entryId}/edit`;
};

export const PUBLIC_ROUTES = [LOGIN_ROUTE, FORGOT_PASSWORD_ROUTE] as const