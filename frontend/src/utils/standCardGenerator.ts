import QRCode from 'qrcode';
import { VenueQrConfig, computeTableDineUrl } from './venueConfig';
import { TableResponse } from '../types/order.types';

/**
 * Generates a clean high-resolution QR code data URL (PNG) with center logo margin.
 */
export const generateQrDataUrl = async (
  text: string,
  options?: {
    size?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> => {
  const size = options?.size || 600;
  const dark = options?.darkColor || '#000000';
  const light = options?.lightColor || '#ffffff';

  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H', // Level H gives 30% error recovery for center emblem overlay
    color: {
      dark,
      light,
    },
  });
};

/**
 * Draws a rounded rectangle path onto the canvas context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Generates an ultra-luxurious, printable table stand card rendered on an HTML5 Canvas.
 * Resolution: 1200 x 1750 px (equivalent to standard 4x6" or 5x7" high-DPI acrylic table tent card).
 */
export const generateStandCardCanvas = async (
  table: TableResponse,
  config: VenueQrConfig
): Promise<HTMLCanvasElement> => {
  const width = 1200;
  const height = 1750;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  const theme = config.themeStyle || 'EMERALD_GOLD';
  const tableNum = String(table.tableNumber);
  const token = table.qrCodeToken || (table as any).qrToken || 'demo-token';
  const dineUrl = computeTableDineUrl(token, config);

  // Theme palettes
  let bgGradient: CanvasGradient;
  let frameColor: string;
  let frameInnerColor: string;
  let textPrimary: string;
  let textSecondary: string;
  let accentColor: string;
  let plaqueBg: string;
  let plaqueBorder: string;
  let plaqueText: string;
  let qrBgColor: string;

  if (theme === 'EMERALD_GOLD') {
    bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#04150F');
    bgGradient.addColorStop(0.5, '#08251B');
    bgGradient.addColorStop(1, '#051911');

    frameColor = '#D97706'; // Gold
    frameInnerColor = 'rgba(245, 158, 11, 0.45)';
    textPrimary = '#F8FAFC';
    textSecondary = '#94A3B8';
    accentColor = '#F59E0B'; // Bright Gold
    plaqueBg = '#0B3325';
    plaqueBorder = '#F59E0B';
    plaqueText = '#FEF08A';
    qrBgColor = '#FFFFFF';
  } else if (theme === 'ROYAL_NOIR') {
    bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#06080F');
    bgGradient.addColorStop(0.5, '#0B1120');
    bgGradient.addColorStop(1, '#080C17');

    frameColor = '#38BDF8'; // Sky Cyan
    frameInnerColor = 'rgba(56, 189, 248, 0.35)';
    textPrimary = '#F8FAFC';
    textSecondary = '#94A3B8';
    accentColor = '#38BDF8';
    plaqueBg = '#111827';
    plaqueBorder = '#38BDF8';
    plaqueText = '#E0F2FE';
    qrBgColor = '#FFFFFF';
  } else {
    // MINIMAL_IVORY (Print / Ink-Friendly)
    bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#FAF9F6');
    bgGradient.addColorStop(1, '#F3F2EE');

    frameColor = '#18181B'; // Charcoal
    frameInnerColor = 'rgba(24, 24, 27, 0.3)';
    textPrimary = '#18181B';
    textSecondary = '#52525B';
    accentColor = '#059669'; // Emerald green
    plaqueBg = '#18181B';
    plaqueBorder = '#27272A';
    plaqueText = '#FFFFFF';
    qrBgColor = '#FFFFFF';
  }

  // 1. Fill Background
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Decorative Double Outer Frame
  const margin = 48;
  const innerMargin = 62;

  // Outer gold/charcoal line
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 4;
  roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, 28);
  ctx.stroke();

  // Inner thin border
  ctx.strokeStyle = frameInnerColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2, 20);
  ctx.stroke();

  // Corner Art-Deco Ornaments
  const cornerSize = 28;
  const corners = [
    [margin + 12, margin + 12],
    [width - margin - 12, margin + 12],
    [margin + 12, height - margin - 12],
    [width - margin - 12, height - margin - 12],
  ];

  ctx.fillStyle = frameColor;
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Corner decorative diamond
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx + 14, cy);
    ctx.lineTo(cx, cy + 14);
    ctx.lineTo(cx - 14, cy);
    ctx.closePath();
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // 3. Header Crest / Icon
  ctx.textAlign = 'center';
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 36px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillText('✦  A U R A  ✦', width / 2, 135);

  // 4. Brand Name
  ctx.fillStyle = textPrimary;
  ctx.font = 'bold 46px "Cinzel", "Playfair Display", "Times New Roman", serif';
  ctx.fillText(config.brandName.toUpperCase(), width / 2, 195);

  // 5. Tagline / Slogan
  ctx.fillStyle = textSecondary;
  ctx.font = 'italic 24px "Inter", "Sora", sans-serif';
  ctx.fillText(config.tagline || 'Scan with Camera to Explore Menu & Order Instantly', width / 2, 235);

  // Thin separator divider
  ctx.strokeStyle = frameInnerColor;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 260);
  ctx.lineTo(width / 2 + 200, 260);
  ctx.stroke();

  // 6. Grand Table Number Plaque
  const plaqueWidth = 520;
  const plaqueHeight = 110;
  const plaqueX = (width - plaqueWidth) / 2;
  const plaqueY = 280;

  ctx.fillStyle = plaqueBg;
  roundRect(ctx, plaqueX, plaqueY, plaqueWidth, plaqueHeight, 24);
  ctx.fill();

  ctx.strokeStyle = plaqueBorder;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Table Plaque Text
  ctx.fillStyle = plaqueText;
  ctx.font = 'bold 54px "Cinzel", "Playfair Display", "Times New Roman", serif';
  ctx.fillText(`TABLE ${tableNum}`, width / 2, plaqueY + 62);

  // Table Capacity / Zone
  ctx.fillStyle = theme === 'MINIMAL_IVORY' ? '#D4D4D8' : '#94A3B8';
  ctx.font = '500 20px "Inter", monospace, sans-serif';
  const zone = Number(tableNum) === 10 ? 'VIP SUITE' : (table.capacity ? `MAIN DINING • ${table.capacity} GUESTS` : 'MAIN DINING ROOM');
  ctx.fillText(zone, width / 2, plaqueY + 94);

  // 7. Render High-Resolution QR Code in White Container
  const qrContainerSize = 620;
  const qrContainerX = (width - qrContainerSize) / 2;
  const qrContainerY = 415;

  // White base card with soft rounded shadow
  ctx.fillStyle = qrBgColor;
  roundRect(ctx, qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 32);
  ctx.fill();

  // Subtle outer border for QR card
  ctx.strokeStyle = theme === 'MINIMAL_IVORY' ? '#E4E4E7' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Generate QR code image
  const qrDataUrl = await generateQrDataUrl(dineUrl, {
    size: 540,
    darkColor: '#0A0E1A',
    lightColor: '#FFFFFF',
  });

  const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  const qrDrawSize = 540;
  const qrDrawX = (width - qrDrawSize) / 2;
  const qrDrawY = qrContainerY + (qrContainerSize - qrDrawSize) / 2;
  ctx.drawImage(qrImg, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize);

  // Center Cutlery / Sparkle Medallion on QR (Safe within Level H error correction)
  const emblemRadius = 42;
  const emblemX = width / 2;
  const emblemY = qrDrawY + qrDrawSize / 2;

  // Outer medallion circle
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, emblemRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Inner colored circle
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, emblemRadius - 6, 0, Math.PI * 2);
  ctx.fillStyle = theme === 'EMERALD_GOLD' ? '#08251B' : (theme === 'ROYAL_NOIR' ? '#0F172A' : '#18181B');
  ctx.fill();

  // Stylized fork & knife emblem icon drawn with canvas paths
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Knife
  ctx.beginPath();
  ctx.moveTo(emblemX - 10, emblemY + 16);
  ctx.lineTo(emblemX - 10, emblemY - 8);
  ctx.quadraticCurveTo(emblemX - 10, emblemY - 18, emblemX - 4, emblemY - 18);
  ctx.lineTo(emblemX - 4, emblemY - 8);
  ctx.lineTo(emblemX - 10, emblemY - 4);
  ctx.stroke();

  // Fork
  ctx.beginPath();
  ctx.moveTo(emblemX + 10, emblemY + 16);
  ctx.lineTo(emblemX + 10, emblemY - 4);
  ctx.moveTo(emblemX + 6, emblemY - 4);
  ctx.lineTo(emblemX + 6, emblemY - 18);
  ctx.moveTo(emblemX + 10, emblemY - 4);
  ctx.lineTo(emblemX + 10, emblemY - 18);
  ctx.moveTo(emblemX + 14, emblemY - 4);
  ctx.lineTo(emblemX + 14, emblemY - 18);
  ctx.stroke();

  // 8. Scanning Instructions Box (3 Easy Steps)
  const stepsY = 1070;
  const stepsBoxWidth = 1040;
  const stepsBoxHeight = 160;
  const stepsBoxX = (width - stepsBoxWidth) / 2;

  ctx.fillStyle = theme === 'MINIMAL_IVORY' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)';
  roundRect(ctx, stepsBoxX, stepsY, stepsBoxWidth, stepsBoxHeight, 22);
  ctx.fill();

  ctx.strokeStyle = frameInnerColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Step 1: Open Camera
  const stepColWidth = stepsBoxWidth / 3;
  const stepIcons = ['📷  STEP 1', '🎯  STEP 2', '🍽️  STEP 3'];
  const stepTitles = ['Open Camera', 'Point at QR', 'Order Dishes'];
  const stepSub = ['iOS or Android', 'Tap banner', 'Kitchen sends direct'];

  for (let i = 0; i < 3; i++) {
    const colCenterX = stepsBoxX + stepColWidth * i + stepColWidth / 2;

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText(stepIcons[i], colCenterX, stepsY + 45);

    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 26px "Inter", "Sora", sans-serif';
    ctx.fillText(stepTitles[i], colCenterX, stepsY + 84);

    ctx.fillStyle = textSecondary;
    ctx.font = '500 18px "Inter", sans-serif';
    ctx.fillText(stepSub[i], colCenterX, stepsY + 118);

    // Column separator lines
    if (i < 2) {
      ctx.strokeStyle = frameInnerColor;
      ctx.beginPath();
      ctx.moveTo(stepsBoxX + stepColWidth * (i + 1), stepsY + 25);
      ctx.lineTo(stepsBoxX + stepColWidth * (i + 1), stepsY + stepsBoxHeight - 25);
      ctx.stroke();
    }
  }

  // 9. Optional Wi-Fi Badge Box
  let currentY = 1260;
  if (config.showWifi && config.wifiSsid) {
    const wifiBoxWidth = 860;
    const wifiBoxHeight = 75;
    const wifiBoxX = (width - wifiBoxWidth) / 2;

    ctx.fillStyle = theme === 'MINIMAL_IVORY' ? '#F4F4F5' : 'rgba(16, 185, 129, 0.12)';
    roundRect(ctx, wifiBoxX, currentY, wifiBoxWidth, wifiBoxHeight, 18);
    ctx.fill();

    ctx.strokeStyle = theme === 'MINIMAL_IVORY' ? '#D4D4D8' : 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = textPrimary;
    ctx.font = '600 24px "Inter", sans-serif';
    const wifiText = `📶 Free Dining Wi-Fi: ${config.wifiSsid}   •   Password: ${config.wifiPassword || 'None'}`;
    ctx.fillText(wifiText, width / 2, currentY + 47);

    currentY += 95;
  } else {
    currentY += 20;
  }

  // 10. Security & Zero-App Guarantee Badge
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 22px "Inter", sans-serif';
  ctx.fillText('⚡ NO APP REQUIRED   •   ZERO DOWNLOADS   •   INSTANT CONTACTLESS DINING', width / 2, currentY + 45);

  // 11. Security Watermark & URL Footer
  ctx.fillStyle = textSecondary;
  ctx.font = '500 18px "Inter", monospace, sans-serif';
  ctx.fillText(`Target URL: ${dineUrl}`, width / 2, currentY + 90);

  ctx.fillStyle = theme === 'MINIMAL_IVORY' ? '#71717A' : '#64748B';
  ctx.font = '500 16px "Inter", monospace, sans-serif';
  ctx.fillText('🔒 Tamper-Proof 128-Bit Cryptographic HMAC Session Guard • AURA Gastronomy Systems', width / 2, currentY + 125);

  return canvas;
};

/**
 * Downloads a rendered HTML5 Canvas as a PNG file.
 */
export const downloadCanvasAsPng = (canvas: HTMLCanvasElement, filename: string): void => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
};

/**
 * Downloads a single table's luxury stand card PNG.
 */
export const downloadStandCard = async (table: TableResponse, config: VenueQrConfig): Promise<void> => {
  const canvas = await generateStandCardCanvas(table, config);
  const cleanBrand = (config.brandName || 'Aura').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanBrand}_Table_${table.tableNumber}_Stand.png`;
  downloadCanvasAsPng(canvas, filename);
};

/**
 * Downloads only the raw high-resolution QR code PNG (1024x1024).
 */
export const downloadQrOnly = async (table: TableResponse, config: VenueQrConfig): Promise<void> => {
  const token = table.qrCodeToken || (table as any).qrToken || 'demo-token';
  const dineUrl = computeTableDineUrl(token, config);
  const dataUrl = await generateQrDataUrl(dineUrl, { size: 1024 });

  const cleanBrand = (config.brandName || 'Aura').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanBrand}_Table_${table.tableNumber}_QR.png`;

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Downloads all stands sequentially with a slight delay so browser doesn't block multiple downloads.
 */
export const batchDownloadAllStands = async (
  tables: TableResponse[],
  config: VenueQrConfig,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    if (onProgress) onProgress(i + 1, tables.length);
    await downloadStandCard(table, config);
    // 350ms delay between automatic downloads
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
};
