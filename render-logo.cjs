const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });
    const svg = '<svg width=\'512\' height=\'512\' viewBox=\'0 0 100 100\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><rect width=\'100\' height=\'100\' fill=\'white\' rx=\'20\' /><defs><linearGradient id=\'trailGrad-favicon\' x1=\'14\' y1=\'84\' x2=\'88\' y2=\'18\' gradientUnits=\'userSpaceOnUse\'><stop offset=\'0%\' stopColor=\'#06b6d4\' /><stop offset=\'35%\' stopColor=\'#3b82f6\' /><stop offset=\'70%\' stopColor=\'#7c3aed\' /><stop offset=\'100%\' stopColor=\'#ec4899\' /></linearGradient></defs><circle cx=\'50\' cy=\'50\' r=\'38\' fill=\'url(#trailGrad-favicon)\' opacity=\'0.15\' /><path d=\'M 20 78 C 14 62, 28 44, 46 44 C 64 44, 82 56, 84 72 C 86 86, 68 90, 52 82 C 34 72, 38 48, 50 32\' stroke=\'#0f172a\' stroke-width=\'11\' stroke-linecap=\'round\' stroke-linejoin=\'round\' opacity=\'0.08\' /><path d=\'M 18 76 C 12 58, 28 40, 48 40 C 66 40, 84 54, 84 70 C 84 84, 68 88, 52 80 C 34 70, 36 46, 50 28\' stroke=\'url(#trailGrad-favicon)\' stroke-width=\'9\' stroke-linecap=\'round\' stroke-linejoin=\'round\' /><path d=\'M 22 72 C 18 58, 30 43, 48 43 C 64 43, 79 54, 80 66\' stroke=\'#ffffff\' stroke-width=\'2.4\' stroke-linecap=\'round\' opacity=\'0.8\' /></svg>';
    const html = '<!DOCTYPE html><html style=\'margin:0;padding:0;background:transparent;\'><body style=\'margin:0;padding:0;\'>' + svg + '</body></html>';
    await page.setContent(html);
    await page.screenshot({ path: 'public/icons/Text2Handwriting_Logo_HighRes.png', omitBackground: true });
    await browser.close();
    console.log('PNG generated successfully!');
})();
