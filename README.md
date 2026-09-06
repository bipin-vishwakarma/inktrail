<div align="center">

# 🖋️ InkTrail

<img src="public/images/logo.png" alt="InkTrail Logo" width="140" />

### Next-Gen Hyper-Realistic Text-to-Handwriting Studio with 3D Camera Physics, Smart Margin Indexing, Chisel Highlighters, and Organic Human Flaws

[![Live Demo](https://img.shields.io/badge/Live-Demo%20on%20Vercel-black?style=for-the-badge&logo=vercel)](https://inktrail-omega.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/bipin-vishwakarma/inktrail)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**[Key Features](#-key-features)** • **[Markup Cheat Sheet](#-markup--syntax-cheat-sheet)** • **[Camera & Physics](#-3d-camera-physics--photo-effects)** • **[Quick Start](#-quick-start)** • **[Deployment](#-deployment-to-vercel)**

</div>

---

## 🌟 What is InkTrail?

**InkTrail** is a privacy-first, zero-friction web application that transforms standard typed text, assignments, and study notes into **indistinguishable physical handwriting photos**.

Unlike traditional handwriting generators that simply render flat digital fonts in a rigid grid, InkTrail reproduces the subtle physical flaws, optical dynamics, and analog paper textures of real-world notes:
- **Hand Dynamics**: Letter micro-jitter, pen pressure variance, baseline wobble, and progressive wrist fatigue.
- **Academic Notebook Elements**: Iconic pre-printed **Date & Page No.** header box, heading double-underlines, and wobbly hand-drawn formula boxes.
- **Chisel-Tip Highlighting**: Multi-color translucent highlighters that blend into porous paper fibers using `mix-blend-mode: multiply`.
- **Smart Academic Layout**: Automated detection of question numbers, answers, roman numerals, and bullets positioned outside the red margin line.
- **Organic Corrections**: Procedural scratch-outs (wavy scribbles, blackouts, slashes) and handwritten caret (`^`) insertions.
- **Physical Environment**: 3D perspective camera angles, smartphone cast shadows, warm desk lamp lighting, and realistic paper creases.
- **Zero Friction**: 100% client-side rendering with zero mandatory logins or paywalls for PDF/ZIP exports.

---

## ⚡ Key Features

### 🖍️ 1. Multi-Color Chisel-Tip Highlighters
Authentic felt marker simulation designed to highlight keywords, dates, and definitions:
- **4 Translucent Ink Shades**:
  - `==text==` $\rightarrow$ Classic Neon Yellow
  - `==green:text==` $\rightarrow$ Mint Emerald Green
  - `==pink:text==` $\rightarrow$ Pastel Rose Pink
  - `==blue:text==` $\rightarrow$ Cyan Sky Blue
- **Paper-Sink Optical Blending**: Uses `mix-blend-mode: multiply` on paper texture, angled chisel skew (`skewX(-2.5deg)`), and natural stroke jitter so highlighter ink sits underneath the pen strokes.
- **Multi-Word Span Support**: Smoothly wraps across long phrases and multiple lines without breaking.

---

### 📅 2. Authentic Student Notebook Header Box & Double Top Rule
- **Iconic Indian Notebook Header**: Multi-compartment coral/rose printed box in the top-right corner, matching authentic **Youva (Navneet), Classmate, Spellar & Sundaram** student notebooks.
- **Day of Week Tracker**: Includes `M T W T F S S` day initials with an organic hand-drawn blue ballpoint circle around the active day.
- **Dynamic Page Numbers & Date**: Automatically numbers each page (`PAGE NO: 01`, `02`, `03`...) using the chosen handwriting style and pen ink, with customizable date.
- **Double Red Top Header Rule**: Authentic dual red lines across the top header margin.
- **Full Fidelity Export**: Rendered on the live drafting desk and preserved pixel-for-pixel inside exported PDFs and Ultra-HD ZIP images.

---

### 🌀 3. 3D Twin-Wire Spiral Binding & Reverse-Page Ink Ghosting
- **3D Twin-Wire Metallic Coils**: Procedural silver dual coils with realistic depth, specular highlights, dark shadow casting, and punched holes.
- **Recto / Verso Parity**: Automatically mirrors spiral binding orientation across pages (odd pages bound on left margin, flipped even pages bound on right margin).
- **Reverse-Page Ink Ghosting**: Simulates genuine 65 GSM Indian notebook paper where faint, blurred handwriting from the reverse side shines through with `mix-blend-mode: multiply` and customizable opacity (4%–28%).

---

### ⚖️ 4. 2-Column Comparison & Differentiation Tables
- **Comparison Syntax**: Format side-by-side differentiations using `|| Advantage | Disadvantage ||` or `[compare]` blocks.
- **Hand-Drawn Divider**: Automatically draws an organic, pen-colored vertical divider line down the center of the ruled lines with natural micro-wobble.
- **Academic Formatting Toolbar**: 1-click heading chips for `[Q1.]`, `[Ans:]`, `[Advantages:]`, `[Limitations:]`, `[Applications:]`, and `[Conclusion:]`, plus automatic typing conversion of `->` to `→`.

---

### ✍️ 5. Heading Double-Underlines & Formula Result Boxes
- **Heading Double Underline (`__Title__`)**: Draws two organic, dual-stroke pen underlines under headings with natural wrist curve and micro-tilt.
- **Hand-Drawn Formula Box (`[[Result]]`)**: Wraps final answers, math formulas, or key definitions inside a wobbly, hand-drawn rectangular sketch box.

---

### ⚡ 4. Quick Markup Toolbar
- Convenient 1-click buttons placed right above the text editor:
  - `🖍️ Yellow` • `🟢 Green` • `🌸 Pink` • `🔷 Blue` • `__Double__` • `[[Box]]` • `~~Strike~~` • `^Caret^`
- **Smart Text Selection**: Highlight any text in your document and click any button to wrap it instantly, or click to insert a formatted placeholder at your cursor position.

---

### 📐 5. Smart Margin Indexing Engine
Simulates the authentic way students and researchers write notes and exams on ruled margin paper:
- **Autonomous Margin Detection**: Identifies prefixes such as:
  - **Questions & Answers**: `Q1.`, `Q.2`, `Ans:`, `Answer:`, `Solution:`, `Note:`
  - **Numeric & Alphabetic Subsections**: `1.`, `(a)`, `b)`, `IV.`, `(iii)`
  - **Academic Steps**: `Step 1:`, `Case A:`, `Ex. 3:`
  - **Bulleted Pointers**: `•`, `-`, `*`, `→`
- **Authentic Alignment**: Positioned dynamically to the left of the vertical red margin line, perfectly baseline-aligned with the accompanying handwriting.
- **Smart Toggle**: Can be enabled or disabled with a single click in Paper Settings.

---

### ✂️ 6. Procedural Pen Scratch & Correction Engine
- **Multiple Strike Styles**:
  - 〰️ **Wavy Scribble**: Natural, looping cursive blackout loops.
  - ✍️ **Underline**: Organic pen line underneath the mistake.
  - ⬛ **Blackout**: Dense, heavy zig-zag pen obliteration.
  - ➖ **Single Strike**: A quick, hurried slash.
  - ⚡ **Zigzag** & ➰ **Coil**: Quick spiral or jagged scratches.
- **Handwritten Caret Insertion (`^`)**: Renders realistic caret marks with the corrected word handwritten directly above the line.
- **Customizable Correction Ink**: Choose **Match** (same pen color) or contrasting inks (**Red**, **Green**, **Purple**).
- **Progressive Writer Fatigue**: Subtly increases baseline drift, slant, and letter spacing towards the bottom of long pages.

---

### 📸 7. 3D Camera Physics & Photo Effects
- **True 3D Spatial Angles**: Rotates notebook pages in 3D space (`perspective(1000px)`, `rotateX`, `rotateY`, and `scale`) mimicking high-angle smartphone camera snapshots.
- **Random Angle Generator**: One-click procedural angle generator that rolls authentic hand-held phone camera rotations ($0.5^\circ - 3.5^\circ$) with tilt jitter per page.
- **Export-Preserved Non-Planar Geometry**: Renders the exact 3D tilt, aspect ratio, and perspective into exported PDFs and Ultra-HD PNG/JPEGs.
- **Smartphone Silhouette Shadow**: Realistic soft-edged silhouette of a phone hovering over the notebook, with customizable angle ($0^\circ - 360^\circ$) and shadow density.
- **Lighting Modes**:
  - 🛋️ **Warm Desk Lamp**: Tungsten warm gradient with adjustable warmth slider.
  - ☀️ **Cool Daylight**: Natural window exposure lighting.
  - ⚡ **Camera Flash**: High-intensity central flash hotspot.
  - 📄 **Flat / Scanner**: Crisp document scan.

---

### 📜 8. 9 Procedural Paper Creases & Folds
Real paper rarely stays completely flat. Choose from 9 authentic physical paper wear profiles:
1. **None**: Crisp, fresh printer paper.
2. **Horizontal Half Fold**: Center fold crease from folding an A4 sheet in half.
3. **Quarter Cross Fold**: 4-quadrant letter fold lines.
4. **Dog-Eared Corner**: Classic bent page corner.
5. **Diagonal Crease**: Hurried textbook bookmark angle fold.
6. **Subtle Wrinkle**: Soft, natural organic paper texture.
7. **Heavy Crease**: Distinct pressure fold lines.
8. **Crumpled & Flattened**: Deep textured distress pattern.
9. **Trifold Brochure**: Letter-style three-panel vertical folds.

---

### 🖋️ 9. Pen Presets & Realistic Papers
- **Pen Presets**:
  - 🖊️ **Blue Ballpoint** (`#1e40af`) — Classic student ballpoint
  - 🖋️ **Black Gel Pen** (`#111827`) — Deep dark ink
  - ✒️ **Royal Fountain** (`#1d4ed8`) — Parker royal blue
  - ✏️ **HB #2 Pencil** (`#4b5563`) — Graphite texture
  - 🔴 **Red Pen** (`#dc2626`) — Vibrant red ink
- **Paper Materials**:
  - 📝 **College Ruled (Red Margin)** — Classic 65px vertical red margin line
  - 📜 **Standard Blue Ruled** — Clean lined notebook paper
  - 📐 **Engineering Graph Paper** — Precision 24px grid paper
  - 📄 **Plain White Sheet** — Unlined printer paper
  - 📜 **Vintage Notepad** — Aged cream parchment sheet

---

### 🗂️ 10. 25+ Curated Authentic Handwriting Fonts
Loaded locally & via Google Fonts for instant, zero-latency rendering:
- **Indian Student Handwritings**: `Shantell Sans`, `Delius`, `Pangolin`, `Gochi Hand`, `Kalam`.
- **Organic Student Handwritings**: `David Reid`, `Garrett Moretz`, `Herbert Cooper`, `John Williams`, `Kevin Knowles`, `Royston Such`.
- **Classic Styles**: `Handwriting 1` through `Handwriting 14` (Clean Pen, Casual Slant, Neat Ballpoint, Fluid Cursive, Fast Flow, Loose Homework, Fine Nib, Quick Notes, etc.).
- **Casual Everyday Fonts**: `Cedarville Cursive`, `Homemade Apple`, `Indie Flower`, `Patrick Hand`, `Shadows Into Light`, `Reenie Beanie`.
- **Full Devnagari Support**: Hindi handwriting font included.

---

### 🖨️ 11. Multi-Page Live Export Preview
- **Pre-Export Inspection**: Scroll through all generated pages with all active 3D tilts, shadows, highlighters, and creases rendered before downloading.
- **Ultra-HD Resolution**: Renders pages at crisp print resolutions (up to $2480 \times 3508$ pixels for A4).
- **Multi-Format Export**:
  - Single/Multi-page PDF document.
  - High-resolution JPEG/PNG ZIP archive.
- **Zero Login Wall**: No email signup, no Google login required.

---

## 📝 Markup & Syntax Cheat Sheet

| Effect | Syntax | Example | Description |
| :--- | :--- | :--- | :--- |
| **Yellow Highlighter** | `==text==` | `==important concept==` | Classic neon yellow chisel marker |
| **Green Highlighter** | `==green:text==` | `==green:Lenz's Law==` | Pastel emerald green chisel marker |
| **Pink Highlighter** | `==pink:text==` | `==pink:Michael Faraday==` | Soft rose pink chisel marker |
| **Blue Highlighter** | `==blue:text==` | `==blue:1831==` | Cyan blue chisel marker |
| **Double Underline** | `__text__` | `__Electromagnetic Induction__` | Organic dual-line heading underline |
| **Formula / Answer Box** | `[[text]]` | `[[e = -dΦ/dt]]` | Hand-drawn wobbly answer box |
| **2-Column Comparison** | `\|\| Left \| Right \|\|` | `\|\| RAM \| ROM \|\|` | Side-by-side columns with hand-drawn pen divider |
| **Arrow Symbol** | `->` | `Input -> Output` | Automatically transforms to `→` on typing |
| **Scratch-Out / Strike** | `~~text~~` | `~~incorrect~~` | Natural pen scratch-out over word |
| **Strike with Caret** | `~~word~~^fix` | `~~proeprties~~^properties` | Scratches out word and puts fix above |
| **Standalone Caret** | `^word^` or `^word` | `looked ^at the car` | Caret mark pointing up at inserted word |
| **Margin Question Marker** | `Q1.` or `Q.1` | `Q1. State Faraday's law` | Placed in the left margin area |
| **Margin Answer Tag** | `Ans:` or `Sol:` | `Ans: When magnetic flux changes...` | Placed in the left margin area |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/bipin-vishwakarma/inktrail.git
cd inktrail
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

## ☁️ Deployment to Vercel

InkTrail is pre-configured with SPA routing and client-side rewrites in `vercel.json`.

### Option A: Using Vercel CLI
```bash
npx vercel --prod
```

### Option B: Deploy via GitHub
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your repository and click **Deploy**.
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI components & reactive hooks |
| **Vite 7** | Next-generation frontend tooling & lightning-fast HMR |
| **TypeScript 5.9** | Strict type safety with modern module resolution |
| **Tailwind CSS v4** | Modern CSS-first styling engine with high performance |
| **Zustand** | Centralized reactive state management |
| **Framer Motion** | Fluid animations, drawers, and modal transitions |
| **modern-screenshot & jsPDF** | High-fidelity canvas capture and PDF generation |
| **JSZip** | Multi-image compression for batch export |
| **Lucide React** | Clean, accessible vector icons |

---

## 📁 Project Structure

```
inktrail/
├── public/
│   ├── fonts/           # 20+ locally loaded authentic handwriting fonts
│   ├── images/          # Assets, paper textures, and logos
│   ├── favicon.ico      # InkTrail fountain-pen favicon
│   └── favicon.png      # InkTrail high-res brand icon
├── src/
│   ├── components/
│   │   ├── HandwrittenWord.tsx     # Highlighters, strikes, carets, double underlines, boxes
│   │   ├── CameraOverlay.tsx       # 3D lighting, creases, phone shadows, sensor noise
│   │   ├── HumanErrorsControls.tsx # Sliders & toggles for human imperfections
│   │   ├── PenPresetSelector.tsx   # Pen ink presets palette
│   │   ├── ThumbnailBar.tsx        # Multi-page floating thumbnail navigation
│   │   ├── layout/                 # Navbar, footer, and page layouts
│   │   └── modals/                 # Export modal, creator modal, history dialog
│   ├── lib/                        # Zustand store & global state
│   ├── pages/                      # EditorPage studio, landing, and legal pages
│   └── utils/                      # Word tokenization, font metrics, camera shadows
├── vercel.json          # SPA rewrite rules for zero-404 Vercel deployments
└── package.json
```

---

## 👨‍💻 Creator & Author

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/151464007?v=4" alt="Bipin Vishwakarma" width="90" style="border-radius: 50%; border: 3px solid #3b82f6;" />
  <br />
  <h3>Bipin Vishwakarma</h3>
  <p><strong>Creator & Developer • InkTrail</strong><br />
  Biomedical Engineering Student at <strong>UPES Dehradun</strong> with a minor in <strong>Artificial Intelligence</strong>. Passionate about creative tech, analog document realism, and building free, privacy-first tools for students and creators.</p>

  <a href="https://github.com/bipin-vishwakarma"><img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <a href="https://instagram.com/bipin_vishwakarma"><img src="https://img.shields.io/badge/Instagram-@bipin__vishwakarma-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
  <a href="https://www.linkedin.com/in/bipin-vishwakarma-b407313b8"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" /></a>
</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  Crafted with ❤️ by <a href="https://github.com/bipin-vishwakarma"><strong>Bipin Vishwakarma</strong></a>
</div>
