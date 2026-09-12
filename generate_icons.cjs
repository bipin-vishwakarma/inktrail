const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
    // Ensure directories exist
    if (!fs.existsSync("public/icons")) fs.mkdirSync("public/icons", { recursive: true });
    if (!fs.existsSync("public/images")) fs.mkdirSync("public/images", { recursive: true });

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    const svg = `
        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="white" rx="10" />
            <defs>
                <linearGradient id="trailGrad-favicon" x1="14" y1="84" x2="88" y2="18" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="35%" stopColor="#3b82f6" />
                    <stop offset="70%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="38" fill="url(#trailGrad-favicon)" opacity="0.15" />
            <path d="M 20 78 C 14 62, 28 44, 46 44 C 64 44, 82 56, 84 72 C 86 86, 68 90, 52 82 C 34 72, 38 48, 50 32" stroke="#0f172a" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.08" />
            <path d="M 18 76 C 12 58, 28 40, 48 40 C 66 40, 84 54, 84 70 C 84 84, 68 88, 52 80 C 34 70, 36 46, 50 28" stroke="url(#trailGrad-favicon)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M 22 72 C 18 58, 30 43, 48 43 C 64 43, 79 54, 80 66" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.8" />
        </svg>`;

    const html = `<!DOCTYPE html><html style="margin:0;padding:0;width:100%;height:100%;background:transparent;"><body style="margin:0;padding:0;width:100%;height:100%;">${svg}</body></html>`;
    await page.setContent(html);

    // Standard Icon Sizes
    const sizes = [
        { width: 16, height: 16, name: "favicon-16x16.png" },
        { width: 32, height: 32, name: "favicon-32x32.png" },
        { width: 180, height: 180, name: "apple-touch-icon.png" },
        { width: 192, height: 192, name: "android-chrome-192x192.png" },
        { width: 512, height: 512, name: "android-chrome-512x512.png" }
    ];

    for (const size of sizes) {
        await page.setViewport({ width: size.width, height: size.height });
        await page.screenshot({ path: `public/icons/${size.name}`, omitBackground: true });
        console.log(`Generated ${size.name}`);
    }

    // OpenGraph Image (1200x630)
    const ogHtml = `
    <!DOCTYPE html>
    <html style="margin:0;padding:0;width:1200px;height:630px;">
    <body style="margin:0;padding:0;width:1200px;height:630px;background:#f3f4f6;display:flex;justify-content:center;align-items:center;flex-direction:column;">
        <div style="width: 256px; height: 256px; margin-bottom: 40px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); border-radius: 60px;">
            ${svg}
        </div>
        <h1 style="font-family: sans-serif; font-size: 64px; color: #111827; margin: 0; font-weight: 800; letter-spacing: -2px;">Text2Handwriting</h1>
        <p style="font-family: sans-serif; font-size: 32px; color: #4b5563; margin: 16px 0 0 0;">Hyper-Realistic Handwriting Studio</p>
    </body>
    </html>`;

    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(ogHtml);
    await page.screenshot({ path: "public/images/logo.png" });
    console.log("Generated OpenGraph Image!");

    await browser.close();
})();
