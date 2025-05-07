import React, { useState } from 'react';
import { FaFileContract, FaShieldAlt, FaUserShield } from 'react-icons/fa';
import Link from 'next/link';

interface AgreementsSectionProps {
  onAgreementChange: (agreed: boolean) => void;
}

export default function AgreementsSection({ onAgreementChange }: AgreementsSectionProps) {
  const [agreements, setAgreements] = useState({
    distanceSales: false,
    kvkk: false,
    userAgreement: false
  });

  const handleAgreementChange = (type: keyof typeof agreements) => {
    const newAgreements = {
      ...agreements,
      [type]: !agreements[type]
    };
    setAgreements(newAgreements);
    onAgreementChange(Object.values(newAgreements).every(Boolean));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <FaFileContract className="text-primary" />
        Sözleşmeler
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="distanceSales"
            checked={agreements.distanceSales}
            onChange={() => handleAgreementChange('distanceSales')}
            className="mt-1 w-4 h-4 text-primary bg-dark-400 border-gray-700 rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="distanceSales" className="text-sm text-gray-300">
            <Link href="/sozlesmeler/mesafeli-satis-sozlesmesi" className="text-primary hover:text-primary/80">
              Mesafeli Satış Sözleşmesi
            </Link>
            'ni okudum ve kabul ediyorum.
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="kvkk"
            checked={agreements.kvkk}
            onChange={() => handleAgreementChange('kvkk')}
            className="mt-1 w-4 h-4 text-primary bg-dark-400 border-gray-700 rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="kvkk" className="text-sm text-gray-300">
            <Link href="/sozlesmeler/kvkk" className="text-primary hover:text-primary/80">
              KVKK Aydınlatma Metni
            </Link>
            'ni okudum ve kabul ediyorum.
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="userAgreement"
            checked={agreements.userAgreement}
            onChange={() => handleAgreementChange('userAgreement')}
            className="mt-1 w-4 h-4 text-primary bg-dark-400 border-gray-700 rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="userAgreement" className="text-sm text-gray-300">
            <Link href="/sozlesmeler/kullanim-kosullari" className="text-primary hover:text-primary/80">
              Kullanıcı Sözleşmesi
            </Link>
            'ni okudum ve kabul ediyorum.
          </label>
        </div>
      </div>

      <div className="mt-4 p-4 bg-dark-300 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 text-gray-300 mb-2">
          <FaShieldAlt className="text-primary" />
          <span className="font-medium">Kişisel Verilerin Korunması</span>
        </div>
        <p className="text-sm text-gray-400">
          Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir. 
          Detaylı bilgi için{' '}
          <Link href="/sozlesmeler/kvkk" className="text-primary hover:text-primary/80">
            KVKK Aydınlatma Metni
          </Link>
          'ni inceleyebilirsiniz.
        </p>
      </div>
    </div>
  );
} 