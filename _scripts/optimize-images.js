/**
 * ═══════════════════════════════════════════════════════════════════
 * IMAGE OPTIMIZATION SCRIPT - HIGH-PERFORMANCE WEB
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ten skrypt automatycznie generuje zoptymalizowane warianty obrazów
 * w różnych rozmiarach i formatach (AVIF, WebP, JPEG) dla maksymalnej
 * wydajności na wszystkich urządzeniach (Mobile, Tablet, Desktop, Retina).
 *
 * ═══════════════════════════════════════════════════════════════════
 * WYMAGANIA:
 * ═══════════════════════════════════════════════════════════════════
 *
 * npm install sharp --save-dev
 *
 * Sharp to najszybsza biblioteka do przetwarzania obrazów w Node.js
 * (wykorzystuje libvips - wydajniejsze niż ImageMagick/GraphicsMagick)
 *
 * ═══════════════════════════════════════════════════════════════════
 * JAK URUCHOMIĆ:
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Zainstaluj zależności:
 *    npm install sharp --save-dev
 *
 * 2. Umieść oryginalne obrazy w folderach:
 *    - assets/images/portfolio/originals/
 *    - assets/images/about/originals/
 *    - assets/images/social/originals/
 *
 * 3. Uruchom skrypt:
 *    node _scripts/optimize-images.js
 *
 * 4. Zoptymalizowane obrazy zostaną wygenerowane w odpowiednich katalogach:
 *    - assets/images/portfolio/ (400w, 800w, 1200w, 1600w)
 *    - assets/images/about/ (400w, 800w, 1200w, 1600w)
 *    - assets/images/social/ (1200x630 dla OG)
 *
 * ═══════════════════════════════════════════════════════════════════
 * CO ROBI SKRYPT:
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Znajduje wszystkie obrazy w folderach /originals/
 * 2. Dla każdego obrazu generuje 4 rozmiary:
 *    - 400px  (Mobile 1x, Tablet 1x)
 *    - 800px  (Mobile 2x/3x, Tablet 2x, Desktop 1x)
 *    - 1200px (Desktop 2x, Mobile 3x Retina)
 *    - 1600px (Desktop 3x, Large Screens 2x)
 *
 * 3. Dla każdego rozmiaru tworzy 3 formaty:
 *    - .avif (Najnowszy, -90% rozmiaru, Chrome 85+, Safari 16+)
 *    - .webp (Fallback, -70% rozmiaru, szeroka kompatybilność)
 *    - .jpg  (Legacy, wszystkie przeglądarki)
 *
 * 4. Zachowuje proporcje obrazu (aspect ratio)
 * 5. Optymalizuje jakość vs rozmiar (q=80 dla JPEG/WebP, q=75 dla AVIF)
 * 6. Usuwa metadata EXIF (mniejszy rozmiar + prywatność)
 * 7. Generuje progressive JPEG (szybsze renderowanie)
 *
 * ═══════════════════════════════════════════════════════════════════
 * STRUKTURA KATALOGÓW:
 * ═══════════════════════════════════════════════════════════════════
 *
 * assets/images/
 * ├── portfolio/
 * │   ├── originals/          ← UMIEŚĆ TUTAJ oryginalne obrazy
 * │   │   ├── kraft.jpg
 * │   │   ├── neon.png
 * │   │   └── techgear.jpg
 * │   ├── kraft-400.avif      ← Wygenerowane przez skrypt
 * │   ├── kraft-400.webp
 * │   ├── kraft-400.jpg
 * │   ├── kraft-800.avif
 * │   ├── ... (wszystkie warianty)
 * │   └── ...
 * ├── about/
 * │   ├── originals/
 * │   │   └── coding-setup.jpg
 * │   └── ... (wygenerowane warianty)
 * └── social/
 *     ├── originals/
 *     │   └── og-image.png
 *     └── og-image-1200x630.webp (dedykowany rozmiar dla OG)
 *
 * ═══════════════════════════════════════════════════════════════════
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// KONFIGURACJA
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  // Ścieżki do katalogów z oryginałami
  inputDirs: [
    'assets/img/products/originals',
    'assets/img/originals',
  ],

  // Rozmiary dla responsive images (szerokości w pikselach)
  // 400w  - Mobile 1x
  // 800w  - Mobile 2x, Tablet 1x
  // 1200w - Tablet 2x, Desktop 1x
  // 1600w - Desktop 2x, Large screens
  sizes: [400, 800, 1200, 1600],

  // Formaty wyjściowe (w kolejności od najnowszych do legacy)
  formats: [
    { ext: 'avif', quality: 75, options: { effort: 4 } },  // Najlepsza kompresja
    { ext: 'webp', quality: 80, options: { effort: 4 } },  // Dobra kompresja
    { ext: 'jpg',  quality: 80, options: { progressive: true, mozjpeg: true } }, // Legacy
  ],

  // Dedykowane rozmiary dla specjalnych przypadków
  special: {
    // Open Graph images (Facebook, LinkedIn, Twitter)
    social: { width: 1200, height: 630 },
  },

  // Limity formatów (aby uniknąć błędów dla bardzo dużych obrazów)
  limits: {
    // AVIF/WebP mają limity rozmiaru (pixels total)
    // Dla bardzo wysokich/szerokich obrazów redukujemy max rozmiar
    maxPixels: {
      avif: 16000 * 16000, // ~256 megapikseli
      webp: 16383 * 16383, // Limit WebP spec
    },
    // Max wysokość/szerokość dla extreme aspect ratios
    maxDimension: 16000,
  },
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Sprawdza czy katalog istnieje, jeśli nie - tworzy go
 */
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`📁 Utworzono katalog: ${dir}`);
  }
}

/**
 * Pobiera wszystkie obrazy z katalogu
 */
async function getImages(dir) {
  try {
    const files = await fs.readdir(dir);
    return files.filter(file =>
      /\.(jpg|jpeg|png|webp|tiff)$/i.test(file)
    ).map(file => ({
      fullPath: path.join(dir, file),
      filename: path.parse(file).name,
      ext: path.parse(file).ext,
    }));
  } catch (error) {
    console.warn(`⚠️  Katalog nie istnieje: ${dir}`);
    return [];
  }
}

/**
 * Formatuje rozmiar pliku do czytelnej postaci
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Oblicza oszczędność rozmiaru w %
 */
function calculateSavings(original, optimized) {
  return Math.round((1 - optimized / original) * 100);
}

// ═══════════════════════════════════════════════════════════════════
// CORE OPTIMIZATION LOGIC
// ═══════════════════════════════════════════════════════════════════

/**
 * Sprawdza czy wymiary obrazu nie przekraczają limitów formatu
 */
function canGenerateFormat(width, height, formatExt) {
  const totalPixels = width * height;

  if (formatExt === 'avif' && totalPixels > CONFIG.limits.maxPixels.avif) {
    return false;
  }
  if (formatExt === 'webp' && totalPixels > CONFIG.limits.maxPixels.webp) {
    return false;
  }
  if (width > CONFIG.limits.maxDimension || height > CONFIG.limits.maxDimension) {
    return false;
  }

  return true;
}

/**
 * Generuje zoptymalizowany wariant obrazu
 */
async function generateVariant(inputPath, outputPath, width, format) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Oblicz docelowe wymiary
  const targetWidth = Math.min(width, metadata.width);
  const targetHeight = Math.round((targetWidth / metadata.width) * metadata.height);

  // Sprawdź czy można wygenerować ten format
  if (!canGenerateFormat(targetWidth, targetHeight, format.ext)) {
    throw new Error(
      `Image too large for ${format.ext.toUpperCase()} format (${targetWidth}x${targetHeight}px). ` +
      `Try using smaller size or JPEG only.`
    );
  }

  // Resize z zachowaniem aspect ratio
  let resized = image.resize(width, null, {
    withoutEnlargement: true,  // Nie powiększaj jeśli oryginalny jest mniejszy
    fit: 'inside',              // Zachowaj proporcje
  });

  // Usuń metadata EXIF (prywatność + mniejszy rozmiar)
  resized = resized.rotate(); // Auto-rotate based on EXIF before stripping

  // Generuj w odpowiednim formacie
  switch (format.ext) {
    case 'avif':
      resized = resized.avif({
        quality: format.quality,
        effort: format.options.effort,
      });
      break;
    case 'webp':
      resized = resized.webp({
        quality: format.quality,
        effort: format.options.effort,
      });
      break;
    case 'jpg':
      resized = resized.jpeg({
        quality: format.quality,
        progressive: format.options.progressive,
        mozjpeg: format.options.mozjpeg,
      });
      break;
  }

  await resized.toFile(outputPath);

  // Zwróć statystyki
  const stats = await fs.stat(outputPath);
  return {
    size: stats.size,
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Generuje dedykowany obraz dla Social Media (OG/Twitter)
 */
async function generateSocialImage(inputPath, outputDir, filename) {
  const { width, height } = CONFIG.special.social;

  console.log(`\n  📱 Generuję Social Media variant (${width}x${height})...`);

  const image = sharp(inputPath);

  // Przytnij do 1200x630 z centrowaniem
  const resized = image.resize(width, height, {
    fit: 'cover',           // Przetnij aby wypełnić
    position: 'center',     // Wycentruj
  });

  // Generuj tylko WebP i JPEG dla social (AVIF jeszcze nie wszędzie wspierane)
  const formats = CONFIG.formats.filter(f => f.ext === 'webp' || f.ext === 'jpg');

  for (const format of formats) {
    const outputPath = path.join(outputDir, `${filename}-social.${format.ext}`);

    let output = resized.clone();
    if (format.ext === 'webp') {
      output = output.webp({ quality: format.quality, effort: format.options.effort });
    } else {
      output = output.jpeg({ quality: format.quality, progressive: true });
    }

    await output.toFile(outputPath);
    const stats = await fs.stat(outputPath);
    console.log(`    ✅ ${format.ext.toUpperCase()}: ${formatBytes(stats.size)}`);
  }
}

/**
 * Przetwarza pojedynczy obraz
 */
async function processImage(image, outputDir) {
  console.log(`\n🖼️  Przetwarzam: ${image.filename}${image.ext}`);

  const originalStats = await fs.stat(image.fullPath);
  const originalSize = originalStats.size;
  console.log(`  📦 Oryginalny rozmiar: ${formatBytes(originalSize)}`);

  let totalSaved = 0;
  let variantCount = 0;

  // Generuj warianty dla każdego rozmiaru i formatu
  for (const size of CONFIG.sizes) {
    console.log(`\n  📐 Rozmiar: ${size}px`);

    for (const format of CONFIG.formats) {
      const outputFilename = `${image.filename}-${size}.${format.ext}`;
      const outputPath = path.join(outputDir, outputFilename);

      try {
        const result = await generateVariant(
          image.fullPath,
          outputPath,
          size,
          format
        );

        const savings = calculateSavings(originalSize, result.size);
        totalSaved += (originalSize - result.size);
        variantCount++;

        console.log(
          `    ✅ ${format.ext.toUpperCase()}: ${result.width}x${result.height} - ` +
          `${formatBytes(result.size)} (${savings}% smaller)`
        );
      } catch (error) {
        console.error(`    ❌ Błąd dla ${format.ext}: ${error.message}`);
      }
    }
  }

  // Jeśli to obraz z folderu social, wygeneruj dedykowany wariant OG
  if (outputDir.includes('social')) {
    await generateSocialImage(image.fullPath, outputDir, image.filename);
  }

  console.log(`\n  💾 Łącznie wygenerowano: ${variantCount} wariantów`);
  console.log(`  💰 Oszczędność miejsca: ${formatBytes(totalSaved)}`);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 IMAGE OPTIMIZATION SCRIPT - HIGH-PERFORMANCE WEB');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  let totalImages = 0;
  let totalVariants = 0;
  const startTime = Date.now();

  for (const inputDir of CONFIG.inputDirs) {
    console.log(`\n📂 Przetwarzam katalog: ${inputDir}`);
    console.log('─────────────────────────────────────────────────────────────────\n');

    const images = await getImages(inputDir);

    if (images.length === 0) {
      console.log(`  ℹ️  Brak obrazów do przetworzenia. Upewnij się, że:`);
      console.log(`     1. Katalog istnieje: ${inputDir}`);
      console.log(`     2. Zawiera pliki: .jpg, .jpeg, .png, .webp, .tiff`);
      continue;
    }

    // Katalog wyjściowy (parent directory bez /originals)
    const outputDir = path.dirname(inputDir);
    await ensureDir(outputDir);

    for (const image of images) {
      await processImage(image, outputDir);
      totalImages++;
      totalVariants += (CONFIG.sizes.length * CONFIG.formats.length);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ OPTYMALIZACJA ZAKOŃCZONA');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`📊 Statystyki:`);
  console.log(`   • Przetworzono obrazów: ${totalImages}`);
  console.log(`   • Wygenerowano wariantów: ${totalVariants}`);
  console.log(`   • Czas wykonania: ${duration}s`);
  console.log(`   • Formaty: AVIF, WebP, JPEG`);
  console.log(`   • Rozmiary: ${CONFIG.sizes.join('px, ')}px`);
  console.log('\n🎯 Następne kroki:');
  console.log('   1. Sprawdź wygenerowane pliki w assets/images/');
  console.log('   2. Zaktualizuj HTML używając elementu <picture>');
  console.log('   3. Przetestuj na różnych urządzeniach (Mobile, Tablet, Desktop)');
  console.log('   4. Zmierz PageSpeed Score (spodziewany wzrost: +15-25 pkt)');
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

// ═══════════════════════════════════════════════════════════════════
// WATCH MODE
// ═══════════════════════════════════════════════════════════════════

const WATCH_MODE = process.argv.includes('--watch');

async function watchForChanges() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('👁️  WATCH MODE - Monitoring for new images...');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log('Watching directories:');
  CONFIG.inputDirs.forEach(dir => console.log(`  - ${dir}`));
  console.log('\nPress Ctrl+C to stop.\n');

  // Initial optimization
  await main();

  // Watch each input directory
  for (const inputDir of CONFIG.inputDirs) {
    try {
      await fs.access(inputDir);

      const watcher = require('fs').watch(inputDir, async (eventType, filename) => {
        if (!filename) return;
        if (!/\.(jpg|jpeg|png|webp|tiff)$/i.test(filename)) return;

        const fullPath = path.join(inputDir, filename);
        const outputDir = path.dirname(inputDir);

        // Small delay to ensure file is fully written
        setTimeout(async () => {
          try {
            await fs.access(fullPath);
            console.log(`\n📷 New image detected: ${filename}`);

            const image = {
              fullPath,
              filename: path.parse(filename).name,
              ext: path.parse(filename).ext,
            };

            await processImage(image, outputDir);
            console.log('✓ Ready for next image...\n');
          } catch (err) {
            // File was deleted or moved
          }
        }, 500);
      });

      console.log(`✓ Watching: ${inputDir}`);
    } catch {
      console.log(`⚠️  Directory not found (will be created): ${inputDir}`);
      await ensureDir(inputDir);
    }
  }

  console.log('\n✓ Watching for new images...\n');
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════

if (WATCH_MODE) {
  watchForChanges().catch(error => {
    console.error('❌ Watch mode error:', error.message);
    process.exit(1);
  });
} else {
  main().catch(error => {
    console.error('\n❌ BŁĄD KRYTYCZNY:\n');
    console.error(error);
    console.error('\n💡 Sprawdź czy:');
    console.error('   1. Zainstalowałeś sharp: npm install sharp --save-dev');
    console.error('   2. Katalogi originals/ istnieją i zawierają obrazy');
    console.error('   3. Masz uprawnienia do zapisu w katalogu assets/');
    process.exit(1);
  });
}
