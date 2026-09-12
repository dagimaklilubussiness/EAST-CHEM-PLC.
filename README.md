# East Chem PLC — website

Plain HTML/CSS/JS, no build step. Every file sits flat in one folder
(no subfolders) so it's easy to edit and upload from a phone.

**Data now lives in Firebase** (free tier) instead of your own
browser's storage — so when you add a product, photo, video, or edit
any text from the admin panel, every visitor sees it immediately. No
more downloading files and re-uploading them to GitHub for that kind
of change.

## One-time setup: connect Firebase (free, ~15 minutes)

1. Go to **console.firebase.google.com**, sign in with any Google
   account, click **Add project**, name it (e.g. "east-chem"), finish
   the wizard.
2. In your new project, click **Build → Firestore Database → Create
   database**. Choose **Start in production mode**, pick any region,
   click Enable.
3. Click **Build → Storage → Get started**. Choose production mode
   again, same region, Enable.
4. Click **Build → Authentication → Get started**. Under
   **Sign-in method**, enable **Email/Password**.
5. Still in Authentication, go to the **Users** tab → **Add user** →
   type the email and password YOU want to log into the admin panel
   with. This is your real account — no code involved.
6. Go to **Project settings** (gear icon, top left) → scroll to **Your
   apps** → click the **</>** (web) icon → give it any nickname →
   **Register app**. It shows a `firebaseConfig = {...}` block —
   copy those values into `firebase-config.js` in this project,
   replacing the placeholder text.
7. Back in **Firestore Database → Rules**, replace the contents with:
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
8. In **Storage → Rules**, paste the same idea:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   Click **Publish**.
9. Upload the updated files (especially `firebase-config.js`) to your
   GitHub repo. Vercel redeploys automatically.
10. Go to `yoursite.com/admin.html`, sign in with the email/password
    from step 5. You're in.

**What this means:** reading the site (browsing products, etc.) is
open to everyone, same as any shop website. Only someone signed in
with your admin account can add/edit/delete anything. Nobody but you
has that password.

If you skip this setup, the site still works and shows its built-in
sample content — admin edits just won't be visible to other visitors
until you connect Firebase.

## What's in the admin panel now
- **Products** — add/edit/delete in 4 languages. Set a card label
  (None / Popular / New). Attach a photo by URL or straight from your
  phone's gallery.
- **Categories** — add as many as you like beyond the starting five.
  Name (4 languages) + a color. New categories automatically get a
  homepage photo slot named `cat-<id>.jpg` (see photo table below).
- **Farmer stories** — a name, their experience (4 languages), and
  one upload button that takes either a photo or a short video
  (sound included) straight from your phone. No filename typing, no
  GitHub step.
- **Social links** — Telegram, email, Facebook, TikTok, Instagram.
  Icons appear in the footer automatically; blank ones are skipped.
- **Site content** — edit the homepage hero text and stats, the
  contact page's address/phone/email/hours, and everything on the
  About page (except its title) — all in 4 languages.
- **Reset to sample products** — wipes your product edits back to the
  built-in starting catalog. (Categories, stories, and site content
  aren't affected by this button.)

## Two kinds of photos on this site
| Type | How to add it | Where |
|---|---|---|
| Product photos, farmer-story photos/videos | Upload directly in the admin panel | Instant, for everyone |
| Homepage hero, category cards, gallery, about-page photos | Upload a file with an exact name via GitHub | Same as before |

For the second kind, each photo slot shows a placeholder telling you
the exact filename it wants:

| Filename | Where | What to shoot | Size |
|---|---|---|---|
| `hero.jpg` | Homepage top | Warehouse, sack pile, or a field | 1600×800, landscape |
| `cat-<id>.jpg` | Category card | e.g. `cat-fertilizer.jpg` — a matching photo | 800×600, landscape |
| `gallery-1/2/3.jpg` | Homepage gallery | Shop/staff/harvest | 800×600, landscape |
| `about-1.jpg` | About page | Team or office | 800×600, landscape |
| `about-2.jpg` | About page | Warehouse/storefront | 600×800, portrait |
| `contact-1.jpg` | Contact page | Office/shop entrance | 800×600, landscape |

Upload via GitHub → **Add file → Upload files**, filename exact.

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
- Footer contact line & admin access → search the HTML files (footer)
  and `firebase-config.js`
- Colors/fonts → the `:root { ... }` block at the top of `style.css`
