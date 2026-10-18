# East Chem PLC — website

Plain HTML/CSS/JS, no build step. Every file sits flat in one folder
(no subfolders) so it's easy to edit and upload from a phone.

**Text data lives in Firebase Firestore** (free, no card needed) —
products, categories, farmer-story text, social links, and site copy
all save live for every visitor the moment you edit them in the admin
panel. **Photos and videos use the GitHub-filename method** (like the
homepage photos always have) — Firebase Storage now requires a
billing card even for free usage, so this site skips it entirely.

## One-time setup: connect Firebase (free, no card, ~10 minutes)

1. Go to **console.firebase.google.com**, sign in with any Google
   account, click **Add project**, name it (e.g. "east-chem"). Turn
   off Google Analytics when asked. Finish the wizard.
2. **Build → Firestore Database → Create database** → **Start in
   production mode** → pick any region → **Enable**.
3. **Build → Authentication → Get started** → **Sign-in method** →
   enable **Email/Password**.
4. Still in Authentication, go to **Users** → **Add user** → type the
   email and password YOU want to log into the admin panel with.
   This is your real account — no code involved.
5. **Project settings** (gear icon, top left) → scroll to **Your
   apps** → click **</>** (web icon) → nickname it → **Register app**.
   Copy the `firebaseConfig = {...}` values shown.
6. Open `firebase-config.js` in this project → paste your values in,
   replacing the placeholders.
7. Back in **Firestore Database → Rules**, replace everything with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   Click **Publish**.
8. Upload the updated files (especially `firebase-config.js`) to your
   GitHub repo. Vercel redeploys automatically.
9. Go to `yoursite.com/admin.html`, sign in with the email/password
   from step 4. You're in.

If you skip this setup, the site still works and shows its built-in
sample content — admin edits just won't be visible to other visitors
until you connect Firebase.

## What's in the admin panel
- **Products** — add/edit/delete in 4 languages. Set a card label
  (None / Popular / New). For a photo: paste a link to one hosted
  elsewhere, or upload the photo to your GitHub repo and type its
  exact filename in the same box (e.g. `npk-fertilizer.jpg`).
- **Categories** — add as many as you like beyond the starting five.
  Name (4 languages) + a color. Each gets a homepage photo slot named
  `cat-<id>.jpg` (upload via GitHub, see table below).
- **Farmer stories** — a name, their experience (4 languages), whether
  it's a photo or video, and the filename you'll upload for it (e.g.
  `story-abebe.jpg` or `story-abebe.mp4`) — upload that file to GitHub
  the same way, and it appears automatically.
- **Social links** — Telegram, email, Facebook, TikTok, Instagram.
  Icons appear in the footer automatically; blank ones are skipped.
- **Site content** — edit the homepage hero text and stats, the
  contact page's address/phone/email/hours, and everything on the
  About page (except its title) — all in 4 languages.
- **Reset to sample products** — wipes product edits back to the
  built-in starting catalog.

## Adding photos & videos (all via GitHub — exact filename required)
Every photo/video slot shows a placeholder telling you the exact
filename it's waiting for. Upload via GitHub → **Add file → Upload
files**, filename exact, and it appears within a minute of redeploy.

| Filename | Where | What to shoot | Size |
|---|---|---|---|
| `hero.jpg` | Homepage top | Warehouse, sack pile, or a field | 1600×800, landscape |
| `cat-<id>.jpg` | Category card | e.g. `cat-fertilizer.jpg` | 800×600, landscape |
| `gallery-1/2/3.jpg` | Homepage gallery | Shop/staff/harvest | 800×600, landscape |
| `about-1.jpg` | About page | Team or office | 800×600, landscape |
| `about-2.jpg` | About page | Warehouse/storefront | 600×800, portrait |
| `contact-1.jpg` | Contact page | Office/shop entrance | 800×600, landscape |
| *(your choice)* | Product photo | Whatever you named it in the admin panel | 800×600ish |
| *(your choice)* | Farmer-story photo/video | Whatever you named it in the admin panel | photo ~800×600, video under ~2 min |

## Fonts
Headings use **Balderasu**; body text uses **Yebse** — both for
Amharic and Tigrinya only. English and Afaan Oromo keep the site's
Latin fonts.

## Files
```
index.html, products.html, about.html, contact.html, admin.html
style.css              all styling
i18n.js                interface text, 4 languages
firebase-config.js     YOUR Firebase project keys go here
categories-data.js     categories — Firestore-backed
products-data.js       product catalog — Firestore-backed
extras-data.js         social links + farmer stories — Firestore-backed
content-data.js        hero/stats/contact/about text — Firestore-backed
main.js                site behaviour, loads & renders everything
admin.js                owner panel logic
logo.png / favicon.png
balderasu.ttf / yebse.ttf
```

## Editing text later
- Interface wording (buttons, nav, labels) → `i18n.js`
- Hero/stats/contact/about page copy → admin panel → Site content
- Footer contact line → search the HTML files (footer)
- Colors/fonts → the `:root { ... }` block at the top of `style.css`

## Internal ERP (erp.html) — Phases 1–3 + Reports: core system, purchasing/customers, dashboard, installable app, reports
A separate, non-public page for the owner and staff only — not linked
from the public site. Tracks inventory and sales, with two roles:
**owner** (full access, including staff management and revenue
totals) and **staff** (can record sales and update stock, cannot see
cost prices or manage staff).

Uses its own Firestore collections (`staff`, `inventory`, `sales`) —
completely separate from the public website's data.

### One-time setup (after your main Firebase setup)
1. In Firebase Console → Authentication → Users, you already have
   your own login (from the main setup). Copy your **User UID** from
   that list.
2. Firestore Database → Data → **Start collection** → ID: `staff` →
   **Document ID**: paste your UID → add fields:
   - `name` (string) — your name
   - `role` (string) — `owner`
   - `active` (boolean) — `true`
   → Save.
3. Replace your Firestore **Rules** with the version below (this
   also now protects `admin.html` — only accounts with `role: owner`
   in the `staff` collection can log into either `admin.html` or
   `erp.html`):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function isSignedIn() { return request.auth != null; }
       function staffData() { return get(/databases/$(database)/documents/staff/$(request.auth.uid)).data; }
       function isActiveStaff() { return isSignedIn() && staffData().active != false; }
       function isOwner() { return isActiveStaff() && staffData().role == "owner"; }

       match /products/{id} { allow read: if true; allow write: if isOwner(); }
       match /categories/{id} { allow read: if true; allow write: if isOwner(); }
       match /testimonials/{id} { allow read: if true; allow write: if isOwner(); }
       match /settings/{id} { allow read: if true; allow write: if isOwner(); }

       match /staff/{id} {
         allow read: if isSignedIn();
         allow write: if isOwner();
       }
       match /inventory/{id} {
         allow read, write: if isActiveStaff();
       }
       match /sales/{id} {
         allow read, create: if isActiveStaff();
         allow update, delete: if isOwner();
       }
       match /customers/{id} {
         allow read, create, update: if isActiveStaff();
         allow delete: if isOwner();
       }
       match /suppliers/{id} {
         allow read, write: if isOwner();
       }
       match /purchaseOrders/{id} {
         allow read, write: if isOwner();
       }
     }
   }
   ```
   → Publish.
4. Go to `yoursite.com/erp.html` → sign in with your existing login.

### Editing (not just add/delete)
Inventory items, customers, and suppliers can now be edited — look
for **አርትዕ** (edit) next to each row. For inventory items, the
quantity field is hidden while editing (use **ክምችት አስተካክል** for
stock changes instead) — editing only touches name/unit/threshold/
cost, so stock totals always come from one trustworthy place: sales,
purchases, and manual adjustments, never a stray edit.

### Dashboard (owner-only tab: ዳሽቦርድ)
This month's sales count, revenue, and an estimated profit (uses each
item's current cost price — a close estimate, not exact accounting
since costs can change over time). Below that: your top 5 customers
by total spend, top 5 products by quantity sold, and a low-stock
warning list — all computed automatically from your sales history.

### Purchasing (owner-only tab: ግዢ)
Add suppliers, then create a purchase order (pick a supplier, add line
items with quantity and cost). It starts as **በመጠባበቅ ላይ** (pending).
When the goods actually arrive, click **ደርሷል ምልክት አድርግ** (mark
received) — stock increases automatically, and each item's cost price
updates to a weighted average of old stock and the new delivery
(same approach Kaliber uses, so cost stays accurate even when supplier
prices change over time).

### Customers (ደንበኞች tab — both owner and staff)
Add a customer once, then pick them from the dropdown when recording
a sale — their name/phone auto-fill, and that sale is now linked to
them. Click **ታሪክ** (history) on any customer to see everything
they've bought and their total spend. Older sales recorded before
this feature existed won't be linked to a customer record — that's
expected, only new sales link up.

### Reports (owner-only tab: ሪፖርት)
Pick a date range → **ሪፖርት አሳይ** (show report) for sales count, revenue
and estimated profit in that window, plus the full list. **CSV አውርድ**
downloads a spreadsheet file (opens in Excel/Google Sheets) — handy
for your accountant or your own records. **አትም** (print) gives a clean
printout with the forms/buttons/navigation hidden, just the report
table. A separate inventory-value report (stock × cost price, with
its own CSV export) sits below it.

### Install it like an app — phone AND PC, today, free
`erp.html` is now a installable web app (PWA). Once it's live:
- **Phone (Android/Chrome):** open the site → tap the **⋮** menu →
  **"Add to Home screen" / "Install app"**. A real icon appears on
  the home screen; it opens full-screen, no browser bar, no URL
  visible — looks and feels like a native app.
- **PC (Chrome/Edge):** open the site → look for the **install icon**
  (⊕ or a small monitor icon) in the address bar → click **Install**.
  Opens in its own window from the Start Menu/taskbar, same as any
  installed program.

This already satisfies "works like an app, on phone and PC" with zero
extra cost or app-store account.

### Getting an actual .apk file
I can't compile a real `.apk` myself in this environment — that needs
Android's official build tools (Google's Android SDK), which isn't
something I have access to here. But since the site is now a proper
PWA (the step above), getting a real APK is just a few clicks on your
end, completely free:
1. Make sure the site is live with the files above uploaded.
2. Go to **pwabuilder.com** (made by Microsoft, free, no account
   needed).
3. Paste your site's URL (`yoursite.com/erp.html`) → **Start**.
4. It scores your PWA (should pass, since the manifest/icons/service
   worker are already set up) → click **Package for stores** → choose
   **Android**.
5. Download the generated `.apk` → send it to any Android phone →
   open it → allow "install from unknown sources" if asked → done.
   No Play Store needed, though PWABuilder can also prep a listing if
   you ever want to publish it there.

### Adding a staff member later
1. Firebase Console → Authentication → Users → **Add user** (their
   email + a password).
2. Copy their new User UID.
3. In `erp.html` → **ሰራተኞች** tab → **ሰራተኛ ጨምር** → paste their UID,
   name, choose role **ሰራተኛ** (staff) → Save.
