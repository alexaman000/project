const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.tsx',
  'src/app/auth/page.tsx',
  'src/components/CinematicLayout.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace text-white with a bright golden color
    content = content.replace(/text-white/g, 'text-[#FDE047]');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
