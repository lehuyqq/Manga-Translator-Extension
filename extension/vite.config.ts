import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import * as fs from 'fs';
import * as path from 'path';

function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const manifestSrc = path.resolve(__dirname, 'manifest.json');
      const manifestDest = path.resolve(distDir, 'manifest.json');

      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
      }

      const popupHtml = path.resolve(distDir, 'src', 'popup', 'index.html');
      const popupDir = path.resolve(distDir, 'popup');
      const popupHtmlOut = path.resolve(popupDir, 'index.html');
      const popupJs = path.resolve(distDir, 'src', 'popup', 'index.js');
      const popupJsOut = path.resolve(popupDir, 'index.js');

      if (fs.existsSync(popupHtml)) {
        fs.mkdirSync(popupDir, { recursive: true });
        fs.renameSync(popupHtml, popupHtmlOut);
      }
      if (fs.existsSync(popupJs)) {
        fs.mkdirSync(popupDir, { recursive: true });
        fs.renameSync(popupJs, popupJsOut);
      }

      if (fs.existsSync(popupHtmlOut)) {
        let html = fs.readFileSync(popupHtmlOut, 'utf-8');
        html = html.replace(/href="\/assets\//g, 'href="../assets/');
        html = html.replace(/src="\/assets\//g, 'src="../assets/');
        html = html.replace(/src="\/popup\//g, 'src="./');
        html = html.replace(/src="\.\.\/src\/popup\/([^"]+)"/g, 'src="../popup/$1"');
        fs.writeFileSync(popupHtmlOut, html);
      }

      const srcDir = path.resolve(distDir, 'src');
      if (fs.existsSync(srcDir)) {
        try {
          fs.rmSync(srcDir, { recursive: true, force: true });
        } catch {
          // ignore cleanup errors
        }
      }

      console.log('Manifest copied and extension artifacts normalized.');
    },
  };
}

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        'content-script/index': resolve(__dirname, 'src/content-script/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background/index.js';
          if (chunkInfo.name === 'content-script/index') return 'content-script/index.js';
          if (chunkInfo.name === 'popup') return 'popup/index.js';
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  plugins: [
    copyManifestPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: [
            'public/icons/icon16.png',
            'public/icons/icon32.png',
            'public/icons/icon48.png',
            'public/icons/icon128.png',
          ],
          dest: 'icons',
        },
        {
          src: 'public/_locales',
          dest: '.',
        },
      ],
    }),
  ],
});
