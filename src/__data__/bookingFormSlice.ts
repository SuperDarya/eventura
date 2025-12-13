import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BookingFormState {
  eventType: string
  date: string
  guestsCount: string
  budget: string
  city: string
  description: string
  selectedVendors: number[]
}

const initialState: BookingFormState = {
  eventType: '',
  date: '',
  guestsCount: '',
  budget: '',
  city: '',
  description: '',
  selectedVendors: []
}

// Загружаем из localStorage при инициализации
const loadFromStorage = (): BookingFormState => {
  try {
    const saved = localStorage.getItem('bookingForm')
    if (saved) {
      return { ...initialState, ...JSON.parse(saved) }
    }
  } catch (error) {
  }
  return initialState
}

const bookingFormSlice = createSlice({
  name: 'bookingForm',
  initialState: loadFromStorage(),
  reducers: {
    updateField: (state, action: PayloadAction<{ field: keyof BookingFormState; value: string | number[] }>) => {
      state[action.payload.field] = action.payload.value as any
    },
    setFormData: (state, action: PayloadAction<Partial<BookingFormState>>) => {
      Object.assign(state, action.payload)
    },
    clearForm: () => {
      return initialState
    }
  }
})

export const { updateField, setFormData, clearForm } = bookingFormSlice.actions
export default bookingFormSlice.reducer

