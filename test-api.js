const fs = require('fs');

async function run() {
  try {
    const res = await fetch('https://www.pivix.top/posts');
    const data = await res.json();
    console.log('posts', data.data.list.length);
  } catch (e) {
    console.error('posts error', e);
  }

  try {
    const res = await fetch('https://www.pivix.top/demands');
    const data = await res.json();
    console.log('demands', data.data.list.length);
  } catch (e) {
    console.error('demands error', e);
  }
}

run();
