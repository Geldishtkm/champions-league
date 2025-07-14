import React from 'react';

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

const positionIcons = {
  'Forward': '⚽️',
  'Defender': '🛡️',
  'Midfielder': '🏃‍♂️',
  'Goalkeeper': '🧤',
};

const StartingXI = ({ startingXIPlayers, onRemoveFromStartingXI, maxPlayers = 11 }) => {
  const isFull = startingXIPlayers.length >= maxPlayers;

  if (startingXIPlayers.length === 0) {
    return (
      <div className="starting-xi-container">
        <h2 className="section-title">
          <span className="title-icon">⚽</span>
          Starting XI
        </h2>
        <div className="empty-starting-xi">
          <div className="empty-icon">👥</div>
          <h3>No players in Starting XI</h3>
          <p>Add players from the Player List to build your starting lineup</p>
        </div>
      </div>
    );
  }

  return (
    <div className="starting-xi-container">
      <h2 className="section-title">
        <span className="title-icon">⚽</span>
        Starting XI ({startingXIPlayers.length}/{maxPlayers})
      </h2>
      
      <div className="starting-xi-grid">
        {startingXIPlayers.map((player, index) => (
          <div key={player.id} className="starting-xi-player-card">
            <div className="player-header">
              <div className="player-number">#{index + 1}</div>
              <button
                className="remove-btn"
                onClick={() => onRemoveFromStartingXI(player.id)}
                aria-label={`Remove ${player.name} from Starting XI`}
                title="Remove from Starting XI"
              >
                ✕
              </button>
            </div>
            
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-details">
                <span className="position-icon" title={player.position}>
                  {positionIcons[player.position] || '⚽'}
                </span>
                <span className="player-position">{player.position}</span>
              </div>
              <div className="player-team">
                <span className="team-name">{player.team}</span>
              </div>
              <div className="player-nationality">
                <span className="flag-emoji" title={player.nationality}>
                  {getFlagEmoji(player.nationality)}
                </span>
                <span className="nationality-name">{player.nationality}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isFull && (
        <div className="starting-xi-full-message">
          <span className="full-icon">✅</span>
          Starting XI is complete! ({maxPlayers} players)
        </div>
      )}
    </div>
  );
};

export default StartingXI; 