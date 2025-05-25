import { Config, Record } from '@/types';
import { router } from '@inertiajs/react';
import { create } from 'zustand';
import axios from 'axios';

interface RecordsState {
    records: Record[] | [];
    setRecords: (newRecords: Record[]) => void;
    
    selectedRecord: Record | null;
    setSelectedRecord: (record: Record) => void;
    
    fetchRecords: () => void;
    fetchRecord: (id: string) => void;
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
    records: [],
    selectedRecord: null,

    setRecords: (newRecords) => set({ records: newRecords }),

    setSelectedRecord: (record: Record) => set({ selectedRecord: record }),

    fetchRecords: () => {
        axios.get('/api/records')
            .then(response => {
                console.log('Records fetched successfully:', response.data);
                get().setRecords(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch records:', error);
            });
    },

    fetchRecord: (id) => {
        axios.get(`/api/records/${id}`)
            .then(response => {
                get().setSelectedRecord(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch record:', error);
            });
    },
}));
