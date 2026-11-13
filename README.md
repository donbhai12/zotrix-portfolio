# Zotrix Tech Media — Portfolio Website

Plain HTML/CSS/JS site. Koi build step nahi, koi npm install nahi — folder upload karo aur site live.

## Kya kya hai page pe
- **Hero** — "Hi, we're Zotrix", flip-card (Restaurant Websites → Online Ordering → …) aur ek phone jisme aapke live projects ghoomte hain.
- **Doors (Selected work)** — 4 darwaze: Restaurants, News Portals, Business, Reels. Click karo → project cards. Chaaron kholne pe 5th "Secret Lab" door unlock hota hai.
- **Process** — 4 steps, bada number scroll ke saath roll hota hai.
- **Footer + Say hello form** — email app khulta hai ya Instagram DM (message auto-copy).
- **Light switch cord** (top-right) — kheencho to dark ↔ light mode.

## Local pe dekhna
Folder ke andar terminal kholo:

```bash
python -m http.server 5173
```

Phir browser mein `http://localhost:5173` kholo.

## Live karna (free)
- **Netlify Drop:** https://app.netlify.com/drop pe poora `zotrix-portfolio` folder drag-and-drop karo. 1 minute mein link mil jayega.
- **Vercel:** GitHub repo banao, ye folder push karo, Vercel mein import karo (Framework: "Other").
- Apna domain baad mein jod sakte ho (jaise `zotrixtechmedia.com`).

## Cheezein badalna
| Kya | Kahan |
|---|---|
| Email / Instagram | `index.html` mein `zotrixtechmedia@gmail.com` aur `instagram.com/zotrixtechmedia` search karo; `js/contact.js` ke upar `EMAIL` aur `IG_DM` |
| Naya project (door ke andar) | `js/doors.js` → `PROJECTS` mein entry + jis door mein dikhana hai uske `work: [...]` mein id. Screenshot `assets/work/` mein (800px wide JPG) |
| Footer "Selected work" list | `index.html` → `sf__work` list |
| Hero phone screens | `index.html` → `#deviceLink` ke `<img>` + `js/main.js` → `SLIDES` (same order) |
| Colours | `css/base.css` ke top pe `:root` (dark) aur `[data-theme="light"]` |

CSS/JS badalne ke baad `index.html` mein `?v=2` ko `?v=3` kar dena, taaki purana cache na dikhe.

## Files
```
index.html
css/base.css      colours, header, buttons, loader, cord
css/hero.css      hero, flip card, phone
css/sections.css  doors, process, footer, contact form
js/util.js        shared helpers (sabse pehle load hota hai)
js/cord.js        light-switch cord + theme
js/doors.js       doors + project data
js/story.js       process odometer
js/contact.js     say-hello form
js/main.js        loader, clock, phone slides, menu, back-to-top
assets/work/      project screenshots + reel covers
```

Note: prices website pe kahin nahi likhe — leads se pehle budget poochna hai.
