import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Search } from 'lucide-react';
import { useTimeConverter, TIMEZONES } from '../hooks/useTimeConverter';

export default function TimeCalculator() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const localTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

  const {
    indianDateTime,
    setIndianDateTime,
    targetTimeZoneId,
    setTargetTimeZoneId,
    convertedTime,
    convertedDate
  } = useTimeConverter(localTimeString, 'America/New_York');

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
  ).slice(0, 100);

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
          <input 
            type="datetime-local" 
            className="input-field"
            value={indianDateTime}
            onChange={(e) => setIndianDateTime(e.target.value)}
          />
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
          key={targetTimeZoneId + indianDateTime}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {convertedTime ? (
            <>
              <div className="result-time">{convertedTime}</div>
              <div className="result-date">{convertedDate} {selectedTz?.name.split(' (')[0] === 'Dubai' ? '🇦🇪' : selectedTz?.name.split(' (')[0] === 'London' ? '🇬🇧' : selectedTz?.id.includes('America') ? '🇺🇸' : '🌍'}</div>
            </>
          ) : (
            <div className="result-time" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              Enter a valid time
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
