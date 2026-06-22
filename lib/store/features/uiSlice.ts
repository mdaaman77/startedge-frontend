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
      state.isWalletOpen = true
    },
    closeWalletSidebar: (state) => {
      state.isWalletOpen = false
    },
    toggleWalletSidebar: (state) => {
      state.isWalletOpen = !state.isWalletOpen
    },
  },
})

export const { openWalletSidebar, closeWalletSidebar, toggleWalletSidebar } = uiSlice.actions
export default uiSlice.reducer
