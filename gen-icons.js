const fs = require('fs');
const path = require('path');

// 这是一个极其简单的 81x81 像素的 PNG Base64 数据（透明底灰色圆和粉色圆）
const defaultIconBase64 = "iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAAAXNSR0IArs4c6QAAAEFJREFUeF7t0AENAAAAwqD3T20PBxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ4Y8gABAR8YhwAAAABJRU5ErkJggg==";
const activeIconBase64 = "iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAAAXNSR0IArs4c6QAAAEBJREFUeF7t0AEBAAAAwqD1T20ND6gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmA97AAEB6A1GAAAAAElFTkSuQmCC";

const names = ['home', 'discover', 'publish', 'events', 'profile'];
const dir = path.join(__dirname, 'src', 'assets', 'tabbar');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

names.forEach(name => {
  fs.writeFileSync(path.join(dir, `${name}.png`), Buffer.from(defaultIconBase64, 'base64'));
  fs.writeFileSync(path.join(dir, `${name}-active.png`), Buffer.from(activeIconBase64, 'base64'));
});

console.log('Icons generated successfully.');
