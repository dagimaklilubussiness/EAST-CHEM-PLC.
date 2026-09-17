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
| *(your choice)* | Farmer-story photo/video | Whatever you named it in the admin panel | any size — GitHub hosts it |
| `dagdevio-logo.png` | Footer credit | Small square developer logo | ~40×40, transparent PNG |

## Farmer stories are per-product
Each farmer story (photo/video + quote) is now tied to **one specific
product**, chosen from a dropdown when you add/edit it in the admin
panel. It appears on that product's detail popup only — not on the
homepage. Only you (the logged-in owner) can add these; customers
can't submit their own.

## Getting the site to show up when someone searches "East Chem PLC"
Two things help this:
1. **Already done in the code:** page title, meta description, Open
   Graph tags, and a sitemap (`sitemap.xml` + `robots.txt`) are set up
   so Google can read and understand the site once it's crawled.
2. **You still need to do this once, manually (free, ~10 min):** go to
   **search.google.com/search-console**, add your site
   (`east-chem-plc.vercel.app`), verify ownership (Google gives you a
   simple method, often just confirming via your Vercel domain), then
   submit `https://east-chem-plc.vercel.app/sitemap.xml` under
   **Sitemaps**. After that, Google typically indexes the site within
   a few days to a couple of weeks — there's no way to force it
   faster, and no code change can substitute for this step.

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
