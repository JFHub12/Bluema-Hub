# VERFIED Firestore Security Specification & Hardened Test Suite

## 1. Data Invariants

1. **User Identity Invariant**: A user document under `/users/{userId}` can only be created or modified if `request.auth.uid == userId`. Users cannot impersonate another UID.
2. **PII Isolation Invariant**: PII like email and telephone are isolated under `/users/{userId}/private/info` and readable strictly by the document owner (`request.auth.uid == userId`) or verified Admin. Blanket reads (`isSignedIn()`) are strictly forbidden.
3. **Role Escalation Invariant**: Users cannot self-assign or mutate `role: 'admin'`. Only pre-existing Admin credentials verified in the system can perform admin operations.
4. **Order Ownership Invariant**: An order document `/orders/{orderId}` must contain `incoming().userId == request.auth.uid`. A user cannot forge orders on behalf of another user.
5. **Terminal State Locking Invariant**: Orders marked `status: 'delivered'` or `status: 'cancelled'` are locked in a terminal state; customers cannot mutate status once delivered or cancelled.
6. **Immortal Timestamps Invariant**: Creation timestamps (`createdAt`) cannot be altered during updates (`incoming().createdAt == existing().createdAt`).
7. **Strict Field Whitelisting Invariant**: Payloads containing arbitrary ghost fields (e.g., `isVerified: true`, `bypassPayment: true`) must be rejected via `hasOnly()` validation.
8. **Path Variable Hardening Invariant**: Document IDs must pass alphanumeric validation (`isValidId()`) and not exceed length limits to prevent DoS attacks.
9. **Support Ticket Sanity Invariant**: Concierge support tickets must contain sanitized character boundaries (message <= 3000 chars, subject <= 200 chars).
10. **Query Enforcement Invariant**: Collection list queries on orders must evaluate `resource.data.userId == request.auth.uid`, preventing unauthorized scrapers from dumping order lists.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (Ghost Field / Shadow Update Attack)**:
   ```json
   {
     "uid": "victim_123",
     "name": "Attacker",
     "createdAt": "2026-10-10T00:00:00Z",
     "isVerifiedAdmin": true
   }
   ```
   *Expected: PERMISSION_DENIED (Violates strict key allowlist).*

2. **Payload 2 (Identity Spoofing on User Profile)**:
   ```json
   {
     "uid": "victim_uid_999",
     "name": "Impersonator",
     "createdAt": "2026-10-10T00:00:00Z"
   }
   ```
   *Attempted by authenticated user `attacker_uid_111`.*
   *Expected: PERMISSION_DENIED (Identity mismatch: `request.auth.uid != uid`).*

3. **Payload 3 (Role Escalation Attack)**:
   ```json
   {
     "uid": "attacker_uid_111",
     "email": "attacker@example.com",
     "role": "admin",
     "createdAt": "2026-10-10T00:00:00Z"
   }
   ```
   *Expected: PERMISSION_DENIED (Standard customer cannot self-assign `role: 'admin'`).*

4. **Payload 4 (PII Snoop Attack - Snooping on victim's private info)**:
   *Operation: `get /users/victim_123/private/info` by `attacker_uid_111`.*
   *Expected: PERMISSION_DENIED (Owner-only private collection).*

5. **Payload 5 (Order Identity Hijack)**:
   ```json
   {
     "id": "order_hack_01",
     "userId": "victim_123",
     "userEmail": "victim@example.com",
     "customerName": "Victim Name",
     "total": 100,
     "status": "verified",
     "createdAt": "2026-10-10T00:00:00Z"
   }
   ```
   *Attempted write by `attacker_uid_111`.*
   *Expected: PERMISSION_DENIED (`incoming().userId != request.auth.uid`).*

6. **Payload 6 (Terminal State Bypass on Order)**:
   ```json
   {
     "status": "pending"
   }
   ```
   *Attempted update when existing order has `status: 'delivered'`.*
   *Expected: PERMISSION_DENIED (Terminal state lock).*

7. **Payload 7 (Immortal Field Mutate Attack - createdAt tampering)**:
   ```json
   {
     "createdAt": "1999-01-01T00:00:00Z"
   }
   ```
   *Expected: PERMISSION_DENIED (`incoming().createdAt != existing().createdAt`).*

8. **Payload 8 (Buffer Overflow / Denial of Wallet via Giant Message)**:
   ```json
   {
     "id": "ticket_bomb",
     "name": "Attacker",
     "email": "attack@example.com",
     "category": "order",
     "subject": "Crash",
     "message": "A".repeat(500000),
     "status": "open",
     "createdAt": "2026-10-10T00:00:00Z"
   }
   ```
   *Expected: PERMISSION_DENIED (Message length violates `.size() <= 3000`).*

9. **Payload 9 (ID Poisoning Attack)**:
   *Attempt to create document with path `/orders/$$$invalid!!!poisoned???id###`.*
   *Expected: PERMISSION_DENIED (`!isValidId(orderId)`).*

10. **Payload 10 (Blanket Order Scraping Attack)**:
    *Operation: `list /orders` without filtering `userId == request.auth.uid`.*
    *Expected: PERMISSION_DENIED (Query Enforcer mandates `resource.data.userId == request.auth.uid`).*

11. **Payload 11 (Unauthenticated User Order Creation)**:
    *Operation: `create /orders/order_anon` with `request.auth == null`.*
    *Expected: PERMISSION_DENIED (Must be signed in with verified identity).*

12. **Payload 12 (Negative or Invalid Type Order Total)**:
    ```json
    {
      "id": "order_neg",
      "userId": "my_uid",
      "userEmail": "me@example.com",
      "customerName": "My Name",
      "total": -9999,
      "status": "verified",
      "createdAt": "2026-10-10T00:00:00Z"
    }
    ```
    *Expected: PERMISSION_DENIED (`incoming().total >= 0`).*
