from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

drawing = svg2rlg('public/icons/favicon.svg')
renderPM.drawToFile(drawing, 'public/icons/logo_highres.png', fmt='PNG', dpi=300)
