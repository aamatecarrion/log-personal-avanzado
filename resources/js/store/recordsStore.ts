import { create } from "zustand"
import { Record } from "@/types"

interface RecordsState {
  records: Record[]
  setRecords: (newRecords: Record[]) => void
  addRecord: (record: Record) => void
  removeRecord: (id: string) => void
  getRecordById: (id: string) => Record | undefined
  fetchRecords: () => Promise<void>
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],

  setRecords: (newRecords) => set({ records: newRecords }),
    
  fetchRecords: async () => {
    try {
      const response = await fetch("/api/records")
      if (!response.ok) throw new Error("Network response was not ok")
      const data: Record[] = await response.json()
      set({ records: data })
    } catch (error) {
      console.error("Failed to fetch records:", error)
    }
  },

  addRecord: (record) =>
    set((state) => ({ records: [...state.records, record] })),

  removeRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== Number(id)),
    })),

  getRecordById: (id) => get().records.find((r) => r.id === Number(id)),
}))