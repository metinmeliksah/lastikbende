'use client';

import { ChangeEvent, useEffect } from 'react';

interface CommunicationPreferencesFormProps {
  formData: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function CommunicationPreferencesForm({ formData, onChange }: CommunicationPreferencesFormProps) {
  // Bileşen yüklendiğinde form verilerini konsola yazdır
  useEffect(() => {
    console.log('CommunicationPreferencesForm yüklendi:', formData);
  }, [formData]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">İletişim Tercihleri</h3>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={onChange}
              className="h-4 w-4 text-primary border-dark-200 rounded focus:ring-primary"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="emailNotifications" className="font-medium text-gray-300">
              E-posta Bildirimleri
            </label>
            <p className="text-gray-400">Sipariş durumu ve önemli güncellemeler hakkında e-posta almak istiyorum</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="smsNotifications"
              name="smsNotifications"
              type="checkbox"
              checked={formData.smsNotifications}
              onChange={onChange}
              className="h-4 w-4 text-primary border-dark-200 rounded focus:ring-primary"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="smsNotifications" className="font-medium text-gray-300">
              SMS Bildirimleri
            </label>
            <p className="text-gray-400">Sipariş durumu ve önemli güncellemeler hakkında SMS almak istiyorum</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="marketingEmails"
              name="marketingEmails"
              type="checkbox"
              checked={formData.marketingEmails}
              onChange={onChange}
              className="h-4 w-4 text-primary border-dark-200 rounded focus:ring-primary"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="marketingEmails" className="font-medium text-gray-300">
              Pazarlama E-postaları
            </label>
            <p className="text-gray-400">Kampanyalar, indirimler ve yeni ürünler hakkında e-posta almak istiyorum</p>
          </div>
        </div>
      </div>
    </div>
  );
} 