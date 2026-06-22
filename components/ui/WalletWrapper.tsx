'use client'

import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import { closeWalletSidebar } from '@/lib/store/features/uiSlice'
import { WalletSidebar } from '@/components/client/WalletSidebar'
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery } from '@/lib/api/wallet'
import { useAuth } from '@/hooks/useAuth'

export function WalletWrapper() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAuth()
  const isWalletOpen = useAppSelector((state) => state.ui.isWalletOpen)

  const { data: walletBalance } = useGetWalletBalanceQuery(undefined, {
    skip: !isAuthenticated,
  })

  const { data: transactionsData } = useGetWalletTransactionsQuery(
    { limit: 50 },
    { skip: !isAuthenticated }
  )

  const balance = walletBalance?.balance || 0
  const transactions = transactionsData?.transactions || []

  return (
    <WalletSidebar
      isOpen={isWalletOpen}
      onClose={() => dispatch(closeWalletSidebar())}
      balance={balance}
      transactions={transactions}
    />
  )
}