import { api } from './client'

export interface WalletBalance {
  balance: number
  currency: string
}

export interface WalletTransaction {
  id: string
  amount: number
  type: 'credit' | 'debit'
  description: string | null
  reference_id: string | null
  created_at: string
}

export interface WalletTransactionSummary {
  total_credits: number
  total_debits: number
  net_balance: number
  currency: string
}

export interface WalletTransactionList {
  transactions: WalletTransaction[]
  count: number
  skip: number
  limit: number
}

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWalletBalance: builder.query<WalletBalance, void>({
      query: () => '/wallet/me',
      providesTags: ['Wallet'],
    }),

    getWalletTransactions: builder.query<
      WalletTransactionList,
      { skip?: number; limit?: number; transaction_type?: 'credit' | 'debit' }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.skip !== undefined) searchParams.set('skip', String(params.skip))
        if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
        if (params.transaction_type) searchParams.set('transaction_type', params.transaction_type)
        return `/wallet/transactions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      },
      providesTags: ['Wallet'],
    }),

    getWalletTransactionSummary: builder.query<WalletTransactionSummary, void>({
      query: () => '/wallet/transactions/summary',
      providesTags: ['Wallet'],
    }),
  }),
})

export const {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useGetWalletTransactionSummaryQuery,
} = walletApi