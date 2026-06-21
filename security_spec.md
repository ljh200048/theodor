# Security Specification: theodor_vintage

This document outlines the data invariants, threat vectors (the Dirty Dozen payloads), and validation guards implemented to secure our shop collections.

## 1. Data Invariants

1. **Product Collection (`products`)**
   - Products are read-only to public guests.
   - Creating, updating, or deleting a product is restricted to the Verified Store Admin (`jongminsin81@gmail.com`).
   - Sizing must be standard textual formats. Pricing must be non-negative integers.
   - Creation requires `createdAt` to be the current server timestamp.

2. **Site Settings Collection (`siteSettings`)**
   - General layout and social assets are public-readable.
   - Modification or removal is strictly restricted to the Verified Store Admin.

3. **Favorites Collection (`favorites`)**
   - A user can only bookmarked/unbookmark items matching their own authenticated `uid`.
   - Blanket query scraping is strictly disabled; a user can only list entries satisfying `resource.data.userId == request.auth.uid`.
   - Document ID follows the compound structure `userId_productId` to prevent duplicate bookmarking.

4. **Inquiries Collection (`inquiries`)**
   - Guests cannot view or write inquiries; users must be authenticated.
   - Users can create inquiries with their authenticated signature (`userId == request.auth.uid`).
   - Users can only read their list of inquiries (`resource.data.userId == request.auth.uid`).
   - Admin can read all inquiries and write to the `reply` property.
   - Standard users cannot modify or overwrite fields once submitted, nor delete sent inquiries.

---

## 2. The "Dirty Dozen" Threat Payloads (Blocked Vectors)

Below is an enumeration of 12 adversarial payload requests that would break the security, privacy, and integrity of the system and must be rejected by the Firestore Rules engine with `PERMISSION_DENIED`:

### Category A: Privilege Escalation & Admin Bypass

1. **Admin Mock Writing to Products (Identity Spoofing)**
   - **Payload**: Anonymous guest attempts to POST to `/products/shady_bootleg` with:
     ```json
     { "name": "Fake Rolex", "price": 1000000, "category": "Accessories", "size": "N/A", "condition": "New", "imageUrl": "hack.png", "isSoldOut": false, "isRecommended": true }
     ```
   - **Result**: `PERMISSION_DENIED` (Guest not authenticated or not registered as the admin email `jongminsin81@gmail.com`).

2. **Falsified Client Email Profile Spoofing**
   - **Payload**: Standard user attempts to overwrite another user profile or claim admin role by submitting an authenticated email claim bypassing verification check.
   - **Result**: `PERMISSION_DENIED` (Admin check requires `request.auth.token.email_verified == true && request.auth.token.email == "jongminsin81@gmail.com"`).

3. **Shadow Update to Settings**
   - **Payload**: Standard member attempts to overwrite banner content or modify Instagram URL in `/siteSettings/main`.
   - **Result**: `PERMISSION_DENIED` (Only `isAdmin()` can write siteSettings).

### Category B: Data Integrity & Injection

4. **Negative Pricing Attack (Resource Poisoning)**
   - **Payload**: Malicious creator posts a product with negative values:
     ```json
     { "name": "Underpriced Jacket", "price": -50000, "category": "Tops", "size": "XL", "condition": "A", "imageUrl": "jacket.png", "isSoldOut": false, "isRecommended": false }
     ```
   - **Result**: `PERMISSION_DENIED` (Validation requires `incoming().price is number && incoming().price >= 0`).

5. **ID Poisoning Attack (Denial of Wallet)**
   - **Payload**: Creator submits a product with a 10KB junk-character document ID path `/products/[10KB_LONG_MALWARE_ID_STRING]`.
   - **Result**: `PERMISSION_DENIED` (ID verification limits size and prevents junk characters: `isValidId(productId)`).

6. **Missing Absolute Structural Fields (The Empty Ghost Document)**
   - **Payload**: Admin attempts a write with fields missing:
     ```json
     { "name": "Incomplete Shirt", "category": "Tops" }
     ```
   - **Result**: `PERMISSION_DENIED` (Keys length does not match requirement or size constraint fails).

### Category C: PII Exposure & Privacy

7. **Snoop Scraping Inquiries**
   - **Payload**: Attacker queries `/inquiries` collection without filter restrictions to scrape email addresses of client inquiries.
   - **Result**: `PERMISSION_DENIED` (Rule enforces `allow list` checks verifying `resource.data.userId == request.auth.uid || isAdmin()`).

8. **Overwriting Other User's Inquiries**
   - **Payload**: User `uid_alice` attempts to delete or modify `/inquiries/bob_inquiry_01`.
   - **Result**: `PERMISSION_DENIED` (Write or delete of inquiries restricted to either own creator with strict limitations, or reply thread for admins).

### Category D: Timestamp and State Exploitation

9. **Falsified Client Timestamps**
   - **Payload**: Creating a product or inquiry with a backdated or forwarddated timestamp `createdAt: "1970-01-01"`.
   - **Result**: `PERMISSION_DENIED` (Creation bounds timestamp to exact Server time `request.time`).

10. **Terminal State Lockdown Bypass**
    - **Payload**: Trying to modify product attributes *after* it has been permanently sold out, bypassing proper controls.
    - **Result**: `PERMISSION_DENIED` (Sold out or restricted operations are secured or only editable by authorized rules).

11. **Malicious Wishlist Hijacking (Cross-User Bookmarking)**
    - **Payload**: Authenticated user `uid_alice` posts a favorite document into `/favorites/alice_likes` with:
      ```json
      { "userId": "uid_bob", "productId": "some_pant_id", "createdAt": "request.time" }
      ```
    - **Result**: `PERMISSION_DENIED` (Enforces that the payload properties `incoming().userId == request.auth.uid`).

12. **Malicious Infinite Payload Size (Denial of Wallet)**
    - **Payload**: Post an inquiry with a custom `message` text size exceeding 20,000 characters.
    - **Result**: `PERMISSION_DENIED` (Rules check bounds limit of field characters: `message.size() <= 2000`).
