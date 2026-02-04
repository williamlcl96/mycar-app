import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { UserProvider } from "./contexts/UserContext"
import { LocationProvider } from "./contexts/LocationContext"
import { AppLayout } from "./components/layouts/AppLayout"
import { OwnerLayout } from "./components/layouts/OwnerLayout"
import { MockStateProvider } from "./lib/mockState"
import { NotificationProvider } from "./lib/notifications"
import { ChatProvider } from "./lib/chatState"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { WorkshopRegistration } from "./pages/WorkshopRegistration"
import { AuthLayout } from "./components/layouts/AuthLayout"
import { ScrollToTop } from "./components/ScrollToTop"

import { Profile } from "./pages/Profile"
// import { ProfileSubPage } from "./pages/ProfileSubPage" // Removed
import { EditProfile } from "./pages/profile/EditProfile"
import { ReferralPage } from "./pages/profile/ReferralPage"
import { SubscriptionPage } from "./pages/profile/SubscriptionPage"
import { SecurityPage } from "./pages/profile/SecurityPage"
import { NotificationsPage } from "./pages/profile/NotificationsPage"
import { NotificationSettings } from "./pages/profile/NotificationSettings"
import { LanguagePage } from "./pages/profile/LanguagePage"
import { SupportPage } from "./pages/profile/SupportPage"
import { MyVehicles } from "./pages/profile/MyVehicles"
import { AddVehicle } from "./pages/profile/AddVehicle"
import { QuoteApproval } from "./pages/booking/QuoteApproval"
import { Checkout } from "./pages/booking/Checkout"
import { PaymentProcessing } from "./pages/booking/PaymentProcessing"
import { PaymentSuccess } from "./pages/booking/PaymentSuccess"

import { RefundRequest } from "./pages/booking/RefundRequest"
import { RefundStatus } from "./pages/booking/RefundStatus"
import { WriteReview } from "./pages/profile/WriteReview"

import { CategoryListing } from "./pages/CategoryListing"
import { MoreCategories } from "./pages/MoreCategories"
import { WorkshopDetails } from "./pages/WorkshopDetails"
import { BookingPage } from "./pages/booking/BookingPage"
import { CheckoutPage } from "./pages/CheckoutPage"
import { ChatPage } from "./pages/ChatPage"
import { Messages } from "./pages/Messages"
import { BookingsPage } from "./pages/BookingsPage"

import { OwnerDashboard } from "./pages/owner/Dashboard"
import { OwnerProfilePage } from "./pages/owner/Profile"
import { OwnerJobsPage } from "./pages/owner/Jobs"
import { OwnerMessages } from "./pages/owner/Messages"
import { OwnerWalletPage } from "./pages/owner/Wallet"
import { Analytics } from "./pages/owner/Analytics"
import { OwnerCreateQuote } from "./pages/owner/CreateQuote"
import { OwnerJobDetails } from "./pages/owner/JobDetails"
import { OwnerQuoteDetails } from "./pages/owner/QuoteDetails"
import { EditShopProfile } from "./pages/owner/EditProfile"
import { OwnerNotificationsPage } from "./pages/owner/NotificationsPage"
import { OwnerNotificationSettings } from "./pages/owner/NotificationSettings"
import { OwnerSecurityPage } from "./pages/owner/SecurityPage"
import { RefundInbox } from "./pages/owner/RefundInbox"
import { RefundResolution } from "./pages/owner/RefundResolution"
import { OwnerReviewsPage } from "./pages/owner/Reviews"

// Placeholder Pages

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register-workshop" element={<WorkshopRegistration />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="garage" element={<MyVehicles />} />
        <Route path="category/:id" element={<CategoryListing />} />
        <Route path="category-more" element={<MoreCategories />} />
        <Route path="workshops/" element={<Navigate to="/" replace />} />

        <Route path="workshops/:id" element={<WorkshopDetails />} />
        <Route path="workshops/:id/book" element={<BookingPage />} />
        <Route path="workshops/:id/checkout" element={<CheckoutPage />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="profile/referral" element={<ReferralPage />} />
        <Route path="profile/subscription" element={<SubscriptionPage />} />
        <Route path="profile/security" element={<SecurityPage />} />
        <Route path="profile/notifications" element={<NotificationsPage />} />
        <Route path="profile/notification-settings" element={<NotificationSettings />} />
        <Route path="profile/language" element={<LanguagePage />} />
        <Route path="profile/support" element={<SupportPage />} />
        <Route path="profile/add-vehicle" element={<AddVehicle />} />
        <Route path="profile/edit-vehicle/:id" element={<AddVehicle />} />
        {/* Booking & Payment Flows */}
        <Route path="/bookings/:id/quote" element={<QuoteApproval />} />
        <Route path="/bookings/:id/checkout" element={<Checkout />} />
        <Route path="/payment/processing" element={<PaymentProcessing />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/bookings/:id/rate" element={<WriteReview />} />
        <Route path="/bookings/:id/refund" element={<RefundRequest />} />
        <Route path="/bookings/:id/refund-status" element={<RefundStatus />} />
      </Route>

      <Route path="/owner" element={<OwnerLayout />}>
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="quotes/:id" element={<OwnerQuoteDetails />} />
        <Route path="quotes/create/:id" element={<OwnerCreateQuote />} />
        <Route path="jobs" element={<OwnerJobsPage />} />
        <Route path="jobs/:id" element={<OwnerJobDetails />} />
        <Route path="messages" element={<OwnerMessages />} />
        <Route path="profile" element={<OwnerProfilePage />} />
        <Route path="profile/edit" element={<EditShopProfile />} />
        <Route path="notifications" element={<OwnerNotificationsPage />} />
        <Route path="profile/notification-settings" element={<OwnerNotificationSettings />} />
        <Route path="profile/security" element={<OwnerSecurityPage />} />
        <Route path="wallet" element={<OwnerWalletPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="disputes" element={<RefundInbox />} />
        <Route path="disputes/:id" element={<RefundResolution />} />
        <Route path="reviews" element={<OwnerReviewsPage />} />
      </Route>


      {/* Shared Routes (No Layout) */}
      <Route path="/messages/:id" element={<ChatPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export default function App() {
  if (typeof window !== 'undefined') {
    (window as any)._agent_test = 'ACTIVE_V4';
    window.onclick = (e) => {
      console.log('AGENT_CLICK_DETECTED', e.target);
    };
  }
  return (
    <UserProvider>
      <NotificationProvider>
        <ChatProvider>
          <LocationProvider>
            <MockStateProvider>
              <Router>
                <ScrollToTop />
                <AppRoutes />
              </Router>
            </MockStateProvider>
          </LocationProvider>
        </ChatProvider>
      </NotificationProvider>
    </UserProvider>
  )
}
