import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { analyticsService } from '../service/analytics'
import { getConfigValue } from '@brojs/cli'

const apiBaseUrl = getConfigValue('eventura.back') || '/'

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

export interface User {
  id: number
  type: 'client' | 'vendor' | 'organizer'
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  companyName?: string
  contactPerson?: string
  createdAt?: string
  favorites?: number[]
  calendar?: string[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  type: 'client' | 'vendor' | 'organizer'
  companyName?: string
  contactPerson?: string
}

export interface AuthResponse {
  user: User
  token?: string
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  text: string
  read: boolean
  createdAt: string
}

export interface Chat {
  id: string
  otherUser: {
    id: number
    name: string
    avatar?: string
    type: string
  }
  lastMessage: {
    text: string
    createdAt: string
  } | null
  unreadCount: number
  updatedAt: string
}

export interface AgentPromptRequest {
  message: string
  sessionId?: string
}

export interface BookingData {
  shouldBook: boolean
  eventType?: string
  date?: string
  guestsCount?: string
  budget?: string
  city?: string
  description?: string
  dishes?: string
  otherDetails?: string
}

export interface AgentPromptResponse {
  message: string
  sessionId: string
  bookingData?: BookingData
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ['Favorite', 'Service', 'Vendor', 'Message', 'Chat'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/eventura/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/eventura/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/eventura/auth/me',
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/eventura/auth/user/${id}`,
    }),
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
    // Service management for vendors
    createService: builder.mutation<Service, Partial<Service>>({
      query: (body) => ({
        url: '/eventura/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation<Service, { id: number; data: Partial<Service> }>({
      query: ({ id, data }) => ({
        url: `/eventura/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Service'],
    }),
    deleteService: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/eventura/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
    // Vendor management
    updateVendor: builder.mutation<Vendor, { id: number; data: Partial<Vendor> }>({
      query: ({ id, data }) => ({
        url: `/eventura/vendors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Vendor'],
    }),
    // Messages
    getChats: builder.query<Chat[], number>({
      query: (userId) => `/eventura/messages/chats?userId=${userId}`,
      providesTags: ['Chat'],
    }),
    getMessages: builder.query<Message[], { userId1: number; userId2: number }>({
      query: ({ userId1, userId2 }) => `/eventura/messages/${userId1}/${userId2}`,
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation<Message, { senderId: number; receiverId: number; text: string }>({
      query: (body) => ({
        url: '/eventura/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Message', 'Chat'],
    }),
    markMessagesAsRead: builder.mutation<{ updated: number }, { userId1: number; userId2: number }>({
      query: ({ userId1, userId2 }) => ({
        url: `/eventura/messages/chats/${userId1}/${userId2}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message', 'Chat'],
    }),
    // Agent
    agentPrompt: builder.mutation<AgentPromptResponse, AgentPromptRequest>({
      query: (body) => ({
        url: '/eventura/agent/prompt',
        method: 'POST',
        body,
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
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetUserQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useUpdateVendorMutation,
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useAgentPromptMutation,
} = api
