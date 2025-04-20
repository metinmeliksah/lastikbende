import { motion } from 'framer-motion';
import { FaCar, FaCheckCircle } from 'react-icons/fa';
import { FieldStatus, FormData } from '../types';
import { useState, useEffect } from 'react';

interface FormSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  fieldStatus: FieldStatus;
  getInputClassName: (name: string) => string;
  t: any;
}

const FormSection: React.FC<FormSectionProps> = ({
  formData,
  handleChange,
  handleBlur,
  handleKeyDown,
  fieldStatus,
  getInputClassName,
  t
}) => {
  // Model to available sizes mapping
  const modelToSizes: { [key: string]: string[] } = {
    // Michelin models
    'Pilot Sport 4': ['225/45R17', '225/45R18', '225/40R19', '245/40R18', '245/35R19', '245/35R20'],
    'Pilot Sport 4S': ['225/45R17', '225/45R18', '225/40R19', '245/40R18', '245/35R19', '245/35R20', '265/35R19', '275/35R19'],
    'Pilot Sport 5': ['225/45R17', '225/45R18', '225/40R19', '245/40R18', '245/35R19', '245/35R20', '265/35R19', '275/35R19'],
    'Primacy 4': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    'Primacy 4+': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    'CrossClimate 2': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17', '225/55R17'],
    'CrossClimate+': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17', '225/55R17'],
    'Alpin 6': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    'X-Ice Snow': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    
    // Continental models
    'PremiumContact 6': ['205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17', '225/55R17'],
    'PremiumContact 7': ['205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17', '225/55R17'],
    'EcoContact 6': ['185/65R15', '195/65R15', '205/55R16', '205/60R16', '215/55R17'],
    'SportContact 7': ['225/45R17', '225/40R19', '245/40R18', '245/35R19', '245/35R20', '265/35R19', '275/35R19'],
    'UltraContact': ['205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17', '225/55R17'],
    'WinterContact TS 870': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17'],
    'WinterContact TS 860': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17'],
    'AllSeasonContact': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    
    // Bridgestone models
    'Turanza T005': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    'Turanza T005A': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    'Potenza Sport': ['225/45R17', '225/40R19', '245/40R18', '245/35R19', '245/35R20', '265/35R19'],
    'Potenza S007': ['225/45R17', '225/40R19', '245/40R18', '245/35R19', '245/35R20', '265/35R19'],
    'Blizzak LM005': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17'],
    'Weather Control A005 EVO': ['195/65R15', '205/55R16', '205/60R16', '215/55R17', '225/45R17', '225/50R17'],
    
    // Default sizes for other models
    'default': [
      '175/65R14', '175/70R13', '175/70R14', '185/55R15', '185/60R14', '185/60R15',
      '185/65R14', '185/65R15', '185/70R14', '195/50R15', '195/55R15', '195/55R16',
      '195/60R15', '195/60R16', '195/65R15', '195/65R16', '205/45R16', '205/45R17',
      '205/50R16', '205/50R17', '205/55R16', '205/55R17', '205/60R15', '205/60R16',
      '205/65R16', '205/70R15', '215/40R17', '215/45R16', '215/45R17', '215/45R18',
      '215/55R16', '215/55R17', '215/55R18', '215/60R16', '215/60R17', '215/65R16',
      '215/65R17', '215/70R16', '225/40R18', '225/40R19', '225/45R17', '225/45R18',
      '225/45R19', '225/50R17', '225/50R18', '225/55R16', '225/55R17', '225/55R18',
      '225/60R17', '225/60R18', '225/65R17', '225/70R16'
    ]
  };

  // State to track the debounced model
  const [debouncedModel, setDebouncedModel] = useState<string>('');
  // State to track loading state
  const [isLoadingSizes, setIsLoadingSizes] = useState<boolean>(false);
  
  // Debounce the model selection with a longer delay
  useEffect(() => {
    // Set loading state when model changes
    if (formData.model) {
      setIsLoadingSizes(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedModel(formData.model);
      setIsLoadingSizes(false);
    }, 1500); // Increased to 1500ms (1.5 seconds) delay for better user experience
    
    return () => clearTimeout(timer);
  }, [formData.model]);

  // Get available sizes for the selected model
  const getAvailableSizes = () => {
    if (!debouncedModel) return modelToSizes['default'];
    return modelToSizes[debouncedModel] || modelToSizes['default'];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
      role="form"
      aria-label="Lastik Detayları Formu"
    >
      <label className="block text-lg sm:text-xl font-medium text-white mb-4 sm:mb-6 flex items-center">
        <FaCar className="text-primary mr-2" aria-hidden="true" />
        Lastik Detayları
      </label>
      <div className="space-y-4 sm:space-y-6">
        <div className="form-field">
          <label className="form-label">
            <FaCheckCircle className="text-primary mr-2" aria-hidden="true" />
            Lastik Tipi
            <span className="text-red-500 ml-1 mr-2" aria-label="zorunlu alan">*</span>
            <div className="info-icon">
              <button
                type="button"
                className="text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                aria-label="Lastik tipi hakkında bilgi"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <div className="info-tooltip">
                Aracınızın kullanım şartlarına uygun lastik tipini seçin.
              </div>
            </div>
          </label>
          <select
            name="lastikTipi"
            value={formData.lastikTipi}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`${getInputClassName('lastikTipi')} appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.5em_1.5em] cursor-pointer hover:bg-dark-400/50 transition-all duration-200 text-white w-full py-2 px-3 rounded-lg`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
            required
            autoComplete="off"
            aria-required="true"
            aria-invalid={fieldStatus.lastikTipi ? !fieldStatus.lastikTipi.success : undefined}
          >
            <option value="" disabled className="bg-dark-300 text-white">Lastik Tipi Seçiniz</option>
            <option value="yaz" className="bg-dark-300 text-white">Yaz Lastiği</option>
            <option value="kis" className="bg-dark-300 text-white">Kış Lastiği</option>
            <option value="dortMevsim" className="bg-dark-300 text-white">4 Mevsim</option>
          </select>
          {fieldStatus.lastikTipi && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.lastikTipi.success ? 'text-green-500' : 'text-red-500'}`}
              role="alert"
            >
              {fieldStatus.lastikTipi.message}
            </motion.p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">
            <FaCheckCircle className="text-primary mr-2" aria-hidden="true" />
            Marka
            <span className="text-red-500 ml-1 mr-2" aria-label="zorunlu alan">*</span>
            <div className="info-icon">
              <button
                type="button"
                className="text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                aria-label="Marka hakkında bilgi"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <div className="info-tooltip">
                Lastik markası analiz kalitesini artırır.
              </div>
            </div>
          </label>
          <select
            name="marka"
            value={formData.marka}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`${getInputClassName('marka')} appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.5em_1.5em] cursor-pointer hover:bg-dark-400/50 transition-all duration-200 text-white w-full py-2 px-3 rounded-lg`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
            required
            autoComplete="off"
            aria-required="true"
            aria-invalid={fieldStatus.marka ? !fieldStatus.marka.success : undefined}
          >
            <option value="" disabled className="bg-dark-300 text-white">Marka Seçiniz</option>
            <option value="Michelin" className="bg-dark-300 text-white">Michelin</option>
            <option value="Continental" className="bg-dark-300 text-white">Continental</option>
            <option value="Bridgestone" className="bg-dark-300 text-white">Bridgestone</option>
            <option value="Goodyear" className="bg-dark-300 text-white">Goodyear</option>
            <option value="Pirelli" className="bg-dark-300 text-white">Pirelli</option>
            <option value="Hankook" className="bg-dark-300 text-white">Hankook</option>
            <option value="Dunlop" className="bg-dark-300 text-white">Dunlop</option>
            <option value="Yokohama" className="bg-dark-300 text-white">Yokohama</option>
            <option value="Lassa" className="bg-dark-300 text-white">Lassa</option>
            <option value="Petlas" className="bg-dark-300 text-white">Petlas</option>
            <option value="Falken" className="bg-dark-300 text-white">Falken</option>
            <option value="Kumho" className="bg-dark-300 text-white">Kumho</option>
            <option value="Toyo" className="bg-dark-300 text-white">Toyo</option>
            <option value="Nokian" className="bg-dark-300 text-white">Nokian</option>
            <option value="BFGoodrich" className="bg-dark-300 text-white">BFGoodrich</option>
            <option value="Diğer" className="bg-dark-300 text-white">Diğer</option>
          </select>
          <div className="text-xs text-gray-400 mt-1 flex items-center ml-1">
            <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Seçtiğiniz markaya göre model önerileri sunulacaktır</span>
          </div>
          {fieldStatus.marka && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.marka.success ? 'text-green-500' : 'text-red-500'}`}
              role="alert"
            >
              {fieldStatus.marka.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" aria-hidden="true" />
            Model
            <span className="text-red-500 ml-1" aria-label="zorunlu alan">*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Örn: Pilot Sport 4"
            className={`${getInputClassName('model')} ${formData.marka ? 'bg-dark-300 hover:bg-dark-400' : ''} w-full py-2 px-3 rounded-lg`}
            required
            list="modelSuggestions"
            autoComplete="off"
            aria-required="true"
            aria-invalid={fieldStatus.model ? !fieldStatus.model.success : undefined}
          />
          <div className="text-xs text-gray-400 mt-1 flex items-center ml-1">
            <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{formData.marka ? `Marka seçildi, öneriler görüntüleniyor` : 'Önce marka seçin'}</span>
            {isLoadingSizes && (
              <span className="ml-2 flex items-center">
                <svg className="animate-spin h-4 w-4 text-primary mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Yükleniyor...</span>
              </span>
            )}
          </div>
          <datalist id="modelSuggestions">
            {formData.marka && (
              <option disabled style={{ fontWeight: 'bold', color: '#FF4444' }} value="-- Öneriler --"></option>
            )}
            {formData.marka === 'Michelin' && (
              <>
                <option value="Pilot Sport 4" />
                <option value="Pilot Sport 4S" />
                <option value="Pilot Sport 5" />
                <option value="Primacy 4" />
                <option value="Primacy 4+" />
                <option value="CrossClimate 2" />
                <option value="CrossClimate+" />
                <option value="Alpin 6" />
                <option value="X-Ice Snow" />
                <option value="Latitude Sport 3" />
                <option value="Agilis 3" />
                <option value="Energy Saver+" />
                <option value="LTX Trail" />
              </>
            )}
            {formData.marka === 'Continental' && (
              <>
                <option value="PremiumContact 6" />
                <option value="PremiumContact 7" />
                <option value="EcoContact 6" />
                <option value="SportContact 7" />
                <option value="UltraContact" />
                <option value="WinterContact TS 870" />
                <option value="WinterContact TS 860" />
                <option value="AllSeasonContact" />
                <option value="CrossContact ATR" />
                <option value="ContiSportContact 5" />
                <option value="ContiCrossContact LX Sport" />
              </>
            )}
            {formData.marka === 'Bridgestone' && (
              <>
                <option value="Turanza T005" />
                <option value="Turanza T005A" />
                <option value="Potenza Sport" />
                <option value="Potenza S007" />
                <option value="Potenza RE980AS" />
                <option value="Blizzak LM005" />
                <option value="Blizzak DM-V2" />
                <option value="Weather Control A005 EVO" />
                <option value="Dueler H/P Sport" />
                <option value="Dueler A/T 001" />
                <option value="Ecopia EP150" />
                <option value="Alenza 001" />
              </>
            )}
            {formData.marka === 'Goodyear' && (
              <>
                <option value="Eagle F1 Asymmetric 5" />
                <option value="Eagle F1 Asymmetric 6" />
                <option value="Eagle F1 SuperSport" />
                <option value="EfficientGrip 2 SUV" />
                <option value="EfficientGrip Performance 2" />
                <option value="Vector 4Seasons Gen-3" />
                <option value="UltraGrip Performance+" />
                <option value="UltraGrip 9+" />
                <option value="Wrangler AT Adventure" />
                <option value="Wrangler HP All Weather" />
              </>
            )}
            {formData.marka === 'Pirelli' && (
              <>
                <option value="P Zero" />
                <option value="P Zero PZ4" />
                <option value="P Zero Winter" />
                <option value="Cinturato P7" />
                <option value="Cinturato P7 (P7C2)" />
                <option value="Cinturato All Season Plus" />
                <option value="Scorpion Verde" />
                <option value="Scorpion Zero All Season" />
                <option value="Scorpion All Terrain Plus" />
                <option value="Winter Sottozero 3" />
                <option value="Ice Zero 2" />
              </>
            )}
            {formData.marka === 'Hankook' && (
              <>
                <option value="Ventus S1 Evo3" />
                <option value="Ventus Prime4" />
                <option value="Ventus V12 Evo2" />
                <option value="Kinergy 4S2" />
                <option value="Kinergy Eco2" />
                <option value="Winter i*cept RS2" />
                <option value="Winter i*cept Evo3" />
                <option value="Winter i*Pike RS2" />
                <option value="Dynapro AT2" />
                <option value="Dynapro HP2" />
              </>
            )}
            {formData.marka === 'Dunlop' && (
              <>
                <option value="Sport Maxx RT2" />
                <option value="Sport Maxx RT" />
                <option value="Sport BluResponse" />
                <option value="SP Winter Sport 4D" />
                <option value="Winter Sport 5" />
                <option value="Winter Sport 5 SUV" />
                <option value="SP Winter Response 2" />
                <option value="Grandtrek AT3" />
                <option value="Grandtrek ST20" />
                <option value="Econodrive" />
              </>
            )}
            {formData.marka === 'Yokohama' && (
              <>
                <option value="ADVAN Sport V105" />
                <option value="ADVAN Fleva V701" />
                <option value="BluEarth GT AE51" />
                <option value="BluEarth Winter V905" />
                <option value="BluEarth-4S AW21" />
                <option value="Geolandar A/T G015" />
                <option value="Geolandar H/T G056" />
                <option value="Geolandar M/T G003" />
                <option value="iceGUARD iG60" />
                <option value="W.Drive V905" />
              </>
            )}
            {formData.marka === 'Lassa' && (
              <>
                <option value="Driveways" />
                <option value="Driveways Sport" />
                <option value="Competus H/P" />
                <option value="Competus H/L" />
                <option value="Snoways 4" />
                <option value="Snoways ERA" />
                <option value="Greenways" />
                <option value="Impetus Revo" />
                <option value="Impetus Revo 2+" />
                <option value="Multiways" />
                <option value="Wintus 2" />
                <option value="Transway 2" />
              </>
            )}
            {formData.marka === 'Petlas' && (
              <>
                <option value="Elegant Premium" />
                <option value="Explero PT411" />
                <option value="Explero PT431" />
                <option value="Full Power PT825+" />
                <option value="Imperium PT515" />
                <option value="Multi Action PT536" />
                <option value="Snow Master W651" />
                <option value="Snow Master W661" />
                <option value="Velox Sport PT741" />
                <option value="Full Grip PT925" />
              </>
            )}
            {formData.marka === 'Falken' && (
              <>
                <option value="AZENIS FK510" />
                <option value="ZIEX ZE310 Ecorun" />
                <option value="EUROALL SEASON AS210" />
                <option value="EUROWINTER HS01" />
                <option value="EUROWINTER HS01 SUV" />
                <option value="SINCERA SN110" />
                <option value="WILDPEAK A/T AT3WA" />
                <option value="WILDPEAK M/T" />
                <option value="LINAM VAN01" />
              </>
            )}
            {formData.marka === 'Kumho' && (
              <>
                <option value="Ecsta PS71" />
                <option value="Ecsta PS91" />
                <option value="Ecsta HS51" />
                <option value="Solus 4S HA32" />
                <option value="WinterCraft WP51" />
                <option value="WinterCraft WP71" />
                <option value="WinterCraft WS71" />
                <option value="Road Venture AT61" />
                <option value="PorTran CW51" />
              </>
            )}
            {formData.marka === 'Toyo' && (
              <>
                <option value="Proxes Sport" />
                <option value="Proxes CF2" />
                <option value="Proxes CF2 SUV" />
                <option value="Proxes T1 Sport" />
                <option value="Celsius" />
                <option value="Observe GSi-6" />
                <option value="Observe GSi-6 HP" />
                <option value="Open Country A/T plus" />
                <option value="Open Country M/T" />
                <option value="Open Country W/T" />
              </>
            )}
            {formData.marka === 'Nokian' && (
              <>
                <option value="Wetproof" />
                <option value="Powerproof" />
                <option value="Snowproof" />
                <option value="Snowproof P" />
                <option value="Hakkapeliitta R3" />
                <option value="Hakkapeliitta R3 SUV" />
                <option value="Hakkapeliitta 10" />
                <option value="Hakkapeliitta 10 SUV" />
                <option value="Outpost AT" />
                <option value="Seasonproof" />
                <option value="Weatherproof" />
              </>
            )}
            {formData.marka === 'BFGoodrich' && (
              <>
                <option value="Advantage T/A Sport" />
                <option value="g-Force COMP-2 A/S Plus" />
                <option value="g-Force Winter 2" />
                <option value="All-Terrain T/A KO2" />
                <option value="Mud-Terrain T/A KM3" />
                <option value="Urban Terrain T/A" />
                <option value="Advantage Control" />
                <option value="Trail Terrain T/A" />
                <option value="Commercial T/A All-Season 2" />
              </>
            )}
          </datalist>
          {fieldStatus.model && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.model.success ? 'text-green-500' : 'text-red-500'}`}
              role="alert"
            >
              {fieldStatus.model.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" aria-hidden="true" />
            Ebat
            <div className="info-icon">
              <button
                type="button"
                className="text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                aria-label="Ebat hakkında bilgi"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <div className="info-tooltip">
                Genişlik/Profil/Çap formatında girin. (Örn: 205/55R16)
              </div>
            </div>
          </label>
          <div className="relative">
            <input
              type="text"
              name="ebat"
              value={formData.ebat}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Örn: 205/55R16"
              className={`${getInputClassName('ebat')} hover:bg-dark-400 w-full py-2 px-3 rounded-lg ${isLoadingSizes ? 'opacity-50' : ''}`}
              list="ebatSuggestions"
              autoComplete="off"
              aria-required="true"
              aria-invalid={fieldStatus.ebat ? !fieldStatus.ebat.success : undefined}
              disabled={isLoadingSizes}
            />
            {isLoadingSizes && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center ml-1">
            <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              {isLoadingSizes 
                ? "Model seçimine göre ebatlar yükleniyor..." 
                : formData.model 
                  ? "Seçilen modele uygun ebatlar" 
                  : "Genişlik/Profil/Çap formatında girin (Örneğin: 205/55R16)"}
            </span>
          </div>
          <datalist id="ebatSuggestions">
            <option disabled style={{ fontWeight: 'bold', color: '#FF4444' }} value="-- Önerilen Ebatlar --"></option>
            {getAvailableSizes().map((size, index) => (
              <option key={index} value={size} />
            ))}
          </datalist>
          {fieldStatus.ebat && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.ebat.success ? 'text-green-500' : 'text-red-500'}`}
              role="alert"
            >
              {fieldStatus.ebat.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" aria-hidden="true" />
            Üretim Yılı
            <span className="text-red-500 ml-1 mr-2" aria-label="zorunlu alan">*</span>
            <div className="info-icon">
              <button
                type="button"
                className="text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                aria-label="Üretim yılı hakkında bilgi"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <div className="info-tooltip">
                Lastiğin DOT kodundaki son 4 rakamın ilk 2 rakamı üretim haftası, son 2 rakamı üretim yılıdır. (Örn: 2023)
              </div>
            </div>
          </label>
          <input
            type="number"
            name="uretimYili"
            value={formData.uretimYili}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Örn: 2023"
            min="1900"
            max={new Date().getFullYear() + 1}
            className={`${getInputClassName('uretimYili')} w-full py-2 px-3 rounded-lg`}
            required
            autoComplete="off"
            aria-required="true"
            aria-invalid={fieldStatus.uretimYili ? !fieldStatus.uretimYili.success : undefined}
          />
          {fieldStatus.uretimYili && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.uretimYili.success ? 'text-green-500' : 'text-red-500'}`}
              role="alert"
            >
              {fieldStatus.uretimYili.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" aria-hidden="true" />
            Kilometre
            <div className="info-icon">
              <button
                type="button"
                className="text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                aria-label="Kilometre hakkında bilgi"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <div className="info-tooltip">
                Aracın güncel kilometresi
              </div>
            </div>
          </label>
          <div className="relative">
            <input
              type="text"
              name="kilometre"
              value={formData.kilometre}
              onChange={(e) => {
                // Sadece sayı girişine izin ver
                const value = e.target.value.replace(/[^\d]/g, '');
                handleChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: 'kilometre',
                    value
                  }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              onBlur={(e) => {
                // Blur olduğunda formatlama yap
                if (e.target.value) {
                  const formattedValue = parseInt(e.target.value).toLocaleString('tr-TR');
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: 'kilometre',
                      value: formattedValue
                    }
                  } as React.ChangeEvent<HTMLInputElement>);
                }
                handleBlur(e);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Örn: 50.000"
              className={`${getInputClassName('kilometre')} w-full py-2 px-3 rounded-lg`}
              autoComplete="off"
              aria-required="true"
              aria-invalid={fieldStatus.kilometre ? !fieldStatus.kilometre.success : undefined}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">km</span>
          </div>
          {fieldStatus.kilometre && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.kilometre.success ? 'text-green-500' : 'text-red-500'}`}
              role="alert"
            >
              {fieldStatus.kilometre.message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FormSection; 