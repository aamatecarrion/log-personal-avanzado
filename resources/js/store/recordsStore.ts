import { Record } from '@/types';
import { create } from 'zustand';

interface RecordsState {
    records: Record[];
    setRecords: (newRecords: Record[]) => void;
    selectedRecord: Record | null;
    fetchRecords: () => Promise<void>;
    fetchRecordById: (id: string) => Promise<void>;
    setSelectedRecord: (id: string) => void;
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
    records: [],
    selectedRecord: null,

    setRecords: (newRecords) => set({ records: newRecords }),

    setSelectedRecord: (id) => {
        get().fetchRecordById(id);
    },

    fetchRecords: async () => {
        try {
            const response = await fetch('/api/records');
            if (!response.ok) throw new Error('Network response was not ok');
            const data: Record[] = await response.json();
            set({ records: data });
        } catch (error) {
            console.error('Failed to fetch records:', error);
        }
    },
    fetchRecordById: async (id) => {
        try {
            const response = await fetch(`/api/records/${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data: Record = await response.json();
            set({ selectedRecord: data });
        } catch (error) {
            console.error('Failed to fetch record:', error);
        }
    },
}));
