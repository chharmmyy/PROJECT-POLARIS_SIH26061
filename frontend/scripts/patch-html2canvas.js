const fs = require('fs');
const path = require('path');

const colorSupportSnippet = `
var labToRgbInternal = function(l, a, b) {
    var y = (l + 16) / 116;
    var x = a / 500 + y;
    var z = y - b / 200;
    var fn = function (v) { return (v * v * v > 0.008856 ? v * v * v : (v - 16 / 116) / 7.787); };
    x = 0.95047 * fn(x);
    y = 1.00000 * fn(y);
    z = 1.08883 * fn(z);
    var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    var bl = x * 0.0557 + y * -0.2040 + z * 1.0570;
    var compand = function (v) { return (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055); };
    r = Math.min(255, Math.max(0, Math.round(compand(r) * 255)));
    g = Math.min(255, Math.max(0, Math.round(compand(g) * 255)));
    bl = Math.min(255, Math.max(0, Math.round(compand(bl) * 255)));
    return [r, g, bl];
};
var oklabToRgbInternal = function(L, a, b) {
    var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    var s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    var l = l_ * l_ * l_;
    var m = m_ * m_ * m_;
    var s = s_ * s_ * s_;
    var r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    var g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    var bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    var compand = function (v) { return (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055); };
    r = Math.min(255, Math.max(0, Math.round(compand(r) * 255)));
    g = Math.min(255, Math.max(0, Math.round(compand(g) * 255)));
    bl = Math.min(255, Math.max(0, Math.round(compand(bl) * 255)));
    return [r, g, bl];
};
var lab = function (_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    var l = tokens[0] ? getTokenColorValue(tokens[0], 0) : 0;
    var a = tokens[1] ? getTokenColorValue(tokens[1], 1) : 0;
    var b = tokens[2] ? getTokenColorValue(tokens[2], 2) : 0;
    var alpha = tokens[3] ? (tokens[3].type === 16 ? tokens[3].number / 100 : tokens[3].number) : 1;
    var rgb = labToRgbInternal(l, a, b);
    return pack(rgb[0], rgb[1], rgb[2], alpha);
};
var oklab = function (_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    var l = tokens[0] ? (tokens[0].type === 16 ? tokens[0].number / 100 : tokens[0].number) : 0;
    var a = tokens[1] ? getTokenColorValue(tokens[1], 1) : 0;
    var b = tokens[2] ? getTokenColorValue(tokens[2], 2) : 0;
    var alpha = tokens[3] ? (tokens[3].type === 16 ? tokens[3].number / 100 : tokens[3].number) : 1;
    var rgb = oklabToRgbInternal(l, a, b);
    return pack(rgb[0], rgb[1], rgb[2], alpha);
};
var lch = function (_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    var l = tokens[0] ? getTokenColorValue(tokens[0], 0) : 0;
    var c = tokens[1] ? getTokenColorValue(tokens[1], 1) : 0;
    var h = tokens[2] ? getTokenColorValue(tokens[2], 2) : 0;
    var alpha = tokens[3] ? (tokens[3].type === 16 ? tokens[3].number / 100 : tokens[3].number) : 1;
    var hRad = (h * Math.PI) / 180;
    var a = c * Math.cos(hRad);
    var b = c * Math.sin(hRad);
    var rgb = labToRgbInternal(l, a, b);
    return pack(rgb[0], rgb[1], rgb[2], alpha);
};
var oklch = function (_context, args) {
    var tokens = args.filter(nonFunctionArgSeparator);
    var l = tokens[0] ? (tokens[0].type === 16 ? tokens[0].number / 100 : tokens[0].number) : 0;
    var c = tokens[1] ? getTokenColorValue(tokens[1], 1) : 0;
    var h = tokens[2] ? getTokenColorValue(tokens[2], 2) : 0;
    var alpha = tokens[3] ? (tokens[3].type === 16 ? tokens[3].number / 100 : tokens[3].number) : 1;
    var hRad = (h * Math.PI) / 180;
    var a = c * Math.cos(hRad);
    var b = c * Math.sin(hRad);
    var rgb = oklabToRgbInternal(l, a, b);
    return pack(rgb[0], rgb[1], rgb[2], alpha);
};
`;

const filesToPatch = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.esm.js',
  'node_modules/html2canvas/dist/html2canvas.min.js'
];

filesToPatch.forEach(relPath => {
  const filePath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) {
    console.log('File not found, skipping:', relPath);
    return;
  }

  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Safe fallback for unsupported color function instead of throwing
  if (code.includes('throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"");')) {
    code = code.replace(
      'throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"");',
      'return pack(0, 0, 0, 1);'
    );
  }

  // 2. Add modern color functions if not already present
  if (!code.includes('labToRgbInternal')) {
    const target = 'var SUPPORTED_COLOR_FUNCTIONS = {';
    if (code.includes(target)) {
      code = code.replace(
        target,
        colorSupportSnippet + '\n' + target + '\n    lab: lab,\n    oklab: oklab,\n    lch: lch,\n    oklch: oklch,'
      );
      console.log('Patched SUPPORTED_COLOR_FUNCTIONS in:', relPath);
    }
  }

  fs.writeFileSync(filePath, code, 'utf8');
});

console.log('html2canvas patch complete.');
