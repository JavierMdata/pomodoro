import sharp from 'sharp';
import fs from 'fs';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = './public/icons/icon.svg';
const outputDir = './public/icons/';

// Asegurarse de que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar iconos PNG desde SVG
async function generateIcons() {
  console.log('🎨 Generando iconos PWA...');

  for (const size of sizes) {
    const outputPath = `${outputDir}icon-${size}x${size}.png`;

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generando icono ${size}x${size}:`, error.message);
    }
  }

  console.log('🎉 Iconos generados exitosamente!');
}

generateIcons().catch(console.error);
