import React, { useState } from 'react';
import { FaUser, FaPhone, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';

interface BillingAddressFormProps {
  onAddressChange: (address: BillingAddress) => void;
  initialAddress?: BillingAddress;
}

export interface BillingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
}

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri'
];

const districts: { [key: string]: string[] } = {
  'İstanbul': ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Ataşehir', 'Maltepe', 'Bakırköy', 'Şişli'],
  'Ankara': ['Çankaya', 'Keçiören', 'Mamak', 'Yenimahalle', 'Etimesgut'],
  'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Çiğli'],
  // Diğer şehirler için ilçeler eklenebilir
};

export default function BillingAddressForm({ onAddressChange, initialAddress }: BillingAddressFormProps) {
  const [address, setAddress] = useState<BillingAddress>(initialAddress || {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zipCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newAddress = { ...address, [name]: value };
    setAddress(newAddress);
    onAddressChange(newAddress);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    const newAddress = { ...address, phone: formatted };
    setAddress(newAddress);
    onAddressChange(newAddress);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          <FaUser className="inline-block mr-2" />
          Ad Soyad
        </label>
        <input
          type="text"
          name="fullName"
          value={address.fullName}
          onChange={handleChange}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          <FaPhone className="inline-block mr-2" />
          Telefon
        </label>
        <div className="flex">
          <div className="flex items-center px-3 bg-dark-100 rounded-l-md border border-dark-100 text-gray-400">
            +90
          </div>
          <input
            type="tel"
            name="phone"
            value={address.phone}
            onChange={handlePhoneChange}
            placeholder="5XX XXX XXXX"
            className="w-full rounded-r-md bg-dark-100 border-dark-100 text-gray-100 focus:border-primary focus:ring-primary"
            required
            maxLength={12}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          <FaBuilding className="inline-block mr-2" />
          Şehir
        </label>
        <select
          name="city"
          value={address.city}
          onChange={handleChange}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          required
        >
          <option value="">Şehir seçiniz</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {address.city && districts[address.city] && (
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <FaBuilding className="inline-block mr-2" />
            İlçe
          </label>
          <select
            name="district"
            value={address.district}
            onChange={handleChange}
            className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
            required
          >
            <option value="">İlçe seçiniz</option>
            {districts[address.city].map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          <FaMapMarkerAlt className="inline-block mr-2" />
          Adres
        </label>
        <textarea
          name="address"
          value={address.address}
          onChange={handleChange}
          rows={3}
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          <FaMapMarkerAlt className="inline-block mr-2" />
          Posta Kodu
        </label>
        <input
          type="text"
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          placeholder="34000"
          className="w-full bg-dark-400 border border-gray-700 rounded-lg p-2 text-white"
          required
          maxLength={5}
        />
      </div>
    </div>
  );
} 