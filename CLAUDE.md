## Commands

```bash
# Install dependencies
npm install

# Run development server (hot-reload)
npm run serve

# Run on local network (accessible from phone/tablet over WiFi)
npm run serve -- --host 0.0.0.0

# Production build
npm run build

# Deploy Firebase Cloud Functions only
cd functions && firebase deploy --only functions

# Deploy Firestore security rules only
firebase deploy --only firestore:rules

# Access Vuex store from Chrome DevTools console
Array.from(document.querySelectorAll('*')).find(e => e.__vue_app__).__vue_app__.config.globalProperties.$store.state
```

## Architecture Overview

This is a **Vue 3 e-commerce SPA** (Options API) for a Bulgarian clothing store called "Невъзможен" (Nevyzmojen). Stack: Vue 3 + Vuex 4 + Vue Router 4 + Vuetify 3 + Firebase (Auth + Firestore) + vue-i18n.

### Site Structure

```
/ (root)
└── /store ──────────────────────── StorePage (product grid)
│       └── /store/:id ──────────── ProductPage (single product, add to basket)
│
├── /basket ─────────────────────── BasketPage (review items)
│       └── /checkout ───────────── CheckOutPage (address, delivery, payment)
│               └── /guest_signup ─ GuestSignUpPage (convert anon session → account)
│
├── /login ──────────────────────── LoginPage
│       └── /signup ─────────────── SignupPage (new full account)
│
├── /account ────────────────────── AccountPage (profile; full_user only)
├── /authed_orders ──────────────── AuthedOrdersPage (order history; full_user only)
└── /about ──────────────────────── AboutPage (info / contact)

Navigation header (all pages): About | Store | Account icon | Basket icon

Typical user journeys:
  Browse:    /store → /store/:id → /basket → /checkout
  Guest:     /checkout (as anon) → /guest_signup
  Auth:      /login → /account  or  /signup → /store
```

### Module System

The app uses a custom module registration pattern. Each feature module lives in `src/modules/<module_name>/` and exports an `index.js` with optional `router` and `store` keys. Modules are registered in `main.js` via `registerModules()` from `src/mainjsHelpers/register-modules.js`, which calls `router.addRoute()` and `store.registerModule()` for each.

Active modules:
- `store_page` — product listing/browsing
- `basket_page` — basket, checkout (`/basket`, `/checkout`), and guest signup (`/guest_signup`)
- `auth_and_accounts` — login, signup, account page
- `authed_orders_page` — order history (full auth required)
- `about_page`
- `3theme_pack` — theming
- `xhome_page_disabled` — disabled home page

Each module follows this structure:
```
src/modules/<name>/
  index.js       # exports { router, store? }
  router.js      # calls router.addRoute(moduleRoute)
  Module.vue     # layout shell with <router-view>
  views/         # page components
```

### Auth Flow

Auth is initialized in `src/mainjsHelpers/FirestoreSetup.js`:
1. Firebase Auth is set to `browserLocalPersistence`.
2. `onAuthStateChanged` fires on app start; it sets `store.authReady = true` and `store.authType` to one of: `"full_user"` | `"anon_user"` | `"null_user"`.
3. For `full_user`, it dispatches `fetchUserData` which loads the Firestore `/users/{uid}` doc into `store.userDetails`.

The global router guard in `src/router.js` waits for both `store.isLoading = false` and `store.authReady = true` before resolving any navigation. Protected routes and redirect logic is all centralized there.

Auth types matter for routing:
- `full_user` — fully registered account
- `anon_user` — anonymous Firebase session (used during guest checkout)
- `null_user` — not signed in

### Vuex Store

`src/store.js` is the main store. It imports two sub-modules registered under `modules`:
- `src/store_modules/products.js` — product array from Firestore
- `src/store_modules/filters.js` — categories and tags

App-wide config lives in `src/store_modules/appConfig.js` — update `globalContactEmail` here **and** in `functions/index.js` if the contact email changes.

The basket is persisted to `localStorage` as Base64-encoded JSON (`basketDetails` key). Basket items have shape: `{ internalProductId, quantity, size }`. The `getEnrichedBasket` getter merges basket items with full product data.

### Global Mixin

`src/mainjsHelpers/GLOBAL_vars_and_functions_Mixin.js` is registered as a global mixin in `main.js`. It exposes these computed properties everywhere:
- `userDetails`, `isLoading`, `userLang`, `pageLang`, `authReady`
- `type_of_user_auth` — the raw authType string
- `is_signed_in`, `full_user_authed`, `anon_user_authed`, `null_user_authed`
- `prodHasDiffSizes`, `globalContactEmail`, `contactNumber`, `globalCommunications_Email`

### Translations (i18n)

Translations live in `src/assets/text_translations/translations.json` with this structure:
```json
{
  "key_name": { "bg": "Bulgarian text", "en": "English text" }
}
```
`src/assets/text_translations/i18n.js` transforms this into vue-i18n's expected format. Use `$t("key_name")` in templates. Product name/description translations are added dynamically to i18n after products are fetched from Firestore (using `internalProductId` as the key prefix).

### Firebase Cloud Functions (`functions/`)

Single Express app exported as `exports.api` (Firebase Functions v2). Deployed at `https://api-fhjlccumqq-uc.a.run.app`. CORS is enabled for all origins. The `BREVO_KEY` secret must be set via `firebase functions:secrets:set BREVO_KEY`.

**Routes:**

- `POST /send-confirmation` — sends a transactional email via the Brevo SDK.
  - Request body: `{ to, subject, html, cc?, bcc? }` — `to`/`cc`/`bcc` can be a string, array of strings, or array of Brevo `{ email }` objects (normalized internally).
  - Sender is always `"НЕВЪЗМОЖЕН" <support@nevyzmojen.com>`.
  - Returns `{ success: true, messageId }` on success.

- `POST /speedy/office` — proxies the Speedy Bulgaria courier API (`https://api.speedy.bg/v1/location/office`) for office lookup. Forwards the request body as-is and returns the Speedy response.

**Firestore trigger:**

`setOrderTimestamps` fires on `orders/{orderId}` document creation and writes two fields back to the doc:
- `server_generated_timestamp` — Unix milliseconds (`Date.now()`)
- `server_generated_datetime` — ISO 8601 string

### Firestore Security Rules (`firestore.rules`)

Rules use three helper functions: `isSignedIn()` (auth != null), `isOwner(userId)` (uid matches), and `isAdmin()` (signed in + Firestore `/users/{uid}.user_role == "admin"`).

| Collection | Read | Write |
|---|---|---|
| `products/{productId}` | Public | Admin only; create/update require fields: `transparent_thumbnail`, `availableSizes`, `brand`, `category`, `price_eur` |
| `categories/{catId}` | Public | Admin only |
| `tags/{tagId}` | Public | Admin only |
| `orders/{orderId}` | `get`: admin or owner; `list`: admin (all) or owner (`resource.data.created_by_user_id == uid` — client query must include matching WHERE filter or Firestore rejects it) | `create`: any signed-in user (incl. anon) — must set `created_by_user_id == uid`, include `products_in_order` + `customer_details.email`; `update`/`delete`: admin only |
| `users/{userId}` | `get`: admin or owner; `list`: admin only | `create`: self only, `user_role` must be `"customer"`; `update`: admin (any field) or owner (cannot touch `user_role`); `delete`: admin only |
| Everything else | Denied | Denied |

### Adding a New Module

1. Copy an existing module folder (e.g. `2Blank_module_dont_modify`) and rename it.
2. In `main.js`: import the module and add it to the `registerModules({...})` call.
3. Define routes in the module's `router.js`.

## Domain & DNS (Namecheap — nevyzmojen.com)

DNS is managed in the Namecheap Advanced DNS tab. Here is what each record does and why it exists.

### Hosting

| Type | Host | Value | Purpose |
|---|---|---|---|
| A | `@` | `75.2.60.5` | Points the apex/root domain (`nevyzmojen.com`) to Netlify's load balancer. Apex domains cannot use CNAMEs (DNS limitation), so Netlify provides a dedicated IP. |
| CNAME | `www` | `nevyzmojen.netlify.app.` | Points `www.nevyzmojen.com` to the Netlify site. |

### Email Authentication (DKIM)

DKIM records let receiving mail servers verify that emails claiming to be from `@nevyzmojen.com` were actually sent by an authorized service. Each service that sends email on your behalf gets its own pair of DKIM CNAME records.

| Type | Host | Value | Purpose |
|---|---|---|---|
| CNAME | `brevo1._domainkey` | `b1.nevyzmojen-com.dkim.brevo.com.` | DKIM key 1 for Brevo (transactional emails sent via Cloud Functions) |
| CNAME | `brevo2._domainkey` | `b2.nevyzmojen-com.dkim.brevo.com.` | DKIM key 2 for Brevo |
| CNAME | `firebase1._domainkey` | `mail-nevyzmojen-com.dkim1._domainkey.firebasemail.com.` | DKIM key 1 for Firebase Auth emails (password reset, email verification) |
| CNAME | `firebase2._domainkey` | `mail-nevyzmojen-com.dkim2._domainkey.firebasemail.com.` | DKIM key 2 for Firebase Auth emails |

### Domain Verification

One-time ownership proofs required by each service before they allow sending from your domain.

| Type | Host | Value | Purpose |
|---|---|---|---|
| TXT | `@` | `firebase=nevyzmojen` | Proves domain ownership to Firebase |
| TXT | `@` | `brevo-code:291e1d8e9fb594c6cf567edef445703f` | Proves domain ownership to Brevo |

### DMARC

| Type | Host | Value | Purpose |
|---|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | Email policy record. `p=none` = monitoring mode only (no emails blocked). Failure reports are sent to Brevo for review. Upgrade `p=none` to `p=quarantine` or `p=reject` later if needed. |
