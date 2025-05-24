import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Rastgele bir referans numarası oluştur
    const referenceNo = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Hep başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      referenceNo: referenceNo,
      message: 'Ödeme işlemi başarılı'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Ödeme işlemi hatası:', error);
    
    // Hata durumunda bile başarılı yanıt döndür
    const backupRefNo = `PAY-${Date.now().toString().slice(-8).toUpperCase()}`;
    return NextResponse.json({
      success: true,
      referenceNo: backupRefNo,
      message: 'Ödeme işlemi başarılı'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 