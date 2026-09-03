<div align="center">

# 📝 PaperTrail

<img src="public/images/logo.png" alt="PaperTrail Logo" width="140" />

### Hyper-Realistic Text-to-Handwriting Studio with Camera Physics & Human Errors

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?logo=github&logoColor=white)](https://github.com/bipin-vishwakarma/papertrail)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-blue.svg?style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**[Explore Features](https://github.com/bipin-vishwakarma/papertrail#features)** • **[Quick Start](https://github.com/bipin-vishwakarma/papertrail#quick-start)** • **[Realism Engines](https://github.com/bipin-vishwakarma/papertrail#realism-architecture)**

</div>

---

## 🌟 What is PaperTrail?

**PaperTrail** is an advanced, privacy-first web application that transforms digital text into **indistinguishable physical handwriting photos**.

Unlike basic handwriting fonts that produce flat, robotic text, PaperTrail simulates:
1. **The Human Hand**: Micro-jitter per letter, progressive wrist fatigue sag, pen pressure variations, and realistic human typos.
2. **The Pen**: Procedural scratch-outs (wavy scribble, dense blackout, single/double strike) and handwritten caret insertions (`^`).
3. **The Physical Environment (Photo Mode)**: Smartphone cast shadows, 3D camera angles, room lighting (warm desk lamp, flash, daylight), paper creases, and sensor noise.

Everything processes **100% locally in your browser** with zero data sent to external servers and zero mandatory login gates for PDF/image exports.

---

## ⚡ Key Features

### ✂️ 1. Human Errors & Scribble Engine
- **Procedural Spelling Slips**: Automatically simulates realistic human typing/writing errors (adjacent key slips, transposed letters, dropped vowels, double strikes).
- **4 Procedural Pen Scratch Styles**:
  - 〰️ **Wavy Scribble**: Organic, looping cursive blackout strokes.
  - ⬛ **Dense Blackout**: Anxious, heavy zig-zag pen scratch.
  - ➖ **Single Strike**: A quick, hurried slash.
  - ═ **Double Strike**: Deliberate double-line strike-through.
- **Handwritten Caret Insertion (`^`)**: Renders realistic caret marks with the corrected word handwritten directly above the line.
- **Manual Markdown Syntax**:
  - `~~word~~` $\rightarrow$ Scratch out word.
  - `~~mistake~~^correction` $\rightarrow$ Scratch out mistake and write "correction" above with a caret.
- **Writer's Fatigue**: Progressively drifts baseline and increases slant towards the bottom of long pages.

### 📸 2. Camera & Photo Physics Engine
- **Smartphone Cast Shadow**: Realistic soft-edged silhouette of a phone hovering over the notebook, with customizable angle ($0^\circ - 360^\circ$) and shadow intensity.
- **3D Non-Planar Camera Tilt**: Renders pages with real 3D camera angles (`perspective(1000px)`, `rotateX`, `rotateY`).
- **Room Lighting Environments**:
  - 🛋️ **Warm Desk Lamp**: Tungsten 2900K gradient with adjustable warmth slider.
  - ☀️ **Cool Daylight**: Natural window exposure lighting.
  - ⚡ **Camera Flash**: High-intensity central flash hotspot.
  - 📄 **Scanner Mode**: High-contrast document scan.
- **Paper Folds & Creases**: Realistic horizontal half-folds, quarter cross-folds, and dog-eared corners.
- **Analog Sensor Noise**: Subtle ISO grain and lens vignette to prevent flat digital rendering.

### 🖋️ 3. Pen Presets & Realistic Papers
- **Pen Presets**:
  - 🖊️ **Blue Ballpoint** (`#1e40af`) — Classic student pen
  - 🖋️ **Black Gel Pen** (`#111827`) — Deep dark ink
  - ✒️ **Royal Blue Fountain** (`#1d4ed8`) — Parker royal blue
  - ✏️ **HB #2 Pencil** (`#4b5563`) — Graphite texture
  - 🔴 **Teacher Red Pen** (`#dc2626`) — Exam grading ink
- **Paper Styles**:
  - 📝 **College Ruled (Red Margin)** — Classic 65px vertical margin line
  - 📜 **Standard Blue Ruled** — Clean lined notebook paper
  - 📋 **Yellow Legal Pad** — Professional yellow pad with margin line
  - 📐 **Math / Engineering Grid** — Precision 24px grid paper
  - 📄 **Plain White A4** — Unlined printer paper

### 🗂️ 4. 15 Authentic Scraped Handwriting Fonts
Preserved and loaded locally in `/public/fonts/`:
- `Handwriting 1` through `Handwriting 14` (Clean Pen, Casual Slant, Neat Ballpoint, Fluid Cursive, Fast Flow, Compact Print, Loose Homework, Fine Nib, Quick Notes, Forward Lean, Natural Cursive, Rounded Junior, Micro Gel, Expressive).
- `Hindi Handwriting` (Full Devnagari handwriting support).
- Google Fonts curated for messy, cute, casual, and formal handwriting styles.

### 📦 5. 100% Free & Frictionless Export
- Multi-page high-resolution PDF download.
- High-resolution JPEG/PNG ZIP image bundle download.
- **Zero Login Wall**: No email signup, no Google login required to export.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/bipin-vishwakarma/papertrail.git
cd papertrail
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI components & hooks |
| **Vite 7** | Next-generation frontend tooling & build pipeline |
| **TypeScript** | Strict type safety with `verbatimModuleSyntax` |
| **Tailwind CSS v4** | Modern utility-first styling |
| **Zustand** | Centralized reactive state management |
| **Framer Motion** | Smooth UI transitions and drawers |
| **modern-screenshot & jsPDF** | High-fidelity canvas capture and PDF generation |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
