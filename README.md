# Невъзможен (Nevyzmojen) — online clothing store

Source code for [nevyzmojen.com](https://nevyzmojen.com), a Bulgarian clothing store I designed, built and run in production.

> **This is a showcase copy.** It is a snapshot of the production codebase, published so the code can be read. Private notes and internal configuration have been removed, and the development history lives in a separate private repository, so this repo has a single commit and is not the deployment source.

## What it does

- Product catalogue with categories, tags, per-size stock and low-stock warnings
- Basket persisted across visits, with stock checks before checkout
- Checkout as a guest (anonymous session) or with an account, with courier office lookup through the Speedy Bulgaria API
- Guest sessions can be converted into full accounts after ordering
- Account page and order history for registered customers
- Admin pages for managing orders and stock
- Order confirmation emails
- Full Bulgarian and English translations

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 (Options API), Vuex 4, Vue Router 4, Vuetify 3, vue-i18n |
| Backend | Firebase Auth, Firestore, Cloud Functions v2 (Express) |
| Email | Brevo transactional API |
| Hosting | Netlify (frontend), Google Cloud Run (functions) |

## Where to look

| Path | What is there |
|---|---|
| [src/modules/](src/modules/) | Feature modules. Each one registers its own routes (and optionally a store module) through [register-modules.js](src/mainjsHelpers/register-modules.js) |
| [src/router.js](src/router.js) | Central navigation guard: waits for auth to resolve, then applies route protection for the three auth states (full account, anonymous, signed out) |
| [src/store.js](src/store.js) | Main Vuex store: basket, orders, user data |
| [src/modules/basket_page/views/CheckOutPage.vue](src/modules/basket_page/views/CheckOutPage.vue) | Checkout flow, including anonymous sign-in for guests |
| [firestore.rules](firestore.rules) | Security rules: public catalogue, owner-only orders and profiles, admin role, protection against role escalation |
| [functions/index.js](functions/index.js) | Cloud Functions: courier API proxy, email sending, order-creation trigger |
| [src/assets/text_translations/](src/assets/text_translations/) | Translation table and the vue-i18n adapter |

## Running it

```bash
npm install
npm run serve
```

The Cloud Functions need their own secrets (`BREVO_KEY`, `SPEEDY_USER`, `SPEEDY_PASS`), which are stored in Google Secret Manager and are not part of this repository.
