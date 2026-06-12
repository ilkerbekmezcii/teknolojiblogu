#!/usr/bin/env node
/**
 * Teknoloji Blogu - Otomatik Makale Uretici
 * 
 * RSS feedlerinden guncel teknoloji basliklarini alir,
 * her baslik icin kategorisine uygun, ozgun ve kaliteli
 * bir icerik olusturur. Icerikler template tabanlidir.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_JS_PATH = path.resolve(__dirname, '..', 'docs', 'app.js');

const MAX_ARTICLES = 120;
const ARTICLES_PER_RUN = 3; // en az 3

// Kategori bazli icerik ureticileri
const CONTENT_TEMPLATES = {
  'Yapay Zeka': [
    (title) => `Yapay zeka alanindaki son gelismeler hiz kesmeden devam ediyor. ${title}, sektorun onde gelen isimleri tarafindan yakindan takip edilen bir konu haline geldi. Uzmanlar, bu teknolojinin onumuzdeki donemde is yapma seklimizi kokten degistirecegini belirtiyor.\n\nAlandaki arastirmacilar, yapay zeka modellerinin her gecen gun daha da yetenekli hale geldigini vurguluyor. Ozellikle dogal dil isleme ve goru ntual tanima alanlarinda kaydedilen ilerlemeler, yapay zekanin potansiyelini gozler onune seriyor.\n\nSektor analistlerine gore, bu teknolojinin benimsenmesi hizlanarak devam edecek ve yaklasik 5 yil icinde bir cok sektorde standart hale gelecek.`,
    (title) => `${title} teknoloji dunyasinda buyuk yanki uyandirdi. Yapay zeka alaninda calisan arastirmacilar, bu gelismeyi sektor icin bir donum noktasi olarak degerlendiriyor.\n\nKonuyla ilgili aciklama yapan uzmanlar, yapay zeka teknolojilerinin artik sadece arastirma laboratuvarlarinin degil, gunluk hayatimizin bir parcasi haline geldigini belirtiyor. Akilli asistanlardan otonom sistemlere kadar genis bir yelpazede kullanilan bu teknolojiler, verimliligi artirirken yeni is modellerinin de onunu aciyor.\n\nTurkiye'de de yapay zeka ekosistemi hizla buyuyor. Gerek startuplar gerekse buyuk sirketler, yapay zeka cozumlerine yatirim yapmaya devam ediyor.`,
    (title) => `${title} konusu, yapay zeka dunyasinda onemli bir gelisme olarak kayitlara gecti. Teknoloji devleri, yapay zeka alaninda yaptiklari yatirimlari artirarak bu alandaki rekabeti kizistiriyor.\n\nOpenAI, Google DeepMind ve Anthropic gibi sirketler arasindaki rekabet, yapay zeka teknolojilerinin cok daha hizli gelismesine yol aciyor. Her yeni model, bir oncekinin sinirlarini zorlayarak daha yetenekli hale geliyor.\n\nUzmanlar, yapay zekanin gelecekte saglik, egitim, finans ve uretim gibi bircok sektor donusturecegini one suruyor.`
  ],
  'Donanim': [
    (title) => `Donanim dunyasinda onemli bir gelisme yasandi. ${title} ile ilgili detaylar teknoloji gundeminde ust siralarda yer aliyor.\n\nYeni donanimin performans testlerinde etkileyici sonuclar elde ettigi bildiriliyor. Enerji verimliligi ve islem gucu acisindan onemli iyilestirmeler sunan bu teknoloji, kullanici deneyimini de ust seviyeye tasiyor.\n\nSektor temsilcileri, bu tur yeniliklerin tuketici elektroniginde yeni bir cagin baslangici olabilecegini belirtiyor.`,
    (title) => `${title} teknoloji severler tarafindan merakla karsilandi. Yeni nesil donanim bilesenleri, onceki nesillere gore ciddi performans artislari sunuyor.\n\nYapilan testlerde, yeni mimarinin ozellikle cok cekirdekli islemlerde ve yapay zeka hesaplamalarinda kayda deger iyilestirmeler sagladigi goruldu. Ayrica enerji tuketiminin de dusurulmesi, cevre dostu bir yaklasim olarak dikkat cekiyor.\n\nPiyasa analistleri, bu tur yeniliklerin bilgisayar ve mobil cihaz pazarinda yeni bir yukselise yol acabilecegini belirtiyor.`
  ],
  'Frontend': [
    (title) => `${title}, frontend gelistirme dunyasinda heyecanla karsilandi. Web teknolojileri surekli evrilirken, gelistiricilere daha iyi araclar ve cozumler sunulmaya devam ediyor.\n\nYeni arac ve kutuphaneler, gelistiricilerin daha hizli ve daha verimli uygulamalar olusturmasina olanak taniyor. Ozellikle performans iyilestirmeleri ve gelistirici deneyimine yapilan yatirimlar dikkat cekiyor.\n\nFrontend toplulugu, bu yenilikleri yakindan takip ederken, en iyi uygulamalari belirlemek icin de aktif olarak calismalar yurutuyor.`,
    (title) => `${title} ile ilgili detaylar, web gelistiricileri arasinda genis yanki buldu. Modern web uygulamalari giderek daha karmasik hale gelirken, bu tur yenilikler gelistiricilerin isini kolaylastiriyor.\n\nYeni ozellikler sayesinde daha hizli yuklenen, daha erisilebilir ve daha kullanici dostu web siteleri olusturmak mumkun hale geliyor. Ayrica, arama motoru optimizasyonu konusunda da onemli iyilestirmeler sunuluyor.`
  ],
  'Backend': [
    (title) => `${title}, backend gelistiricileri icin onemli bir gelisme olarak degerlendiriliyor. Sunucu tarafli teknolojiler, olcekleme ve performans konularinda surekli olarak evriliyor.\n\nYeni surumler ve araclar, gelistiricilere daha iyi hata yonetimi, daha hizli sorgu suresi ve daha guvenli uygulamalar gelistirme imkani sunuyor. Ayarla birlikte gelen yeni API'ler ve iyilestirmeler, gelistirme deneyimini onemli olcude artiriyor.\n\nBackend teknolojilerindeki bu gelismeler, ozellikle buyuk olcekli uygulamalar gelistiren ekipler icin buyuk onem tasiyor.`,
    (title) => `${title} backend dunyasinda ses getiren bir gelisme oldu. Olcekleme ve performans iyilestirmeleri, gelistiricilerin daha saglam uygulamalar insa etmesine olanak taniyor.\n\nYeni surumle birlikte gelen guvenlik yamalari ve performans iyilestirmeleri, uretim ortamlarinda onemli avantajlar sagliyor. Ayrica, yeni ozellikler sayesinde gelistirici verimliliginin artmasi bekleniyor.`
  ],
  'Guvenlik': [
    (title) => `Siber guvenlik alaninda onemli bir gelisme: ${title}. Uzmanlar, bu gelismenin kurumlar ve bireyler icin dikkate alinmasi gereken bir durum oldugunu vurguluyor.\n\nSiber tehditler her gecen gun daha da karmasik hale gelirken, guvenlik uzmanlari da savunma mekanizmalarini surekli olarak guncelliyor. Yeni nesil guvenlik cozumleri, yapay zeka destegiyle tehditleri henuz olusmadan tespit edebiliyor.\n\nGuvenlik uzmanlari, bireysel kullanicilarin de sifre yonetimi, iki faktorlu kimlik dogrulama ve duzenli yedekleme gibi temel guvenlik onlemlerini almalarini tavsiye ediyor.`,
    (title) => `${title} siber guvenlik alaninda calisanlar tarafindan yakindan takip ediliyor. Dijital dunyadaki tehditler giderek cesitlenirken, korunma yontemleri de ayni hizla gelisiyor.\n\nYapilan arastirmalar, yapay zeka destekli saldirilarin arttigini gosteriyor. Bu nedenle sirketler, guvenlik altyapilarini yapay zeka tabanli cozumlerle guclendirmeye yoneliyor.\n\nUzmanlara gore, 2026 yilinda sirketlerin karsilastigi en buyuk tehditler arasinda fidye yazilimlari ve sosyal muhendislik saldirilari basi cekiyor.`
  ],
  'Mobil': [
    (title) => `${title} mobil teknoloji dunyasinda merakla karsilandi. Mobil cihazlar ve uygulamalar hayatimizin vazgecilmez bir parcasi haline gelirken, bu alandaki yenilikler de hiz kesmeden devam ediyor.\n\nYeni mobil teknolojiler, daha iyi kamera performansi, daha uzun pil omru ve daha akilli yazilim ozellikleri sunuyor. Ayrica yapay zeka entegrasyonu sayesinde kullanici deneyimi de onemli olcude iyilesiyor.\n\nMobil uygulama gelistiricileri, yeni surumler ve araclarla daha iyi uygulamalar olusturmak icin calismalarini surduruyor.`,
    (title) => `${title} ile ilgili detaylar mobil teknoloji takipcileri tarafindan buyuk bir ilgiyle karsilandi. Akilli telefon pazari, her gecen gun daha da rekabetci hale geliyor.\n\nUreticiler, birbirinden farkli ozelliklerle kullaniclari cezbetmeye calisirken, ozellikle kamera teknolojileri ve yapay zeka ozellikleri on plana cikiyor. Yeni modellerde, onceki nesillere gore ciddi iyilestirmeler dikkat cekiyor.`
  ],
  'Cloud': [
    (title) => `${title}, bulut bilisim dunyasinda onemli bir adim olarak degerlendiriliyor. Bulut teknolojileri, isletmelerin dijital donusum surecinde kilit rol oynamaya devam ediyor.\n\nYeni bulut hizmetleri ve ozellikleri, sirketlerin daha esnek ve olceklenebilir altyapilar kurmasina imkan taniyor. Saglik, finans ve perakende gibi sektorler, bulut teknolojilerini hizla benimsiyor.\n\nBulut saglayicilari arasindaki rekabet, hizmet kalitesini artirirken fiyatlari da asagi cekiyor. Bu da kucuk ve orta olcekli isletmelerin buluta gecisini kolaylastiriyor.`,
    (title) => `${title} bulut bilisim alaninda calisan profesyoneller tarafindan dikkatle takip ediliyor. Hibrit bulut ve coklu bulut stratejileri, sirketler arasinda giderek daha fazla benimseniyor.\n\nGuvenlik ve uyumluluk konulari, buluta gecis surecinde en kritik faktorler olarak one cikiyor. Bulut saglayicilari, musteri verilerinin guvenligini saglamak icin yeni nesil sifreleme ve kimlik dogrulama teknolojilerine yatirim yapiyor.`
  ],
  'Bilim': [
    (title) => `Bilim dunyasindan onemli bir haber: ${title}. Bilim insanlari, bu kesfin/yeniligin insanligin karsilastigi onemli sorunlara cozum olabilecegini belirtiyor.\n\nYapilan arastirmalar, ozellikle tip, fizik ve biyoteknoloji alanlarinda kayda deger ilerlemeler kaydedildigini gosteriyor. Bu arastirmalar, gelecekte hastaliklarin tedavisinden enerji sorunlarina kadar bircok alanda cozum sunabilir.\n\nUluslararasi is birligiyle yurutulen projeler, bilimsel arastirmalarin sinirlari asan dogasini bir kez daha gozler onune seriyor.`,
    (title) => `${title} bilim camiasinda genis yanki uyandirdi. Arastirmacilar, bu gelismeyi alanlarindaki en onemli buluslardan biri olarak nitelendiriyor.\n\nUzun suredir uzerinde calisilan projenin basariyla sonuclanmasi, bilim dunyasinda heyecan yaratti. Arastirmanin detaylari, saygin bilim dergilerinde yayimlanirken, konunun uzmanlari tarafindan da degerlendiriliyor.\n\nBu tur calismalar, temel bilimlere yapilan yatirimin onemini bir kez daha ortaya koyuyor.`
  ],
  'Startup': [
    (title) => `${title}, startup ekosisteminde dikkat ceken bir gelisme olarak kayitlara gecti. Girisim sermayesi yatirimlari, teknoloji dunyasinin nabzini tutmaya devam ediyor.\n\nYatirimcilar, ozellikle yapay zeka, saglik teknolojileri ve iklim teknolojileri alanindaki girisimlere yoneliyor. Bu alanlardaki startup'lar, rekor duzeyde yatirim aliyor.\n\nGirisimciler icin 2026 yili, yeni fikirlerini hayata gecirmek icin uygun bir donem olarak degerlendiriliyor. Teknoloji odakli is modelleri, yatirimcilarin ilgisini cekmeye devam ediyor.`,
    (title) => `${title} startup dunyasinda konusulmaya devam ediyor. Teknoloji girisimleri, yenilikci cozumleriyle sektorleri donustururken, yatirimcilar da bu donusumun bir parcasi olmak icin yarisiyor.\n\nGirisim sermayesi fonlari, 2026 yilinda rekor duzeyde yatirim yaparken, ozellikle erken asama girisimlere olan ilgi artarak devam ediyor. Basarili girisim hikayeleri, yeni girisimcilere ilham kaynagi oluyor.`
  ],
  'Ulasim': [
    (title) => `${title}, ulasim sektorunde onemli bir gelisme olarak karsimiza cikiyor. Elektrikli araclar ve otonom surus teknolojileri, ulasim alaninda devrim yaratmaya devam ediyor.\n\nBuyuk otomobil ureticileri, elektrikli araclara gecis surecini hizlandirirken, otonom surus teknolojileri de her gecen gun daha da olgunlasiyor. Bircok sehirde surucusuz taksi hizmetleri test ediliyor.\n\nUlasim sektorundeki bu donusum, cevre kirliligini azaltma ve trafik sorunlarina cozum bulma potansiyeli tasiyor.`,
    (title) => `${title} ulasim teknolojileri alaninda calisanlar tarafindan yakindan takip ediliyor. Yenilikci ulasim cozumleri, sehirlerin gelecegini sekillendiriyor.\n\nElektrikli araclara olan talep her gecen gun artarken, sarj altyapisi da hizla genisliyor. Dunya genelinde sarj istasyonu sayisi giderek artiyor ve bu da elektrikli araclara gecisi kolaylastiriyor.`
  ],
  'Isletim Sistemi': [
    (title) => `${title} isletim sistemleri dunyasinda ses getiren bir gelisme oldu. Yeni surumler ve guncellemeler, kullanicilara daha iyi bir deneyim sunmayi hedefliyor.\n\nPerformans iyilestirmeleri, yeni ozellikler ve guvenlik yamalari, isletim sistemi guncellemelerinin temel bilesenleri arasinda yer aliyor. Kullanici geri bildirimleri dogrultusunda yapilan iyilestirmeler, memnuniyeti artiriyor.\n\nAcik kaynakli isletim sistemleri de her gecen gun daha fazla kullaniciya ulasirken, ticari isletim sistemleri de rekabeti surduruyor.`,
    (title) => `${title} teknoloji kullanicilari tarafindan merakla takip ediliyor. Isletim sistemleri, dijital dunyanin temel taslarindan biri olarak gelismeye devam ediyor.\n\nYeni surumle birlikte gelen arayuz iyilestirmeleri ve yeni ozellikler, kullanicilarin bilgisayar deneyimini daha keyifli hale getiriyor. Ayrica guvenlik konusunda yapilan iyilestirmeler de dikkat cekiyor.`
  ],
  'Web3': [
    (title) => `${title}, Web3 ve blockchain dunyasinda onemli bir gelisme olarak degerlendiriliyor. Merkeziyetsiz teknolojiler, finans ve diger sektorlerde donusum yaratmaya devam ediyor.\n\nBlockchain tabanli cozumler, ozellikle finansal hizmetler, tedarik zinciri ve dijital kimlik yonetimi gibi alanlarda giderek daha fazla kabul goruyor. Yeni nesil blockchain platformlari, olcekleme sorunlarina cozum sunarken, enerji tuketimini de azaltmayi hedefliyor.`,
    (title) => `${title} kripto para ve blockchain toplulugunda genis yanki buldu. Merkeziyetsiz finans (DeFi) uygulamalari ve NFT'ler, dijital ekonomiye yeni bir boyut kazandirmaya devam ediyor.\n\nDugzenleyici kurumlar, blockchain teknolojisine yonelik net cerceveler olusturmaya calisirken, yatirimci korumasi ve piyasa istikrari konularinda adimlar atiliyor.`
  ],
  'Oyun': [
    (title) => `${title} oyun dunyasinda buyuk bir heyecan yaratti. Oyun sektoru, teknolojik gelismelerin en hizli benimsendigi alanlardan biri olmaya devam ediyor.\n\nYeni oyun motorlari ve grafik teknolojileri, oyunlarin gorsel kalitesini ve gercekciligini artiriyor. Yapay zeka destekli oyun mekanikleri ve prosedurel icerik uretimi, oyun deneyimini zenginlestiriyor.\n\nOyun sektoru, dunya genelinde eglence sektorunun en hizli buyuyen segmenti olarak dikkat cekiyor.`,
    (title) => `${title} oyun gelistiricileri ve oyuncular tarafindan merakla karsilandi. Yeni nesil konsollar ve oyun bilgisayarlari, daha etkileyici oyun deneyimleri sunuyor.\n\nBulut oyun servisleri de her gecen gun daha fazla kullaniciya ulasirken, oyunlara her an her yerden erisim imkani sunuyor. Bu durum, oyun sektorunun erisilebilirligini artiriyor.`
  ]
};

const DEFAULT_TEMPLATES = [
  (title) => `${title}, teknoloji dunyasinda onemli bir gelisme olarak karsimiza cikiyor. Sektorun onde gelen isimleri, bu konudaki gelismeleri yakindan takip ediyor.\n\nTeknoloji alanindaki yenilikler hiz kesmeden devam ederken, bu gelisme de sektore yon veren adimlardan biri olarak degerlendiriliyor. Uzmanlar, konunun gelecekte daha da onem kazanacagini belirtiyor.\n\nDetayli bilgi ve analizler icin teknoloji blogumuzu takip etmeye devam edin.`,
  (title) => `${title} ile ilgili son gelismeler teknoloji gundeminde ust siralarda yer aliyor. Bu konu, ozellikle sektor profesyonelleri ve teknoloji meraklilari tarafindan yakindan takip ediliyor.\n\nYapilan arastirmalar ve aciklamalar, bu alandaki gelismelerin hiz kesmeden devam edecegini gosteriyor. Gelecekte bu teknolojinin daha genis kitlelere ulasmasi bekleniyor.`
];

// RSS Feed kaynaklari (kaliteli icerikli olanlar secildi)
const RSS_FEEDS = [
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'New York Times' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' }
];

const CATEGORY_KEYWORDS = {
  'Yapay Zeka': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'copilot', 'chatgpt', 'gpt', 'llm', 'openai', 'anthropic', 'claude', 'gemini', 'intelligence'],
  'Donanim': ['apple', 'iphone', 'macbook', 'chip', 'processor', 'gpu', 'cpu', 'hardware', 'nvidia', 'amd', 'intel', 'qualcomm', 'samsung galaxy', 'smartphone'],
  'Frontend': ['react', 'angular', 'vue', 'css', 'javascript', 'typescript', 'web', 'browser', 'frontend', 'ui', 'ux', 'css'],
  'Backend': ['node', 'deno', 'rust', 'golang', 'api', 'server', 'backend', 'database', 'docker', 'kubernetes', 'devops'],
  'Guvenlik': ['security', 'cyber', 'hack', 'vulnerability', 'malware', 'ransomware', 'privacy', 'encryption', 'data breach', '0-day', 'zeroday', 'vulnerabilities', 'exploit', 'patch', 'cve-', 'bug', 'flaw', 'breach', 'attack', 'threat'],
  'Mobil': ['mobile', 'android', 'ios', 'app store', 'smartphone', 'tablet', 'wearable', 'flutter', 'swift'],
  'Cloud': ['cloud', 'aws', 'azure', 'google cloud', 'serverless', 'saas'],
  'Bilim': ['quantum', 'space', 'nasa', 'science', 'research', 'physics', 'biology', 'medicine', 'nobel'],
  'Startup': ['startup', 'venture', 'funding', 'ipo', 'unicorn', 'silicon valley'],
  'Ulasim': ['tesla', 'electric vehicle', 'ev', 'autonomous', 'self-driving', 'robotaxi', 'waymo'],
  'Isletim Sistemi': ['windows', 'linux', 'macos', 'ubuntu', 'kernel'],
  'Web3': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'nft'],
  'Oyun': ['gaming', 'playstation', 'xbox', 'nintendo', 'game', 'vr', 'ar']
};

const DEFAULT_CATEGORY = 'Teknoloji';

// --- RSS XML parse ---
function parseRSS(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    if (title && title.length > 10 && title.length < 200) {
      items.push({
        title: title,
        description: stripHtml(extractTag(itemXml, 'description')),
        pubDate: extractTag(itemXml, 'pubDate')
      });
    }
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

// --- Kategori tespiti ---
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
  const kw = ['technology','coding','computer','ai','digital','robot','data','cyber','code','server','science','chip','mobile','cloud','startup','gaming','security','hardware','developer','web'];
  const pick = kw[Math.floor(Math.random() * kw.length)];
  return `https://source.unsplash.com/400x250/?${pick}&${Date.now()}`;
}

// --- Icerik uret ---
function generateContent(title, category) {
  const templates = CONTENT_TEMPLATES[category] || DEFAULT_TEMPLATES;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template(title);
}

// --- JS guvenli hale getirme ---
function safeStr(s) {
  if (!s) return '';
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ').trim();
}

function safeTpl(s) {
  if (!s) return '';
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${').replace(/\n/g, '\\n').replace(/\r/g, '').trim();
}

// --- Mevcut makaleleri oku ---
function readExistingArticles() {
  const raw = fs.readFileSync(APP_JS_PATH, 'utf-8');
  const content = raw.replace(/\r\n/g, '\n');
  const startMarker = 'const SAMPLE_ARTICLES = [';
  const endMarker = '];\n\nconst SAMPLE_CATEGORIES';
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx);
  if (startIdx === -1 || endIdx === -1) throw new Error('SAMPLE_ARTICLES not found');
  const arrayStart = startIdx + startMarker.length;
  const arrayContent = content.substring(arrayStart, endIdx).trim();
  const idRegex = /_id:\s*"(\d+)"/g;
  const ids = [];
  let m;
  while ((m = idRegex.exec(arrayContent)) !== null) ids.push(parseInt(m[1]));
  const titleRegex = /title:\s*"([^"]+)"/g;
  const titles = [];
  while ((m = titleRegex.exec(arrayContent)) !== null) titles.push(m[1].toLowerCase().trim());
  return { raw, content, startIdx, arrayStart, endIdx, ids, titles };
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
  const beforeEnd = content.substring(0, endIdx);
  const afterEnd = content.substring(endIdx);
  const lastBrace = beforeEnd.lastIndexOf('}');
  const updated = beforeEnd.substring(0, lastBrace + 1) + sep + newEntries.join(sep) + nl + beforeEnd.substring(lastBrace + 1);
  const result = updated + afterEnd;
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
  console.log('Kategoriler guncellendi:', list.length);
}

// --- Ana akis ---
async function main() {
  console.log('Teknoloji Blogu - Kaliteli Makale Uretici');
  console.log('----------------------------------------');

  let existing;
  try {
    existing = readExistingArticles();
    console.log('Mevcut makale:', existing.ids.length);
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(1);
  }

  // RSS feedlerinden basliklari al
  const allItems = [];
  for (const feed of RSS_FEEDS) {
    try {
      console.log('Taranıyor:', feed.url.split('/')[2]);
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRSS(xml);
      console.log('  Baslik:', items.length);
      for (const item of items) allItems.push(item);
    } catch (e) {
      console.log('  Hata:', e.message);
    }
  }

  console.log('Toplam baslik:', allItems.length);

  // Dedup - mevcut basliklarla karsilastir
  const existingTitles = existing.titles;
  const newItems = [];
  const seen = new Set();
  for (const item of allItems) {
    const norm = item.title.toLowerCase().trim();
    if (seen.has(norm)) continue;
    seen.add(norm);
    let dup = false;
    for (const et of existingTitles) {
      if (norm === et || norm.includes(et) || et.includes(norm)) { dup = true; break; }
    }
    if (!dup) newItems.push(item);
  }

  console.log('Yeni baslik:', newItems.length);

  const target = Math.min(newItems.length, ARTICLES_PER_RUN);
  const selected = newItems.slice(0, target);
  if (selected.length === 0) {
    console.log('Yeni makale yok.');
    return;
  }

  let nextId = Math.max(...existing.ids, 0) + 1;

  // Her baslik icin kaliteli icerik olustur
  const articles = selected.map((item, i) => {
    const cat = detectCategory(item.title, item.description);
    const content = generateContent(item.title, cat);
    // Turkce, anlamli bir description olustur (ilk cumle)
    const desc = content.length > 180 ? content.substring(0, 177) + '...' : content;
    return {
      _id: String(nextId + i),
      title: item.title,
      description: desc,
      category: cat,
      imageUrl: getRandomImage(),
      content: content
    };
  });

  const added = writeArticles(existing, articles);
  console.log('Eklenen:', added, 'makale');
  trimArticles();
  updateCategories();
  console.log('Tamam!');
}

main().catch(e => { console.error(e); process.exit(1); });
