#!/usr/bin/env node
/**
 * Teknoloji Blogu - Otomatik Makale Uretici
 * GitHub Actions ile her gun calisir.
 * RSS feedlerinden teknoloji haberlerini ceker,
 * docs/app.js icindeki SAMPLE_ARTICLES dizisine ekler.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_JS_PATH = path.resolve(__dirname, '..', 'docs', 'app.js');

const RSS_FEEDS = [
  { url: 'https://hnrss.org/frontpage?count=10', category: 'Yazilim' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Bilim' },
  { url: 'https://www.theverge.com/rss/index.xml', category: 'Teknoloji' },
  { url: 'https://techcrunch.com/feed/', category: 'Startup' },
  { url: 'https://www.wired.com/feed/rss', category: 'Teknoloji' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'Teknoloji' }
];

const CATEGORY_KEYWORDS = {
  'Yapay Zeka': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'copilot', 'chatgpt', 'gpt', 'llm', 'openai', 'anthropic', 'claude', 'gemini'],
  'Donanim': ['apple', 'iphone', 'macbook', 'chip', 'processor', 'gpu', 'cpu', 'hardware', 'nvidia', 'amd', 'intel', 'qualcomm', 'samsung'],
  'Frontend': ['react', 'angular', 'vue', 'css', 'javascript', 'typescript', 'web', 'browser', 'frontend', 'ui', 'ux'],
  'Backend': ['node', 'deno', 'rust', 'go', 'python', 'api', 'server', 'backend', 'database', 'docker', 'kubernetes'],
  'Guvenlik': ['security', 'cyber', 'hack', 'vulnerability', 'malware', 'ransomware', 'privacy', 'encryption', 'zero day'],
  'Mobil': ['mobile', 'android', 'ios', 'app', 'smartphone', 'tablet', 'wearable', 'flutter', 'swift'],
  'Cloud': ['cloud', 'aws', 'azure', 'google cloud', 'serverless', 'saas', 'iaas', 'paas'],
  'Bilim': ['quantum', 'space', 'nasa', 'science', 'research', 'nobel', 'physics', 'biology', 'medicine'],
  'Startup': ['startup', 'venture', 'funding', 'ipo', 'unicorn', 'silicon valley', 'yc', 'accelerator'],
  'Ulasim': ['tesla', 'ev', 'electric vehicle', 'autonomous', 'self-driving', 'robotaxi', 'waymo'],
  'Isletim Sistemi': ['windows', 'linux', 'macos', 'ubuntu', 'kernel', 'os', 'operating system'],
  'Web3': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'nft', 'defi', 'solana'],
  'Oyun': ['gaming', 'playstation', 'xbox', 'nintendo', 'game', 'vr', 'ar', 'unreal engine', 'unity']
};

const DEFAULT_CATEGORY = 'Teknoloji';
const MAX_ARTICLES = 120;
const ARTICLES_PER_RUN = 5;

// --- RSS XML parse ---
function parseRSS(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link'),
      description: stripHtml(extractTag(itemXml, 'description')),
      pubDate: extractTag(itemXml, 'pubDate'),
      creator: extractTag(itemXml, 'dc:creator') || extractTag(itemXml, 'author') || ''
    });
  }
  return items;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  if (match) return (match[1] || match[2] || '').trim();
  return '';
}

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '').trim();
}

// --- Yardimci fonksiyonlar ---
function detectCategory(title, desc) {
  const text = (title + ' ' + desc).toLowerCase();
  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += kw.split(' ').length;
    }
    if (score > 0) scores[cat] = score;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : DEFAULT_CATEGORY;
}

function getRandomImage() {
  const keywords = ['technology', 'coding', 'computer', 'ai', 'digital', 'robot', 'data', 'cyber', 'code', 'server'];
  const kw = keywords[Math.floor(Math.random() * keywords.length)];
  return `https://source.unsplash.com/400x250/?${kw}&${Date.now()}`;
}

// Guvenli JS string (cift tirnak icinde kullanilacak)
function safeStr(s) {
  if (!s) return '';
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .trim();
}

// Guvenli template literal (backtick icinde kullanilacak)
function safeTpl(s) {
  if (!s) return '';
  return s
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .trim();
}

// --- Mevcut makaleleri oku ---
function readExistingArticles() {
  const raw = fs.readFileSync(APP_JS_PATH, 'utf-8');
  const content = raw.replace(/\r\n/g, '\n');

  const startMarker = 'const SAMPLE_ARTICLES = [';
  const endMarker = '];\n\nconst SAMPLE_CATEGORIES';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('SAMPLE_ARTICLES array not found in app.js');
  }

  const arrayStart = startIdx + startMarker.length;
  const arrayContent = content.substring(arrayStart, endIdx).trim();

  const idRegex = /_id:\s*"(\d+)"/g;
  const ids = [];
  let m;
  while ((m = idRegex.exec(arrayContent)) !== null) ids.push(parseInt(m[1]));

  const titleRegex = /title:\s*"([^"]+)"/g;
  const titles = [];
  while ((m = titleRegex.exec(arrayContent)) !== null) titles.push(m[1].toLowerCase().trim());

  return { raw, content, startIdx, arrayStart, endIdx, arrayContent, ids, titles };
}

// --- Yeni makaleleri ekle ---
function writeArticles(existing, newArticles) {
  const { raw, content, endIdx } = existing;
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';

  const newEntries = newArticles.map(a => {
    return [
      '    {',
      '        _id: "' + safeStr(a._id) + '",',
      '        title: "' + safeStr(a.title) + '",',
      '        description: "' + safeStr(a.description) + '",',
      '        category: "' + safeStr(a.category) + '",',
      '        imageUrl: "' + safeStr(a.imageUrl) + '",',
      '        views: 0, likes: 0,',
      '        publishedAt: new Date(Date.now() - ' + Math.floor(Math.random() * 24 * 3600000) + ').toISOString(),',
      '        author: "Ilker Bekmezci",',
      '        content: `' + safeTpl(a.content) + '`',
      '    }'
    ].join(nl);
  });

  const sep = ',' + nl;
  const newEntriesStr = sep + newEntries.join(sep);

  const normalized = content;
  const beforeEnd = normalized.substring(0, endIdx);
  const afterEnd = normalized.substring(endIdx);
  const lastBrace = beforeEnd.lastIndexOf('}');
  const updated = beforeEnd.substring(0, lastBrace + 1) + newEntriesStr + nl + beforeEnd.substring(lastBrace + 1);

  const result = (updated + afterEnd);
  const final = raw.includes('\r\n') ? result.replace(/\n(?!\r)/g, '\r\n') : result;
  fs.writeFileSync(APP_JS_PATH, final, 'utf-8');
  return newArticles.length;
}

// --- Eski makaleleri temizle ---
function trimArticles() {
  const raw = fs.readFileSync(APP_JS_PATH, 'utf-8');
  const content = raw.replace(/\r\n/g, '\n');
  const startMarker = 'const SAMPLE_ARTICLES = [';
  const endMarker = '];\n\nconst SAMPLE_CATEGORIES';
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx);
  if (startIdx === -1 || endIdx === -1) return;

  const arrayStart = startIdx + startMarker.length;
  const arrayContent = content.substring(arrayStart, endIdx).trim();

  const idMatches = arrayContent.match(/_id:\s*"\d+"/g);
  if (!idMatches || idMatches.length <= MAX_ARTICLES) return;

  const entries = [];
  let depth = 0, current = '';
  for (const ch of arrayContent) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    current += ch;
    if (depth === 0 && current.trim().startsWith('{') && current.trim().endsWith('}')) {
      entries.push(current.trim());
      current = '';
    }
  }

  if (entries.length <= MAX_ARTICLES) return;
  const keep = entries.slice(entries.length - MAX_ARTICLES);
  const sep = ',' + (raw.includes('\r\n') ? '\r\n' : '\n');
  const newArray = sep + keep.join(sep) + '\n';

  const newContent = content.substring(0, arrayStart) + newArray + content.substring(endIdx);
  const final = raw.includes('\r\n') ? newContent.replace(/\n(?!\r)/g, '\r\n') : newContent;
  fs.writeFileSync(APP_JS_PATH, final, 'utf-8');
}

// --- Kategorileri guncelle ---
function updateCategories() {
  const raw = fs.readFileSync(APP_JS_PATH, 'utf-8');
  const content = raw.replace(/\r\n/g, '\n');

  const catStart = 'const SAMPLE_CATEGORIES = [';
  const catEnd = '];';
  const startIdx = content.indexOf(catStart);
  const endIdx = content.indexOf(catEnd, startIdx + catStart.length);
  if (startIdx === -1 || endIdx === -1) return;

  const regex = /category:\s*"([^"]+)"/g;
  const cats = new Set();
  let m;
  while ((m = regex.exec(content)) !== null) cats.add(m[1]);

  const list = Array.from(cats).sort();
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  const newStr = catStart + nl + '    "' + list.join('", "') + '"' + nl + content.substring(endIdx);

  const result = content.substring(0, startIdx) + newStr;
  const final = raw.includes('\r\n') ? result.replace(/\n(?!\r)/g, '\r\n') : result;
  fs.writeFileSync(APP_JS_PATH, final, 'utf-8');
  console.log('Kategoriler guncellendi:', list.join(', '));
}

// --- Ana akis ---
async function main() {
  console.log('Teknoloji Blogu - Otomatik Makale Uretici');
  console.log('----------------------------------------');

  let existing;
  try {
    existing = readExistingArticles();
    console.log('Mevcut makale sayisi:', existing.ids.length);
  } catch (e) {
    console.error('app.js okunamadi:', e.message);
    process.exit(1);
  }

  const allFetchedItems = [];
  for (const feed of RSS_FEEDS) {
    try {
      console.log('Taranıyor:', feed.url.split('/')[2]);
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TeknolojiBlogu/1.0)' },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) { console.log('  HTTP', res.status); continue; }
      const xml = await res.text();
      const items = parseRSS(xml);
      console.log('  Bulunan:', items.length);
      for (const item of items) {
        if (item.title && item.title.length > 10) allFetchedItems.push(item);
      }
    } catch (e) {
      console.log('  Hata:', e.message);
    }
  }

  console.log('Toplam aday:', allFetchedItems.length);

  // Dedup
  const existingTitles = existing.titles;
  const newItems = [];
  const seen = new Set();

  for (const item of allFetchedItems) {
    const norm = item.title.toLowerCase().trim();
    if (seen.has(norm)) continue;
    seen.add(norm);

    let dup = false;
    for (const et of existingTitles) {
      if (norm === et || norm.includes(et) || et.includes(norm)) {
        dup = true;
        break;
      }
    }
    if (!dup) newItems.push(item);
  }

  console.log('Yeni (benzersiz):', newItems.length);

  const target = Math.min(newItems.length, ARTICLES_PER_RUN);
  const selected = newItems.slice(0, target);
  if (selected.length === 0) {
    console.log('Eklenecek yeni makale yok.');
    return;
  }

  let nextId = Math.max(...existing.ids, 0) + 1;

  const articles = selected.map((item, i) => {
    const cat = detectCategory(item.title, item.description);
    const desc = item.description
      ? (item.description.length > 200 ? item.description.substring(0, 197) + '...' : item.description)
      : item.title + ' hakkinda detayli bilgi.';
    return {
      _id: String(nextId + i),
      title: item.title,
      description: desc,
      category: cat,
      imageUrl: getRandomImage(),
      content: desc.length > 50 ? desc : item.title + ' ile ilgili son gelismeler teknoloji dunyasinda yanki uyandirdi. Detaylar haberimizde.'
    };
  });

  const added = writeArticles(existing, articles);
  console.log('Eklenen makale:', added);

  trimArticles();
  console.log('Maksimum', MAX_ARTICLES, 'ile sinirlandi.');

  updateCategories();

  console.log('Islem tamam!');
}

main().catch(e => { console.error('Hata:', e); process.exit(1); });
