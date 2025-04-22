import { useState } from 'react';

interface CommunicationPreferencesFormProps {
  onPreferencesChange: (preferences: {
    emailNotification: boolean;
    smsNotification: boolean;
    phoneCall: boolean;
  }) => void;
}

export default function CommunicationPreferencesForm({ onPreferencesChange }: CommunicationPreferencesFormProps) {
  const [preferences, setPreferences] = useState({
    emailNotification: false,
    smsNotification: false,
    phoneCall: false
  });

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const newPreferences = { ...preferences, [name]: checked };
    setPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-400 mb-4">İletişim Tercihleri</h4>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="emailNotification"
            name="emailNotification"
            checked={preferences.emailNotification}
            onChange={handlePreferenceChange}
            className="rounded bg-dark-100 border-dark-100 text-primary focus:ring-primary"
          />
          <label htmlFor="emailNotification" className="text-sm text-gray-400">
            E-posta bildirimleri
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="smsNotification"
            name="smsNotification"
            checked={preferences.smsNotification}
            onChange={handlePreferenceChange}
            className="rounded bg-dark-100 border-dark-100 text-primary focus:ring-primary"
          />
          <label htmlFor="smsNotification" className="text-sm text-gray-400">
            SMS bildirimleri
          </label>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="phoneCall"
            name="phoneCall"
            checked={preferences.phoneCall}
            onChange={handlePreferenceChange}
            className="rounded bg-dark-100 border-dark-100 text-primary focus:ring-primary"
          />
          <label htmlFor="phoneCall" className="text-sm text-gray-400">
            Telefon araması
          </label>
        </div>
      </div>
    </div>
  );
} 