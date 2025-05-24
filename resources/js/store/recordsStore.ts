import { Config, Record } from '@/types';
import { router } from '@inertiajs/react';
import { create } from 'zustand';
import axios from 'axios';

interface RecordsState {
    records: Record[] | [];
    setRecords: (newRecords: Record[]) => void;
    selectedRecord: Record | null;
    setSelectedRecord: (id: string) => void;
    fetchRecords: () => void;
    fetchRecordById: (id: string) => void;
    config: Config | null;
    setConfig: (config: Config) => void;
    fetchConfig: () => void;
    updateConfig: (config: Config) => void;
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
    records: [],
    selectedRecord: null,
    config: null,

    setConfig: (config) => {
        set({ config: config })
    },

    fetchConfig: () => {
        axios.get('/api/config')
            .then(response => {
                get().setConfig(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch config:', error);
            });
    },
    updateConfig: (config: Config) => {
        axios.put('/api/config', config)
            .then(response => {
                console.log('Config updated successfully:', response.data);
                get().setConfig(response.data);
            })
            .catch(error => {
                console.error('Failed to update config:', error);
            });
    },

    setRecords: (newRecords) => set({ records: newRecords }),


    setSelectedRecord: (id) => {
        get().fetchRecordById(id);
    },

    fetchRecords: async () => {
        axios.get('/api/records')
            .then(response => {
                get().setRecords(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch records:', error);
            });
    },
    fetchRecordById: (id) => {
        axios.get(`/api/records/${id}`)
            .then(response => {
                set({ selectedRecord: response.data });
            })
            .catch(error => {
                console.error('Failed to fetch record:', error);
            });
    },
}));
