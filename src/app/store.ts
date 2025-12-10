// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice';
import accountsReducer from '../features/accounts/accountsSlice';
import transactionsReducer from '../features/transactions/transactionsSlice';
import budgetsReducer from '../features/budgets/budgetsSlice';
import { baseApi } from '../services/baseApi';
// UPDATE THIS IMPORT PATH:
import { groupsApi } from '../features/groups/groupsApi'; // Changed from '../services/groupsApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [groupsApi.reducerPath]: groupsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(groupsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;