import Link from 'next/link'
import { FaFileContract, FaUserShield, FaHandshake, FaExchangeAlt, FaFileSignature } from 'react-icons/fa'

export default function SozlesmelerPage() {
  const sozlesmeler = [
    {
      baslik: 'Üyelik Sözleşmesi',
      aciklama: 'Sitemize üye olurken kabul ettiğiniz üyelik koşulları ve kurallar.',
      icon: FaUserShield,
      link: '/sozlesmeler/uyelik-sozlesmesi'
    },
    {
      baslik: 'Gizlilik Politikası',
      aciklama: 'Kişisel verilerinizin nasıl işlendiği ve korunduğu hakkında bilgiler.',
      icon: FaFileContract,
      link: '/sozlesmeler/gizlilik-politikasi'
    },
    {
      baslik: 'Kullanım Koşulları',
      aciklama: 'Sitemizi kullanırken uymanız gereken kurallar ve koşullar.',
      icon: FaHandshake,
      link: '/sozlesmeler/kullanim-kosullari'
    },
    {
      baslik: 'İade Politikası',
      aciklama: 'Ürün iade ve değişim süreçleri hakkında detaylı bilgiler.',
      icon: FaExchangeAlt,
      link: '/sozlesmeler/iade-politikasi'
    },
    {
      baslik: 'Mesafeli Satış Sözleşmesi',
      aciklama: 'Mesafeli satış sözleşmesi hakkında bilgiler.',
      icon: FaFileSignature,
      link: '/sozlesmeler/mesafeli-satis-sozlesmesi'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-dark-400 pt-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Sözleşmeler ve Politikalar</h1>
            <p className="text-gray-400 mt-2">Yasal düzenlemeler ve kullanıcı hakları hakkında bilgiler</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {sozlesmeler.map((sozlesme, index) => {
            const Icon = sozlesme.icon
            return (
              <Link 
                href={sozlesme.link} 
                key={index}
                className="block bg-dark-300 border border-gray-700 rounded-lg hover:border-primary transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h2 className="text-xl font-semibold text-white">
                        {sozlesme.baslik}
                      </h2>
                      <p className="text-gray-400 mt-1">
                        {sozlesme.aciklama}
                      </p>
                    </div>
                    <div className="ml-4">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 