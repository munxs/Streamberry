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

\`\`\`
streamberry/
├── README.md
├── .gitignore
├── src/
│   ├── css
│   	└── Streamberry.css      # Full theme stylesheet
│   ├── js
│   	└── Streamberry.js       # Bottom nav bar + UI enhancements
└── docs/
    └── installation.md      # Step-by-step setup guide
\`\`\`

---

## 🚀 Quick Install

1. Open your Jellyfin **Dashboard**
2. Go to **General** settings
3. Paste the contents of \`src/Streamberry.css\` into the **Custom CSS** field
4. Paste the contents of \`src/Streamberry.js\` into the **Custom JavaScript** field
5. Save and refresh your Jellyfin client

> For detailed instructions, see [\`docs/installation.md\`](docs/installation.md).

---

## 🎨 Customization

Key design tokens are defined at the top of \`Streamberry.css\` inside \`:root { }\`. You can easily change:

| Variable | Default | Description |
|---|---|---|
| \`--accent\` | \`rgb(229, 9, 20)\` | Primary accent color (Netflix red) |
| \`--orange\` | \`rgb(255, 120, 0)\` | Secondary accent (Crunchyroll orange) |
| \`--streamberryFooterText\` | \`"STREAMBERRY"\` | Footer branding text |

---

## 📋 Requirements

- Jellyfin **10.8+** recommended
- A modern browser (Chrome, Firefox, Edge, Safari)

---

## 📄 License

Private repository — for personal use only.
