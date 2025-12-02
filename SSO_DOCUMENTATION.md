# Single Sign-On (SSO) Implementation

## Overview

Nebula Portal now supports Single Sign-On (SSO) authentication with multiple providers, allowing users to login securely using their existing accounts from Google, Microsoft, or GitHub.

## Features

### ✅ Supported Providers

- **Google OAuth 2.0** - Login with Google account
- **Microsoft OAuth 2.0** - Login with Microsoft/Outlook account
- **GitHub OAuth** - Login with GitHub account

### ✅ Key Features

- **Seamless Authentication** - One-click login with SSO providers
- **Auto Account Creation** - First-time SSO users automatically get accounts created
- **Session Management** - 24-hour secure sessions with auto-expiry
- **Account Linking** - Existing users can link their SSO accounts
- **Secure Logout** - Properly clears both SSO and local sessions
- **Role Preservation** - SSO users maintain their assigned roles

## How It Works

### 1. User Login Flow

```
User clicks SSO button → OAuth provider authentication →
Profile returned → Check if user exists →
Create/Link account → Create session → Redirect to dashboard
```

### 2. Session Management

- SSO sessions are stored in `localStorage` as `nebulaSSO`
- Session includes: token, expiry time (24h), userId, provider
- Sessions auto-validate on page load
- Expired sessions are automatically cleared

### 3. Account Creation

- **New Users**: Automatically created with `role: 'user'` and `isApproved: true`
- **Existing Users**: Must manually link SSO from settings (security measure)
- **SSO Users**: Cannot use password login (SSO-only)

## User Interface

### Login Page

The SSO buttons appear on the login screen below the traditional login form:

- Google button with Google logo and colors
- Microsoft button with Microsoft logo and colors
- GitHub button with GitHub logo
- Loading states while authenticating
- Error handling with user-friendly messages

### User Profile

SSO users can see their linked provider in their profile with provider icon.

## Technical Implementation

### Frontend Components

#### `/src/utils/sso.ts`

Core SSO utilities:

- `isSessionValid()` - Check if SSO session is active
- `getSession()` - Get current SSO session
- `createSession()` - Create new SSO session
- `clearSession()` - Clear SSO session
- `findUserByProvider()` - Find user by SSO provider
- `createSSOUser()` - Create new SSO user
- `simulateGoogleOAuth()` - Simulate Google OAuth (demo)
- `simulateMicrosoftOAuth()` - Simulate Microsoft OAuth (demo)
- `simulateGitHubOAuth()` - Simulate GitHub OAuth (demo)

#### `/src/components/auth/SSOButtons.tsx`

SSO authentication buttons component:

- Displays provider buttons
- Handles OAuth flow
- Manages loading states
- Creates/links user accounts
- Error handling

### Backend API Endpoints

```javascript
// Find user by SSO provider
GET /api/users/sso/:provider/:providerId

// Create or update SSO user
POST /api/users/sso
Body: {
  email, name, provider, providerId, picture, role
}

// Validate SSO session
POST /api/sso/validate
Body: {
  token, userId
}
```

### Database Schema

#### User Document (with SSO)

```javascript
{
  id: string,
  email: string,
  name: string,
  role: 'admin' | 'user' | 'manager',
  isApproved: boolean,
  // SSO Fields
  ssoLinked: boolean,
  provider: 'google' | 'microsoft' | 'github',
  providerId: string,
  picture?: string,
  createdAt: string
}
```

#### SSO Session (localStorage)

```javascript
{
  token: string,      // Secure random token
  expiresAt: number,  // Timestamp
  userId: string,     // User ID
  provider: string    // OAuth provider
}
```

## Security Features

### 1. Session Tokens

- Generated using `crypto.getRandomValues()`
- 32-byte random tokens
- Stored securely in localStorage
- Validated on each request

### 2. Session Expiry

- 24-hour session lifetime
- Automatic cleanup of expired sessions
- Re-authentication required after expiry

### 3. Account Protection

- Existing email accounts cannot be hijacked via SSO
- Manual linking required for existing users
- Provider ID verification

### 4. Logout Security

- Clears both SSO session and user data
- `handleSSOLogout()` ensures complete cleanup
- No residual session data

## Configuration

### Current Setup (Demo Mode)

The current implementation uses **simulated OAuth** for demonstration purposes. In production, you would integrate with actual OAuth providers.

### For Production OAuth

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Update `.env`:

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
```

#### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register application in Azure AD
3. Configure redirect URIs
4. Update `.env`:

```bash
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:8080/auth/microsoft/callback
```

#### GitHub OAuth Setup

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set callback URL
4. Update `.env`:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:8080/auth/github/callback
```

## Usage Examples

### For Users

#### First Time SSO Login

```
1. Go to login page
2. Click "Continue with Google" (or Microsoft/GitHub)
3. Authenticate with provider
4. Redirected to dashboard with new account
5. Default role: User
```

#### Returning SSO User

```
1. Go to login page
2. Click SSO button for linked provider
3. Instant authentication
4. Redirected to dashboard
```

#### Linking SSO to Existing Account

```
1. Login with password
2. Go to Profile settings
3. Click "Link Google Account" (future feature)
4. Authenticate with Google
5. Account now linked - can use either method
```

### For Developers

#### Check if user has active SSO session

```typescript
import { isSessionValid, getSession } from "../utils/sso";

// Check session validity
if (isSessionValid()) {
  const session = getSession();
  console.log("Active session:", session);
}
```

#### Handle SSO logout

```typescript
import { handleSSOLogout } from "../utils/sso";

const logout = () => {
  handleSSOLogout();
  navigate("/");
};
```

#### Create SSO user manually

```typescript
import { createSSOUser } from "../utils/sso";

const user = createSSOUser(
  "user@example.com",
  "John Doe",
  "google",
  "google_123456",
  "https://avatar.url/image.jpg"
);
```

## Testing

### Test SSO Login

1. Start the application
2. Navigate to login page
3. Click any SSO button
4. Wait for simulated OAuth (1 second)
5. You'll be logged in with a new account
6. Check console for debug logs

### Test Session Persistence

1. Login with SSO
2. Close browser tab
3. Open new tab to the app
4. Should still be logged in (session valid for 24h)

### Test Session Expiry

```javascript
// In browser console, manually expire session
const session = JSON.parse(localStorage.getItem("nebulaSSO"));
session.expiresAt = Date.now() - 1000; // Expire 1 second ago
localStorage.setItem("nebulaSSO", JSON.stringify(session));
// Refresh page - should be logged out
```

## Troubleshooting

### Issue: SSO button not showing

**Solution**: SSO buttons only appear on login screen, not signup

### Issue: "This email is already registered" error

**Solution**: This is intentional security. Login with password first to link SSO

### Issue: Session expires too quickly

**Solution**: Default is 24h. Modify in `createSession()` function

### Issue: SSO doesn't work in production

**Solution**: Replace simulation functions with actual OAuth client library

## Future Enhancements

- [ ] Account linking UI in user profile
- [ ] Support for additional providers (Twitter, LinkedIn, etc.)
- [ ] Multi-factor authentication (MFA)
- [ ] Social profile sync (update name/picture from provider)
- [ ] SSO session refresh without re-login
- [ ] Admin dashboard for SSO analytics
- [ ] Role assignment during SSO signup
- [ ] Enterprise SSO (SAML, OpenID Connect)

## Benefits

### For Users

✅ Faster login (one click)
✅ No passwords to remember
✅ More secure (OAuth 2.0)
✅ Use trusted accounts
✅ Auto account creation

### For Organization

✅ Reduced support tickets (password resets)
✅ Better security posture
✅ Improved user experience
✅ Enterprise-grade authentication
✅ Audit trails via providers

## Migration Guide

### From Password-Only to SSO

If you want to migrate existing users to SSO:

1. **Add linking UI** to user profile
2. **Prompt users** to link accounts
3. **Keep password auth** as fallback
4. **Gradually deprecate** password-only accounts
5. **Enforce SSO** for new users (optional)

### Database Migration

```javascript
// Add SSO fields to existing users
db.users.updateMany(
  { ssoLinked: { $exists: false } },
  { $set: { ssoLinked: false, provider: null, providerId: null } }
);
```

## Support

For issues or questions:

1. Check browser console for error messages
2. Verify localStorage contains `nebulaSSO` and `nebulaUser`
3. Check network tab for API errors
4. Review this documentation

## Credits

SSO implementation uses:

- OAuth 2.0 protocol
- Crypto Web API for secure tokens
- React hooks for state management
- LocalStorage for session persistence
