import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isHydrated: boolean;
}

const initialState: ThemeState = {
  mode: 'light',
  isHydrated: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    hydrateTheme: (state) => {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('theme') as ThemeMode;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      state.mode = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
      state.isHydrated = true;
      document.documentElement.classList.toggle('dark', state.mode === 'dark');
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.mode);
        document.documentElement.classList.toggle('dark', state.mode === 'dark');
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.classList.toggle('dark', action.payload === 'dark');
      }
    },
  },
});

export const { hydrateTheme, toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;