import { lazy } from 'react'

export const HomePage = lazy(() => import(/* webpackChunkName: 'home' */'./home/home'))
export const ChatPage = lazy(() => import(/* webpackChunkName: 'chat' */'./chat'))
export const CatalogPage = lazy(() => import(/* webpackChunkName: 'catalog' */'./catalog'))
export const BookingPage = lazy(() => import(/* webpackChunkName: 'booking' */'./booking/booking'))
export const BookingDetailPage = lazy(() => import(/* webpackChunkName: 'booking-detail' */'./booking-detail/booking-detail'))
export const ProfilePage = lazy(() => import(/* webpackChunkName: 'profile' */'./profile/profile'))
export const VendorProfilePage = lazy(() => import(/* webpackChunkName: 'vendor-profile' */'./vendor-profile/vendor-profile'))
export const AuthPage = lazy(() => import(/* webpackChunkName: 'auth' */'./auth/auth'))
export const MessengerPage = lazy(() => import(/* webpackChunkName: 'messenger' */'./messenger/messenger'))
export const MessengerChatPage = lazy(() => import(/* webpackChunkName: 'messenger-chat' */'./messenger/chat'))

// Старые страницы (для совместимости)
export const MainPage = HomePage
export const OrdersPage = lazy(() => import(/* webpackChunkName: 'orders' */'./orders'))
export const AnalyticsPage = lazy(() => import(/* webpackChunkName: 'analytics' */'./analytics'))