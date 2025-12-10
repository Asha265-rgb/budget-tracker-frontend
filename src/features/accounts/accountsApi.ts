// src/features/accounts/accountsApi.ts
import { baseApi } from '../../services/baseApi';

// Account Interface
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  accountNumber?: string;
  bankName?: string;
  status: string;
  isDeleted: boolean;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Create Account DTO - Fixed with all required fields
export interface CreateAccountDto {
  name: string;
  type: string;
  balance?: number;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
  color?: string;
  icon?: string;
  userId: string;
  status?: string;
  isDeleted?: boolean;
}

// Update Account DTO (optional fields) - FIXED: Add balance property
export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  id?: never; // Prevent id from being sent in updates
  balance?: number; // Add this line - balance is now included
}

// Inject endpoints into the base API
export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all accounts for a user
    getAccounts: builder.query<Account[], string>({
      query: (userId: string) => ({
        url: `/accounts/user/${userId}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Account' as const, id })),
              { type: 'Account' as const, id: 'LIST' },
            ]
          : [{ type: 'Account' as const, id: 'LIST' }],
    }),
    
    // Create a new account - FIXED to match backend expectations
    createAccount: builder.mutation<Account, CreateAccountDto>({
      query: (accountData: CreateAccountDto) => {
        console.log('🔄 API: Transforming account data for backend...');
        console.log('📤 Original data:', accountData);
        
        // Transform to match backend expectations
        // Backend expects ONLY: name, type, balance, currency, userId
        const backendData = {
          name: accountData.name,
          type: accountData.type,
          balance: accountData.balance || 0,
          currency: accountData.currency || 'USD',
          userId: accountData.userId // REQUIRED: Make sure this is included
        };
        
        console.log('✅ Sending to backend:', backendData);
        
        return {
          url: '/accounts',
          method: 'POST',
          body: backendData, // Send ONLY what backend expects
        };
      },
      invalidatesTags: [{ type: 'Account' as const, id: 'LIST' }],
    }),
    
    // Get single account by ID
    getAccount: builder.query<Account, string>({
      query: (id: string) => ({
        url: `/accounts/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id: string) => [{ type: 'Account' as const, id }],
    }),
    
    // Update an account - FIXED: Now UpdateAccountDto includes balance
    updateAccount: builder.mutation<Account, { id: string; data: UpdateAccountDto }>({
      query: ({ id, data }: { id: string; data: UpdateAccountDto }) => ({
        url: `/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }: { id: string }) => [{ type: 'Account' as const, id }],
    }),
    
    // Delete an account
    deleteAccount: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id: string) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id: string) => [{ type: 'Account' as const, id }],
    }),
    
    // Optional: Get accounts by type
    getAccountsByType: builder.query<Account[], { userId: string; type: string }>({
      query: ({ userId, type }: { userId: string; type: string }) => ({
        url: `/accounts/user/${userId}/type/${type}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Account' as const, id }))
          : [],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useGetAccountQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetAccountsByTypeQuery,
} = accountsApi;