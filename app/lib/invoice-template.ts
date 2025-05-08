export function generateInvoiceHTML(order: any) {
  // Sayısal değerleri formatla
  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fatura #${order.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 16px;
          color: #666;
        }
        .customer-info {
          margin-bottom: 30px;
        }
        .customer-info h3 {
          margin-bottom: 10px;
          color: #333;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .total-section {
          text-align: right;
          margin-top: 20px;
        }
        .total-row {
          margin: 5px 0;
        }
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #eee;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
        @media (max-width: 600px) {
          .header {
            flex-direction: column;
            text-align: center;
          }
          .invoice-info {
            text-align: center;
            margin-top: 20px;
          }
          .items-table {
            font-size: 14px;
          }
          .items-table th,
          .items-table td {
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <!-- Logo buraya gelecek -->
          <img src="https://res.cloudinary.com/your-cloud-name/image/upload/v1/logo.png" alt="LastikBende Logo">
        </div>
        <div class="invoice-info">
          <h1 class="invoice-title">FATURA</h1>
          <p class="invoice-number">Fatura No: FTR-${order.id}</p>
          <p>Tarih: ${formatDate(order.date)}</p>
        </div>
      </div>

      <div class="customer-info">
        <h3>Müşteri Bilgileri</h3>
        <p>Ad Soyad: ${order.customerName || 'Belirtilmemiş'}</p>
        <p>E-posta: ${order.customerEmail || 'Belirtilmemiş'}</p>
        <p>Telefon: ${order.customerPhone || 'Belirtilmemiş'}</p>
        <p>Adres: ${order.customerAddress || 'Belirtilmemiş'}</p>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Ürün</th>
            <th>Adet</th>
            <th>Birim Fiyat</th>
            <th>KDV</th>
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.price)} ₺</td>
              <td>%18</td>
              <td>${formatCurrency(item.price * item.quantity)} ₺</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Ara Toplam: ${formatCurrency(order.subtotal)} ₺</span>
        </div>
        <div class="total-row">
          <span>KDV (%18): ${formatCurrency(order.tax)} ₺</span>
        </div>
        <div class="total-row grand-total">
          <span>Genel Toplam: ${formatCurrency(order.total)} ₺</span>
        </div>
      </div>

      <div class="footer">
        <p>LastikBende - Tüm hakları saklıdır.</p>
        <p>Adres: İstanbul, Türkiye | Tel: 0850 444 0044</p>
      </div>
    </body>
    </html>
  `;
} 