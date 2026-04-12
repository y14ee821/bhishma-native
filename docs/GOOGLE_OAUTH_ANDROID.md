# Google Sign-In on Android (Expo / React Native) + FastAPI backend

This document describes how Bhishma wires **Google OAuth on Android** with an **Expo dev/production build**, avoids **`ExpoWebBrowser`** issues on the login route, and verifies **ID tokens** on the **FastAPI** backend when tokens come from different OAuth client types (Android vs Web).

---

## 1. Android application id and scheme

- Use a valid Android **application id** / package (avoid reserved words like `native` in the last segment if tooling complains).
- Example package: `com.bhishma.bhishmanative`.
- Keep **`app.json`** aligned:
  - `expo.android.package`
  - `expo.scheme` (used with deep links / OAuth return)

Google’s Android OAuth client **package name** must match **`expo.android.package`** exactly.

---

## 2. Why login is split (native module + lazy loading)

**Problem:** Importing `expo-auth-session/providers/google` at the top of `LoginScreen.js` pulls in **`expo-web-browser`**, which calls **`requireNativeModule('ExpoWebBrowser')`**. If that runs before the native module graph is ready, or exports never run because the module throws, you see:

- `Cannot find native module 'ExpoWebBrowser'`
- `LoginScreen export is missing or invalid` (lazy import guard sees no export)

**Approach:**

| File | Role |
|------|--------|
| `src/screens/LoginScreen.js` | Default export only: small shell, `InteractionManager` (optional), `React.lazy` + `Suspense` for the panel. |
| `src/screens/LoginGooglePanel.js` | **iOS / default:** `expo-auth-session` + Google provider (may use `expo-web-browser`). |
| `src/screens/LoginGooglePanel.android.js` | **Android only:** no `expo-web-browser`. Opens **Chrome** via `expo-linking`, **PKCE** with `expo-crypto`, exchanges code with `https://oauth2.googleapis.com/token`, reads **`id_token`**. |
| `src/screens/loginGoogleShared.js` | Shared styles / themes. |
| `src/routes/Routes.js` | `lazy(() => import("../screens/LoginScreen"))` — expects **default** export from `LoginScreen.js`. |

Metro resolves **`LoginGooglePanel.android.js`** on Android instead of `LoginGooglePanel.js`.

**Dependencies (app):** `expo-linking`, `expo-crypto`, `axios` (and existing Expo packages). `expo-web-browser` remains for non-Android paths that need it.

---

## 3. Google Cloud Console (Android OAuth client)

1. **Credentials** → **OAuth 2.0 Client IDs** → **Android** client used by the app.
2. **Package name** = same as `app.json` → `android.package` (e.g. `com.bhishma.bhishmanative`).
3. **SHA-1 certificate fingerprint** = fingerprint of the keystore that signs the build you install:
   - Local **`expo run:android`**: usually the **debug** keystore SHA-1.
   - Play / EAS release: use the **upload** or **app signing** cert SHA-1 as Google documents for that track.
4. **Advanced settings** → enable **custom URI scheme** for OAuth redirects.  
   Since [Google’s OAuth custom URI restrictions](https://developers.googleblog.com/en/improving-user-safety-in-oauth-flows-through-new-oauth-custom-uri-scheme-restrictions/), new Android clients often need this enabled or the user sees **`invalid_request`** / “custom URI scheme is not enabled for your Android client”.
5. **Do not** use a **Web** application client id in the browser authorization URL together with a **custom-scheme** `redirect_uri`. Google returns errors such as **“Custom scheme URIs are not allowed for WEB client type”**.

**Redirect URI used in this app (Android panel):**

```text
<android.package>:/oauthredirect
```

Example: `com.bhishma.bhishmanative:/oauthredirect`  
(Optional override: `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` in the app `.env`.)

---

## 4. Mobile environment variables (`bhishma-native`)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | **Required** for `LoginGooglePanel.android.js`: Android OAuth **client id** (auth URL + token exchange). |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Web flows / other uses. |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Optional default / web. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | iOS builds. |
| `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` | Optional; must match what you send to Google if set. |

After editing `.env`, restart **Metro** (and rebuild the native app when you change native config or `app.json`).

---

## 5. Backend: why “Invalid Google token” happened

Google **ID tokens** are JWTs. The **`aud` (audience)** claim is the **OAuth client id** that minted the token:

- Android Linking + PKCE flow → **`aud`** = **Android** client id.
- Web sign-in → **`aud`** often = **Web** client id.

If FastAPI only passes **one** client id into `google.oauth2.id_token.verify_oauth2_token`, tokens from the **other** platform fail verification → **401 / “Invalid Google token”**.

---

## 6. Backend configuration (`bhishma-backend`)

### Code (`app/services/auth_service.py`)

- `verify_google_token` collects **allowed audiences** from:
  - `GOOGLE_CLIENT_ID` — supports **comma-separated** multiple client ids.
  - Optional: `GOOGLE_ANDROID_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_WEB_CLIENT_ID`.
- It tries `verify_oauth2_token` until one audience matches the token’s `aud`.

### Environment (`.env` next to the backend, loaded via `python-dotenv` in `app/database.py`)

Set at least one of:

- `GOOGLE_CLIENT_ID` — e.g. Web client id, or comma-separated list of all client ids that may appear in `aud`.
- **`GOOGLE_ANDROID_CLIENT_ID`** — same Android OAuth client id as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` on the phone.

See **`env.example`** in `bhishma-backend` for placeholders.

Restart **uvicorn** after changing backend `.env`.

---

## 7. Checklist for a new machine or new app

- [ ] `app.json`: `android.package` and `scheme` set.
- [ ] Google **Android** OAuth client: package + SHA-1 match the build; **custom URI scheme** enabled.
- [ ] App `.env`: `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` set.
- [ ] Backend `.env`: `GOOGLE_ANDROID_CLIENT_ID` (and/or comma-separated `GOOGLE_CLIENT_ID`) includes every client id that can appear as JWT `aud`.
- [ ] Restart Metro and backend.

---

## 8. Security notes

- Never commit real **`.env`** files. Use **`env.example`** without secrets.
- Rotate credentials if they are ever exposed in a repo or chat.

---

## References

- [Google: OAuth 2.0 for native apps](https://developers.google.com/identity/protocols/oauth2/native-app) (including custom URI scheme notes)
- [Google Developers Blog: OAuth custom URI scheme restrictions](https://developers.googleblog.com/en/improving-user-safety-in-oauth-flows-through-new-oauth-custom-uri-scheme-restrictions/)
