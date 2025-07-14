import React, { useState, useEffect } from 'react';
import realMadridTeam from './assets/real-madrid-team.jpg';
import defensaImg from './assets/defensa.jpg';
import nationImg from './assets/nation.jpg';
import ChampionsLogo from './ChampionsLogo';

const positionIcons = {
  'Forward': '⚽️',
  'Defender': '🛡️',
  'Midfielder': '🏃‍♂️',
  'Goalkeeper': '🧤',
  'Multi-Position': '🔄',
};



// Helper function to normalize position display
const normalizePositionDisplay = (pos) => {
  if (!pos) return '';
  const position = pos.toString().toUpperCase().trim();
  
  // Check if it's a multi-position player (contains comma)
  if (position.includes(',')) {
    const positions = position.split(',').map(p => p.trim());
    const normalizedPositions = positions.map(p => {
      const positionMap = {
        'GK': 'Goalkeeper',
        'G': 'Goalkeeper',
        'DEF': 'Defender',
        'DEFENDER': 'Defender',
        'D': 'Defender',
        'DF': 'Defender',
        'MID': 'Midfielder',
        'MIDFIELDER': 'Midfielder',
        'MF': 'Midfielder',
        'M': 'Midfielder',
        'FWD': 'Forward',
        'FORWARD': 'Forward',
        'FW': 'Forward',
        'F': 'Forward',
        'ST': 'Forward',
        'STRIKER': 'Forward',
        'ATT': 'Forward',
        'ATTACKER': 'Forward',
      };
      return positionMap[p] || p;
    });
    return normalizedPositions.join(', ');
  }
  
  // Single position mapping
  const positionMap = {
    'GK': 'Goalkeeper',
    'G': 'Goalkeeper',
    'DEF': 'Defender',
    'DEFENDER': 'Defender',
    'D': 'Defender',
    'DF': 'Defender',
    'MID': 'Midfielder',
    'MIDFIELDER': 'Midfielder',
    'MF': 'Midfielder',
    'M': 'Midfielder',
    'FWD': 'Forward',
    'FORWARD': 'Forward',
    'FW': 'Forward',
    'F': 'Forward',
    'ST': 'Forward',
    'STRIKER': 'Forward',
    'ATT': 'Forward',
    'ATTACKER': 'Forward',
  };
  
  return positionMap[position] || pos;
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

// Loading Spinner Component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#fff'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid rgba(255,255,255,0.3)',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <span style={{ marginLeft: '12px', fontSize: '16px' }}>Loading players...</span>
  </div>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <div style={{
    textAlign: 'center',
    padding: '40px',
    color: '#fff'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
    <h3 style={{ marginBottom: '16px' }}>Unable to load players</h3>
    <p style={{ marginBottom: '24px', opacity: 0.8 }}>{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="btn btn-primary"
        style={{ padding: '12px 24px' }}
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty State Component
const EmptyState = ({ message }) => (
  <div style={{
    textAlign: 'center',
    padding: '40px',
    color: '#fff'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
    <h3 style={{ marginBottom: '16px' }}>No players found</h3>
    <p style={{ opacity: 0.8 }}>{message}</p>
  </div>
);

// Simplified Player Card Component
const PlayerCard = ({ player, onAddToBench, onAddToStartingXI, onDeletePlayer, isInStartingXI, showDeleteButton = false }) => {
  const handleAddToBench = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PlayerCard - Adding to bench:', player.name, player.id);
    if (onAddToBench) {
      onAddToBench(player);
    }
  };

  const handleAddToStartingXI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PlayerCard - Adding to Starting XI:', player.name, player.id);
    if (onAddToStartingXI) {
      onAddToStartingXI(player);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeletePlayer) {
      onDeletePlayer(player.id);
    }
  };

  return (
    <div className={`player-card ${isInStartingXI ? 'in-starting-xi' : ''}`}>
      <div className="player-header">
        <span className="player-name">{player.name}</span>
        <span className="player-id" style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>ID: {player.id}</span>
        <span className="player-position">{positionIcons[player.position] || ''} {player.position}</span>
        {isInStartingXI && (
          <span className="starting-xi-badge" title="In Starting XI">⚽</span>
        )}
      </div>
      <div className="player-details">
        <span className="player-team">🏟️ {player.team}</span>
        <span className="player-nationality">
          <span style={{ fontSize: 22, marginRight: 6 }}>{getFlagEmoji(player.nationality)}</span>
          {player.nationality}
        </span>
      </div>
      <div className="player-actions">
        <button 
          className="btn btn-success" 
          onClick={handleAddToBench}
          aria-label={`Add ${player.name} to bench`}
        >
          Add to Bench
        </button>
        {onAddToStartingXI && (
          <button 
            className={`btn ${isInStartingXI ? 'btn-warning' : 'btn-info'}`}
            onClick={handleAddToStartingXI}
            aria-label={isInStartingXI ? `${player.name} already in Starting XI` : `Add ${player.name} to Starting XI`}
            title={isInStartingXI ? 'Already in Starting XI' : 'Add to Starting XI'}
          >
            {isInStartingXI ? 'In Starting XI' : 'Add to Starting XI'}
          </button>
        )}
        {showDeleteButton && onDeletePlayer && (
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
            aria-label={`Delete ${player.name}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const PlayerList = ({ 
  players, 
  onAddPlayer, 
  mainTeamIds = [], 
  benchIds = [], 
  benchFull = false,
  searchTerm,
  onSearchChange,
  onDeletePlayer,
  startingXI,
  updateStartingXI,
  frontendStartingXI = [],
  onAddToFrontendStartingXI,
  loading = false,
  error = null,
  onRetry
}) => {
  const [view, setView] = useState('main'); // main, clubs, players, positions, nations
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedNation, setSelectedNation] = useState(null);

  useEffect(() => {
    if (view === 'main') {
      document.body.classList.add('home-bg');
    } else {
      document.body.classList.remove('home-bg');
    }
    return () => document.body.classList.remove('home-bg');
  }, [view]);

  // Show loading state
  if (loading) {
    return (
      <div className="player-list-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="player-list-container">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  // Show empty state if no players
  if (!players || players.length === 0) {
    return (
      <div className="player-list-container">
        <EmptyState message="No players are currently available. Please try again later or add some players." />
      </div>
    );
  }

  let content;
  if (view === 'main') {
    content = (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 40,
        marginTop: 40,
        flexWrap: 'wrap',
      }}>
        {/* Teams Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 280 }}>
          <img
            src={realMadridTeam}
            alt="Real Madrid Team - Click to view all clubs"
            className="main-interactive-img"
            style={{
              width: 280,
              height: 180,
              objectFit: 'cover',
              borderRadius: 24,
              boxShadow: '0 4px 24px #0002',
              marginBottom: 24,
              marginTop: 16,
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
            }}
            onClick={() => setView('clubs')}
            onKeyDown={(e) => e.key === 'Enter' && setView('clubs')}
            tabIndex={0}
            role="button"
            aria-label="View all clubs"
          />
          <button
            style={{
              marginTop: 18,
              padding: '12px 32px',
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 14,
              background: 'linear-gradient(90deg, #007bff 0%, #00c6ff 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 12px #007bff44',
              cursor: 'pointer',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onClick={() => setView('clubs')}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            onFocus={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onBlur={e => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="View all clubs"
          >
            View Clubs
          </button>
        </div>
        {/* Position Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 280 }}>
          <img
            src={defensaImg}
            alt="Player Positions - Click to view all positions"
            className="main-interactive-img"
            style={{
              width: 280,
              height: 180,
              objectFit: 'cover',
              borderRadius: 24,
              boxShadow: '0 4px 24px #0002',
              marginBottom: 24,
              marginTop: 16,
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
            }}
            onClick={() => setView('positions')}
            onKeyDown={(e) => e.key === 'Enter' && setView('positions')}
            tabIndex={0}
            role="button"
            aria-label="View all positions"
          />
          <button
            style={{
              marginTop: 18,
              padding: '12px 32px',
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 14,
              background: 'linear-gradient(90deg, #007bff 0%, #00c6ff 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 12px #007bff44',
              cursor: 'pointer',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onClick={() => setView('positions')}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            onFocus={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onBlur={e => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="View all positions"
          >
            View Positions
          </button>
        </div>
        {/* Nation Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 280 }}>
          <img
            src={nationImg}
            alt="Player Nations - Click to view all nations"
            className="main-interactive-img"
            style={{
              width: 280,
              height: 180,
              objectFit: 'cover',
              borderRadius: 24,
              boxShadow: '0 4px 24px #0002',
              marginBottom: 24,
              marginTop: 16,
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
            }}
            onClick={() => setView('nations')}
            onKeyDown={(e) => e.key === 'Enter' && setView('nations')}
            tabIndex={0}
            role="button"
            aria-label="View all nations"
          />
          <button
            style={{
              marginTop: 18,
              padding: '12px 32px',
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 14,
              background: 'linear-gradient(90deg, #007bff 0%, #00c6ff 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 12px #007bff44',
              cursor: 'pointer',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onClick={() => setView('nations')}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            onFocus={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onBlur={e => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="View all nations"
          >
            View Nations
          </button>
        </div>
      </div>
    );
  } else if (view === 'positions') {
    // Show all positions
    const positions = [...new Set(players.map(p => p.position))].sort();
    content = (
      <div>
        <button 
          className="btn btn-primary" 
          style={{ marginBottom: 24 }} 
          onClick={() => setView('main')}
          aria-label="Go back to main view"
        >
          ← Back to Main
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Player Positions</h2>
        <div className="player-grid">
          {positions
            .filter(position => {
              // Filter out empty, null, undefined, or "Unknown" positions
              return position && position.trim() !== '' && position !== 'Unknown' && position !== 'unknown';
            })
            .map(position => {
              const normalizedPosition = normalizePositionDisplay(position);
              const isMultiPosition = position.includes(',');
              const icon = isMultiPosition ? '🔄' : (positionIcons[normalizedPosition] || '');
              
              return (
                <div key={position} className="player-card" style={{ cursor: 'pointer' }}>
                  <div className="player-header">
                    <span className="player-name">{normalizedPosition}</span>
                    <span className="player-position">{icon}</span>
                  </div>
                  <div className="player-details">
                    <span className="player-team">
                      {players.filter(p => p.position === position).length} players
                    </span>
                  </div>
                  <div className="player-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setSelectedPosition(position);
                        setView('players-by-position');
                      }}
                      aria-label={`View ${normalizedPosition} players`}
                    >
                      View Players
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  } else if (view === 'nations') {
    // Show all nations
    const nations = [...new Set(players.map(p => p.nationality))].sort();
    content = (
      <div>
        <button 
          className="btn btn-primary" 
          style={{ marginBottom: 24 }} 
          onClick={() => setView('main')}
          aria-label="Go back to main view"
        >
          ← Back to Main
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Player Nations</h2>
        <div className="player-grid">
          {nations
            .filter(nation => {
              // Filter out empty, null, undefined, or "Unknown" nations
              return nation && nation.trim() !== '' && nation !== 'Unknown' && nation !== 'unknown';
            })
            .map(nation => (
              <div key={nation} className="player-card" style={{ cursor: 'pointer' }}>
                <div className="player-header">
                  <span className="player-name">{nation}</span>
                  <span className="player-position">{getFlagEmoji(nation)}</span>
                </div>
                <div className="player-details">
                  <span className="player-team">
                    {players.filter(p => p.nationality === nation).length} players
                  </span>
                </div>
                <div className="player-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setSelectedNation(nation);
                      setView('players-by-nation');
                    }}
                    aria-label={`View ${nation} players`}
                  >
                    View Players
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  } else if (view === 'clubs') {
    // Show all clubs
    const clubs = [...new Set(players.map(p => p.team))].sort();
    content = (
      <div>
        <button 
          className="btn btn-primary" 
          style={{ marginBottom: 24 }} 
          onClick={() => setView('main')}
          aria-label="Go back to main view"
        >
          ← Back to Main
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Football Clubs</h2>
        <div className="player-grid">
          {clubs
            .filter(club => {
              // Filter out empty, null, undefined, or "Unknown" clubs
              return club && club.trim() !== '' && club !== 'Unknown' && club !== 'unknown';
            })
            .map(club => {
              const playerCount = players.filter(p => p.team === club).length;
              // Only show clubs that have players
              if (playerCount === 0) return null;
              
              return (
                <div key={club} className="player-card" style={{ cursor: 'pointer' }}>
                  <div className="player-header">
                    <span className="player-name">{club}</span>
                    <span className="player-position">🏟️</span>
                  </div>
                  <div className="player-details">
                    <span className="player-team">
                      {playerCount} players
                    </span>
                  </div>
                  <div className="player-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setSelectedClub(club);
                        setView('players');
                      }}
                      aria-label={`View ${club} players`}
                    >
                      View Players
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  } else if (view === 'players-by-position' && selectedPosition) {
    // Show players filtered by position
    const positionPlayers = players.filter(p => p.position === selectedPosition);
    content = (
      <div>
        <button 
          className="btn btn-primary" 
          style={{ marginBottom: 24 }} 
          onClick={() => setView('positions')}
          aria-label="Go back to positions"
        >
          ← Back to Positions
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{normalizePositionDisplay(selectedPosition)} Players</h2>
        {positionPlayers.length === 0 ? (
          <EmptyState message={`No players found for ${normalizePositionDisplay(selectedPosition)} position.`} />
        ) : (
          <div className="player-grid">
            {positionPlayers.map(player => {
              const isInStartingXI = frontendStartingXI.some(p => p.id === player.id);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onAddToBench={onAddPlayer}
                  onAddToStartingXI={onAddToFrontendStartingXI}
                  onDeletePlayer={onDeletePlayer}
                  isInStartingXI={isInStartingXI}
                  showDeleteButton={false}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (view === 'players-by-nation' && selectedNation) {
    // Show players filtered by nation
    const nationPlayers = players.filter(p => p.nationality === selectedNation);
    content = (
      <div>
        <button 
          className="btn btn-primary" 
          style={{ marginBottom: 24 }} 
          onClick={() => setView('nations')}
          aria-label="Go back to nations"
        >
          ← Back to Nations
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{selectedNation} Players</h2>
        {nationPlayers.length === 0 ? (
          <EmptyState message={`No players found for ${selectedNation}.`} />
        ) : (
          <div className="player-grid">
            {nationPlayers.map(player => {
              const isInStartingXI = frontendStartingXI.some(p => p.id === player.id);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onAddToBench={onAddPlayer}
                  onAddToStartingXI={onAddToFrontendStartingXI}
                  onDeletePlayer={onDeletePlayer}
                  isInStartingXI={isInStartingXI}
                  showDeleteButton={false}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (view === 'players' && selectedClub) {
    // Show players filtered by team
    const clubPlayers = players.filter(p => p.team === selectedClub);
    content = (
      <div>
        <button 
          className="btn btn-primary" 
          style={{ marginBottom: 24 }} 
          onClick={() => setView('clubs')}
          aria-label="Go back to clubs"
        >
          ← Back to Clubs
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{selectedClub} Players</h2>
        {clubPlayers.length === 0 ? (
          <EmptyState message={`No players found for ${selectedClub}.`} />
        ) : (
          <div className="player-grid">
            {clubPlayers.map(player => {
              const isInStartingXI = frontendStartingXI.some(p => p.id === player.id);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onAddToBench={onAddPlayer}
                  onAddToStartingXI={onAddToFrontendStartingXI}
                  onDeletePlayer={onDeletePlayer}
                  isInStartingXI={isInStartingXI}
                  showDeleteButton={false}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Detect duplicate IDs in the current view
  let duplicateIdWarning = null;
  if (players && players.length > 0) {
    const idCounts = players.reduce((acc, p) => { acc[p.id] = (acc[p.id] || 0) + 1; return acc; }, {});
    const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
    if (duplicates.length > 0) {
      duplicateIdWarning = (
        <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 16 }}>
          Warning: Duplicate player IDs detected in this view! IDs: {duplicates.map(([id]) => id).join(', ')}
        </div>
      );
    }
  }
  return <div className="player-list-container">{duplicateIdWarning}{content}</div>;
};

export default PlayerList; 