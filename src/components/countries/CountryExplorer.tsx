import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Globe2,
  Calendar,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TargetCountry, ResolvedEvent } from '../../types';

interface CountryMarketProfile {
  country: TargetCountry;
  flag: string;
  currency: string;
  topStockThemes: string[];
  seasonalPeakDescription: string;
  culturalNuances: string;
}

const COUNTRY_PROFILES: CountryMarketProfile[] = [
  {
    country: 'Sri Lanka',
    flag: '🇱🇰',
    currency: 'LKR',
    topStockThemes: ['Sinhala & Tamil New Year (Avurudu)', 'Vesak Lanterns & Pandols', 'Ceylon Tea Estates', 'Kandyan Cultural Dancers', 'Independence Day', 'Poya Full Moons'],
    seasonalPeakDescription: 'Major Q2 commercial peak around April (Aluth Avurudda) and May (Vesak). High demand for traditional clay pot boiling milk, oil lamps, betel leaves, and Kavum/Kokis sweetmeats.',
    culturalNuances: 'Respect Buddhist and Hindu religious sensitivities; Vesak and Poson lanterns require authentic geometric styling.',
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    topStockThemes: ['Black Friday & Cyber Monday', '4th of July Fireworks', 'Thanksgiving Dinner', 'Halloween Costumes', 'Super Bowl Parties', 'Memorial Day BBQ'],
    seasonalPeakDescription: 'Continuous retail peaks from Back-to-School (August) through Q4 mega-holidays (Halloween, Thanksgiving, Black Friday, Christmas). Massive willingness to license vectors with clean copy-space.',
    culturalNuances: 'High emphasis on authentic workplace diversity, realistic family dynamics, and clean uncluttered negative space for advertising typography.',
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    topStockThemes: ['Boxing Day Sales', 'Guy Fawkes Night', 'St. George’s Day', 'Summer Bank Holidays', 'Mothering Sunday (March)', 'Remembrance Sunday'],
    seasonalPeakDescription: 'Spring campaigns around March Mothering Sunday, Summer festival lifestyle, and December Christmas/Boxing Day retail surges.',
    culturalNuances: 'Mothering Sunday in the UK is celebrated in March (Lent) rather than May (US date); spelling preferences include "colour", "autumn", and "centre".',
  },
  {
    country: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    topStockThemes: ['Diwali (Deepavali) Lights', 'Holi Powder Explosion', 'Independence Day (Aug 15)', 'Raksha Bandhan', 'Ganesh Chaturthi', 'Wedding Season'],
    seasonalPeakDescription: 'Festive shopping season runs August to November. Huge commercial demand for clay diya lamps, rangoli geometric patterns, marigold garlands, and ethnic celebratory attire.',
    culturalNuances: 'Vibrant, rich saturation in color palettes; avoid trademarked Bollywood or political imagery.',
  },
  {
    country: 'China',
    flag: '🇨🇳',
    currency: 'CNY',
    topStockThemes: ['Lunar New Year (Spring Festival)', 'Singles’ Day (11.11)', 'Mid-Autumn Moon Festival', 'Dragon Boat Festival', 'Golden Week Travel'],
    seasonalPeakDescription: 'Massive Q1 peak for Chinese New Year (zodiac animals, red packets, lanterns) and Q4 e-commerce peak for 11.11 Singles’ Day.',
    culturalNuances: 'Red and gold color palettes symbolize luck and prosperity; accurate Chinese zodiac animal representation for the specific lunar year.',
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    topStockThemes: ['Oktoberfest Folk Traditions', 'German Unity Day', 'Christmas Markets (Weihnachtsmarkt)', 'Spring Gardening', 'Green Tech & Solar'],
    seasonalPeakDescription: 'High demand for autumn Oktoberfest imagery and authentic European Christmas market gingerbread/wooden stall aesthetics.',
    culturalNuances: 'High preference for clean, minimalist technical aesthetics, renewable energy concepts, and strict GDPR privacy styling.',
  },
  {
    country: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    topStockThemes: ['Bastille Day (July 14)', 'French Gastronomy & Wine', 'Fête de la Musique', 'Haute Couture Fashion Week', 'Rentrée (Back to School)'],
    seasonalPeakDescription: 'Summer Bastille celebrations with tricolor banners and Autumn culinary/back-to-school marketing.',
    culturalNuances: 'Sophisticated editorial art direction, authentic café culture, and architectural heritage.',
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    topStockThemes: ['Cherry Blossom (Sakura) Season', 'Golden Week Travel', 'New Year (Oshogatsu)', 'Tanabata Star Festival', 'Modern Tech & Robotics'],
    seasonalPeakDescription: 'Spring Sakura tourism peak in March/April, Golden Week in May, and Year-End corporate bonuses.',
    culturalNuances: 'Delicate pastel palettes, clean minimalist typography layout spaces, and respectful cultural depictions.',
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    topStockThemes: ['Australia Day (Jan 26)', 'ANZAC Day (April 25)', 'Summer Christmas on the Beach', 'Outback Wildlife', 'End of Financial Year (EOFY)'],
    seasonalPeakDescription: 'Opposite season hemisphere: December is peak Summer beach season and January is mid-summer holiday.',
    culturalNuances: 'Remember Southern Hemisphere seasons are inverted (Summer: Dec-Feb, Winter: Jun-Aug).',
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    topStockThemes: ['Canada Day (July 1)', 'Canadian Thanksgiving (October)', 'Victoria Day Weekend', 'Winter Snow Sports', 'Maple Harvest'],
    seasonalPeakDescription: 'Thanksgiving is in early October (2nd Monday), two months before US Thanksgiving.',
    culturalNuances: 'Bilingual English/French market considerations; distinct date for Thanksgiving compared to the US.',
  },
];

export const CountryExplorer: React.FC = () => {
  const { allResolvedEvents, openEventDetail, discoverNichesForEvent, currentYear } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<TargetCountry>('Sri Lanka');

  const profile = useMemo(() => {
    return COUNTRY_PROFILES.find((p) => p.country === selectedCountry) || COUNTRY_PROFILES[0];
  }, [selectedCountry]);

  // Events specific to this country + Global events
  const countryEvents = useMemo(() => {
    return allResolvedEvents.filter(
      (e) => e.countries.includes(selectedCountry) || e.countries.includes('Global')
    );
  }, [allResolvedEvents, selectedCountry]);

  const localSpecificCount = countryEvents.filter((e) => e.countries.includes(selectedCountry) && !e.countries.includes('Global')).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Market Geography Intelligence
              </span>
              <span className="text-xs text-slate-400">Localized Stock Buyer Demands</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Country & Regional Market Explorer
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Commercial holiday timing and visual preferences vary dramatically across countries. Avoid generic assumptions—target localized cultural dates and shopping habits.
            </p>
          </div>
        </div>

        {/* Country Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-800/80">
          {COUNTRY_PROFILES.map((p) => (
            <button
              key={p.country}
              onClick={() => setSelectedCountry(p.country)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCountry === p.country
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{p.flag}</span>
              <span>{p.country}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Country Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{profile.flag}</span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{profile.country} Stock Market Brief</span>
              </h2>
              <span className="text-xs text-slate-400">
                {countryEvents.length} total events tracked ({localSpecificCount} national public holidays)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono font-medium">
              Currency: {profile.currency}
            </span>
          </div>
        </div>

        {/* 2 Grid Columns: Seasonality & Cultural Nuances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Seasonal Buying Peaks & Retail Windows
            </span>
            <p className="text-slate-300 leading-relaxed">
              {profile.seasonalPeakDescription}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cultural Nuances & Microstock Guidelines
            </span>
            <p className="text-slate-300 leading-relaxed">
              {profile.culturalNuances}
            </p>
          </div>
        </div>

        {/* Trending Stock Asset Themes */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Highest-Selling Stock Subject Themes in {profile.country}
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.topStockThemes.map((theme) => (
              <span
                key={theme}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Country Specific Events List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Events & Commercial Days in {profile.country}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countryEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openEventDetail(ev)}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-600 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3 cursor-pointer transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-cyan-400 font-bold">{ev.resolvedDate}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {ev.opportunityScore}/100
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {ev.name}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {ev.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{ev.category}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    discoverNichesForEvent(ev);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Niches →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
