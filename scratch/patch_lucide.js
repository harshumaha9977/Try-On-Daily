import fs from 'fs';
import path from 'path';

const lucideDir = '/Users/harshalmahajan/Desktop/virtual-tryon.nosync/frontend/node_modules/lucide-react/dist/esm';
const iconDir = path.join(lucideDir, 'icons');
const iconIndexPath = path.join(iconDir, 'index.mjs');
const mainPath = path.join(lucideDir, 'lucide-react.mjs');

const icons = [
  'X', 'Check', 'Loader2', 'CheckCircle', 'Shield', 'Bot', 'User', 'ChevronRight', 
  'MessageSquare', 'Search', 'Menu', 'Shirt', 'Mail', 'Lock', 'AlertCircle',
  'Home', 'Sparkles', 'Settings', 'Image', 'Zap', 'Play', 'Star', 'Code', 'Server',
  'Heart', 'ArrowRight', 'Watch', 'Gem', 'Footprints', 'Camera', 'MapPin', 'Phone',
  'Send', 'Scissors', 'Grid', 'Upload', 'ChevronLeft', 'Download', 'History', 'Glasses',
  'CreditCard', 'LogOut', 'LayoutGrid', 'Moon', 'Languages'
];

// Patch icons/index.mjs
let iconContent = '';
icons.forEach(icon => {
  let fileName = icon.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  if (icon === 'CheckCircle') fileName = 'check-circle';
  if (icon === 'ChevronRight') fileName = 'chevron-right';
  if (icon === 'MessageSquare') fileName = 'message-square';
  if (icon === 'AlertCircle') fileName = 'alert-circle';
  if (icon === 'ArrowRight') fileName = 'arrow-right';
  if (icon === 'MapPin') fileName = 'map-pin';
  if (icon === 'Loader2') fileName = 'loader-2';
  if (icon === 'ChevronLeft') fileName = 'chevron-left';
  if (icon === 'CreditCard') fileName = 'credit-card';
  if (icon === 'LogOut') fileName = 'log-out';
  if (icon === 'LayoutGrid') fileName = 'layout-grid';

  const fullPath = path.join(iconDir, `${fileName}.mjs`);
  if (fs.existsSync(fullPath)) {
    iconContent += `export { default as ${icon} } from './${fileName}.mjs';\n`;
  }
});

fs.writeFileSync(iconIndexPath, iconContent);

// Patch lucide-react.mjs
const mainContent = `export { ${icons.join(', ')} } from './icons/index.mjs';\n`;
fs.writeFileSync(mainPath, mainContent);

console.log('Successfully patched BOTH Lucide files with exhaustive list.');
