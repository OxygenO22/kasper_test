import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TableItem } from '../types/types';

const initialState = {
  data: [] as TableItem[],
  searchQuery: '',
};

export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<TableItem, 'id'>>) => {
      const newItem = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.data.push(newItem);
    },
    editItem: (state, action: PayloadAction<TableItem>) => {
      const index = state.data.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(item => item.id !== action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { addItem, editItem, deleteItem, setSearchQuery } = tableSlice.actions;
export default tableSlice.reducer;