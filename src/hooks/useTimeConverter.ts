import { useState, useEffect } from 'react';

// Get all IANA timezones supported by the browser
const allZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [
  'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver', 
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Dubai', 'Asia/Kolkata'
];

// Define common cities/states that map to known timezones
const EXTRA_LOCATIONS = [
  { name: 'San Francisco, California', timeZone: 'America/Los_Angeles' },
  { name: 'California, USA', timeZone: 'America/Los_Angeles' },
  { name: 'Silicon Valley, California', timeZone: 'America/Los_Angeles' },
  { name: 'San Jose, California', timeZone: 'America/Los_Angeles' },
  { name: 'San Diego, California', timeZone: 'America/Los_Angeles' },
  { name: 'Seattle, Washington', timeZone: 'America/Los_Angeles' },
  { name: 'Las Vegas, Nevada', timeZone: 'America/Los_Angeles' },
  { name: 'Dallas, Texas', timeZone: 'America/Chicago' },
  { name: 'Houston, Texas', timeZone: 'America/Chicago' },
  { name: 'Austin, Texas', timeZone: 'America/Chicago' },
  { name: 'Texas, USA', timeZone: 'America/Chicago' },
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

export function useTimeConverter(initialIndianTime: string, initialTargetTimezoneId: string) {
  const [indianDateTime, setIndianDateTime] = useState<string>(initialIndianTime);
  const [targetTimeZoneId, setTargetTimeZoneId] = useState<string>(initialTargetTimezoneId);
  
  const [convertedTime, setConvertedTime] = useState<string>('');
  const [convertedDate, setConvertedDate] = useState<string>('');

  useEffect(() => {
    if (!indianDateTime) {
      setConvertedTime('');
      setConvertedDate('');
      return;
    }

    try {
      // The input from datetime-local looks like "2026-03-23T20:14"
      // We append "+05:30" to force parsing as Indian Standard Time
      const dateObj = new Date(`${indianDateTime}:00+05:30`);
      
      const targetTz = TIMEZONES.find(t => t.id === targetTimeZoneId);
      if (!targetTz) return;

      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz.timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz.timeZone,
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });

      setConvertedTime(timeFormatter.format(dateObj));
      setConvertedDate(dateFormatter.format(dateObj));
    } catch (err) {
      setConvertedTime('Invalid Time');
      setConvertedDate('');
    }
  }, [indianDateTime, targetTimeZoneId]);

  return {
    indianDateTime,
    setIndianDateTime,
    targetTimeZoneId,
    setTargetTimeZoneId,
    convertedTime,
    convertedDate
  };
}
