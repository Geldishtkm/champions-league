import React, { useState } from 'react';

const positionIcons = {
  'Forward': '⚽️',
  'Defender': '🛡️',
  'Midfielder': '🏃‍♂️',
  'Goalkeeper': '🧤',
};

// Helper: Convert country name to flag emoji
function getFlagEmoji(countryNameOrCode) {
  if (!countryNameOrCode) return '🏳️';
  const name = countryNameOrCode.trim();

  // Map full country names to flag emojis
  const flags = {
    'Armenia': '🇦🇲',
    'Angola': '🇦🇴',
    'Argentina': '🇦🇷',
    'Austria': '🇦🇹',
    'Australia': '🇦🇺',
    'Bosnia and Herzegovina': '🇧🇦',
    'Belgium': '🇧🇪',
    'Burkina Faso': '🇧🇫',
    'Brazil': '🇧🇷',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Netherlands': '🇳🇱',
    'Portugal': '🇵🇹',
    'England': '🇬🇧',
    'Russia': '🇷🇺',
    'Croatia': '🇭🇷',
    'Poland': '🇵🇱',
    'Norway': '🇳🇴',
    'Sweden': '🇸🇪',
    'Denmark': '🇩🇰',
    'Switzerland': '🇨🇭',
    'Ukraine': '🇺🇦',
    'Morocco': '🇲🇦',
    'Ivory Coast': '🇨🇮',
    'Nigeria': '🇳🇬',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'Mexico': '🇲🇽',
    'Greece': '🇬🇷',
    'Turkey': '🇹🇷',
    'Finland': '🇫🇮',
    'Ireland': '🇮🇪',
    'Serbia': '🇷🇸',
    'Bulgaria': '🇧🇬',
    'Hungary': '🇭🇺',
    'Romania': '🇷🇴',
    'Slovakia': '🇸🇰',
    'Czech Republic': '🇨🇿',
    'Slovenia': '🇸🇮',
    'Iceland': '🇮🇸',
    'Scotland': '🏴',
    'Wales': '🏴',
    'Northern Ireland': '🇬🇧',
    // Add more as needed
  };
  if (flags[name]) return flags[name];

  // Fallback: try to generate flag from 2-letter code if the name is a code
  const code = name.toUpperCase();
  if (code.length === 2 && /^[A-Z]{2}$/.test(code)) {
    return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
  }
  // Fallback: try to generate flag from country name (first two letters)
  try {
    const fallback = code.replace(/[^A-Z]/g, '').slice(0, 2);
    if (fallback.length === 2) {
      return String.fromCodePoint(...[...fallback].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
    }
  } catch {}
  return '🏳️';
}

// Player Info Tooltip Component
const PlayerTooltip = ({ player, show, position }) => {
  if (!show || !player) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: position.y - 120,
      left: position.x + 10,
      background: '#fff',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '200px',
      fontSize: '14px',
      color: '#333'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{player.name}</div>
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: '600' }}>Position:</span> {positionIcons[player.position]} {player.position}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: '600' }}>Team:</span> 🏟️ {player.team}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: '600' }}>Nationality:</span> {getFlagEmoji(player.nationality)} {player.nationality}
      </div>
      <div style={{ 
        position: 'absolute', 
        bottom: '-8px', 
        left: '10px', 
        width: '0', 
        height: '0', 
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid #007bff'
      }}></div>
    </div>
  );
};

const PitchRow = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '12px 0' }}>{children}</div>
);

const PlayerPickerModal = ({ open, onClose, players, onSelect, filledPlayerIds }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxHeight: 500, overflowY: 'auto', position: 'relative' }}>
        <h3>Select Player</h3>
        <button 
          style={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }} 
          onClick={onClose}
          aria-label="Close player selection modal"
        >
          Close
        </button>
        {players.length === 0 ? (
          <div>No available players for this position.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {players.map(player => (
              <li key={player.id} style={{ margin: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {player.name} 
                  <span style={{ fontSize: 14, color: '#888' }}>({player.team})</span>
                  <span style={{ fontSize: 16, marginLeft: 8 }}>{getFlagEmoji(player.nationality)}</span>
                </span>
                <button
                  disabled={filledPlayerIds.includes(player.id)}
                  onClick={() => onSelect(player)}
                  style={{ padding: '4px 12px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', opacity: filledPlayerIds.includes(player.id) ? 0.5 : 1 }}
                  aria-label={`Add ${player.name} to formation`}
                >Add</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const SlotPickerModal = ({ open, onClose, slots, onSelect }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxHeight: 500, overflowY: 'auto', position: 'relative' }}>
        <h3>Select Slot</h3>
        <button 
          style={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }} 
          onClick={onClose}
          aria-label="Close slot selection modal"
        >
          Close
        </button>
        {slots.length === 0 ? (
          <div>No slots for this position.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {slots.map(({ idx, label, player }) => (
              <li key={idx} style={{ margin: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {label} {player ? `- ${player.name}` : ''}
                  {player && <span style={{ fontSize: 16, marginLeft: 8 }}>{getFlagEmoji(player.nationality)}</span>}
                </span>
                <button
                  onClick={() => onSelect(idx)}
                  style={{ padding: '4px 12px', borderRadius: 8, background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
                  aria-label={player ? `Replace ${player.name} in ${label}` : `Add to ${label}`}
                >{player ? 'Replace' : 'Add'}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const MyTeam = ({ players, myTeam, bench = [], onAddToSlot, onRemoveFromSlot, onRemoveFromBench, selectedFormation, setSelectedFormation, formations }) => {
  // myTeam: array of 11 { id, position, player: {id, ...} | null }
  const [picker, setPicker] = useState({ open: false, slotIdx: null });
  const [slotPicker, setSlotPicker] = useState({ open: false, player: null });
  const [tooltip, setTooltip] = useState({ show: false, player: null, position: { x: 0, y: 0 } });

  // Helper: add or replace in slot
  const handleAddOrReplace = (slotIdx, benchPlayer) => {
    const slot = myTeam[slotIdx];
    if (!slot.player) {
      onAddToSlot(slotIdx, benchPlayer);
    } else {
      // Replace: move current player to bench if not already there and space
      if (slot.player && !bench.some(p => p.id === slot.player.id) && bench.length < 23) {
        onRemoveFromSlot(slotIdx); // This will add to bench
        setTimeout(() => onAddToSlot(slotIdx, benchPlayer), 0); // Add after remove
      } else {
        // Remove then add (if already on bench or bench full)
        onRemoveFromSlot(slotIdx);
        setTimeout(() => onAddToSlot(slotIdx, benchPlayer), 0);
      }
    }
  };

  // Arrange slots by rows for the current formation
  const formationArr = formations[selectedFormation];
  const rows = (() => {
    // Simple logic: group by position for visual separation
    const posOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
    return posOrder.map(pos => formationArr.map((slot, idx) => slot.position === pos ? idx : null).filter(idx => idx !== null));
  })();

  // For player picker modal
  const filledPlayerIds = myTeam.map(slot => slot.player && slot.player.id).filter(Boolean);

  // Helper: eligible bench players for a slot (no position restrictions)
  const eligibleBenchPlayers = (slotIdx) => {
    // Return all bench players - no position restrictions
    console.log(`All bench players eligible for ${formationArr[slotIdx].label}:`, bench.map(p => p.name));
    return bench;
  };

  // Helper: first available slot for a position
  const firstAvailableSlotIdx = (position) => {
    return myTeam.findIndex(slot => slot.position === position && !slot.player);
  };

  // Handle mouse events for tooltip
  const handleMouseEnter = (player, event) => {
    setTooltip({
      show: true,
      player,
      position: { x: event.clientX, y: event.clientY }
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, player: null, position: { x: 0, y: 0 } });
  };

  return (
    <div className="my-team-glass my-team-pitch">
      <div className="my-team-header">
        <h2 className="my-team-title" style={{
          fontSize: '2.3rem',
          fontWeight: 900,
          background: 'linear-gradient(90deg, #fff 0%, #ffe066 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: '#fff',
          textShadow: '0 2px 16px #fff, 0 1px 2px #ffe066',
          margin: '32px 0 18px 0',
          letterSpacing: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontWeight: 900,
            fontSize: '2.3rem',
            background: 'linear-gradient(90deg, #fff 0%, #ffe066 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#fff',
            textShadow: '0 2px 16px #fff, 0 1px 2px #ffe066',
          }}>My Team</span>
          <span style={{
            fontWeight: 600,
            fontSize: '1.2rem',
            color: '#bfc6e6',
            marginLeft: 8,
            textShadow: '0 1px 4px #007bff22',
          }}>({selectedFormation} Formation)</span>
        </h2>
        <div className="my-team-formation-select">
          <label htmlFor="formation-select">Formation:</label>
          <select
            id="formation-select"
            value={selectedFormation}
            onChange={e => setSelectedFormation(e.target.value)}
            aria-label="Select formation"
          >
            {Object.keys(formations).map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="my-team-rows">
        {rows.map((row, i) => (
          row.length > 0 && (
            <PitchRow key={i}>
              {row.map(idx => {
                const slot = myTeam[idx];
                const eligible = eligibleBenchPlayers(idx);
                return (
                  <div key={idx} className={`my-team-slot${slot.player ? ' filled' : ''}`}> 
                    <div className="my-team-slot-label">{formationArr[idx].label}</div>
                    <div className="my-team-slot-icon">{positionIcons[formationArr[idx].position]}</div>
                    {slot.player ? (
                      <>
                        <div 
                          className="my-team-player-name"
                          onMouseEnter={(e) => handleMouseEnter(slot.player, e)}
                          onMouseLeave={handleMouseLeave}
                          title={`${slot.player.name} - ${slot.player.team} - ${slot.player.nationality}`}
                        >
                          {slot.player.name}
                        </div>
                        <div className="my-team-player-team">{slot.player.team}</div>
                        <div className="my-team-player-flag">{getFlagEmoji(slot.player.nationality)}</div>
                        <button 
                          className="my-team-remove-btn"
                          onClick={() => onRemoveFromSlot(idx)}
                          aria-label={`Remove ${slot.player.name} from ${formationArr[idx].label}`}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <button
                          className="my-team-add-btn"
                          onClick={() => setPicker({ open: true, slotIdx: idx })}
                          disabled={eligible.length === 0}
                          aria-label={`Add player to ${formationArr[idx].label} position`}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </PitchRow>
          )
        ))}
      </div>
      <PlayerTooltip 
        player={tooltip.player} 
        show={tooltip.show} 
        position={tooltip.position} 
      />
      <PlayerPickerModal
        open={picker.open}
        onClose={() => setPicker({ open: false, slotIdx: null })}
        players={picker.slotIdx !== null ? eligibleBenchPlayers(picker.slotIdx) : []}
        onSelect={player => {
          onAddToSlot(picker.slotIdx, player);
          setPicker({ open: false, slotIdx: null });
        }}
        filledPlayerIds={filledPlayerIds}
      />
      {/* Bench Section */}
      {bench.length > 0 && (
        <div className="my-team-bench">
          <h3 className="my-team-bench-title">Bench ({bench.length}/23)</h3>
          <div className="my-team-bench-list">
            {bench.map(player => {
              const isMinimal = !player.nationality;
              return (
                <div key={player.id} className="my-team-bench-card">
                  <div 
                    className="my-team-bench-player-name"
                    onMouseEnter={(e) => handleMouseEnter(player, e)}
                    onMouseLeave={handleMouseLeave}
                    title={`${player.name} - ${player.team} - ${player.nationality}`}
                  >
                    {player.name}
                  </div>
                  <div className="my-team-bench-player-team">{player.team}</div>
                  <div className="my-team-bench-player-pos">{isMinimal ? player.position : `${positionIcons[player.position]} ${player.position}`}</div>
                  <div className="my-team-bench-actions">
                    <button 
                      className="my-team-remove-btn"
                      onClick={() => onRemoveFromBench(player.id)}
                      aria-label={`Remove ${player.name} from bench`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {bench.length === 0 && (
        <div className="my-team-bench-empty">
          <h3>No players in bench</h3>
          <p>Add players from the Player List to your bench first!</p>
        </div>
      )}
      <SlotPickerModal
        open={slotPicker.open}
        onClose={() => setSlotPicker({ open: false, player: null })}
        slots={slotPicker.player ? myTeam
          .map((slot, idx) => (slot.position === slotPicker.player.position) ? { idx, label: formationArr[idx].label, player: slot.player } : null)
          .filter(Boolean) : []}
        onSelect={idx => {
          handleAddOrReplace(idx, slotPicker.player);
          setSlotPicker({ open: false, player: null });
        }}
      />
    </div>
  );
};

export default MyTeam; 