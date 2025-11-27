import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { analyticsService } from '../service/analytics'

interface GenerateImageResponse {
  uuid: string
}

interface GenerateImageRequest {
  imagePrompt: string
  imagesStyle: string
}

// Eventura types
export interface Vendor {
  id: number
  type: 'vendor' | 'organizer'
  email: string
  companyName: string
  contactPerson: string
  phone: string
  city: string
  rating: number
  reviewsCount: number
  isOrganizer: boolean
  createdAt: string
}

export interface Service {
  id: number
  vendorId: number
  name: string
  category: string
  description: string
  priceMin: number
  priceMax: number
  unit: string
  duration: number
}

export interface Event {
  id: number
  clientId: number
  type: string
  title: string
  budget: number
  guestsCount: number
  date: string
  city: string
  description: string
  status: string
  createdAt: string
}

export interface Booking {
  id: number
  clientId: number
  vendorId: number
  serviceId: number
  eventId: number
  status: string
  totalPrice: number
  date: string
  createdAt: string
}

export interface AISearchRequest {
  eventType: string
  budget: number
  guestsCount: number
  date: string
  city: string
  description?: string
  clarificationCount?: number
}

export interface AISearchResponse {
  vendors: Array<{
    vendorId: number
    relevanceScore: number
    reason: string
    estimatedPrice?: number
  }>
  eventConcept: string
  estimatedCosts: Array<{
    category: string
    estimatedPrice: number
    notes?: string
  }>
  needsClarification?: boolean
  clarificationQuestion?: string
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Favorite'],
  endpoints: (builder) => ({
    generateImage: builder.mutation<GenerateImageResponse, GenerateImageRequest>({
      query: (body) => ({
        url: '/generate-image',
        method: 'POST',
        body,
      }),
    }),
    getAnalytics: builder.query({
      queryFn: () => {
        return analyticsService.getAnalytics().then(res => {
          return {
            data: res,
            error: undefined
          }
        }).catch(res => {
          return {
            data: undefined,
            error: res
          }
        })
      }
    }),
    // Eventura endpoints
    getVendors: builder.query<Vendor[], { city?: string; category?: string; minRating?: number }>({
      query: (params) => ({
        url: '/eventura/vendors',
        params,
      }),
    }),
    getVendor: builder.query<Vendor, number>({
      query: (id) => `/eventura/vendors/${id}`,
    }),
    getServices: builder.query<Service[], { category?: string; vendorId?: number; priceMin?: number; priceMax?: number }>({
      query: (params) => ({
        url: '/eventura/services',
        params,
      }),
    }),
    getEvents: builder.query<Event[], { clientId?: number; type?: string; status?: string }>({
      query: (params) => ({
        url: '/eventura/events',
        params,
      }),
    }),
    createEvent: builder.mutation<Event, Partial<Event>>({
      query: (body) => ({
        url: '/eventura/events',
        method: 'POST',
        body,
      }),
    }),
    getBookings: builder.query<Booking[], { clientId?: number; vendorId?: number; eventId?: number; status?: string }>({
      query: (params) => ({
        url: '/eventura/bookings',
        params,
      }),
    }),
    createBooking: builder.mutation<Booking, Partial<Booking>>({
      query: (body) => ({
        url: '/eventura/bookings',
        method: 'POST',
        body,
      }),
    }),
    aiSearch: builder.mutation<AISearchResponse, AISearchRequest>({
      query: (body) => ({
        url: '/eventura/ai-search',
        method: 'POST',
        body,
      }),
    }),
    getFavorites: builder.query<Vendor[], number>({
      query: (userId) => `/eventura/favorites/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Favorite', id: userId }],
    }),
    addFavorite: builder.mutation<{ success: boolean; favorites: number[] }, { userId: number; vendorId: number }>({
      query: ({ userId, vendorId }) => ({
        url: `/eventura/favorites/${userId}`,
        method: 'POST',
        body: { vendorId },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Favorite', id: userId }],
    }),
    removeFavorite: builder.mutation<{ success: boolean; favorites: number[] }, { userId: number; vendorId: number }>({
      query: ({ userId, vendorId }) => ({
        url: `/eventura/favorites/${userId}/${vendorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Favorite', id: userId }],
    }),
    getBooking: builder.query<any, number>({
      query: (id) => `/eventura/bookings/${id}`,
    }),
    updateBooking: builder.mutation<any, { id: number; data: Partial<Booking> }>({
      query: ({ id, data }) => ({
        url: `/eventura/bookings/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    updateVendorCalendar: builder.mutation<{ success: boolean; calendar: string[] }, { vendorId: number; calendar: string[] }>({
      query: ({ vendorId, calendar }) => ({
        url: `/eventura/vendors/${vendorId}/calendar`,
        method: 'PUT',
        body: { calendar },
      }),
    }),
  }),
})

export const { 
  useGenerateImageMutation, 
  useGetAnalyticsQuery,
  useGetVendorsQuery,
  useGetVendorQuery,
  useGetServicesQuery,
  useGetEventsQuery,
  useCreateEventMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useAiSearchMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
        useGetBookingQuery,
        useUpdateBookingMutation,
        useUpdateVendorCalendarMutation,
} = api
