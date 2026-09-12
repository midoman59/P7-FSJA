const fs = require('fs');
const path = require('path');

const lcovPath = path.join(__dirname, '../coverage/microcrm/lcov.info');

if (fs.existsSync(lcovPath)) {
  let content = fs.readFileSync(lcovPath, 'utf8');
  const originalSize = content.length;

  // Replace Windows backslashes with forward slashes
  content = content.replace(/\\/g, '/');

  fs.writeFileSync(lcovPath, content, 'utf8');

  console.log(`✓ Coverage paths normalized (${originalSize} → ${content.length} bytes)`);
} else {
  console.error(`✗ LCOV file not found: ${lcovPath}`);
  process.exit(1);
}
