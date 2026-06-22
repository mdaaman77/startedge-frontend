import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  isWalletOpen: boolean
}

const initialState: UIState = {
  isWalletOpen: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openWalletSidebar: (state) => {
      console.log('🔓 openWalletSidebar reducer called')
      state.isWalletOpen = true
    },
    closeWalletSidebar: (state) => {
      console.log('🔒 closeWalletSidebar reducer called')
      state.isWalletOpen = false
    },
    toggleWalletSidebar: (state) => {
      console.log('🔄 toggleWalletSidebar reducer called')
      state.isWalletOpen = !state.isWalletOpen
    },
  },
})

export const { openWalletSidebar, closeWalletSidebar, toggleWalletSidebar } = uiSlice.actions
export default uiSlice.reducer