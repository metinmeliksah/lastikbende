import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { v2 as cloudinary } from 'cloudinary';
import { generateInvoiceHTML } from '@/app/lib/invoice-template';

// Cloudinary konfigürasyonu
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

// Cloudinary yapılandırma bilgilerini kontrol et
console.log('Environment Variables:', {
  cloudName: cloudName || 'undefined',
  apiKey: apiKey ? '***' + apiKey.slice(-4) : 'undefined',
  apiSecret: apiSecret ? '***' + apiSecret.slice(-4) : 'undefined'
});

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Cloudinary yapılandırma bilgileri eksik. Lütfen .env.local dosyasını kontrol edin.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

export async function POST(request: Request) {
  let browser;
  try {
    const { order } = await request.json();
    console.log('Fatura oluşturma isteği alındı:', { orderId: order.id });

    // HTML fatura şablonunu oluştur
    const htmlContent = generateInvoiceHTML(order);
    console.log('HTML şablonu oluşturuldu');

    // Puppeteer ile PDF oluştur
    console.log('PDF oluşturma başlıyor...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-extensions'
      ]
    });

    const page = await browser.newPage();
    
    // PDF için ek yapılandırmalar
    await page.emulateMediaType('print');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Yazdırma için optimize edilmiş PDF ayarları
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });

    console.log('PDF oluşturuldu, boyut:', pdfBuffer.length);

    // PDF'i Cloudinary'ye yükle
    console.log('Cloudinary yükleme başlıyor...');
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'invoices',
          public_id: `FTR-${order.id}.pdf`,
          format: 'pdf',
          overwrite: true,
          invalidate: true,
          access_mode: 'public',
          type: 'upload',
          use_filename: true,
          unique_filename: true,
          allowed_formats: ['pdf']
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary yükleme hatası:', error);
            reject(error);
          } else {
            console.log('Cloudinary yükleme başarılı:', result);
            resolve(result);
          }
        }
      );

      // Buffer'ı stream'e dönüştür ve yükle
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(pdfBuffer);
      bufferStream.pipe(uploadStream);
    });

    // PDF'in doğru yüklendiğini kontrol et
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('PDF yükleme başarısız: URL alınamadı');
    }

    // PDF URL'sini oluştur
    const pdfUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/v${uploadResult.version}/invoices/FTR-${order.id}.pdf`;

    // URL'in erişilebilir olduğunu kontrol et
    try {
      const checkResponse = await fetch(pdfUrl);
      if (!checkResponse.ok) {
        console.error('PDF erişim kontrolü başarısız:', {
          status: checkResponse.status,
          statusText: checkResponse.statusText,
          url: pdfUrl
        });
        throw new Error(`PDF erişilebilir değil: ${checkResponse.status} ${checkResponse.statusText}`);
      }
      console.log('PDF erişim kontrolü başarılı:', pdfUrl);
    } catch (error) {
      console.error('PDF erişim kontrolü hatası:', error);
      throw new Error('PDF erişim kontrolü başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }

    return NextResponse.json({
      fileName: `FTR-${order.id}.pdf`,
      downloadUrl: pdfUrl
    });

  } catch (error) {
    console.error('Fatura oluşturma hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fatura oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 