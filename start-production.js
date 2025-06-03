#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure public directory exists and contains the built files
const distPath = path.join(__dirname, 'dist', 'public');
const publicPath = path.join(__dirname, 'public');

if (fs.existsSync(distPath)) {
  // Copy dist/public to public if it doesn't exist
  if (!fs.existsSync(publicPath)) {
    fs.cpSync(distPath, publicPath, { recursive: true });
    console.log('Copied built files to public directory');
  }
} else {
  console.log('Warning: No built files found in dist/public');
}

// Start the server
import('./dist/index.js').catch(console.error);