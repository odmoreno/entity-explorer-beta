var svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg1.setAttribute("viewBox", [-width / 2, (-height / 2) - 25, width - 100 , height])
svg1.setAttribute("width", width)
svg1.setAttribute("height", height)
//svg.attr("viewBox", [-width / 2, (-height / 2) - 25, width - 100 , height])
//.attr("width", width) // + margin.left + margin.right)
//.attr("height", height)
console.log(svg1)
var pt = svg1.createSVGPoint();

// pass event coordinates
pt.x = x;
pt.y = y;

const svgP = pt.matrixTransform( svg1.getScreenCTM().inverse() );
console.log("new coord:", svgP.x, svgP.y)