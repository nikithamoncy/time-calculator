import { useState, useMemo } from 'react';
import { formatInTimeZone, toDate } from 'date-fns-tz';

export type TimeComponents = {
  date: string; // YYYY-MM-DD
  hour: string; // 1-12
  minute: string; // 00-59
  ampm: 'AM' | 'PM';
};

function getComponents(utcDate: Date, timeZone: string): TimeComponents {
  return {
    date: formatInTimeZone(utcDate, timeZone, 'yyyy-MM-dd'),
    hour: formatInTimeZone(utcDate, timeZone, 'h'),
    minute: formatInTimeZone(utcDate, timeZone, 'mm'),
    ampm: formatInTimeZone(utcDate, timeZone, 'a').toUpperCase() as 'AM' | 'PM'
  };
}

function getUtcDate(components: TimeComponents, timeZone: string): Date {
  const { date, hour, minute, ampm } = components;
  let h24 = parseInt(hour, 10);
  if (ampm === 'PM' && h24 < 12) h24 += 12;
  if (ampm === 'AM' && h24 === 12) h24 = 0;
  
  const paddedHour = h24.toString().padStart(2, '0');
  const isoString = `${date}T${paddedHour}:${minute}:00`;
  return toDate(isoString, { timeZone });
}

const allZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [
  'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver', 
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Dubai', 'Asia/Kolkata'
];

const EXTRA_LOCATIONS = [
  // All 50 US States
  { name: 'Alabama, USA', timeZone: 'America/Chicago' },
  { name: 'Alaska, USA', timeZone: 'America/Anchorage' },
  { name: 'Arizona, USA', timeZone: 'America/Phoenix' },
  { name: 'Arkansas, USA', timeZone: 'America/Chicago' },
  { name: 'California, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Colorado, USA', timeZone: 'America/Denver' },
  { name: 'Connecticut, USA', timeZone: 'America/New_York' },
  { name: 'Delaware, USA', timeZone: 'America/New_York' },
  { name: 'Florida, USA', timeZone: 'America/New_York' },
  { name: 'Georgia, USA', timeZone: 'America/New_York' },
  { name: 'Hawaii, USA', timeZone: 'Pacific/Honolulu' },
  { name: 'Idaho, USA', timeZone: 'America/Boise' },
  { name: 'Illinois, USA', timeZone: 'America/Chicago' },
  { name: 'Indiana, USA', timeZone: 'America/Indiana/Indianapolis' },
  { name: 'Iowa, USA', timeZone: 'America/Chicago' },
  { name: 'Kansas, USA', timeZone: 'America/Chicago' },
  { name: 'Kentucky, USA', timeZone: 'America/New_York' },
  { name: 'Louisiana, USA', timeZone: 'America/Chicago' },
  { name: 'Maine, USA', timeZone: 'America/New_York' },
  { name: 'Maryland, USA', timeZone: 'America/New_York' },
  { name: 'Massachusetts, USA', timeZone: 'America/New_York' },
  { name: 'Michigan, USA', timeZone: 'America/Detroit' },
  { name: 'Minnesota, USA', timeZone: 'America/Chicago' },
  { name: 'Mississippi, USA', timeZone: 'America/Chicago' },
  { name: 'Missouri, USA', timeZone: 'America/Chicago' },
  { name: 'Montana, USA', timeZone: 'America/Denver' },
  { name: 'Nebraska, USA', timeZone: 'America/Chicago' },
  { name: 'Nevada, USA', timeZone: 'America/Los_Angeles' },
  { name: 'New Hampshire, USA', timeZone: 'America/New_York' },
  { name: 'New Jersey, USA', timeZone: 'America/New_York' },
  { name: 'New Mexico, USA', timeZone: 'America/Denver' },
  { name: 'New York, USA', timeZone: 'America/New_York' },
  { name: 'North Carolina, USA', timeZone: 'America/New_York' },
  { name: 'North Dakota, USA', timeZone: 'America/Chicago' },
  { name: 'Ohio, USA', timeZone: 'America/New_York' },
  { name: 'Oklahoma, USA', timeZone: 'America/Chicago' },
  { name: 'Oregon, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Pennsylvania, USA', timeZone: 'America/New_York' },
  { name: 'Rhode Island, USA', timeZone: 'America/New_York' },
  { name: 'South Carolina, USA', timeZone: 'America/New_York' },
  { name: 'South Dakota, USA', timeZone: 'America/Chicago' },
  { name: 'Tennessee, USA', timeZone: 'America/Chicago' },
  { name: 'Texas, USA', timeZone: 'America/Chicago' },
  { name: 'Utah, USA', timeZone: 'America/Denver' },
  { name: 'Vermont, USA', timeZone: 'America/New_York' },
  { name: 'Virginia, USA', timeZone: 'America/New_York' },
  { name: 'Washington, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Washington D.C., USA', timeZone: 'America/New_York' },
  { name: 'West Virginia, USA', timeZone: 'America/New_York' },
  { name: 'Wisconsin, USA', timeZone: 'America/Chicago' },
  { name: 'Wyoming, USA', timeZone: 'America/Denver' },
  
  // Major US Cities
  { name: 'San Francisco, California', timeZone: 'America/Los_Angeles' },
  { name: 'Silicon Valley, California', timeZone: 'America/Los_Angeles' },
  { name: 'San Jose, California', timeZone: 'America/Los_Angeles' },
  { name: 'San Diego, California', timeZone: 'America/Los_Angeles' },
  { name: 'Los Angeles, California', timeZone: 'America/Los_Angeles' },
  { name: 'Seattle, Washington', timeZone: 'America/Los_Angeles' },
  { name: 'Las Vegas, Nevada', timeZone: 'America/Los_Angeles' },
  { name: 'Dallas, Texas', timeZone: 'America/Chicago' },
  { name: 'Houston, Texas', timeZone: 'America/Chicago' },
  { name: 'Austin, Texas', timeZone: 'America/Chicago' },
  { name: 'Miami, Florida', timeZone: 'America/New_York' },
  { name: 'Boston, Massachusetts', timeZone: 'America/New_York' },
  { name: 'Atlanta, Georgia', timeZone: 'America/New_York' },
  { name: 'Philadelphia, Pennsylvania', timeZone: 'America/New_York' },
  
  // Canadian Provinces
  { name: 'Ontario, Canada', timeZone: 'America/Toronto' },
  { name: 'British Columbia, Canada', timeZone: 'America/Vancouver' },
  { name: 'Quebec, Canada', timeZone: 'America/Montreal' },
  { name: 'Alberta, Canada', timeZone: 'America/Edmonton' },
  { name: 'Nova Scotia, Canada', timeZone: 'America/Halifax' },
  { name: 'Manitoba, Canada', timeZone: 'America/Winnipeg' },
  { name: 'Saskatchewan, Canada', timeZone: 'America/Regina' },
  { name: 'New Brunswick, Canada', timeZone: 'America/Moncton' },
  { name: 'Newfoundland, Canada', timeZone: 'America/St_Johns' },
  
  // Major Global
  { name: 'UK, United Kingdom', timeZone: 'Europe/London' },
  { name: 'England, UK', timeZone: 'Europe/London' },
  { name: 'Germany', timeZone: 'Europe/Berlin' },
  { name: 'France', timeZone: 'Europe/Paris' },
  { name: 'Italy', timeZone: 'Europe/Rome' },
  { name: 'Spain', timeZone: 'Europe/Madrid' },
  { name: 'India', timeZone: 'Asia/Kolkata' },
  { name: 'Japan', timeZone: 'Asia/Tokyo' },
  { name: 'China', timeZone: 'Asia/Shanghai' },
  { name: 'Australia (Sydney)', timeZone: 'Australia/Sydney' },
  { name: 'Australia (Perth)', timeZone: 'Australia/Perth' },
  { name: 'Australia (Melbourne)', timeZone: 'Australia/Melbourne' },
  { name: 'Australia (Brisbane)', timeZone: 'Australia/Brisbane' },
  { name: 'Brazil (Sao Paulo)', timeZone: 'America/Sao_Paulo' },
  { name: 'Mexico (Mexico City)', timeZone: 'America/Mexico_City' },
  { name: 'South Africa', timeZone: 'Africa/Johannesburg' },
  { name: 'United Arab Emirates (Dubai)', timeZone: 'Asia/Dubai' },
  { name: 'Saudi Arabia', timeZone: 'Asia/Riyadh' },
  { name: 'Singapore', timeZone: 'Asia/Singapore' },
  { name: 'New Zealand', timeZone: 'Pacific/Auckland' },
  
  // More Countries
  { name: 'Russia (Moscow)', timeZone: 'Europe/Moscow' },
  { name: 'Argentina (Buenos Aires)', timeZone: 'America/Argentina/Buenos_Aires' },
  { name: 'Colombia (Bogota)', timeZone: 'America/Bogota' },
  { name: 'Chile (Santiago)', timeZone: 'America/Santiago' },
  { name: 'Peru (Lima)', timeZone: 'America/Lima' },
  { name: 'Venezuela (Caracas)', timeZone: 'America/Caracas' },
  { name: 'Egypt (Cairo)', timeZone: 'Africa/Cairo' },
  { name: 'Nigeria (Lagos)', timeZone: 'Africa/Lagos' },
  { name: 'Kenya (Nairobi)', timeZone: 'Africa/Nairobi' },
  { name: 'Morocco (Casablanca)', timeZone: 'Africa/Casablanca' },
  { name: 'Indonesia (Jakarta)', timeZone: 'Asia/Jakarta' },
  { name: 'Philippines (Manila)', timeZone: 'Asia/Manila' },
  { name: 'South Korea (Seoul)', timeZone: 'Asia/Seoul' },
  { name: 'Turkey (Istanbul)', timeZone: 'Europe/Istanbul' },
  { name: 'Thailand (Bangkok)', timeZone: 'Asia/Bangkok' },
  { name: 'Vietnam (Ho Chi Minh)', timeZone: 'Asia/Ho_Chi_Minh' },
  { name: 'Malaysia (Kuala Lumpur)', timeZone: 'Asia/Kuala_Lumpur' },
  { name: 'Pakistan (Karachi)', timeZone: 'Asia/Karachi' },
  { name: 'Bangladesh (Dhaka)', timeZone: 'Asia/Dhaka' },
  { name: 'Iran (Tehran)', timeZone: 'Asia/Tehran' },
  { name: 'Israel (Jerusalem)', timeZone: 'Asia/Jerusalem' },
  { name: 'Netherlands (Amsterdam)', timeZone: 'Europe/Amsterdam' },
  { name: 'Switzerland (Zurich)', timeZone: 'Europe/Zurich' },
  { name: 'Sweden (Stockholm)', timeZone: 'Europe/Stockholm' },
  { name: 'Norway (Oslo)', timeZone: 'Europe/Oslo' },
  { name: 'Denmark (Copenhagen)', timeZone: 'Europe/Copenhagen' },
  { name: 'Finland (Helsinki)', timeZone: 'Europe/Helsinki' },
  { name: 'Poland (Warsaw)', timeZone: 'Europe/Warsaw' },
  { name: 'Austria (Vienna)', timeZone: 'Europe/Vienna' },
  { name: 'Ireland (Dublin)', timeZone: 'Europe/Dublin' },
  { name: 'Czech Republic (Prague)', timeZone: 'Europe/Prague' },
  { name: 'Greece (Athens)', timeZone: 'Europe/Athens' },
  { name: 'Portugal (Lisbon)', timeZone: 'Europe/Lisbon' }
];

const builtInZones = allZones.map(tz => {
  const parts = tz.split('/');
  const rawCity = parts[parts.length - 1] || tz;
  const region = parts[0] !== rawCity ? parts[0] : '';
  const city = rawCity.replace(/_/g, ' ');

  return {
    id: tz,
    name: region ? `${city} (${region})` : city,
    timeZone: tz,
    searchString: `${city} ${region} ${tz}`.toLowerCase()
  };
});

const customZones = EXTRA_LOCATIONS.map((loc, i) => ({
  id: `custom-${i}`,
  name: loc.name,
  timeZone: loc.timeZone,
  searchString: loc.name.toLowerCase()
}));

export const TIMEZONES = [...customZones, ...builtInZones].sort((a, b) => a.name.localeCompare(b.name));

export function useTimeConverter(initialUtcDate: Date, initialTargetTz: string) {
  const [utcDate, setUtcDate] = useState<Date>(initialUtcDate);
  const [targetTimeZoneId, setTargetTimeZoneId] = useState<string>(initialTargetTz);

  const indianComponents = useMemo(() => getComponents(utcDate, 'Asia/Kolkata'), [utcDate]);
  
  const targetComponents = useMemo(() => {
     if (!targetTimeZoneId) return null;
     const tz = TIMEZONES.find(t => t.id === targetTimeZoneId)?.timeZone || targetTimeZoneId;
     return getComponents(utcDate, tz);
  }, [utcDate, targetTimeZoneId]);

  const updateIndianTime = (updates: Partial<TimeComponents>) => {
     const newComps = { ...indianComponents, ...updates };
     setUtcDate(getUtcDate(newComps, 'Asia/Kolkata'));
  };

  const updateTargetTime = (updates: Partial<TimeComponents>) => {
     if (!targetTimeZoneId) return;
     const currentTarget = targetComponents || indianComponents;
     const newComps = { ...currentTarget, ...updates };
     const tz = TIMEZONES.find(t => t.id === targetTimeZoneId)?.timeZone || targetTimeZoneId;
     setUtcDate(getUtcDate(newComps, tz));
  };

  return {
     targetTimeZoneId,
     setTargetTimeZoneId,
     indianComponents,
     targetComponents,
     updateIndianTime,
     updateTargetTime
  };
}
