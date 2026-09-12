const fs = require('fs');
const file = 'src/components/common/Text2HandwritingLogo.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the Nib Head group
content = content.replace(/\{\/\* 3D Iconic Gold Nib Head \*\/\}.*?<\/g>/s, '');

// Also clean up the gradients if we want, but it's not strictly necessary.

fs.writeFileSync(file, content, 'utf8');
