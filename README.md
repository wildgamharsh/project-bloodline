# 🩸 Project Bloodline

> **Voluntary Blood Donor Search & Emergency Request System** — a responsive, frontend-only web application that helps patients and families find compatible blood donors fast during medical emergencies.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-green.svg)](./index.html)
[![Responsive](https://img.shields.io/badge/responsive-Yes-brightgreen.svg)](./index.html)
[![Status](https://img.shields.io/badge/status-Complete-success.svg)](./index.html)

---

## 📌 Overview

In emergency surgeries, accidents, and urgent hospital situations, finding a compatible blood donor — especially for rare groups such as **O−** or **AB−** — can be difficult and time-consuming. **Project Bloodline** addresses this by providing a clean, digital platform where:

- Voluntary donors **register** their details (name, blood group, city, contact).
- Users **search & filter** the donor directory by blood group and neighborhood.
- **Emergency blood requirement broadcasts** are prominently displayed in bold red so critical needs are immediately visible.
- A **blood compatibility matrix** visually explains compatible donor/recipient pairs (including O− universal donor and AB+ universal recipient).

The project is **entirely frontend** — no backend, no build step. Just open it in a browser.

---

## 🚀 Features

- 🩸 **Donor Registration Form** — full name, 8 blood groups (A+, A−, B+, B−, AB+, AB−, O+, O−), city/area, contact.
- 🔍 **Searchable Donor Directory** — instant live filtering by blood group and neighborhood.
- 🚨 **Emergency Broadcast Banner** — bold red, high-visibility urgent blood requirement display.
- 📊 **Blood Compatibility Matrix** — visual card explaining donor/recipient compatibility with universal rules.
- 📱 **Fully Responsive** — mobile, tablet, and desktop usable.
- 🎨 **Polished UI** — warm editorial design system (Fraunces serif + Outfit sans), smooth scroll, accessible contrast.
- ⚡ **Zero Dependencies** — vanilla HTML/CSS/JS, runs offline.

---

## 📦 Quick Start

No install, no build, no dependencies. Just open the file:

```bash
# Option 1 — open directly in your browser
xdg-open index.html      # Linux
open index.html          # macOS
start index.html         # Windows

# Option 2 — serve it locally (optional, for better dev tooling)
python3 -m http.server 8000
# then visit http://localhost:8000
```

> **Note:** Donor data is stored in-browser only (in-memory during the session). This is a frontend prototype.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Scripting | Vanilla JavaScript (no frameworks) |
| Typography | Google Fonts — *Fraunces* (serif) + *Outfit* (sans) |
| Icons | Lucide (via unpkg CDN) |

---

## 📁 Project Structure

```
project-bloodline/
├── index.html              # Main application (hero, directory, emergency broadcast, compatibility matrix)
├── bloodline-logo.png      # Project logo
├── bloodline-logo-trimmed.png  # Trimmed logo variant (favicon + brand mark)
├── info.md                 # Full project specification & team details
├── .gitignore              # Ignores prototypes, OS noise, editor files
└── README.md               # This file
```

---

## 👥 Team

| Role | Name | Registration No. |
|---|---|---|
| **Project Leader** | Harshveer Singh Jaspal | 12613979 |
| Team Member | — | 12616832 |
| Team Member | — | 12622800 |

**Team Name:** Curious Builders  
**Course:** CSE326 — Section K4P26FE  
**Institution:** LPU (Lovely Professional University)

---

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-idea`).
3. Commit your changes (`git commit -m "Add: your idea"`).
4. Push to the branch (`git push origin feat/your-idea`).
5. Open a Pull Request describing your change.

> Please keep changes **frontend-only** and maintain the existing design system (colors, typography, spacing tokens).

---

## 📞 Contact

- **GitHub:** [@wildgamharsh](https://github.com/wildgamharsh)
- **Institution:** LPU, CSE326

---

## 🔖 Tags

`blood-donor` `frontend` `html-css-js` `emergency-response` `web-app` `responsive-design` `volunteer` `healthtech` `student-project` `lpu` `cse326`

---

_Built with care for the CSE326 project submission. ❤️_