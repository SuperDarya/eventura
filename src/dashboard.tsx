import React, { Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import { URLs } from './__data__/urls'
import { HomePage, ChatPage, CatalogPage, BookingPage, BookingDetailPage, ProfilePage, VendorProfilePage, AuthPage, MessengerPage, MessengerChatPage } from './pages'

const PageWrapper = ({ children }: React.PropsWithChildren) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
)

export const Dashboard = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.chat.url}
        element={
          <PageWrapper>
            <ChatPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.catalog.url}
        element={
          <PageWrapper>
            <CatalogPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.booking.url}
        element={
          <PageWrapper>
            <BookingPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.bookingDetail.url}
        element={
          <PageWrapper>
            <BookingDetailPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.profile.url}
        element={
          <PageWrapper>
            <ProfilePage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.vendorProfile.url}
        element={
          <PageWrapper>
            <VendorProfilePage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.auth.url}
        element={
          <PageWrapper>
            <AuthPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.messenger.url}
        element={
          <PageWrapper>
            <MessengerPage />
          </PageWrapper>
        }
      />
      <Route
        path={URLs.messenger.chat}
        element={
          <PageWrapper>
            <MessengerChatPage />
          </PageWrapper>
        }
      />
    </Routes>
  )
}
