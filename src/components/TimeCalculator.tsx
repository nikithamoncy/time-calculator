import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Search } from 'lucide-react';
import { useTimeConverter, TIMEZONES } from '../hooks/useTimeConverter';
import type { TimeComponents } from '../hooks/useTimeConverter';

const DateTimePicker = ({ comps, onChange, isTarget }: { comps: TimeComponents, onChange: (c: Partial<TimeComponents>) => void, isTarget?: boolean }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: isTarget ? 'center' : 'flex-start' }}>
      <input type="date" value={comps.date} onChange={e => onChange({ date: e.target.value })} className="input-field" style={{ padding: '8px 12px', flex: '1 1 auto', minWidth: '130px' }} />
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <select value={comps.hour} onChange={e => onChange({ hour: e.target.value })} className="input-field" style={{ padding: '8px', minWidth: '60px' }}>
          {Array.from({length: 12}, (_, i) => <option key={i+1} value={(i+1).toString()}>{i+1}</option>)}
        </select>
        <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>:</span>
        <select value={comps.minute} onChange={e => onChange({ minute: e.target.value })} className="input-field" style={{ padding: '8px', minWidth: '60px' }}>
          {Array.from({length: 60}, (_, i) => <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>)}
        </select>
        <select value={comps.ampm} onChange={e => onChange({ ampm: e.target.value as 'AM'|'PM' })} className="input-field" style={{ padding: '8px', minWidth: '70px', fontWeight: 'bold' }}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export default function TimeCalculator() {
  const [initDate] = useState(() => new Date());

  const {
    targetTimeZoneId,
    setTargetTimeZoneId,
    indianComponents,
    targetComponents,
    updateIndianTime,
    updateTargetTime
  } = useTimeConverter(initDate, 'America/New_York');

  const selectedTz = TIMEZONES.find(t => t.id === targetTimeZoneId);
  const [search, setSearch] = useState(selectedTz?.name || 'New York (America)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        // Reset search to selected timezone if closed without picking
        const currentTz = TIMEZONES.find(t => t.id === targetTimeZoneId);
        if (currentTz) setSearch(currentTz.name);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [targetTimeZoneId]);

  const filteredZones = TIMEZONES.filter(z => 
    z.searchString.includes(search.toLowerCase())
  );

  const handleSelect = (tzId: string, tzName: string) => {
    setTargetTimeZoneId(tzId);
    setSearch(tzName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="app-container">
      <motion.div 
        className="glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="header">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            TimeSync
          </motion.h1>
          <p>Convert Indian processing times globally</p>
        </div>

        <div className="input-group">
          <label className="input-label">India (IST)</label>
          <DateTimePicker comps={indianComponents} onChange={updateIndianTime} />
        </div>

        <div className="divider">
          <div className="divider-icon">
            <ArrowDown size={20} />
          </div>
        </div>

        <div className="input-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="input-label">Target Location (e.g. New York)</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="input-field"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                setSearch('');
                setIsDropdownOpen(true);
              }}
              placeholder="Type to search..."
            />
            <Search size={18} style={{ position: 'absolute', right: 14, top: 14, color: 'var(--text-secondary)' }} />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                className="dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {filteredZones.length > 0 ? (
                  filteredZones.map(zone => (
                    <div 
                      key={zone.id} 
                      className={`dropdown-item ${zone.id === targetTimeZoneId ? 'active' : ''}`}
                      onClick={() => handleSelect(zone.id, zone.name)}
                    >
                      {zone.name}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item" style={{ color: 'var(--text-secondary)' }}>
                    No locations found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="result-card"
          key={targetTimeZoneId + (indianComponents.minute)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {targetComponents ? (
            <>
              <DateTimePicker comps={targetComponents} onChange={updateTargetTime} isTarget />
              <div className="result-date mt-3" style={{ marginTop: '16px' }}>
                 {selectedTz?.name.split(' (')[0] === 'Dubai' ? '🇦🇪 ' : selectedTz?.name.split(' (')[0] === 'London' ? '🇬🇧 ' : selectedTz?.id.includes('America') ? '🇺🇸 ' : '🌍 '}
                 {targetComponents.date}
              </div>
            </>
          ) : (
            <div className="result-time" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              Select a target location
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
