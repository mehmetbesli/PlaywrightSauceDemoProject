# Sauce Demo Playwright & TypeScript Test Otomasyon Projesi

Bu proje, [Sauce Demo Shopify Store](https://sauce-demo.myshopify.com/) e-ticaret platformu için TypeScript ve Playwright kullanılarak geliştirilmiş, modüler, sürdürülebilir, **Otomatik E-Posta Bildirimi (Email Notification)** desteğine, **Çoklu Tarayıcı (Chromium, Firefox, WebKit)** desteğine, yüksek performanslı **Paralel Test Koşumu (Parallel Execution)** mimarisine, renkli adım loglama (Logger) sistemine, kararsız testleri önleyici yeniden deneme (Retry) mekanizmasına, merkezi çoklu ortam (Multi-Environment) mimarisine ve gelişmiş (HTML & Excel) raporlama yeteneklerine sahip ölçeklenebilir bir test otomasyon projesidir.

---

## 📁 📊 Örnek Raporlar (Sample Reports Showcase)

Projeyi bilgisayarınıza klonlamadan doğrudan GitHub üzerinden örnek rapor çıktılarını inceleyebilirsiniz:

| Rapor Türü | Açıklama | Dosya Bağlantısı |
| :--- | :--- | :--- |
| 📄 **HTML Test Raporu** | 5'li kartlı metrik dashboard, tarayıcı rozetleri ve senaryo süreleri | [`sample-reports/sample-report.html`](./sample-reports/sample-report.html) |
| 📊 **Excel Test Raporu** | Sayfa 1 (Özet Dashboard) & Sayfa 2 (Detaylı Test Tablosu & Retry Rozetleri) | [`sample-reports/sample-report.xlsx`](./sample-reports/sample-report.xlsx) |
| 📝 **Adım Logları** | Renkli/emojili zaman damgalı terminal adım logları | [`sample-reports/sample-run.log`](./sample-reports/sample-run.log) |

---

## 🚀 Proje Mimarisi

Framework, sektör standardı **Page Object Model (POM)**, **Playwright Test Fixtures (Dependency Injection)**, **Çoklu Tarayıcı & Paralel Worker Mimarisi**, **Gelişmiş Loglama (Logger)**, **Otomatik E-Posta Servisi** ve **Kod Bazlı Merkezi Ortam & Retry Yönetimi** prensiplerine göre tasarlanmıştır:

```text
PlaywrightSauceDemoProject/
├── sample-reports/             # GitHub üzerinde doğrudan incelenebilecek örnek HTML, Excel ve Log çıktıları
│   ├── sample-report.html
│   ├── sample-report.xlsx
│   └── sample-run.log
├── src/
│   ├── config/                 # Tüm ortam, retry, browser, SMTP ve worker parametrelerinin yönetildiği modül
│   │   └── environment.ts      # DEV, QA, STAGING, PROD, Retries, Workers, SMTP ve Environment sınıfı
│   ├── constants/              # Route, endpoint ve merkezi mesaj/başlık sabitleri
│   │   ├── routes.ts
│   │   └── messages.ts
│   ├── data/                   # Test veri modelleri ve parametrik veriler
│   │   └── testData.ts
│   ├── fixtures/               # Playwright Dependency Injection Fixtures
│   │   └── testFixtures.ts
│   ├── pages/                  # Page Object Model sınıfları
│   │   ├── base/
│   │   │   └── BasePage.ts     # Merkezi ortak metodlar (click, fill, wait, vb.)
│   │   ├── components/
│   │   │   └── Header.ts       # Header ve arama kutusu
│   │   ├── HomePage.ts         # Ana sayfa
│   │   ├── SearchResultsPage.ts # Arama sonuçları listeleme
│   │   ├── ProductDetailPage.ts # Ürün detay ve sepete ekleme
│   │   ├── CartPage.ts         # Sepet yönetimi, ürün silme ve sepet doğrulama
│   │   └── CheckoutPage.ts     # Sipariş teslimat formu ve sipariş özeti
│   └── utils/                  # Yardımcı araçlar, özel raporlayıcılar, e-posta, loglama ve zaman damgaları
│       ├── emailService.ts        # HTML şablonlu, 3 ekli (HTML+Excel+Screenshot) e-posta servisi
│       ├── logger.ts              # Renkli konsol ve dosya tabanlı adım loglayıcı
│       ├── customHtmlReporter.ts  # Browser rozetli, Flaky/Retry etiketli özel HTML raporlayıcı
│       ├── customExcelReporter.ts # Browser, Retry ve Screenshot sütunlu, çok sayfalı özel Excel raporlayıcı
│       ├── dateTimeHelper.ts      # Tarih/zaman formatlama (YYYY-MM-DD_HH-mm-ss)
│       └── priceHelper.ts         # Para birimi ve fiyat hesaplama
├── tests/                      # Test senaryoları (Framework kodundan bağımsız)
│   └── e2e/
│       └── endToEndPurchase.spec.ts # Uçtan uca e2e ve arama senaryoları (TC01 & TC02)
├── playwright.config.ts        # Merkezi Playwright konfigürasyonu (Chromium, Firefox, WebKit, Parallel)
├── tsconfig.json               # TypeScript yapılandırması ve path mapping
└── package.json                # NPM bağımlılıkları, cross-browser, paralel, e-posta ve ortam scriptleri
```

---

## 🛠️ Kurulum

Gereksinimler: **Node.js (>= 18)**

```bash
# Bağımlılıkları yükleme
npm install

# Tüm tarayıcı motorlarını (Chromium, Firefox, WebKit) yükleme
npx playwright install chromium firefox webkit
```

---

## 📧 Otomatik E-Posta Bildirimi (Email Notification)

Test koşumu tamamlandığında, yöneticilere ve ekibe **modern HTML e-posta şablonu** ve **3'lü tam ek paketi** ile anlık bildirim gönderilir:

### 📎 Otomatik E-Posta Ekleri:
1. 📄 **HTML Raporu (`.html`)**: İndirilip tarayıcıda tıklandığında interaktif tam dashboard açılır.
2. 📊 **Excel Raporu (`.xlsx`)**: Yönetici özeti, test detayları ve filtreleme tablosu.
3. 📸 **Hata Ekran Görüntüsü (`.png`)**: Eğer test fail olduysa hata anının ekran görüntüsü.

### 🧪 E-Posta ile Çalıştırma Komutları:
```bash
# Varsayılan (QA) testleri koşar ve bitiminde e-posta gönderir:
npm run test:qa:email

# DEV ortamında testleri koşup e-posta gönderir:
npm run test:dev:email
```

---

## 🌐 Çoklu Tarayıcı (Cross-Browser Testing)

| Komut | Açıklama |
| :--- | :--- |
| `npm run test:chrome` | Testleri **Google Chrome (Chromium)** üzerinde koşturur |
| `npm run test:firefox` | Testleri **Mozilla Firefox** üzerinde koşturur |
| `npm run test:webkit` | Testleri **Apple Safari Motoru (WebKit)** üzerinde koşturur |
| `npm run test:all-browsers` | Testleri **3 tarayıcıda eşzamanlı** (Cross-Browser Matrix) koşturur |
| `npm run test:chrome:headed` | Chrome üzerinde ekranda izleyerek koşturur |
| `npm run test:firefox:headed` | Firefox üzerinde ekranda izleyerek koşturur |
| `npm run test:webkit:headed` | WebKit üzerinde ekranda izleyerek koşturur |

---

## ⚡ Paralel Test Koşumu (Parallel Execution)

| Komut | Açıklama |
| :--- | :--- |
| `npm run test:parallel` | Testleri arka planda 2 worker ile paralel koşturur |
| `npm run test:parallel:headed` | **Testleri ekranda 2 ayrı tarayıcı penceresi açarak eşzamanlı izletir** |
| `npm run test:parallel:4` | Testleri 4 eşzamanlı worker ile koşturur |
| `npm run test:qa:parallel:headed` | QA ortamında ekranda izleyerek paralel koşturur |
| `npm run test:serial:headed` | Sıralı (tek tarayıcı penceresiyle) ekranda izleyerek koşturur |

---

## 📝 Renkli ve Dosya Tabanlı Loglama (Logger)

Projede `src/utils/logger.ts` üzerinden hem konsola renkli/emojili çıktı veren hem de `reports/logs/YYYY-MM-DD_HH-mm-ss.log` dosyasına yazan sade bir loglama mekanizması bulunmaktadır:

* `Logger.step(1, 'Mağaza ana sayfasına gidiliyor...')` 🔹
* `Logger.success('Ana sayfa başarıyla açıldı.')` ✅
* `Logger.info('...')` ℹ️
* `Logger.warn('...')` ⚠️
* `Logger.error('...')` ❌

---

## 🔁 Yeniden Deneme (Retry Mechanism)

Geçici ağ gecikmeleri ve sayfa yüklenme dalgalanmalarından kaynaklanan hataları (**flaky tests**) önlemek için:
* Yerel ortamda: **1 Retry** (Bir test hata alırsa anında 1 kez daha denenir).
* CI/CD pipeline ortamında: **2 Retry** uygulanır.
* Raporlarda tekrar denenen testler **`⚡ FLAKY`** rozeti ile gösterilir.

---

## 🌐 Merkezi Çoklu Ortam (Multi-Environment) Yapısı

| Ortam | Tanımlı Merkez | Komut |
| :--- | :--- | :--- |
| **QA (Varsayılan)** | `src/config/environment.ts` | `npm run test:qa` veya `npm test` |
| **DEV** | `src/config/environment.ts` | `npm run test:dev` |
| **STAGING** | `src/config/environment.ts` | `npm run test:staging` |
| **PROD** | `src/config/environment.ts` | `npm run test:prod` |

---

## 📊 Raporlama, Loglar, Excel, E-Posta ve Hata Ekran Görüntüleri

1. **📧 E-Posta Bildirimi:** Modern HTML şablonu + HTML Raporu (.html) + Excel (.xlsx) + Screenshot (.png) ekleri.
2. **📝 Log Dosyaları:** `reports/logs/YYYY-MM-DD_HH-mm-ss.log`
3. **📄 HTML Raporu:** `reports/html/YYYY-MM-DD_HH-mm-ss.html` (Tarayıcı rozetleri ve 5'li Flaky/Retry dashboard kartlarıyla).
4. **📊 Excel Raporu (`exceljs`):** `reports/excel/YYYY-MM-DD_HH-mm-ss.xlsx` (Özet Dashboard, Detay Tablosu, Tarayıcı Sütunu, Flaky/Retry metrikleri ve Screenshot sütunlarıyla).
5. **📸 Hata Ekran Görüntüleri:** `reports/screenShot/YYYY-MM-DD_HH-mm-ss.png` (Yalnızca test FAIL olduğunda kaydedilir).

---

## 🤖 CI/CD Entegrasyonu (GitHub Actions Pipeline)

Proje, tam teşekküllü ve özelleştirilebilir bir **GitHub Actions CI/CD Pipeline** (`.github/workflows/playwright.yml`) ile entegre edilmiştir.

### 🌟 Pipeline Özellikleri:
- **Otomatik Tetikleyiciler (Triggers):** `main` / `master` dallarına yapılan her `push` ve `pull_request` işleminde testler Ubuntu ortamında otomatik olarak koşulur.
- **Manuel Koşum ve Parametre Seçimi (`workflow_dispatch`):**
  - **Environment:** `qa`, `dev`, `staging`, `prod`
  - **Browser:** `chromium`, `firefox`, `webkit`, `all`
  - **Workers:** Paralel iş parçacığı sayısı (örn: `2`, `4`)
  - **Send Email:** Koşum sonrası otomatik e-posta gönderimi (`true` / `false`)
- **Artifact Arşivleme (`actions/upload-artifact`):**
  - 📄 **playwright-html-reports:** `reports/html/`
  - 📊 **playwright-excel-reports:** `reports/excel/`
  - 📝 **playwright-logs:** `reports/logs/`
  - 📸 **playwright-screenshots:** `reports/screenShot/` (Hata anı ekran görüntüleri)
- **GitHub Secrets Entegrasyonu:** E-posta bildirimi için `SMTP_USER`, `SMTP_PASS`, `SMTP_TO`, `SMTP_FROM`, `SMTP_HOST`, `SMTP_PORT` repository secret'ları desteklenir.

### 🚀 Manuel Tetikleme Adımları:
1. GitHub reponuzda **Actions** sekmesine gidin.
2. Sol menüden **Playwright Tests** iş akışını seçin.
3. **Run workflow** butonuna tıklayın, istediğiniz ortamı ve tarayıcıyı seçerek testleri başlatın.
4. Koşum tamamlandığında sayfanın altındaki **Artifacts** bölümünden tüm HTML, Excel ve Log raporlarını zip olarak indirin.

---

## 📋 Kapsanan E2E Test Senaryoları

* **`TC01 - Complete End-to-End Product Purchase Flow`**:
  1. Ana sayfaya erişim ve sayfa başlığı doğrulaması
  2. Arama kutusu ile ürün arama ve listelenen sonuçtan ürünü seçme
  3. Ürün detay sayfasında (PDP) başlık ve dinamik fiyat doğrulaması
  4. Ürünü sepete ekleme
  5. Sepet sayfasında ürün adı ve ara toplam tutarının hesaplanarak doğrulanması
  6. Checkout sayfasına geçiş, müşteri/adres bilgilerinin form alanlarına doldurulması ve sipariş özetinin kontrolü
  7. Sepete geri dönerek ürünü sepetten silme (`removeItem`)
  8. Sepetin başarıyla boşaltıldığını (`It appears that your cart is currently empty!`) ve ürünün sepetten kalktığını doğrulama

* **`TC02 - Quick Product Search and Details Verification`**:
  1. Ana sayfaya erişim
  2. Header arama kutusundan hızlı ürün araması
  3. Sonuç listesinden ürüne tıklanması
  4. Ürün Detay Sayfasında (PDP) ürün başlığı ve geçerli fiyatın hızlı doğrulanması
