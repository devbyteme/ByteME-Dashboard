# Customer Login Flow - Updated

## Overview
The customer login flow has been updated to provide a better user experience by offering customers a clear choice between Email authentication and Guest mode immediately after scanning a QR code.

## New Flow Diagram

```
QR Code Scan
    ↓
Customer Login Selection Page
    ↓
    ├─→ Email Login → Customer Auth Page (Login/Register/Google OAuth)
    │                       ↓
    │                  Customer Menu (Authenticated)
    │
    └─→ Guest Mode → Customer Menu (Guest Session)
```

## Pages Overview

### 1. Customer Login Selection (`/customer-login-selection`)
**Purpose:** First page customers see after scanning a QR code

**Features:**
- Display restaurant name and table number
- Two clear options:
  - **Email Login:** Full authentication with account benefits
  - **Guest Mode:** Quick access without creating an account
- Beautiful card-based UI with clear descriptions
- Shows ByteMe branding

**URL Parameters:**
- `restaurant` - The vendor/restaurant ID
- `table` - The table number

**Navigation:**
- Email button → `/customer-auth?restaurant={id}&table={num}`
- Guest button → `/customer-menu?restaurant={id}&table={num}&guest=true`

### 2. Customer Auth Page (`/customer-auth`)
**Purpose:** Handle email-based authentication

**Features:**
- Login tab (email + password)
- Register tab (create new account)
- Google OAuth authentication
- Forgot password link
- Back button to return to selection page

**Changes Made:**
- ✅ Removed "Continue as Guest" button (now on selection page)
- ✅ Added "Back to options" button
- ✅ Google OAuth properly redirects to menu after authentication

### 3. Customer Menu (`/customer-menu`)
**Purpose:** Display menu and allow ordering

**Changes Made:**
- ✅ Redirects to login selection page if not authenticated (instead of auth page)
- ✅ Still supports all authentication types (email, Google, guest)

## QR Code Generation Updates

### File: `QRGenerator.jsx`
**Change:** QR codes now redirect to `/customer-login-selection` instead of `/customer-menu`

```javascript
// OLD
const pagePath = "/customer-menu";

// NEW
const pagePath = "/customer-login-selection";
```

**Impact:** All newly generated QR codes will direct customers to the selection page first.

### Existing QR Codes
⚠️ **Important:** Old QR codes that point directly to `/customer-menu` will still work! The CustomerMenu component automatically redirects unauthenticated users to the login selection page.

## User Experience Flow

### Scenario 1: Email Login
1. Customer scans QR code
2. Lands on **Login Selection Page**
3. Clicks "Sign in with Email"
4. Lands on **Customer Auth Page**
5. Logs in or registers
6. Redirected to **Customer Menu** (authenticated)

### Scenario 2: Google OAuth
1. Customer scans QR code
2. Lands on **Login Selection Page**
3. Clicks "Sign in with Email"
4. Lands on **Customer Auth Page**
5. Clicks "Continue with Google"
6. Authenticates with Google
7. Redirected to **Customer Menu** (authenticated)

### Scenario 3: Guest Mode
1. Customer scans QR code
2. Lands on **Login Selection Page**
3. Clicks "Continue as Guest"
4. **Immediately** goes to **Customer Menu** (guest session)

### Scenario 4: Returning Customer
1. Customer scans QR code
2. Lands on **Login Selection Page**
3. Clicks "Sign in with Email"
4. Lands on **Customer Auth Page**
5. System detects existing valid session
6. **Auto-redirects** to **Customer Menu**

## Session Management

### Email/Google Authenticated Session
- Stored in `localStorage` as `customerToken` and `customerUser`
- Managed by `customerAuthService`
- Persists across page refreshes
- Valid until token expires (configurable on backend)

### Guest Session
- Stored in `localStorage` as:
  - `guestSession: 'true'`
  - `guestTimestamp: Date.now()`
  - `guestVendorId: vendorId`
  - `guestTableNumber: tableNumber`
- Valid for 24 hours
- Tied to specific vendor and table
- No personal data stored

## Benefits of New Flow

### For Customers
✅ **Clear Choice:** Immediately see options without hidden buttons
✅ **Faster Access:** Guest mode is one click from QR scan
✅ **Better UX:** No confusion about how to proceed
✅ **Flexibility:** Easy to go back and choose different option

### For Restaurants
✅ **Higher Engagement:** Clear value proposition for account creation
✅ **Reduced Friction:** Guests can order quickly without pressure
✅ **Better Analytics:** Clear distinction between authenticated and guest users
✅ **Backward Compatible:** Old QR codes still work

### For Development
✅ **Separation of Concerns:** Selection logic separate from auth logic
✅ **Maintainable:** Each page has single clear purpose
✅ **Testable:** Easy to test individual flows
✅ **Extensible:** Easy to add more login methods (e.g., SMS, social media)

## Files Modified

### New Files
- ✅ `src/pages/CustomerLoginSelection.jsx` - New selection page

### Modified Files
- ✅ `src/pages/index.jsx` - Added route for selection page
- ✅ `src/pages/QRGenerator.jsx` - Updated QR code URL
- ✅ `src/pages/QRScanner.jsx` - Updated demo navigation
- ✅ `src/pages/CustomerAuthPage.jsx` - Removed guest button, added back button
- ✅ `src/pages/CustomerMenu.jsx` - Updated redirect to selection page

## Testing Checklist

### QR Code Flow
- [ ] Generate new QR code
- [ ] Scan QR code
- [ ] Verify lands on login selection page
- [ ] Verify restaurant name and table number displayed

### Email Login Flow
- [ ] Click "Sign in with Email"
- [ ] Verify lands on customer auth page
- [ ] Test login with existing account
- [ ] Verify redirects to menu after successful login
- [ ] Test back button returns to selection page

### Google OAuth Flow
- [ ] From customer auth page, click "Continue with Google"
- [ ] Complete Google authentication
- [ ] Verify redirects back to menu with auth data
- [ ] Verify user info displayed in menu

### Guest Mode Flow
- [ ] From selection page, click "Continue as Guest"
- [ ] Verify immediately lands on customer menu
- [ ] Verify can browse menu and add items to cart
- [ ] Verify guest session persists on page refresh

### Registration Flow
- [ ] From customer auth page, switch to register tab
- [ ] Fill out registration form
- [ ] Submit registration
- [ ] Verify redirects to menu after successful registration

### Session Persistence
- [ ] Login as customer
- [ ] Close browser
- [ ] Scan QR code again
- [ ] Verify still authenticated (if within token validity)
- [ ] Verify can access menu without re-login

### Backward Compatibility
- [ ] Use old QR code (pointing to /customer-menu)
- [ ] Verify auto-redirects to login selection if not authenticated
- [ ] Verify authenticated users can access menu directly

## Environment Notes

### Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- QR codes generated with localhost URLs

### Production
- Update QR code generation to use production domain
- Ensure Google OAuth callback URLs include production domain
- Test complete flow in production environment

## Future Enhancements

### Potential Additions
1. **SMS Login:** Add phone number authentication option
2. **Social Media Login:** Facebook, Apple, etc.
3. **QR Code Analytics:** Track which option customers choose
4. **Personalized Recommendations:** Show popular items on selection page
5. **Table Availability:** Show table status before proceeding
6. **Multi-language Support:** Detect and display in customer's language
7. **Loyalty Program Integration:** Show points/rewards on selection page

---

**Last Updated:** October 6, 2025
**Version:** 2.0

