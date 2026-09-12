const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.match(/\.(tsx|ts|jsx|js|html)$/)) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src').concat(['./index.html']);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace text
    content = content.replace(/InkTrail/g, 'Text2Handwriting');
    content = content.replace(/inktrail/g, 'text2handwriting');
    
    // Rename component imports/exports if needed (Text2HandwritingLogo)
    // The node script replaces the strings, so InkTrailLogo becomes Text2HandwritingLogo
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
