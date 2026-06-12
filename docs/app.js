// Teknoloji Blogu - Özgün makaleler
const SAMPLE_ARTICLES = [
    {
        _id: "1",
        title: "Claude 4 ile Kodlama Devri: Yapay Zeka Artık Gerçek Bir Geliştirici Ortağı",
        description: "Anthropic'in yeni nesil yapay zeka modeli Claude 4, sadece kod önermekle kalmıyor, tüm bir projeyi baştan sona yönetebiliyor. İşte detaylı inceleme.",
        category: "Yapay Zeka",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Anthropic'in son çeyrekte piyasaya sürdüğü Claude 4, yapay zeka destekli yazılım geliştirme alanında çığır açıyor. Önceki modellerden farklı olarak Claude 4, yalnızca kod parçacıkları önermekle kalmıyor; bir yazılım projesinin tüm mimarisini anlayıp, bağımlılıkları yönetip, test senaryoları oluşturup, dokümantasyonu baştan sona hazırlayabiliyor.\n\nYapılan bağımsız testlerde Claude 4'ün karmaşık bir web uygulamasını sıfırdan inşa etme süresini %73 oranında azalttığı görüldü. Üstelik model, kod güvenliği konusunda da eğitilmiş durumda; OWASP Top 10 güvenlik açıklarını otomatik olarak tespit edip düzeltebiliyor.\n\nClaude 4'ün en dikkat çekici özelliği ise 'bağlam penceresi' — 2 milyon token kapasitesiyle koca bir codebase'i aynı anda analiz edebiliyor. Bu özellik, büyük ölçekli projelerde refactoring işlemlerini neredeyse hatasız bir şekilde gerçekleştirmesine olanak tanıyor."
    },
    {
        _id: "2",
        title: "Apple Vision Pro 2 Tanıtıldı: Fiyatı Düştü, Özellikleri Arttı",
        description: "Apple'ın ikinci nesil karma gerçeklik gözlüğü Vision Pro 2, %40 daha hafif ve önemli ölçüde daha uygun fiyatlı. İşte tüm detaylar.",
        category: "Donanım",
        imageUrl: "https://images.unsplash.com/photo-1676630657486-4473bc376caf?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Apple, geçtiğimiz hafta düzenlediği etkinlikte merakla beklenen Vision Pro 2'yi resmen tanıttı. İlk neslin ardından gelen eleştirileri dikkate alan Apple, yeni modelde hem ağırlığı hem de fiyatı ciddi oranda düşürmüş durumda.\n\nVision Pro 2, selefine göre %40 daha hafif — sadece 340 gram. Bu, uzun süreli kullanımda belirgin bir konfor artışı sağlıyor. Fiyat ise 3.499 dolardan 1.999 dolara gerilemiş.\n\nTeknik özelliklere gelince: yeni M4 Ultra çip, iki adet 4K micro-OLED ekran, geliştirilmiş el hareketi takibi ve yeni bir dijital taç sayesinde daha hassas kontrol imkanı sunuyor. Ayrıca batarya ömrü 4 saate çıkarılmış. Apple'ın VisionOS 3 ile birlikte tanıttığı yeni işletim sistemi, üretkenlik uygulamalarıyla daha derin entegrasyon vaat ediyor."
    },
    {
        _id: "3",
        title: "React Server Components: Frontend Dünyasında Paradigma Değişimi",
        description: "React Server Components, 2026'da frontend geliştirme yaklaşımını tamamen değiştiriyor. Client ve server arasındaki çizgiyi yeniden tanımlayan bu teknolojiyi derinlemesine inceledik.",
        category: "Frontend",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "React Server Components (RSC), frontend geliştirme dünyasında sessiz ama köklü bir devrim yaratıyor. Geleneksel React uygulamalarında tüm bileşenler istemci tarafında çalışırken, RSC ile bileşenlerin büyük bir kısmı sunucu tarafında işleniyor. Bu yaklaşım, JavaScript paket boyutunu %80'e varan oranlarda azaltırken, sayfa yüklenme hızını da önemli ölçüde artırıyor.\n\nNext.js 18 ile birlikte gelen App Router, RSC'yi varsayılan haline getirdi. Bu sayede geliştiriciler, 'use client' direktifi kullanmadıkları sürece tüm bileşenler otomatik olarak server component olarak çalışıyor. Bu, veritabanı sorguları, API çağrıları ve dosya sistemi erişimi gibi işlemlerin doğrudan React bileşenleri içinde yapılabilmesi anlamına geliyor.\n\nAncak bu paradigma değişiminin zorlukları da yok değil. Geliştiricilerin 'client' ve 'server' arasındaki sınırı iyi anlaması gerekiyor. Yanlış kullanıldığında, hibrit bir yaklaşım performans kazançlarını tersine çevirebiliyor."
    },
    {
        _id: "4",
        title: "Google Willow Kuantum Çipi: 10 Septilyon Yıllık İşlemi 5 Dakikada Çözdü",
        description: "Google'ın yeni kuantum çipi Willow, 10 septilyon yıl sürecek bir hesaplamayı sadece 5 dakikada gerçekleştirdi. Kuanton bilgisayarların geldiği son nokta.",
        category: "Bilim",
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 9 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Google'ın kuantum yapay zeka laboratuvarı, yeni nesil kuantum çipi Willow'u tanıttı. 105 kübit ile çalışan Willow, standart bir süper bilgisayarın 10 septilyon (10 üzeri 25) yılda çözeceği bir problemi yalnızca 5 dakikada tamamlayarak kuantum üstünlüğünü yeniden kanıtladı.\n\nWillow'un en büyük başarısı, kuantum hata düzeltme alanında geldi. Google araştırmacıları, kübit sayısını artırdıkça hata oranını düşürmeyi başardı. Bu, kuantum bilgisayarların pratik kullanımı için yıllardır aşılamayan en büyük engellerden biriydi.\n\nWillow'un potansiyel uygulamaları arasında ilaç keşfi, iklim modellemesi, füzyon enerjisi hesaplamaları ve kriptografi yer alıyor. Ancak ticari kullanım için hâlâ yıllar gerektiği belirtiliyor."
    },
    {
        _id: "5",
        title: "Siber Güvenlik 2026: Yeni Nesil Tehditler ve Savunma Stratejileri",
        description: "Yapay zeka destekli siber saldırılar 2026'da rekor seviyeye ulaştı. Kurumların yeni nesil tehditlere karşı alması gereken önlemleri detaylıca inceledik.",
        category: "Güvenlik",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "2026 yılı, siber güvenlik alanında dönüm noktası oldu. Yapay zeka destekli siber saldırılar bir önceki yıla göre %340 artış gösterdi. Artık saldırganlar, hedef sistemleri analiz eden, zafiyetleri otomatik keşfeden ve insan müdahalesi olmadan sızma gerçekleştiren yapay zeka ajanları kullanıyor.\n\nÖzellikle deepfake tabanlı kimlik avı saldırıları ciddi bir tehdit oluşturuyor. CEO'ların ses ve görüntülerinin gerçek zamanlı olarak taklit edildiği bu saldırılarda, çalışanların büyük meblağları yanlış hesaplara transfer ettiği vakalar bildiriliyor.\n\nSavunma tarafında ise 'sıfır güven' (zero trust) mimarisi artık standart haline geliyor. Yapay zeka tabanlı tehdit avcılığı sistemleri, ağ trafiğindeki anormallikleri gerçek zamanlı tespit ederek saldırıları henüz başlangıç aşamasındayken engelleyebiliyor. Ayrıca, AB ve ABD'nin ortaklaşa yürürlüğe koyduğu yeni siber güvenlik yasası, kritik altyapı şirketlerine zorunlu güvenlik standartları getiriyor."
    },
    {
        _id: "6",
        title: "Rust 2026 Sürümü: Güvenli ve Hızlı Sistem Programlamada Yeni Dönem",
        description: "Rust programlama dili 2026 sürümüyle birlikte yeni özellikler, daha iyi derleyici performansı ve genişleyen ekosistemle karşımızda.",
        category: "Backend",
        imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Rust programlama dili, 2026 sürümüyle birlikte önemli yenilikler sunuyor. Yıllık sürüm takvimine geçen Rust ekibi, bu yılki ana sürümde derleyici optimizasyonlarına ve dilin kullanılabilirliğini artıran özelliklere odaklandı.\n\nEn dikkat çekici yenilikler: 'Trait aliases' ile karmaşık tür bildirimlerinin sadeleştirilmesi, 'async closures' ile eşzamansız programlamada yeni bir esneklik seviyesi ve 'compile-time reflection' ile derleme zamanında tür bilgisine erişim imkanı.\n\nRust'ın benimsenmesi hız kesmeden devam ediyor. Linux çekirdeğinde Rust desteği resmiyet kazanırken, Windows çekirdeğinde de Rust bileşenleri kullanılmaya başlandı. AWS, Google, Microsoft ve Meta gibi büyük teknoloji şirketleri, performans kritik sistemlerinde Rust'ı tercih etmeye devam ediyor."
    },
    {
        _id: "7",
        title: "Midjourney V8 ile Görsel Üretimde Çığır: Fotoğraf Gerçekçiliği Artık Ayırt Edilemiyor",
        description: "Midjourney'in yeni versiyonu V8, ürettiği görsellerde artık gerçek fotoğraflarla arasındaki farkı ayırt etmenin neredeyse imkansız olduğu bir seviyeye ulaştı.",
        category: "Yapay Zeka",
        imageUrl: "https://images.unsplash.com/photo-1547954575-855750c57bd3?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Midjourney'in 2026 başında piyasaya sürdüğü V8 versiyonu, yapay zeka görsel üretiminde yeni bir dönemin kapılarını araladı. Model, artık sadece fotogerçekçi görseller üretmekle kalmıyor, aynı zamanda ışık, gölge, doku ve kamera ayarları gibi parametreleri de kusursuz bir şekilde yönetiyor.\n\nYapılan kör testlerde, katılımcıların yalnızca %12'si Midjourney V8 çıktılarıyla gerçek fotoğrafları ayırt edebildi. Bu, yapay zeka görsel üretiminde dönüm noktası olarak değerlendiriliyor.\n\nYeni versiyonla gelen 'stil transferi' özelliği, bir görselin stilini başka bir görsele uygulayabiliyor. 'Sahne düzenleme' ile üretilen görsellerde nesnelerin konumu, rengi ve boyutu sonradan değiştirilebiliyor. Ayrıca 'tutarlı karakter' özelliği, aynı karakteri farklı sahnelerde ve açılardan tutarlı bir şekilde üretebiliyor — bu özellik özellikle çizgi roman ve animasyon üreticileri için büyük bir kolaylık."
    },
    {
        _id: "8",
        title: "iPhone 17 Pro İncelemesi: Yapay Zeka Çağına Uygun Tasarım",
        description: "Apple'ın yeni amiral gemisi iPhone 17 Pro, A19 çipi ve tamamen yenilenen kamera sistemiyle yapay zeka çağına hazır olduğunu kanıtlıyor.",
        category: "Mobil",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Apple'ın Eylül 2026'da tanıttığı iPhone 17 Pro, şirketin şimdiye kadar ürettiği en güçlü ve en akıllı telefon olarak karşımıza çıkıyor. 3 nanometre teknolojisiyle üretilen A19 Pro çipi, önceki nesle göre %35 daha yüksek CPU performansı ve %45 daha hızlı yapay zeka işleme kapasitesi sunuyor.\n\nEn dikkat çekici yenilik, kamera sisteminde yaşandı. 48 megapiksellik ana kameraya artık 48 megapiksellik ultra geniş açı lens eşlik ediyor. Apple'ın yeni 'AI Photography Engine' sayesinde düşük ışık performansı belirgin şekilde iyileşmiş. Gece modu artık neredeyse tam karanlıkta bile etkileyici sonuçlar verebiliyor.\n\nBatarya ömrü de önemli ölçüde artırılmış. Şarj başına 30 saate varan video oynatma süresi sunan iPhone 17 Pro, 45W hızlı şarj desteğiyle 30 dakikada %70'e kadar şarj olabiliyor."
    },
    {
        _id: "9",
        title: "Gökyüzü Bilgisayarları: Microsoft ve Google'ın Yeni Stratejisi",
        description: "Bulut bilişim devleri Microsoft Azure ve Google Cloud, fiziksel veri merkezlerinin yerini alacak 'gökyüzü bilgisayarları' konseptini test etmeye başladı.",
        category: "Cloud",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 34 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Bulut bilişim dünyasında çığır açacak bir gelişme yaşanıyor. Microsoft Azure ve Google Cloud, başlattıkları ortak projede, yüksek irtifa platformlarına (HAPS — High Altitude Platform Stations) yerleştirilen veri merkezlerini test ediyor. Bu 'gökyüzü bilgisayarları', 20 kilometre yükseklikteki stratosferde konumlanıyor.\n\nBu yaklaşımın en büyük avantajı, yer tabanlı veri merkezlerine kıyasla %90 daha az soğutma enerjisi gerektirmesi. Sıcaklığın sürekli -50°C civarında olduğu stratosferde, sunucular doğal olarak soğutuluyor. Ayrıca, güneş enerjisi panelleriyle kesintisiz enerji sağlanabiliyor.\n\nProjenin ilk pilot uygulaması, Afrika kıtasının kırsal bölgelerinde düşük gecikmeli internet hizmeti sunmayı hedefliyor. Uzun vadede ise bu platformların felaket kurtarma, askeri iletişim ve uzaktan eğitim gibi alanlarda kritik rol oynaması bekleniyor."
    },
    {
        _id: "10",
        title: "Blender 5.0 ile 3D Modellemede Yeni Dönem: Gerçek Zamanlı İşleme Artık Ücretsiz",
        description: "Açık kaynaklı 3D modelleme yazılımı Blender 5.0, gerçek zamanlı ışın izleme ve yapay zeka destekli modelleme araçlarıyla profesyonel yazılımlara rakip oluyor.",
        category: "Yazılım",
        imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 40 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Blender Foundation, açık kaynaklı 3D modelleme yazılımının 5.0 sürümünü duyurdu. Bu sürüm, Blender'ı profesyonel stüdyoların vazgeçilmez aracı haline getirecek özelliklerle geliyor.\n\nEn önemli yenilik, tamamen yeniden yazılan gerçek zamanlı render motoru 'Eevee Next'. Bu motor, RTX ışın izleme donanımını tam olarak kullanarak, Cycles motoruyla neredeyse aynı kalitede ancak saniyeler içinde render alabiliyor. Ayrıca yeni 'AI Denoiser' sayesinde düşük örneklemeli görüntüler anında temizlenebiliyor.\n\nBlender 5.0 ile gelen diğer özellikler arasında yapay zeka destekli 'Smart Sculpt' aracı, 'Node Groups' sisteminin tamamen yenilenmesi ve 'Geometry Nodes' ile artık görsel efektlerin daha kolay oluşturulabilmesi yer alıyor. Bu güncellemeyle Blender, endüstri standardı haline gelmiş Maya ve 3ds Max gibi yazılımlara açık ara en güçlü ücretsiz alternatif konumuna yükseliyor."
    },
    {
        _id: "11",
        title: "Neuralink İnsan Deneylerinde İkinci Aşamaya Geçti: Felçli Hastalar Düşünceyle Yazı Yazıyor",
        description: "Elon Musk'ın beyin-bilgisayar arayüzü şirketi Neuralink, ikinci faz insan deneylerinde felçli hastaların düşünce gücüyle yazı yazabildiğini ve bilgisayar kullanabildiğini duyurdu.",
        category: "Bilim",
        imageUrl: "https://images.unsplash.com/photo-1559757175-7cb057fba0b6?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 46 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Neuralink, beyin-bilgisayar arayüzü (BCI) teknolojisinde önemli bir eşiği daha geçti. Şirketin ikinci faz insan deneylerinde, omurilik felci geçiren hastalar, Neuralink çipi sayesinde yalnızca düşünce gücüyle yazı yazabiliyor, internet taraması yapabiliyor ve hatta video oyunları oynayabiliyor.\n\nDeneylere katılan hastalar, implantasyon sonrası sadece 4 hafta içinde dakikada 60 kelimeye varan yazma hızlarına ulaştı. Bu, önceki BCI teknolojilerine göre yaklaşık 10 kat daha hızlı. Üstelik Neuralink'in kablosuz teknolojisi sayesinde hastaların kafalarında herhangi bir dış bağlantı noktası bulunmuyor.\n\nNeuralink'in bir sonraki hedefi, görme engelli hastalarda görsel korteksi uyararak temel görüntü algısı oluşturmak. Bu deneylerin 2027 başında başlaması planlanıyor."
    },
    {
        _id: "12",
        title: "Docker Desktop Alternatifleri: 2026'nın En İyi Container Yönetim Araçları",
        description: "Docker Desktop'ın kurumsal lisans değişiklikleri sonrası geliştiriciler alternatif arayışına yöneldi. İşte 2026'da öne çıkan Docker alternatifleri.",
        category: "Backend",
        imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 52 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Docker Desktop'ın 2024'te duyurulan kurumsal lisans değişiklikleri, açık kaynak topluluğunda alternatif arayışlarını hızlandırmıştı. 2026'ya geldiğimizde bu alternatifler artık olgunlaşmış durumda ve birçoğu Docker'ın sunduğu özellikleri fazlasıyla karşılıyor.\n\nPodman, Red Hat'in geliştirdiği Docker alternatifi olarak başı çekiyor. Docker ile neredeyse birebir uyumlu CLI yapısı sayesinde geliştiriciler herhangi bir öğrenme eğrisi olmadan geçiş yapabiliyor. Lima ve Rancher Desktop ise macOS kullanıcıları için popüler seçenekler arasında.\n\nEn dikkat çekici gelişme ise Microsoft'un Windows için geliştirdiği 'Win Containers' teknolojisi. Artık Docker Desktop olmadan da Windows'ta native container çalıştırmak mümkün. Bu, özellikle .NET geliştiricileri için büyük bir kolaylık sağlıyor."
    },
    {
        _id: "13",
        title: "Sürücüsüz Taksi Hizmeti Artık 10 Şehirde: Waymo ve Tesla'nın Rekabeti Kızışıyor",
        description: "Otonom taksi hizmetleri 2026'da 10 büyük şehirde hizmet vermeye başladı. Waymo'nun deneyimi ile Tesla'nın ölçek avantajı arasındaki rekabet giderek kızışıyor.",
        category: "Ulaşım",
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 58 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "2026 yılı, otonom taksi hizmetlerinin ana akım haline geldiği yıl oldu. Waymo ve Tesla arasındaki rekabet, bu hizmetlerin hem kalitesini hem de erişilebilirliğini artırıyor. Halihazırda San Francisco, Los Angeles, Phoenix, Austin, Miami, New York, Londra, Berlin, Dubai ve Tokyo'da tamamen sürücüsüz taksi hizmeti veriliyor.\n\nWaymo, 10 milyon millik sürüş deneyimiyle güvenlik konusunda öne çıkarken, Tesla'nın maliyet avantajı dikkat çekiyor. Tesla'nın Cybercab modeli, mil başına 0.25 dolar gibi rekabetçi bir fiyat sunarken, Waymo'nun Jaguar I-Pace tabanlı araçları mil başına 0.80 dolar civarında seyrediyor.\n\nGüvenlik verileri de paylaşılmış durumda. Waymo, 2026'da bugüne kadar 20 milyon milden fazla sürüş yaptı ve yalnızca 3 küçük kazaya karıştı — bunların tamamında diğer araç sürücüleri hatalı bulundu. Tesla'nın tam otonom sistemi ise 5 milyon mili geride bıraktı."
    },
    {
        _id: "14",
        title: "Linux Mint 22 İncelemesi: Windows'tan Geçiş Artık Hiç Bu Kadar Kolay Olmamıştı",
        description: "Linux Mint 22, Windows kullanıcıları için en kolay geçiş deneyimini sunuyor. Yeni Cinnamon masaüstü ve donanım uyumluluğuyla herkes için Linux.",
        category: "İşletim Sistemi",
        imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 66 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Linux Mint 22 'Sonya', uzun dönem destekli (LTS) sürüm olarak piyasaya çıktı ve Windows'tan Linux'a geçiş yapmak isteyen kullanıcılar için şimdiye kadarki en iyi seçenek olduğunu kanıtlıyor. Ubuntu 24.04 LTS tabanlı olan bu sürüm, 2032 yılına kadar güvenlik güncellemesi alacak.\n\nCinnamon 7.0 masaüstü ortamı, Windows kullanıcılarının yabancılık çekmeyeceği bir arayüz sunuyor. Alt kısımda görev çubuğu, sol alt köşede menü, sağ alt köşede sistem tepsisi — tam bir Windows deneyimi. Ancak bu benzerlik yüzeysel değil; Cinnamon 7.0, Wayland desteği ve %40 daha hızlı animasyonlarla teknik olarak da üstün.\n\nDonanım uyumluluğu da önemli ölçüde gelişmiş. Yeni 'Driver Manager' aracı, NVIDIA ve AMD ekran kartları için uygun sürücüleri otomatik olarak tespit edip kuruyor. Ayrıca, PDF düzenleme, ofis programları ve medya oynatıcı gibi temel yazılımlar kutudan çıktığı gibi hazır geliyor."
    },
    {
        _id: "15",
        title: "ESG Teknolojileri: Sürdürülebilir BT Altyapısına Geçişin Maliyeti ve Getirisi",
        description: "Kurumların karbon ayak izini azaltmak için benimsediği yeşil BT teknolojileri, 2026'da artık bir tercih değil zorunluluk haline geldi.",
        category: "Cloud",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Sürdürülebilirlik, 2026'da BT departmanlarının bir numaralı gündem maddesi haline geldi. AB'nin yeni düzenlemeleri ve yatırımcı baskısıyla, kurumlar artık BT altyapılarının karbon ayak izini raporlamak ve azaltmak zorunda.\n\nYeşil BT'ye geçişin en popüler yöntemi, enerji verimliliği yüksek ARM tabanlı sunuculara geçiş. Amazon'un Graviton işlemcileri, geleneksel x86 sunuculara göre %60 daha az enerji tüketiyor. Google ise yapay zeka destekli soğutma sistemleriyle veri merkezlerinde %40 enerji tasarrufu sağlıyor.\n\nSıvı soğutma teknolojileri de yaygınlaşıyor. Özellikle dielektrik sıvı içinde tamamen daldırma soğutma (immersion cooling), geleneksel hava soğutmaya göre %95 daha az enerji harcıyor. Microsoft'un bu teknolojiyi kullanan veri merkezleri, Power Usage Effectiveness (PUE) değerinde 1.02 gibi teorik sınıra yakın bir performans sergiliyor."
    },
    {
        _id: "16",
        title: "Flutter 5.0 ile Tek Kod Tabanından Her Platforma Uygulama",
        description: "Google'ın çapraz platform framework'ü Flutter 5.0, web ve masaüstü desteğini önemli ölçüde geliştirerek mobil cihazlarla aynı seviyeye getiriyor.",
        category: "Mobil",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
        views: 0, likes: 0,
        publishedAt: new Date(Date.now() - 80 * 3600000).toISOString(),
        author: "İlker Bekmezci",
        content: "Flutter 5.0, Google'ın çapraz platform geliştirme framework'ünün şimdiye kadarki en kapsamlı güncellemesi olarak karşımıza çıkıyor. Bu sürümle birlikte Flutter, artık sadece mobil uygulama değil, aynı zamanda web ve masaüstü uygulamaları için de gerçek bir alternatif haline geliyor.\n\nEn önemli yenilik, 'Implicit Animations' sisteminin tamamen yenilenmesi. Geliştiriciler artık herhangi bir animasyon kodu yazmadan, sadece widget ağacında bildirim yaparak karmaşık animasyonlar oluşturabiliyor. Ayrıca, Dart 4 dil desteğiyle birlikte pattern matching ve null safety iyileştirmeleri de geliyor.\n\nWeb desteği de önemli ölçüde gelişmiş. Flutter 5.0 ile oluşturulan web uygulamaları, artık WASM (WebAssembly) desteği sayesinde native performansa yakın bir hızda çalışıyor. SEO desteği ve erişilebilirlik özellikleri de bu sürümle birlikte olgunlaşmış durumda."
    }
];

const SAMPLE_CATEGORIES = ["Yapay Zeka", "Donanım", "Frontend", "Bilim", "Güvenlik", "Backend", "Mobil", "Cloud", "Yazılım", "Ulaşım", "İşletim Sistemi"];

let currentPage = 1;
let currentCategory = 'all';
const ITEMS_PER_PAGE = 6;

// DOM Elements
const articlesContainer = document.getElementById('articles-container');
const categoriesContainer = document.getElementById('categories-container');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('article-modal');
const closeBtn = document.querySelector('.close');

// Event Listeners
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = 'none';
};

// Kategorileri yükle
function loadCategories() {
    categoriesContainer.innerHTML = SAMPLE_CATEGORIES.map(cat => `
        <button class="category-btn" data-category="${cat}">${cat}</button>
    `).join('');

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            currentPage = 1;
            loadArticles();
        });
    });
}

// Makaleleri yükle
function loadArticles() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
    articlesContainer.innerHTML = '';

    let filtered = SAMPLE_ARTICLES;
    if (currentCategory !== 'all') {
        filtered = SAMPLE_ARTICLES.filter(a => a.category === currentCategory);
    }

    // Sayfalama
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    articlesContainer.innerHTML = pageItems.map(article => `
        <div class="article-card" onclick="openArticle('${article._id}')">
            <img src="${article.imageUrl}" alt="${article.title}" class="article-image" loading="lazy" onerror="this.src='https://placehold.co/300x200/667eea/white?text=Teknoloji'">
            <div class="article-content">
                <span class="article-category">${article.category}</span>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-description">${article.description}</p>
                <div class="article-meta"></div>
            </div>
        </div>
    `).join('');

    loadingDiv.style.display = 'none';

    // Sayfalama
    createPagination(totalPages);
}

// Sayfalama oluştur
function createPagination(totalPages) {
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        if (i === currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            loadArticles();
            window.scrollTo(0, 0);
        };
        paginationContainer.appendChild(btn);
    }
}

// Makaleyi aç
function openArticle(id) {
    const article = SAMPLE_ARTICLES.find(a => a._id === id);
    if (!article) return;

    document.getElementById('modal-body').innerHTML = `
        <img src="${article.imageUrl}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;" onerror="this.src='https://placehold.co/500x300/667eea/white?text=Teknoloji'">
        <h2>${article.title}</h2>
        <p style="color: #666; margin: 10px 0;"><strong>Yazar:</strong> ${article.author}</p>
        <p style="color: #999; margin: 10px 0; font-size: 0.9em;">Yayın Tarihi: ${new Date(article.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p style="margin: 20px 0; line-height: 1.8; color: #444; font-size: 1.05em;">${article.content}</p>
        <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
            <span style="padding: 8px 16px; background: #667eea; color: white; border-radius: 20px; font-size: 0.9em;">${article.category}</span>
        </div>
    `;
    modal.style.display = 'block';
}

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadArticles();
});
