const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const tags = `
    <link rel="apple-touch-icon" href="/core_training_app/apple-touch-icon.png" />
    <link rel="manifest" href="/core_training_app/manifest.json" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="コアトレ" />
    <meta name="theme-color" content="#4CAF50" />`;

html = html.replace('</head>', tags + '\n  </head>');

fs.writeFileSync(indexPath, html);
console.log('PWA meta tags injected into dist/index.html');
