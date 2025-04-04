import { motion } from 'framer-motion';
import { FaCar, FaCheckCircle } from 'react-icons/fa';
import { FieldStatus, FormData } from '../types';

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
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-dark-200 p-8 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <label className="block text-xl font-medium text-white mb-6 flex items-center">
        <FaCar className="text-primary mr-2" />
        Lastik Detayları
      </label>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            Lastik Tipi
            <span className="text-red-500 ml-1">*</span>
            <div className="relative ml-2 group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-dark-100 rounded-md shadow-lg text-xs text-gray-300 hidden group-hover:block z-10">
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
            className={`${getInputClassName('lastikTipi')} appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.5em_1.5em] cursor-pointer hover:bg-dark-400/50 transition-all duration-200 text-white`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
            required
            autoComplete="off"
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
            >
              {fieldStatus.lastikTipi.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            Marka
            <span className="text-red-500 ml-1">*</span>
            <div className="relative ml-2 group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-dark-100 rounded-md shadow-lg text-xs text-gray-300 hidden group-hover:block z-10">
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
            className={`${getInputClassName('marka')} appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.5em_1.5em] cursor-pointer hover:bg-dark-400/50 transition-all duration-200 text-white`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
            required
            autoComplete="off"
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
            <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Seçtiğiniz markaya göre model önerileri sunulacaktır
          </div>
          {fieldStatus.marka && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.marka.success ? 'text-green-500' : 'text-red-500'}`}
            >
              {fieldStatus.marka.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            Model
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Örn: Pilot Sport 4"
            className={`${getInputClassName('model')} ${formData.marka ? 'bg-dark-300 hover:bg-dark-400' : ''}`}
            required
            list="modelSuggestions"
            autoComplete="off"
          />
          <div className="text-xs text-gray-400 mt-1 flex items-center ml-1">
            <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {formData.marka ? `Marka seçildi, öneriler görüntüleniyor` : 'Önce marka seçin'}
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
            >
              {fieldStatus.model.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            Ebat
            <div className="relative ml-2 group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-100 rounded-md shadow-lg text-xs text-gray-300 hidden group-hover:block z-10">
                Genişlik/Profil/Çap formatında girin. (Örn: 205/55R16)
              </div>
            </div>
          </label>
          <input
            type="text"
            name="ebat"
            value={formData.ebat}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Örn: 205/55R16"
            className={`${getInputClassName('ebat')} hover:bg-dark-400`}
            list="ebatSuggestions"
            autoComplete="off"
          />
          <div className="text-xs text-gray-400 mt-1 flex items-center ml-1">
            <svg className="w-3 h-3 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Genişlik/Profil/Çap formatında girin (Örneğin: 205/55R16)
          </div>
          <datalist id="ebatSuggestions">
            <option disabled style={{ fontWeight: 'bold', color: '#FF4444' }} value="-- Standart Ebatlar --"></option>
            {/* Binek/Sedan Araçlar için Standart Ebatlar */}
            <option value="175/65R14" />
            <option value="175/70R13" />
            <option value="175/70R14" />
            <option value="185/55R15" />
            <option value="185/60R14" />
            <option value="185/60R15" />
            <option value="185/65R14" />
            <option value="185/65R15" />
            <option value="185/70R14" />
            <option value="195/50R15" />
            <option value="195/55R15" />
            <option value="195/55R16" />
            <option value="195/60R15" />
            <option value="195/60R16" />
            <option value="195/65R15" />
            <option value="195/65R16" />
            <option value="205/45R16" />
            <option value="205/45R17" />
            <option value="205/50R16" />
            <option value="205/50R17" />
            <option value="205/55R16" />
            <option value="205/55R17" />
            <option value="205/60R15" />
            <option value="205/60R16" />
            <option value="205/65R16" />
            <option value="205/70R15" />
            <option value="215/40R17" />
            <option value="215/45R16" />
            <option value="215/45R17" />
            <option value="215/45R18" />
            <option value="215/50R17" />
            <option value="215/55R16" />
            <option value="215/55R17" />
            <option value="215/55R18" />
            <option value="215/60R16" />
            <option value="215/60R17" />
            <option value="215/65R16" />
            <option value="215/65R17" />
            <option value="215/70R16" />
            <option value="225/40R18" />
            <option value="225/40R19" />
            <option value="225/45R17" />
            <option value="225/45R18" />
            <option value="225/45R19" />
            <option value="225/50R17" />
            <option value="225/50R18" />
            <option value="225/55R16" />
            <option value="225/55R17" />
            <option value="225/55R18" />
            <option value="225/60R17" />
            <option value="225/60R18" />
            <option value="225/65R17" />
            <option value="225/70R16" />
            <option value="235/35R19" />
            <option value="235/40R18" />
            <option value="235/40R19" />
            <option value="235/45R17" />
            <option value="235/45R18" />
            <option value="235/45R19" />
            <option value="235/45R20" />
            <option value="235/50R18" />
            <option value="235/50R19" />
            <option value="235/55R17" />
            <option value="235/55R18" />
            <option value="235/55R19" />
            <option value="235/60R16" />
            <option value="235/60R17" />
            <option value="235/60R18" />
            <option value="235/65R16" />
            <option value="235/65R17" />
            <option value="235/65R18" />
            <option value="235/70R16" />
            <option value="245/35R19" />
            <option value="245/35R20" />
            <option value="245/40R17" />
            <option value="245/40R18" />
            <option value="245/40R19" />
            <option value="245/40R20" />
            <option value="245/45R17" />
            <option value="245/45R18" />
            <option value="245/45R19" />
            <option value="245/45R20" />
            <option value="245/50R18" />
            <option value="245/50R19" />
            <option value="245/50R20" />
            <option value="245/55R19" />
            <option value="245/65R17" />
            <option value="255/35R18" />
            <option value="255/35R19" />
            <option value="255/35R20" />
            <option value="255/40R17" />
            <option value="255/40R18" />
            <option value="255/40R19" />
            <option value="255/40R20" />
            <option value="255/45R18" />
            <option value="255/45R19" />
            <option value="255/45R20" />
            <option value="255/50R19" />
            <option value="255/50R20" />
            <option value="255/55R18" />
            <option value="255/55R19" />
            <option value="255/55R20" />
            <option value="255/60R17" />
            <option value="255/60R18" />
            <option value="255/60R19" />
            <option value="255/65R17" />
            <option value="265/35R18" />
            <option value="265/35R19" />
            <option value="265/40R18" />
            <option value="265/40R20" />
            <option value="265/45R20" />
            <option value="265/50R19" />
            <option value="265/50R20" />
            <option value="265/55R19" />
            <option value="265/60R18" />
            <option value="265/65R17" />
            <option value="275/35R19" />
            <option value="275/35R20" />
            <option value="275/40R20" />
            <option value="275/45R19" />
            <option value="275/45R20" />
            <option value="275/45R21" />
            <option value="275/50R20" />
            <option value="275/55R19" />
            <option value="275/55R20" />
            <option value="275/65R17" />
            <option value="285/30R19" />
            <option value="285/30R20" />
            <option value="285/35R19" />
            <option value="285/35R21" />
            <option value="285/40R19" />
            <option value="285/40R20" />
            <option value="285/45R19" />
            <option value="285/45R20" />
            <option value="285/45R21" />
            <option value="285/45R22" />
            <option value="285/50R20" />
            <option value="295/35R21" />
            <option value="295/40R20" />
            <option value="295/40R21" />
            <option value="295/45R20" />
            <option value="305/35R21" />
            <option value="305/40R20" />
            <option value="315/35R20" />
          </datalist>
          {fieldStatus.ebat && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.ebat.success ? 'text-green-500' : 'text-red-500'}`}
            >
              {fieldStatus.ebat.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            Üretim Yılı
            <span className="text-red-500 ml-1">*</span>
            <div className="relative ml-2 group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-dark-100 rounded-md shadow-lg text-xs text-gray-300 hidden group-hover:block z-10">
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
            className={getInputClassName('uretimYili')}
            required
            autoComplete="off"
          />
          {fieldStatus.uretimYili && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.uretimYili.success ? 'text-green-500' : 'text-red-500'}`}
            >
              {fieldStatus.uretimYili.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            Kilometre
            <div className="relative ml-2 group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-dark-100 rounded-md shadow-lg text-xs text-gray-300 hidden group-hover:block z-10">
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
              className={getInputClassName('kilometre')}
              autoComplete="off"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">km</span>
          </div>
          {fieldStatus.kilometre && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${fieldStatus.kilometre.success ? 'text-green-500' : 'text-red-500'}`}
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