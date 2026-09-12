const fs = require('fs');
const file = 'src/components/common/Text2HandwritingLogo.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Ink<span/g, 'Text<span');
content = content.replace(/>Trail<\/span>/g, '>2Handwriting</span>');

fs.writeFileSync(file, content, 'utf8');
