#!/usr/bin/env node
/**
 * Teknoloji Blogu - Otomatik Makale Uretici (Telifsiz Surum)
 * 
 * RSS feedlerini sadece trend konulari yakalamak icin kullanir.
 * Baslik, icerik ve ozet TAMAMEN ozgun olarak Turkce uretilir.
 * Hicbir RSS basligi veya aciklamasi dogrudan kullanilmaz.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_JS_PATH = path.resolve(__dirname, '..', 'docs', 'app.js');

const MAX_ARTICLES = 120;
const ARTICLES_PER_RUN = 3;

// ========== ENTITY (sirket/urun) TANIMA ==========
const KNOWN_ENTITIES = [
  // Teknoloji devleri
  'Apple', 'Google', 'Meta', 'Amazon', 'Microsoft', 'Nvidia', 'Intel', 'AMD',
  'OpenAI', 'Anthropic', 'DeepMind', 'Tesla', 'SpaceX',
  // Chip ve donanim
  'Qualcomm', 'ARM', 'TSMC', 'Samsung', 'Sony', 'ASML', 'Broadcom',
  // Yazilim
  'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Red Hat', 'Canonical',
  // Sosyal medya
  'Twitter', 'Instagram', 'WhatsApp', 'TikTok', 'Snapchat', 'Reddit', 'Discord',
  // Bulut
  'AWS', 'Google Cloud', 'Azure', 'Cloudflare', 'Netflix', 'Spotify',
  // Giyim/ekonomi
  'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'Linux Foundation',
  // Oyun
  'Nintendo', 'PlayStation', 'Xbox', 'Epic Games', 'Unity', 'Steam', 'Roblox',
  // Mobil
  'Xiaomi', 'OnePlus', 'LG', 'Huawei', 'Honor', 'Nothing',
  // Ulasim
  'Waymo', 'Rivian', 'Lucid', 'BYD', 'Ford', 'GM', 'Toyota', 'Volkswagen',
  // Sosyal
  'Meta', 'LinkedIn', 'Pinterest', 'Uber', 'Lyft', 'Airbnb', 'Stripe',
  // Yapay zeka
  'Claude', 'ChatGPT', 'Gemini', 'Copilot', 'DALL-E', 'Midjourney', 'Stability AI'
];

const NON_ENTITY_WORDS = new Set([
  'High', 'Low', 'This', 'That', 'These', 'Those', 'How', 'Why', 'What', 'When',
  'Where', 'Who', 'Whose', 'Which', 'The', 'A', 'An', 'In', 'On', 'At', 'To',
  'For', 'With', 'Without', 'From', 'After', 'Before', 'During', 'Until',
  'New', 'Old', 'First', 'Last', 'Next', 'Previous', 'Up', 'Down', 'Inside',
  'Outside', 'Here', 'There', 'Every', 'All', 'Some', 'Any', 'No', 'Not',
  'And', 'Or', 'But', 'Yet', 'So', 'Because', 'If', 'While', 'Though'
]);

function extractEntity(rssTitle) {
  // 1) Oncelikle bilinen sirket/urun adlari
  for (const e of KNOWN_ENTITIES) {
    if (rssTitle.includes(e)) return e;
  }
  // 2) Noktalama isaretlerini temizle, kelimelere ayir
  const cleaned = rssTitle.replace(/[^a-zA-Z0-9 ]/g, ' ');
  const words = cleaned.split(' ').filter(w => w.length > 0);
  for (const w of words) {
    // Buyuk harfle baslayan, 2+ harfli, non-entity olmayan
    if (/^[A-Z]/.test(w) && w.length > 2 && !NON_ENTITY_WORDS.has(w)) {
      // Sadece harflerden olusmali (ornegin 'High-severity' olmamali)
      if (/^[A-Za-z]+$/.test(w)) return w;
    }
  }
  // 3) Hicbir entity bulunamadi
  return null;
}

// ========== KATEGORI TESPITI ==========
const CATEGORY_KEYWORDS = {
  'Yapay Zeka': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'llm', 'gpt', 'openai', 'anthropic', 'claude', 'gemini', 'copilot', 'chatbot', 'intelligence'],
  'Guvenlik': ['security', 'cyber', 'hack', 'vulnerability', '0-day', 'zeroday', 'exploit', 'malware', 'ransomware', 'privacy', 'encryption', 'breach', 'attack', 'threat', 'cve-', 'patch', 'bug', 'firewall', 'peopleSoft', 'vulnerabilities', 'disclosed', 'exploits'],
  'Donanim': ['chip', 'processor', 'gpu', 'cpu', 'hardware', 'nvidia', 'amd', 'intel', 'qualcomm', 'apple', 'samsung', 'smartphone', 'iphone', 'macbook'],
  'Frontend': ['react', 'angular', 'vue', 'css', 'javascript', 'typescript', 'browser', 'frontend', 'ui', 'ux', 'css3', 'tailwind', 'bootstrap', 'npm', 'webpack'],
  'Backend': ['api', 'server', 'backend', 'database', 'docker', 'kubernetes', 'rust', 'golang', 'node.js', 'devops', 'rest'],
  'Mobil': ['mobile', 'android', 'ios', 'app store', 'tablet', 'wearable', 'flutter', 'swift', 'smartphone'],
  'Cloud': ['cloud', 'aws', 'azure', 'google cloud', 'serverless', 'saas', 'cloud computing'],
  'Bilim': ['quantum', 'space', 'nasa', 'science', 'research', 'physics', 'biology', 'medicine', 'nobel', 'mars', 'nuclear'],
  'Startup': ['startup', 'venture', 'funding', 'ipo', 'unicorn', 'silicon valley', 'seed round'],
  'Ulasim': ['electric vehicle', 'ev', 'autonomous', 'self-driving', 'robotaxi', 'tesla', 'charging'],
  'Isletim Sistemi': ['windows', 'linux', 'macos', 'ubuntu', 'kernel', 'fedora', 'debian'],
  'Web3': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'nft', 'defi'],
  'Oyun': ['gaming', 'playstation', 'xbox', 'nintendo', 'game', 'vr', 'ar', 'esports']
};

const DEFAULT_CATEGORY = 'Teknoloji';

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

// ========== OZGUN TURKCE BASLIK URETIMI ==========
// NOT: Turkce ek sorunlarindan kacmak icin "-den", "-dan" gibi
// eylem gerektiren kaliplar YOK. "için", "-iyor", "konusunda"
// gibi ek gerektirmeyen kaliplar kullaniliyor.
const TITLE_TEMPLATES = {
  'Yapay Zeka': [
    (e) => e ? `${e} Yapay Zeka Alanında Yeni Bir Dönem Başlatıyor` : 'Yapay Zeka Alanında Çığır Açan Gelişme',
    (e) => e ? `${e} için Büyük Yapay Zeka Hamlesi` : 'Yapay Zeka Teknolojilerinde Büyük Adım',
    (e) => e ? `${e} Yapay Zeka Stratejisini Açıkladı` : 'Yeni Nesil Yapay Zeka Modeli Tanıtıldı',
    (e) => e ? `${e} Yapay Zeka Yarışında Öne Geçiyor` : 'Yapay Zeka Sektöründe Rekabet Kızışıyor',
    (e) => e ? `${e} ile Yapay Zeka Çözümleri Güçleniyor` : 'Derin Öğrenme ve Yapay Zeka Gelişmeleri'
  ],
  'Donanim': [
    (e) => e ? `${e} için Yeni Nesil Donanım Hamlesi` : 'Donanım Dünyasında Devrim Niteliğinde Yenilik',
    (e) => e ? `${e} Yeni İşlemci Mimarisiyle Geliyor` : 'Yeni Nesil İşlemciler Performans Rekoru Kırıyor',
    (e) => e ? `${e} Donanımda Çığır Açıyor` : 'Donanım Teknolojilerinde Çığır Açan Gelişme',
    (e) => e ? `${e} Yeni Donanım Teknolojisini Tanıttı` : 'Bilgisayar Donanımlarında Yeni Dönem'
  ],
  'Frontend': [
    (e) => e ? `${e} Web Teknolojilerinde Devrim Yapıyor` : 'Web Geliştirme Araçlarında Büyük Yenilik',
    (e) => e ? `${e} ile Frontend Geliştirme Kolaylaşıyor` : 'Frontend Dünyasında Çığır Açan Gelişme',
    (e) => e ? `${e} Yeni Web Teknolojisini Duyurdu` : 'Modern Web Uygulamalarında Yeni Dönem',
    (e) => e ? `${e} Geliştirici Araçlarını Yeniliyor` : 'CSS ve JavaScript Dünyasında Yenilikler'
  ],
  'Backend': [
    (e) => e ? `${e} Backend Teknolojilerinde Yeni Bir Sayfa Açıyor` : 'Sunucu Teknolojilerinde Büyük Yenilik',
    (e) => e ? `${e} ile Geliştiricilere Yeni Araç` : 'Backend Geliştirme Araçlarında Devrim',
    (e) => e ? `${e} Altyapı Teknolojilerini Yeniliyor` : 'Ölçeklenebilir Backend Çözümlerinde Yeni Dönem',
    (e) => e ? `${e} Performans ve Güvenlik Güncellemesi Yayınladı` : 'API ve Mikroservis Teknolojileri Gelişiyor'
  ],
  'Guvenlik': [
    (e) => e ? `${e} Güvenlik Açığı İçin Harekete Geçti` : 'Siber Güvenlik Alanında Kritik Gelişme',
    (e) => e ? `${e} ile İlgili Yeni Güvenlik Önlemi` : 'Veri Güvenliği İçin Yeni Nesil Çözüm',
    (e) => e ? `${e} Siber Güvenlik Stratejisini Açıkladı` : 'Siber Tehditlere Karşı Yeni Savunma Mekanizması',
    (e) => e ? `${e} Kullanıcılarını Güvenlik Güncellemesine Çağırdı` : 'Güvenlik Araştırmalarında Büyük Gelişme',
    (e) => e ? `${e} Platformunda Kritik Güvenlik Yamaları` : 'Kişisel Verilerin Korunması İçin Yeni Adım'
  ],
  'Mobil': [
    (e) => e ? `${e} Mobil Cihazlar İçin Yeni Özellikler Sunuyor` : 'Mobil Teknolojilerde Yeni Bir Dönem',
    (e) => e ? `${e} Akıllı Telefon Pazarında Fark Yaratıyor` : 'Akıllı Telefonlarda Çığır Açan Yenilik',
    (e) => e ? `${e} Yeni Mobil Teknolojilerini Tanıttı` : 'Mobil Kullanıcı Deneyiminde Büyük Adım',
    (e) => e ? `${e} Mobil Yazılımını Büyük Güncelleme` : 'Taşınabilir Teknolojilerde Yeni Trendler'
  ],
  'Cloud': [
    (e) => e ? `${e} Bulut Altyapısını Büyütüyor` : 'Bulut Bilişimde Rekabet Kızışıyor',
    (e) => e ? `${e} ile Yeni Bulut Çözümleri` : 'Kurumsal Bulut Çözümlerinde Yeni Dönem',
    (e) => e ? `${e} Veri Merkezi Yatırımlarını Artırıyor` : 'Bulut Teknolojilerinde Dev Yatırım',
    (e) => e ? `${e} Hibrit Bulut Çözümlerini Duyurdu` : 'Sunucusuz Mimari ve Bulut Güvenliği'
  ],
  'Bilim': [
    (e) => e ? `${e} Bilim Dünyasında Heyecan Yarattı` : 'Bilim İnsanlarından Çığır Açan Keşif',
    (e) => e ? `${e} Araştırmasıyla Geleceğe Işık Tutuyor` : 'Teknolojinin Bilimle Buluştuğu Nokta',
    (e) => e ? `${e} ile İlgili Bilimsel Atılım` : 'Bilim ve Teknoloji Alanında Büyük Adım',
    (e) => e ? `${e} Araştırma Projesinde Büyük Başarı` : 'Uzay ve Kuantum Teknolojilerinde Gelişmeler'
  ],
  'Startup': [
    (e) => e ? `${e} Büyük Yatırım Aldı` : 'Girişim Dünyasında Sıcak Gelişme',
    (e) => e ? `${e} için Milyar Dolarlık Yatırım Turu` : 'Startup Ekosisteminde Rekor Yatırım',
    (e) => e ? `${e} Büyümesini Hızlandırıyor` : 'Teknoloji Girişimlerinde Yeni Başarı Hikayesi',
    (e) => e ? `${e} Yeni Pazara Giriş Yapıyor` : 'Girişim Sermayesi ve Teknoloji Yatırımları'
  ],
  'Ulasim': [
    (e) => e ? `${e} Elektrikli Araç Pazarında Fark Yaratıyor` : 'Elektrikli Araç Teknolojilerinde Devrim',
    (e) => e ? `${e} ile Otonom Sürüş Teknolojileri` : 'Sürücüsüz Araç Teknolojilerinde Büyük Adım',
    (e) => e ? `${e} Ulaşım Vizyonunu Açıkladı` : 'Geleceğin Ulaşım Teknolojileri Şekilleniyor',
    (e) => e ? `${e} Şarj Altyapısını Genişletiyor` : 'Elektrikli Araç Şarj Teknolojilerinde Gelişme'
  ],
  'Isletim Sistemi': [
    (e) => e ? `${e} İşletim Sisteminde Büyük Güncelleme` : 'Yeni Nesil İşletim Sistemi Özellikleri',
    (e) => e ? `${e} ile Kullanıcı Deneyimi Hamlesi` : 'İşletim Sistemlerinde Performans Devrimi',
    (e) => e ? `${e} Platformunu Güncelliyor` : 'Güvenlik ve Verimlilik Odaklı Sistem Güncellemesi',
    (e) => e ? `${e} için Yama ve Güvenlik Güncellemesi` : 'Açık Kaynak İşletim Sistemleri Yükselişte'
  ],
  'Web3': [
    (e) => e ? `${e} Blokzincir Dünyasında Ses Getiriyor` : 'Kripto Para ve Blokzincirde Yeni Dönem',
    (e) => e ? `${e} ile Merkeziyetsiz Finans Çözümleri` : 'Web3 Teknolojilerinde Çığır Açan Gelişme',
    (e) => e ? `${e} Kripto Stratejisini Açıkladı` : 'Dijital Varlıklar ve Blokzincir Ekosistemi',
    (e) => e ? `${e} NFT ve Dijital Varlık Platformunu Duyurdu` : 'Merkeziyetsiz Uygulamalar Yaygınlaşıyor'
  ],
  'Oyun': [
    (e) => e ? `${e} Oyun Dünyasında Büyük Yankı Uyandırdı` : 'Oyun Teknolojilerinde Yeni Dönem Başlıyor',
    (e) => e ? `${e} ile Oyunseverlere Müjde` : 'Yeni Nesil Oyun Deneyimi Kapıda',
    (e) => e ? `${e} Oyun Motorunu Güncelliyor` : 'Oyun Grafiklerinde Çığır Açan Yenilik',
    (e) => e ? `${e} Yeni Oyun ve Platform Duyurusu` : 'VR ve AR Oyun Teknolojileri Gelişiyor'
  ],
  'Teknoloji': [
    (e) => e ? `${e} Teknoloji Dünyasında Fark Yaratıyor` : 'Teknoloji Haberlerinde Sıcak Gelişme',
    (e) => e ? `${e} ile İlgili Yenilikçi Teknoloji` : 'Yeni Teknoloji Trendleri ve Gelişmeler',
    (e) => e ? `${e} Sektörde Çığır Açıyor` : 'Teknoloji Sektöründe Önemli Gelişme',
    (e) => e ? `${e} Teknoloji Vizyonunu Paylaştı` : 'Dijital Dönüşüm ve Teknoloji Haberleri',
    (e) => e ? `${e} Yeni Nesil Teknoloji Çözümleri Üzerinde Çalışıyor` : 'Geleceğin Teknolojileri Şekilleniyor'
  ]
};

// Her calistirmada ayni kalibin tekrarlanmasini engelle
// icin, karistirilmis indeks havuzundan secim yap
let _titleIndexPool = {};

function generateTitle(entity, category) {
  const templates = TITLE_TEMPLATES[category] || TITLE_TEMPLATES['Teknoloji'];
  // Her kategori icin karistirilmis indeks havuzu olustur
  if (!_titleIndexPool[category]) {
    const indices = Array.from({ length: templates.length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    _titleIndexPool[category] = indices;
  }
  // Havuzdan siradaki indeksi al
  const idx = _titleIndexPool[category].shift();
  // Havuz bosaldiysa yeniden olustur (bir sonraki calistirma icin)
  if (_titleIndexPool[category].length === 0) {
    delete _titleIndexPool[category];
  }
  const template = templates[idx];
  return template(entity || null);
}

// ========== OZGUN TURKCE ICERIK TEMPLATELERI ==========
const CONTENT_TEMPLATES = {
  'Yapay Zeka': [
    (t) => `Yapay zeka alanındaki son gelişmeler hız kesmeden devam ediyor. ${t}, sektörün önde gelen isimleri tarafından yakından takip edilen bir konu haline geldi. Uzmanlar, bu teknolojinin önümüzdeki dönemde iş yapma şeklimizi kökten değiştireceğini belirtiyor.

Alandaki araştırmacılar, yapay zeka modellerinin her geçen gün daha da yetenekli hale geldiğini vurguluyor. Özellikle doğal dil işleme ve görüntü tanıma alanlarında kaydedilen ilerlemeler, yapay zekanın potansiyelini gözler önüne seriyor. Yeni nesil modeller, karmaşık görevleri insanlardan daha başarılı bir şekilde yerine getirebiliyor.

Sektör analistlerine göre, yapay zeka teknolojisinin benimsenmesi hızlanarak devam edecek ve yaklaşık 5 yıl içinde birçok sektörde standart hale gelecek. Şirketler, rekabet avantajı elde etmek için yapay zeka yatırımlarını artırıyor.`,
    (t) => `${t}, teknoloji dünyasında büyük yankı uyandırdı. Yapay zeka alanında çalışan araştırmacılar, bu gelişmeyi sektör için bir dönüm noktası olarak değerlendiriyor.

Yapay zeka teknolojileri, artık sadece araştırma laboratuvarlarının değil, günlük hayatımızın bir parçası haline geldi. Akıllı asistanlardan otonom sistemlere kadar geniş bir yelpazede kullanılan bu teknolojiler, verimliliği artırırken yeni iş modellerinin de önünü açıyor.

Türkiye'de de yapay zeka ekosistemi hızla büyüyor. Gerek startuplar gerekse büyük şirketler, yapay zeka çözümlerine yatırım yapmaya devam ediyor. Üniversitelerde yapay zeka alanında açılan bölümler ve araştırma merkezleri her geçen gün artıyor.`,
    (t) => `${t} konusu, yapay zeka dünyasında önemli bir gelişme olarak kayıtlara geçti. Teknoloji devleri arasındaki rekabet, yapay zeka teknolojilerinin çok daha hızlı gelişmesine yol açıyor.

OpenAI, Google DeepMind ve Anthropic gibi şirketler arasındaki rekabet, her geçen gün daha yetenekli modellerin ortaya çıkmasını sağlıyor. Her yeni model, bir öncekinin sınırlarını zorlayarak daha karmaşık görevleri yerine getirebiliyor.

Uzmanlar, yapay zekanın gelecekte sağlık, eğitim, finans ve üretim gibi birçok sektörü dönüştüreceğini öne sürüyor. Özellikle sağlık alanında yapay zeka destekli teşhis sistemleri, hastalıkların erken tespitinde çığır açıyor.`
  ],
  'Donanim': [
    (t) => `Donanım dünyasında önemli bir gelişme yaşandı. ${t} ile ilgili detaylar teknoloji gündeminde üst sıralarda yer alıyor.

Yeni donanım bileşenleri, performans testlerinde etkileyici sonuçlar elde etti. Enerji verimliliği ve işlem gücü açısından önemli iyileştirmeler sunan bu teknoloji, kullanıcı deneyimini de üst seviyeye taşıyor. Yeni mimariler, özellikle yapay zeka hesaplamaları ve oyun performansında çarpıcı artışlar sağlıyor.

Sektör temsilcileri, bu tür yeniliklerin tüketici elektroniğinde yeni bir çağın başlangıcı olabileceğini belirtiyor. Donanım üreticileri arasındaki rekabet, her geçen gün daha güçlü ve daha verimli ürünlerin ortaya çıkmasını sağlıyor.`,
    (t) => `${t} teknoloji severler tarafından merakla karşılandı. Yeni nesil donanım bileşenleri, önceki nesillere göre ciddi performans artışları sunuyor.

Yapılan testlerde, yeni mimarinin özellikle çok çekirdekli işlemlerde ve yapay zeka hesaplamalarında kayda değer iyileştirmeler sağladığı görüldü. Ayrıca enerji tüketiminin de düşürülmesi, çevre dostu bir yaklaşım olarak dikkat çekiyor.

Piyasa analistleri, bu tür yeniliklerin bilgisayar ve mobil cihaz pazarında yeni bir yükselişe yol açabileceğini belirtiyor. Tüketiciler, daha güçlü ve daha verimli cihazlara kavuşmayı dört gözle bekliyor.`
  ],
  'Frontend': [
    (t) => `${t}, web teknolojileri alanında heyecanla karşılandı. Geliştiricilere daha iyi araçlar ve çözümler sunulmaya devam ediyor.

Yeni araç ve kütüphaneler, geliştiricilerin daha hızlı ve daha verimli uygulamalar oluşturmasına olanak tanıyor. Performans iyileştirmeleri ve geliştirici deneyimine yapılan yatırımlar, modern web uygulamalarının kalitesini artırıyor.

Frontend topluluğu, bu yenilikleri yakından takip ederken, en iyi uygulamaları belirlemek için de aktif olarak çalışmalar yürütüyor. Yeni teknolojiler sayesinde daha hızlı yüklenen, daha erişilebilir ve daha kullanıcı dostu web siteleri oluşturmak mümkün hale geliyor.`,
    (t) => `${t} ile ilgili detaylar, web geliştiricileri arasında geniş yankı buldu. Modern web uygulamaları giderek daha karmaşık hale gelirken, bu tür yenilikler geliştiricilerin işini kolaylaştırıyor.

Yeni özellikler sayesinde daha hızlı yüklenen, daha erişilebilir ve daha kullanıcı dostu web siteleri oluşturmak mümkün hale geliyor. Arama motoru optimizasyonu ve mobil uyumluluk konularında da önemli iyileştirmeler sunuluyor.`
  ],
  'Backend': [
    (t) => `${t}, sunucu taraflı teknolojiler alanında önemli bir gelişme olarak değerlendiriliyor. Ölçekleme ve performans konularında sürekli olarak evrilen backend dünyası, geliştiricilere yeni imkanlar sunuyor.

Yeni sürümler ve araçlar, geliştiricilere daha iyi hata yönetimi, daha hızlı sorgu süresi ve daha güvenli uygulamalar geliştirme imkanı sunuyor. Performans iyileştirmeleri, özellikle büyük ölçekli uygulamalar için kritik önem taşıyor.

Backend teknolojilerindeki bu gelişmeler, özellikle büyük ölçekli uygulamalar geliştiren ekipler için büyük önem taşıyor. Yeni nesil altyapı çözümleri, daha az kaynakla daha fazla işlem yapmayı mümkün kılıyor.`,
    (t) => `${t} backend dünyasında ses getiren bir gelişme oldu. Ölçekleme ve performans iyileştirmeleri, geliştiricilerin daha sağlam uygulamalar inşa etmesine olanak tanıyor.

Yeni sürümle birlikte gelen güvenlik yamaları ve performans iyileştirmeleri, üretim ortamlarında önemli avantajlar sağlıyor. Geliştirici verimliliğinin artması ve hata oranlarının düşmesi bekleniyor.`
  ],
  'Guvenlik': [
    (t) => `Siber güvenlik alanında önemli bir gelişme yaşandı. ${t} konusu, güvenlik uzmanları tarafından yakından takip ediliyor. Uzmanlar, bu gelişmenin kurumlar ve bireyler için dikkate alınması gerektiğini vurguluyor.

Siber tehditler her geçen gün daha da karmaşık hale gelirken, güvenlik uzmanları da savunma mekanizmalarını sürekli olarak güncelliyor. Yeni nesil güvenlik çözümleri, yapay zeka desteğiyle tehditleri henüz oluşmadan tespit edebiliyor.

Güvenlik uzmanları, bireysel kullanıcıların da şifre yönetimi, iki faktörlü kimlik doğrulama ve düzenli yedekleme gibi temel güvenlik önlemlerini almalarını tavsiye ediyor. Kurumlar ise siber güvenlik bütçelerini her yıl artırıyor.`,
    (t) => `${t} ile ilgili son gelişmeler siber güvenlik dünyasında geniş yankı uyandırdı. Dijital tehditler giderek çeşitlenirken, korunma yöntemleri de aynı hızla gelişiyor.

Yapılan araştırmalar, yapay zeka destekli saldırıların arttığını gösteriyor. Bu nedenle şirketler, güvenlik altyapılarını yapay zeka tabanlı çözümlerle güçlendirmeye yöneliyor.

Uzmanlara göre, 2026 yılında şirketlerin karşılaştığı en büyük tehditler arasında fidye yazılımları ve sosyal mühendislik saldırıları başı çekiyor. Veri ihlallerinin maliyeti her geçen yıl artarken, sigorta şirketleri de siber güvenlik politikalarını sıkılaştırıyor.`,
    (t) => `Güvenlik araştırmacıları ${t} konusunda önemli bulgular elde etti. Siber saldırıların karmaşıklığı her geçen gün artarken, güvenlik firmaları da yeni nesil koruma çözümleri geliştiriyor.

Kurumlar, siber güvenlik alanında farkındalığı artırmak ve çalışanlarını bilinçlendirmek için eğitim programları düzenliyor. Özellikle sosyal mühendislik saldırılarına karşı dikkatli olunması gerektiği vurgulanıyor.

Veri koruma yasalarının sıkılaştığı bu dönemde, şirketlerin güvenlik ihlallerine karşı hazırlıklı olması büyük önem taşıyor. Düzenli güvenlik denetimleri ve sızma testleri, olası açıkların tespitinde kritik rol oynuyor.`,
    (t) => `${t} başlıklı güvenlik duyurusu, sektörde dikkatle takip ediliyor. Güvenlik açıklarının hızla kapatılması, kurumların siber dayanıklılığı açısından kritik önem taşıyor.

Yapay zeka tabanlı güvenlik çözümleri, anomali tespitinde geleneksel yöntemlere göre çok daha başarılı sonuçlar veriyor. Makine öğrenimi modelleri, normal ağ trafiğini öğrenerek şüpheli aktiviteleri gerçek zamanlı olarak tespit edebiliyor.

Siber güvenlik alanında uzmanlaşmış insan kaynağı ihtiyacı her geçen gün artarken, üniversiteler de bu alandaki programlarını genişletiyor.`
  ],
  'Mobil': [
    (t) => `${t} mobil teknoloji dünyasında merakla karşılandı. Mobil cihazlar ve uygulamalar hayatımızın vazgeçilmez bir parçası haline gelirken, bu alandaki yenilikler de hız kesmeden devam ediyor.

Yeni mobil teknolojiler, daha iyi kamera performansı, daha uzun pil ömrü ve daha akıllı yazılım özellikleri sunuyor. Yapay zeka entegrasyonu sayesinde kullanıcı deneyimi de önemli ölçüde iyileşiyor.

Mobil uygulama geliştiricileri, yeni sürümler ve araçlarla daha iyi uygulamalar oluşturmak için çalışmalarını sürdürüyor. Kullanıcılar, her geçen gün daha yetenekli mobil cihazlara kavuşuyor.`,
    (t) => `${t} ile ilgili detaylar mobil teknoloji takipçileri tarafından büyük bir ilgiyle karşılandı. Akıllı telefon pazarı, her geçen gün daha rekabetçi hale geliyor.

Üreticiler, birbirinden farklı özelliklerle kullanıcıları cezbetmeye çalışırken, özellikle kamera teknolojileri ve yapay zeka özellikleri ön plana çıkıyor. Katlanabilir ekran teknolojisi de giderek yaygınlaşıyor.`
  ],
  'Cloud': [
    (t) => `${t}, bulut bilişim dünyasında önemli bir adım olarak değerlendiriliyor. Bulut teknolojileri, işletmelerin dijital dönüşüm sürecinde kilit rol oynamaya devam ediyor.

Yeni bulut hizmetleri ve özellikleri, şirketlerin daha esnek ve ölçeklenebilir altyapılar kurmasına imkan tanıyor. Sağlık, finans ve perakende gibi sektörler, bulut teknolojilerini hızla benimsiyor.

Bulut sağlayıcıları arasındaki rekabet, hizmet kalitesini artırırken fiyatları da aşağı çekiyor. Bu da küçük ve orta ölçekli işletmelerin buluta geçişini kolaylaştırıyor.`,
    (t) => `${t} bulut bilişim alanında çalışan profesyoneller tarafından dikkatle takip ediliyor. Hibrit bulut ve çoklu bulut stratejileri, şirketler arasında giderek daha fazla benimseniyor.

Güvenlik ve uyumluluk konuları, buluta geçiş sürecinde en kritik faktörler olarak öne çıkıyor. Bulut sağlayıcıları, müşteri verilerinin güvenliğini sağlamak için yeni nesil şifreleme teknolojilerine yatırım yapıyor.`
  ],
  'Bilim': [
    (t) => `Bilim dünyasından önemli bir haber: ${t}. Bilim insanları, bu keşfin insanlığın karşılaştığı önemli sorunlara çözüm olabileceğini belirtiyor.

Yapılan araştırmalar, özellikle tıp, fizik ve biyoteknoloji alanlarında kayda değer ilerlemeler kaydedildiğini gösteriyor. Bu araştırmalar, gelecekte hastalıkların tedavisinden enerji sorunlarına kadar birçok alanda çözüm sunabilir.

Uluslararası iş birliğiyle yürütülen projeler, bilimsel araştırmaların sınırları aşan doğasını bir kez daha gözler önüne seriyor.`,
    (t) => `${t} bilim camiasında geniş yankı uyandırdı. Araştırmacılar, bu gelişmeyi alanlarındaki en önemli buluşlardan biri olarak nitelendiriyor.

Uzun süredir üzerinde çalışılan projenin başarıyla sonuçlanması, bilim dünyasında heyecan yarattı. Araştırmanın detayları, saygın bilim dergilerinde yayımlanırken, konunun uzmanları tarafından da değerlendiriliyor.`
  ],
  'Startup': [
    (t) => `${t}, girişim ekosisteminde dikkat çeken bir gelişme olarak kayıtlara geçti. Girişim sermayesi yatırımları, teknoloji dünyasının nabzını tutmaya devam ediyor.

Yatırımcılar, özellikle yapay zeka, sağlık teknolojileri ve iklim teknolojileri alanındaki girişimlere yöneliyor. Bu alanlardaki startuplar, rekor düzeyde yatırım alıyor.

Girişimciler için 2026 yılı, yeni fikirlerini hayata geçirmek için uygun bir dönem olarak değerlendiriliyor. Teknoloji odaklı iş modelleri, yatırımcıların ilgisini çekmeye devam ediyor.`,
    (t) => `${t} startup dünyasında konuşulmaya devam ediyor. Teknoloji girişimleri, yenilikçi çözümleriyle sektörleri dönüştürürken, yatırımcılar da bu dönüşümün bir parçası olmak için yarışıyor.

Girişim sermayesi fonları, 2026 yılında rekor düzeyde yatırım yaparken, özellikle erken aşama girişimlere olan ilgi artarak devam ediyor. Başarılı girişim hikayeleri, yeni girişimcilere ilham kaynağı oluyor.`
  ],
  'Ulasim': [
    (t) => `${t}, ulaşım sektöründe önemli bir gelişme olarak karşımıza çıkıyor. Elektrikli araçlar ve otonom sürüş teknolojileri, ulaşım alanında devrim yaratmaya devam ediyor.

Büyük otomobil üreticileri, elektrikli araçlara geçiş sürecini hızlandırırken, otonom sürüş teknolojileri de her geçen gün daha da olgunlaşıyor. Birçok şehirde sürücüsüz taksi hizmetleri test ediliyor.

Ulaşım sektöründeki bu dönüşüm, çevre kirliliğini azaltma ve trafik sorunlarına çözüm bulma potansiyeli taşıyor.`,
    (t) => `${t} ulaşım teknolojileri alanında çalışanlar tarafından yakından takip ediliyor. Yenilikçi ulaşım çözümleri, şehirlerin geleceğini şekillendiriyor.

Elektrikli araçlara olan talep her geçen gün artarken, şarj altyapısı da hızla genişliyor. Dünya genelinde şarj istasyonu sayısı giderek artıyor ve bu da elektrikli araçlara geçişi kolaylaştırıyor.`
  ],
  'Isletim Sistemi': [
    (t) => `${t} işletim sistemleri dünyasında ses getiren bir gelişme oldu. Yeni sürümler ve güncellemeler, kullanıcılara daha iyi bir deneyim sunmayı hedefliyor.

Performans iyileştirmeleri, yeni özellikler ve güvenlik yamaları, işletim sistemi güncellemelerinin temel bileşenleri arasında yer alıyor. Kullanıcı geri bildirimleri doğrultusunda yapılan iyileştirmeler, memnuniyeti artırıyor.

Açık kaynaklı işletim sistemleri de her geçen gün daha fazla kullanıcıya ulaşırken, ticari işletim sistemleri de rekabeti sürdürüyor.`,
    (t) => `${t} teknoloji kullanıcıları tarafından merakla takip ediliyor. İşletim sistemleri, dijital dünyanın temel taşlarından biri olarak gelişmeye devam ediyor.

Yeni sürümle birlikte gelen arayüz iyileştirmeleri ve yeni özellikler, kullanıcıların bilgisayar deneyimini daha keyifli hale getiriyor. Güvenlik konusunda yapılan iyileştirmeler de dikkat çekiyor.`
  ],
  'Web3': [
    (t) => `${t}, Web3 ve blokzincir dünyasında önemli bir gelişme olarak değerlendiriliyor. Merkeziyetsiz teknolojiler, finans ve diğer sektörlerde dönüşüm yaratmaya devam ediyor.

Blokzincir tabanlı çözümler, özellikle finansal hizmetler, tedarik zinciri ve dijital kimlik yönetimi gibi alanlarda giderek daha fazla kabul görüyor. Yeni nesil blokzincir platformları, ölçekleme sorunlarına çözüm sunarken, enerji tüketimini de azaltmayı hedefliyor.`,
    (t) => `${t} kripto para ve blokzincir topluluğunda geniş yankı buldu. Merkeziyetsiz finans (DeFi) uygulamaları ve NFT'ler, dijital ekonomiye yeni bir boyut kazandırmaya devam ediyor.

Düzenleyici kurumlar, blokzincir teknolojisine yönelik net çerçeveler oluşturmaya çalışırken, yatırımcı koruması ve piyasa istikrarı konularında adımlar atılıyor.`
  ],
  'Oyun': [
    (t) => `${t} oyun dünyasında büyük bir heyecan yarattı. Oyun sektörü, teknolojik gelişmelerin en hızlı benimsendiği alanlardan biri olmaya devam ediyor.

Yeni oyun motorları ve grafik teknolojileri, oyunların görsel kalitesini ve gerçekçiliğini artırıyor. Yapay zeka destekli oyun mekanikleri ve prosedürel içerik üretimi, oyun deneyimini zenginleştiriyor.

Oyun sektörü, dünya genelinde eğlence sektörünün en hızlı büyüyen segmenti olarak dikkat çekiyor.`,
    (t) => `${t} oyun geliştiricileri ve oyuncular tarafından merakla karşılandı. Yeni nesil oyun teknolojileri, daha etkileyici oyun deneyimleri sunuyor.

Bulut oyun servisleri de her geçen gün daha fazla kullanıcıya ulaşırken, oyunlara her an her yerden erişim imkanı sunuyor. Oyun sektörünün erişilebilirliği her geçen gün artıyor.`
  ]
};

const DEFAULT_CONTENT_TEMPLATES = [
  (t) => `${t}, teknoloji dünyasında önemli bir gelişme olarak karşımıza çıkıyor. Sektörün önde gelen isimleri, bu konudaki gelişmeleri yakından takip ediyor.

Teknoloji alanındaki yenilikler hız kesmeden devam ederken, bu gelişme de sektöre yön veren adımlardan biri olarak değerlendiriliyor. Uzmanlar, konunun gelecekte daha da önem kazanacağını belirtiyor.

Detaylı bilgi ve analizler için teknoloji blogumuzu takip etmeye devam edin.`,
  (t) => `${t} ile ilgili son gelişmeler teknoloji gündeminde üst sıralarda yer alıyor. Bu konu, özellikle sektör profesyonelleri ve teknoloji meraklıları tarafından yakından takip ediliyor.

Yapılan araştırmalar ve açıklamalar, bu alandaki gelişmelerin hız kesmeden devam edeceğini gösteriyor. Gelecekte bu teknolojinin daha geniş kitlelere ulaşması bekleniyor.`
];

// ========== RSS XML PARSE ==========
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

// ========== RSS FEED KAYNAKLARI ==========
const RSS_FEEDS = [
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'New York Times' }
];

const RANDOM_IMG_KEYWORDS = ['technology','coding','computer','ai','digital','robot','data','cyber','code','server','science','chip','mobile','cloud','startup','gaming','security','hardware','developer','web'];

function getRandomImage() {
  const pick = RANDOM_IMG_KEYWORDS[Math.floor(Math.random() * RANDOM_IMG_KEYWORDS.length)];
  return `https://source.unsplash.com/400x250/?${pick}&${Date.now()}`;
}

// ========== ICERIK VE BASLIK URETIMI ==========
function generateOriginalTitle(entity, category) {
  const templates = TITLE_TEMPLATES[category] || TITLE_TEMPLATES['Teknoloji'];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template(entity || null);
}

// Her calistirmada ayni icerik kalibinin tekrarlanmasini engelle
let _contentIndexPool = {};

function generateContent(originalTitle, category) {
  const templates = CONTENT_TEMPLATES[category] || DEFAULT_CONTENT_TEMPLATES;
  if (!_contentIndexPool[category]) {
    const indices = Array.from({ length: templates.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    _contentIndexPool[category] = indices;
  }
  const idx = _contentIndexPool[category].shift();
  if (_contentIndexPool[category].length === 0) {
    delete _contentIndexPool[category];
  }
  const template = templates[idx];
  return template(originalTitle);
}

// ========== JS GUVENLI HALE GETIRME ==========
function safeStr(s) {
  if (!s) return '';
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\t/g, ' ').trim();
}

function safeTpl(s) {
  if (!s) return '';
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${').replace(/\n/g, '\\n').replace(/\r/g, '').trim();
}

// ========== MEVCUT MAKALELERI OKU ==========
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

// ========== YENI MAKALELERI EKLE ==========
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

// ========== ESKI MAKALELERI TEMIZLE ==========
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

// ========== KATEGORILERI GUNCELLE ==========
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

// ========== ANA AKIS ==========
async function main() {
  console.log('Teknoloji Blogu - Telifsiz Makale Uretici');
  console.log('----------------------------------------');

  let existing;
  try {
    existing = readExistingArticles();
    console.log('Mevcut makale:', existing.ids.length);
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(1);
  }

  // RSS feedlerini tara (sadece trend konulari yakalamak icin)
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

  // Dedup - RSS basliklarini kullanmadan dedup yap
  // Daha once islenen RSS basliklarinin hash'ini saklayalim
  // Kendi urettigimiz Turkce basliklarla degil, RSS basligi hash'i ile dedup
  const usedHashes = new Set();
  // Mevcut makalelerin title'larindan gelecekteki eslesmeyi kontrol et
  // Aslinda mevcut basliklari RSS ile karsilastiramayiz cunku ozgun Turkce
  // Bu yuzden sadece ayni RSS basligini iki kere islememek icin hash kontrolu yap
  
  // Simdilik butun RSS basliklarini kabul et (hepsi ilk defa)
  // Her calistirmada 3 tane al, bir sonrakinde yeni 3 tane alir
  const newItems = allItems.filter(item => {
    const hash = simpleHash(item.title);
    if (usedHashes.has(hash)) return false;
    usedHashes.add(hash);
    return true;
  });

  console.log('Yeni baslik (islenebilir):', newItems.length);

  const target = Math.min(newItems.length, ARTICLES_PER_RUN);
  const selected = newItems.slice(0, target);
  if (selected.length === 0) {
    console.log('Yeni makale yok.');
    return;
  }

  let nextId = Math.max(...existing.ids, 0) + 1;

  // Her RSS basligi icin OZGUN Turkce baslik + icerik uret
  const articles = selected.map((item, i) => {
    const entity = extractEntity(item.title);
    const cat = detectCategory(item.title, item.description);
    const originalTitle = generateOriginalTitle(entity, cat);
    const content = generateContent(originalTitle, cat);
    const desc = content.length > 180 ? content.substring(0, 177) + '...' : content;
    return {
      _id: String(nextId + i),
      title: originalTitle,           // <-- OZGUN TURKCE BASLIK
      description: desc,              // <-- Tamamen Turkce ozet
      category: cat,
      imageUrl: getRandomImage(),
      content: content                // <-- Tamamen Turkce icerik
    };
  });

  const added = writeArticles(existing, articles);
  console.log('Eklenen:', added, 'makale');
  trimArticles();
  updateCategories();
  console.log('Tamam!');
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

main().catch(e => { console.error(e); process.exit(1); });
