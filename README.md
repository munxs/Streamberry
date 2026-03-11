# Streamberry

A custom Netflix × Crunchyroll-inspired theme for [Jellyfin](https://jellyfin.org/), featuring a sleek dark UI with red/orange accents, a custom bottom navigation bar, and smooth transitions.

---

## ✨ Features

- **Netflix-style dark palette** — near-pure black backgrounds with red/orange accent colors
- **Custom bottom navigation bar** — Home, Movies, TV, Search, and a "My Vault" panel
- **Smooth page transitions** — fade overlay on navigation
- **Inter font** — clean, modern typography throughout
- **Streamberry branding** — custom footer text and styling
- **Optimized CSS** — consolidated rules, reduced specificity conflicts

---

## 📁 File Structure

```
streamberry/
├── README.md
├── .gitignore
├── src/
│   ├── css/
│   │   └── Streamberry.css      # Full theme stylesheet
│   └── js/
│       └── Streamberry.js       # Bottom nav bar + UI enhancements
└── docs/
    └── installation.md          # Step-by-step setup guide
```

---

## 🚀 Quick Install

Go to your Jellyfin **Dashboard → General** and paste the following:

**Custom CSS:**
```css
@import url("https://cdn.jsdelivr.net/gh/munxs/streamberry@main/src/css/Streamberry.css");
```

**Custom JavaScript:**
```js
var s = document.createElement('script');
s.src = "https://cdn.jsdelivr.net/gh/munxs/streamberry@main/src/js/Streamberry.js";
document.head.appendChild(s);
```

Save and hard refresh your browser (`Ctrl + Shift + R`).

> For detailed instructions, see [`docs/installation.md`](docs/installation.md).

---

## 🔄 Updating

Changes pushed to `main` are served via jsDelivr CDN. To force an immediate update after pushing:

1. Go to [jsdelivr.com/tools/purge](https://www.jsdelivr.com/tools/purge)
2. Paste both URLs and purge them
3. Hard refresh Jellyfin

---

## 🎨 Customization

Key design tokens are defined at the top of `Streamberry.css` inside `:root { }`. You can easily change:

| Variable | Default | Description |
|---|---|---|
| `--accent` | `rgb(229, 9, 20)` | Primary accent color (Netflix red) |
| `--orange` | `rgb(255, 120, 0)` | Secondary accent (Crunchyroll orange) |
| `--streamberryFooterText` | `"STREAMBERRY"` | Footer branding text |

---

## 📋 Requirements

- Jellyfin **10.8+** recommended
- A modern browser (Chrome, Firefox, Edge, Safari)

---

## 🙏 Credits

Streamberry was inspired by [ElegantFin](https://github.com/lscambo13/ElegantFin) by [@lscambo13](https://github.com/lscambo13). Original concept and design direction credit goes to that project.

---

## 📄 License

MIT — feel free to use and modify for personal use.
