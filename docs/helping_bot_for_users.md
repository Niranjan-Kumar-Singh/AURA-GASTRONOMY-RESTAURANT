# Helping Bot for Users (Floating Assistant Chatbot)

## Overview

A floating help chatbot for **customers only**. It answers questions about the
menu, cuisine, pricing, dietary options, allergens, reservations, and restaurant
policies. It is NOT a staff/waiter tool.

The floating launcher button sits next to the existing "Call Waiter" floating
action button (bottom-right of the customer screens).

---

## 1. Files Required (Frontend)

The launcher goes beside the existing Call Waiter floating icon
(`frontend/src/components/customer/CallWaiterButton.tsx`, fixed at
`bottom-20 right-4`). The new chatbot launcher should sit directly below it
(e.g. `bottom-40 right-4`) so the two never overlap.

| New File | Purpose |
| --- | --- |
| `frontend/src/components/customer/HelpBotLauncher.tsx` | Floating launcher button (MessageCircle icon) next to Call Waiter icon. Toggles the chat panel open/closed. |
| `frontend/src/components/customer/HelpBotPanel.tsx` | The chat window: header, message list, fixed quick-option chips, free-text input, typing indicator, 7 UI states (Loading / Error / Offline etc. per CONSTITUTION). |
| `frontend/src/services/chatbot.service.ts` | `chatbotService.sendMessage(text, context)` — POSTs the user's query to the backend and returns the answer. Follows the existing service pattern (`frontend/src/services/order.service.ts`). |
| `frontend/src/types/chatbot.types.ts` | Typed contracts: `ChatbotMessage`, `ChatbotOption`, `ChatbotResponse` (`{ reply: string; quickOptions?: ChatbotOption[] }`). |

### Integration Points (Modified Files)

| Existing File | Change |
| --- | --- |
| `frontend/src/pages/customer/MenuPage.tsx` | Render `<HelpBotLauncher tableId={tableId} />` alongside `<CallWaiterButton tableId={tableId} />` (currently line 333). |
| `frontend/src/pages/customer/OrderTrackingPage.tsx` | Same addition beside `<CallWaiterButton tableId={tableId} />` (currently line 409). |
| `frontend/src/components/customer/CustomerSidebar.tsx` (optional) | Optional entry point linking to the same bot. |

**Only customers see this.** Do NOT mount the launcher on kitchen/waiter/cashier/
admin layouts — those are staff screens wrapped in `AppLayout` and are role-gated
in `frontend/src/App.tsx`.

---

## 2. Initial Fixed Options (First Message)

The bot opens with a welcome message plus fixed quick-option chips so users can
start without typing:

1. **Today's Specials & Chef Recommendations**
2. **Menu & Cuisine Details** (what dishes are, how they are prepared)
3. **Pricing & Best Value Combos**
4. **Dietary & Allergen Info** (Vegetarian / Jain / Gluten-Free / allergens)
5. **Spice Levels & Customizations**
6. **Reservations & Table Booking**
7. **Restaurant Hours, Parking & Policies**
8. **Call Waiter for Human Help** (hand-off to the existing Call Waiter flow)

Each chip sends a predefined query string to the same chat endpoint. The reply
can return a new set of `quickOptions` to narrow the topic (e.g. "Pricing" →
per-category prices).

---

## 3. Where the Backend Code Resides

The AURA backend that the frontend actually talks to is the **Express/MongoDB**
API (`backend/server.js`, port 5000). The chatbot logic lives there, following
the existing route-file pattern (no separate controller layer in this backend).

| New File | Purpose |
| --- | --- |
| `backend/routes/chatbotRoutes.js` | `POST /api/chatbot` — receives `{ message, tableId, sessionId }`, returns `{ reply, quickOptions }`. |
| `backend/services/chatbotService.js` (new `backend/services/` folder) | Core answering logic: resolves fixed options / keyword intents, queries `MenuItem` + `Category` + `Coupon` + `Faq` models for live menu/pricing data, falls back to LLM generation if configured. |
| `backend/models/ChatbotConversation.js` | Optional: per-session message history in MongoDB for context. |
| `backend/knowledge/aura_faq.txt` (new) | Optional static knowledge source (hours, location, policies, GST) that is not already in DB. |

### Wired Into Existing Files

- `backend/server.js` — mount `app.use('/api', chatbotRoutes);` alongside the
  other route mounts (lines 23–29).
- `api/index.js` (Vercel serverless entry) — mount the same route so the
  deployed serverless API also serves the chatbot.

The Spring Boot backend (`backend/src/main/java/com/restaurant/`) is a separate
parallel implementation not used by the frontend; the chatbot is added to the
Express backend only, unless it is deliberately migrated to Spring Boot later.

---

## 4. How the Interface Communicates with the Backend

1. **Request** — the React panel calls
   `chatbotService.sendMessage(text, { tableId, sessionId })`, which does
   `apiClient.post('/chatbot', payload)` through the shared Axios client
   (`frontend/src/services/api-client.ts`, base URL `http://localhost:5000/api`
   in dev, `/api` in production).
2. **Backend processing** — `chatbotRoutes.js` receives the JSON body, delegates
   to `chatbotService`, which:
   - Checks the message against the fixed option / intent registry;
   - Queries MongoDB via the existing `MenuItem`, `Category`, `Coupon`, `Faq`
     models for up-to-date menu, pricing and FAQ data (never hardcoded prices);
   - Optionally appends context from `ChatbotConversation` history;
   - Optionally calls a configured LLM (e.g. Groq/LangChain, same as the
     `restaurant_chatbot` demo) with the fetched data as grounding to phrase a
     friendly, concise answer.
3. **Response** — the route returns `{ data: { reply, quickOptions } }` (same
   `{ data: ... }` envelope used by every other route in this API).
4. **Render** — the panel appends `reply` as a bot bubble, renders any returned
   `quickOptions` as new chips, and keeps history in component state (or in
   `ChatbotConversation` on the backend if persistence is required).

### Flow Diagram

```
User taps "Pricing" chip or types text
        │
        ▼
HelpBotPanel (frontend/src/components/customer/HelpBotPanel.tsx)
        │  POST /api/chatbot { message, tableId, sessionId }
        ▼
apiClient (frontend/src/services/api-client.ts → http://localhost:5000/api)
        │
        ▼
chatbotRoutes.js (backend/routes/chatbotRoutes.js)  ← mounted in server.js
        │
        ▼
chatbotService.js (backend/services/chatbotService.js)
        │  intent match → MongoDB (MenuItem/Category/Coupon/Faq)
        │  → optional LLM grounding
        ▼
{ data: { reply, quickOptions } }  ──►  HelpBotPanel renders bubble + chips
```

---

## Notes

- The bot answers from live DB data plus the knowledge file; it never guesses
  prices or availability.
- If no intent matches, the bot politely says it will check with the chef or
  manager (same policy as the existing waiter bot) and offers "Call Waiter".
- No auth required — the bot is for anonymous guests scanning a table QR.
