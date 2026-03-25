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
  { name: 'San Francisco, California', timeZone: 'America/Los_Angeles' },
  { name: 'California, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Silicon Valley, California', timeZone: 'America/Los_Angeles' },
  { name: 'San Jose, California', timeZone: 'America/Los_Angeles' },
  { name: 'San Diego, California', timeZone: 'America/Los_Angeles' },
  { name: 'Seattle, Washington', timeZone: 'America/Los_Angeles' },
  { name: 'Washington, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Oregon, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Nevada, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Las Vegas, Nevada', timeZone: 'America/Los_Angeles' },
  { name: 'Idaho, USA', timeZone: 'America/Boise' },
  { name: 'Arizona, USA', timeZone: 'America/Phoenix' },
  { name: 'Utah, USA', timeZone: 'America/Denver' },
  { name: 'Colorado, USA', timeZone: 'America/Denver' },
  { name: 'New Mexico, USA', timeZone: 'America/Denver' },
  { name: 'Wyoming, USA', timeZone: 'America/Denver' },
  { name: 'Montana, USA', timeZone: 'America/Denver' },
  { name: 'Dallas, Texas', timeZone: 'America/Chicago' },
  { name: 'Houston, Texas', timeZone: 'America/Chicago' },
  { name: 'Austin, Texas', timeZone: 'America/Chicago' },
  { name: 'Texas, USA', timeZone: 'America/Chicago' },
  { name: 'Illinois, USA', timeZone: 'America/Chicago' },
  { name: 'Miami, Florida', timeZone: 'America/New_York' },
  { name: 'Florida, USA', timeZone: 'America/New_York' },
  { name: 'Boston, Massachusetts', timeZone: 'America/New_York' },
  { name: 'Atlanta, Georgia', timeZone: 'America/New_York' },
  { name: 'Washington D.C., USA', timeZone: 'America/New_York' },
  { name: 'Philadelphia, Pennsylvania', timeZone: 'America/New_York' },
  { name: 'Fairbanks, Alaska', timeZone: 'America/Anchorage' },
  { name: 'Alaska, USA', timeZone: 'America/Anchorage' },
  { name: 'Hawaii, USA', timeZone: 'Pacific/Honolulu' },
  { name: 'Honolulu, Hawaii', timeZone: 'Pacific/Honolulu' },
  { name: 'Ontario, Canada', timeZone: 'America/Toronto' },
  { name: 'British Columbia, Canada', timeZone: 'America/Vancouver' },
  { name: 'Quebec, Canada', timeZone: 'America/Montreal' },
  { name: 'Alberta, Canada', timeZone: 'America/Edmonton' },
  { name: 'UK, United Kingdom', timeZone: 'Europe/London' }
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
