# East Chem PLC — website

A plain HTML/CSS/JS site (no build step, no paid services). Works on
desktop and phone, in English, Amharic, Afaan Oromo and Tigrinya.

## What's inside
```
index.html        Homepage — hero, categories, crop advisor tool, featured products
products.html      Full catalog with filters, search, product detail popups
about.html         Company story and values
contact.html       Contact form + info
admin.html         Owner panel to add/edit/delete products
css/style.css      All styling
js/i18n.js         Every piece of interface text, in 4 languages
js/products-data.js  The product catalog itself
js/main.js         Site behaviour (nav, language switch, search, popups...)
js/admin.js        Owner panel logic
```

## Putting it online (free)
This is a static site, so any of these work and all have a free tier
that supports a custom domain:
- **Netlify** — drag the whole `east-chem` folder onto app.netlify.com/drop
- **Cloudflare Pages** or **GitHub Pages** — push the folder to a GitHub
  repo and connect it
- **Vercel** — similar drag-and-drop / GitHub flow

Whichever you pick, you'll point your domain's DNS at it — each
service walks you through that step when you connect the domain.

## Adding products (the owner panel)
Go to `yoursite.com/admin.html`.
1. The default access code is **eastchem2026** — open `js/admin.js`
   and change `ACCESS_CODE` to something only your team knows before
   you publish the site. This is a simple shared-login gate, not real
   account security.
2. Add, edit or delete products, in all four languages.
3. Your changes save to *your* browser only — that's how you can
   preview them safely. To make them visible to every visitor, click
   **Download products-data.js** and upload that file to your hosting,
   replacing the old `js/products-data.js`.

If you'd rather have changes go live the moment you save — no
download/upload step — that needs a small free database (Firebase or
Supabase both have generous free tiers). I can wire that up if you
want it; it's maybe 20 extra minutes of setup on your end to create a
free account.

## Images
Every product can take an image URL in the admin form. Send me (or
add directly) photos of your actual products and packaging and I'll
drop them in — until then the site uses clean line-art icons instead
of stock photos, so nothing looks generic or placeholder-ish.

## Translations
The Amharic, Afaan Oromo and Tigrinya interface text in `js/i18n.js`
is a solid first pass, but have a native speaker on your team read
through it before launch — the same way you'd proof any signage
before printing it.

## Editing content later
- Change any interface wording → `js/i18n.js`
- Change contact email/phone/address → search for `info@eastchem.example`
  and `+251 9xx xxx xxx` across the HTML files and replace them
- Change the access code → `js/admin.js`, top of the file
