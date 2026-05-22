# ZoomClone — Interview Preparation Guide

## 1) Project Overview
- **Problem solved:** Enables browser-based real-time video meetings with chat and meeting history, reducing friction for quick ad-hoc calls.
- **Real-world use case:** Small teams, classrooms, interview practice, and remote family calls where users share a meeting code and instantly join.
- **Target users:** Students, individual creators, small groups, and developers needing lightweight video rooms.
- **Main purpose:** Deliver an end-to-end experience for authentication, joining/creating meetings, participating in WebRTC calls, chatting, and viewing prior sessions.
- **Why valuable:** Demonstrates full-stack ownership: React UI + authentication + REST APIs + Socket.IO signaling + WebRTC media + MongoDB persistence.
- **Core business logic:**
  1. User authenticates and receives a token.
  2. User enters meeting code.
  3. App stores meeting code in history.
  4. User joins room via Socket.IO signaling.
  5. Peers establish P2P streams via WebRTC.
  6. Chat and participant updates are broadcast in-room.

---

## 2) Tech Stack Analysis
### Frontend
- React + Vite
- React Router
- Material UI
- Axios
- Socket.IO client

### Backend
- Node.js + Express
- Socket.IO server
- Mongoose + MongoDB Atlas
- bcrypt
- crypto (random token generation)

### Database
- MongoDB (documents for `User` and `Meeting`)

### Auth method
- Custom token auth stored in `User.token` and browser localStorage.

### APIs used
- REST for auth/history (`/register`, `/login`, `/add_to_activity`, `/get_all_activity`)
- Socket.IO for real-time signaling and chat
- Browser Web APIs: `getUserMedia`, `getDisplayMedia`, WebRTC RTCPeerConnection

### State management
- React local state + Context (`AuthContext`) for auth/history actions.

### Deployment-related tools
- Vite config and static files exist on frontend.
- Backend currently starts directly via `node` entry.

### Why chosen + tradeoffs
- **React + MUI:** fast UI development, good DX; tradeoff is larger bundle than minimal CSS.
- **Socket.IO:** robust event abstraction and reconnection support; tradeoff is dependency overhead vs pure WebSocket.
- **MongoDB + Mongoose:** quick schema iteration; tradeoff is weaker relational integrity than SQL.
- **Custom token auth:** simple to implement; tradeoff is weaker security posture than signed JWT + expiry + refresh.

---

## 3) Architecture Explanation
### End-to-end flow
1. User opens app and navigates routes (`Landing`, `Authentication`, `Home`, `History`, meeting route).
2. Auth actions call backend REST endpoints through Axios client in `AuthContext`.
3. Backend validates credentials, hashes passwords, persists/fetches MongoDB data.
4. On meeting join, frontend writes activity history and navigates to `/:meetingCode`.
5. Video page initializes media permissions, opens Socket.IO connection, emits `join-call`.
6. Server tracks room membership in memory and relays `signal`/chat events.
7. Clients exchange SDP/ICE over Socket.IO and set up direct WebRTC streams.
8. UI renders local + remote streams and in-call controls.

### Request-response lifecycle (REST)
- Browser Axios request → Express route → Controller → Mongoose query/write → JSON response.

### Frontend-backend communication
- Axios for CRUD-like endpoints.
- Socket.IO for low-latency signaling/chat and membership events.

### DB interaction flow
- `register`: create `User` with bcrypt hash.
- `login`: fetch `User`, compare hash, persist generated token.
- `add_to_activity`: map token → username, create `Meeting` record.
- `get_all_activity`: map token → username, fetch matching `Meeting` records.

### Folder structure
- `backend/src/controllers`: API + socket logic
- `backend/src/models`: Mongoose schemas
- `backend/src/routes`: route definitions
- `frontend/src/pages`: feature pages
- `frontend/src/contexts`: shared auth actions
- `frontend/src/utils`: helpers and wrappers
- `frontend/src/styles`: module CSS + style helpers

### Middleware flow
- `cors`, `express.json`, `express.urlencoded` globally, then route mounting.

### Authentication flow
- Register -> hashed password stored.
- Login -> random token created + saved in DB.
- Token stored in localStorage and used for history APIs.
- `withAuth` checks localStorage token before protected pages.

### Error handling flow
- Try/catch in controllers and context methods.
- UI surfaces errors via text/Snackbar.
- Some routes still return generic `res.json` on error (needs stronger status discipline).

---

## 4) Feature Breakdown
## A) Authentication
- **What:** Register/login users.
- **How:** bcrypt hash on register; bcrypt compare on login; random token set in DB.
- **Files:** `backend/src/controllers/user.controller.js`, `backend/src/models/user.model.js`, `frontend/src/pages/Authentication.jsx`, `frontend/src/contexts/AuthContext.jsx`.
- **Endpoints:** `POST /register`, `POST /login`.
- **Models:** `User`.
- **Why approach:** Minimal custom auth to move fast.
- **Interview questions:** Why not JWT? How would you add refresh tokens? Why hash cost factor 10?

## B) Meeting History
- **What:** Stores and displays meeting codes joined by user.
- **How:** Client posts token + meeting code; server maps token to username and writes `Meeting`; history fetch queries by `user_id`.
- **Files:** `user.controller.js`, `meeting.model.js`, `History.jsx`, `Home.jsx`, `AuthContext.jsx`.
- **Endpoints:** `POST /add_to_activity`, `GET /get_all_activity`.
- **Models:** `Meeting`, `User`.
- **Why approach:** Lightweight audit trail.
- **Interview questions:** Why store `user_id` as username string? What are consistency risks?

## C) Real-time Video Call (WebRTC + Socket.IO)
- **What:** Multi-user room with audio/video/screen-share and chat.
- **How:** Socket server manages room IDs in-memory; clients exchange SDP/ICE over `signal`; WebRTC peer connections carry media.
- **Files:** `socketManager.js`, `VideoMeet.jsx`, `app.js`.
- **Socket events:** `join-call`, `signal`, `chat-message`, `user-joined`, `user-left`.
- **Why approach:** Standard architecture: signaling server + P2P media.
- **Interview questions:** Why STUN only? What happens behind symmetric NAT? How to scale rooms across instances?

---

## 5) Database Design
- **User schema:** name, userName(unique), password(hash), token.
- **Meeting schema:** user_id, meeting_code, date.
- **Relationship:** logical one-to-many (one user → many meetings), but not enforced via ObjectId ref.
- **Why chosen:** Simplicity and quick development.
- **Optimization present:** unique constraint on `userName`.
- **Missing optimizations:** indexes on `token`, `user_id`, maybe compound `(user_id, date desc)`.
- **Data flow example:** login returns token → token used to resolve user for history read/write.

---

## 6) Authentication & Security
### What’s implemented
- Password hashing via bcrypt.
- Basic auth guards in frontend (`withAuth`).
- Token-based lookup for history APIs.

### Risks / improvements (important for interviews)
- Hardcoded MongoDB credentials in source (critical risk).
- Token is random but no expiry/rotation/revocation strategy.
- Token stored in localStorage (XSS risk).
- No backend auth middleware protecting endpoints uniformly.
- CORS currently open to `*`.
- No request validation/sanitization rate limiting.

### Senior-level upgrade path
- Move secrets to env vars.
- JWT access + refresh tokens with expiry.
- HttpOnly secure cookies.
- Add auth middleware and role checks.
- Add zod/joi validation, helmet, rate limiter, audit logs.

---

## 7) Performance & Optimization
### Present
- React componentization and CSS modules.
- Local media stream reuse.
- Some cleanup paths for media tracks.

### Missing / opportunities
- No lazy route loading.
- No pagination for history.
- No debounce for frequent inputs.
- No caching layer for history APIs.
- Socket room/message state in memory (not horizontally scalable).
- Repeated socket connection logic in `VideoMeet` can cause duplicate connections/listeners.

### Scalability discussion
- For scale: Redis adapter for Socket.IO, distributed room state, TURN server for robust connectivity, and SFU (e.g., mediasoup/Janus) instead of pure mesh for large rooms.

---

## 8) Interview Preparation Scripts
### HR explanation (simple)
“I built a Zoom-like web app where users sign up, join calls with a meeting code, chat in real time, and view meeting history. I implemented both frontend and backend and integrated WebRTC for live media.”

### Technical explanation (mid-depth)
“React handles routing and call UI, while Express exposes auth/history APIs. Socket.IO is used as signaling transport for WebRTC offer/answer and ICE candidate exchange. MongoDB stores users and meeting activity. I used Context API to centralize auth/history actions on the frontend.”

### Deep technical explanation (senior)
“This system follows a hybrid architecture: REST for stateful business operations and event-driven signaling for real-time media orchestration. The signaling service tracks room membership and relays SDP/ICE, while the media plane remains peer-to-peer using RTCPeerConnection. Persistence is normalized enough for velocity but intentionally denormalized for history lookup, which I’d evolve using indexed references and auth middleware boundaries.”

### “Tell me about your project”
Focus: product goal → architecture → your ownership → tradeoffs → what you would improve next.

### “Challenges faced”
- WebRTC debugging across peers
- Device permission edge cases
- State synchronization for remote streams
- Socket lifecycle cleanup

### “Why this stack?”
- JavaScript end-to-end for speed
- React ecosystem for UI iteration
- Socket.IO for reliable real-time events
- MongoDB for flexible early-stage schema

### “What would you improve?”
- Secure auth (JWT+refresh+cookies)
- Infra scale (Redis adapter + TURN + SFU)
- Strong validation and observability
- Better error contracts and tests

### “What did YOU build specifically?”
- Auth flows + activity API integration
- Meeting UI and control logic
- Socket signaling and peer connection orchestration
- History display and route protection

---

## 9) Possible Interview Questions (with answer guidance)
> Use format: **Answer → Why → Common mistakes**

1. **How does WebRTC connection establishment work here?**
   - Answer: “Peers join a room via Socket.IO, exchange SDP offers/answers and ICE candidates through `signal`, then media flows directly P2P.”
   - Why: Separates signaling from media plane.
   - Mistakes: Saying Socket.IO carries video stream.

2. **Why use Socket.IO when WebRTC exists?**
   - Answer: “WebRTC needs signaling transport; Socket.IO provides reliable event semantics and reconnection support.”
   - Why: Faster to ship than raw WebSocket.
   - Mistakes: Confusing signaling with media transport.

3. **Biggest security gap?**
   - Answer: “Hardcoded DB credentials and non-expiring localStorage token. I’d fix with env vars + JWT expiry + HttpOnly cookies.”
   - Why: Reduces credential leakage/XSS impact.
   - Mistakes: Only mentioning password hashing.

4. **How would you scale to 100+ participants?**
   - Answer: “Move from mesh P2P to SFU and centralize signaling/session state with Redis-backed Socket.IO.”
   - Why: Mesh bandwidth complexity is O(n²).
   - Mistakes: Claiming current mesh can scale linearly.

5. **Why MongoDB here?**
   - Answer: “Simple user/history documents and quick iteration; minimal joins. For richer analytics/reporting, I’d consider relational modeling.”
   - Why: Product stage tradeoff.
   - Mistakes: Dogmatic ‘Mongo is always faster’.

(Continue mock prep by extending this list during practice.)

---

## 10) Deep Code Insights
### Smart implementations
- Uses WebRTC + Socket signaling separation.
- Includes media track cleanup and call-end logic.
- Activity history gives product continuity beyond one session.

### Bad practices
- Secrets in source code.
- Mixed async patterns and inconsistent HTTP status handling.
- Global mutable objects for room/message state in single process memory.
- Duplicate socket initialization in `VideoMeet` lifecycle.

### Refactoring opportunities
- Extract socket/WebRTC into custom hooks.
- Create backend auth middleware.
- Normalize error response schema.
- Replace deprecated `onaddstream` with `ontrack`.

### Maintainability concerns
- Very large `VideoMeet.jsx` component (high cognitive load).
- Mixed naming conventions (`user_id` vs `userName`).

---

## 11) Project Story (how to narrate)
- **Why built:** To learn and demonstrate real-time communication systems, not just CRUD apps.
- **Inspiration:** Need for lightweight browser meetings with simple join flow.
- **Development problems:** NAT/media issues, connection cleanup, participant synchronization.
- **What you learned:** WebRTC internals, event-driven design, state synchronization, and production security concerns.
- **Uniqueness:** Combines full-stack auth/history features with real-time media and chat in one project.

---

## 12) Resume Value
### ATS-friendly bullets
- Built a full-stack Zoom-style video conferencing platform using React, Express, Socket.IO, WebRTC, and MongoDB.
- Implemented secure password hashing (bcrypt), custom token-based authentication, and protected client routes.
- Designed and integrated REST APIs for user authentication and meeting activity history persistence.
- Engineered real-time signaling and peer connection orchestration for multi-user audio/video/chat sessions.
- Improved user workflow with meeting history tracking, lobby onboarding, and in-call media controls.

### Strong action verbs
Designed, Implemented, Engineered, Optimized, Integrated, Hardened, Refactored, Scaled.

### Quantified impact (how to present)
If you measured none, say: “Supported concurrent multi-user sessions in browser with low-latency signaling and persistent activity tracking.”

---

## 13) Mock Interview Mode (start now)
I’ll run this as iterative practice:
1. I ask one question.
2. You answer.
3. I grade it (clarity, correctness, depth, leadership).
4. I upgrade your answer to senior-level.
5. Repeat.

**Question 1:**
“Walk me through exactly what happens from when a user clicks ‘Join’ on Home to seeing remote participant video on screen.”
