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
    padding: '60px',
    color: '#fff',
    flexDirection: 'column',
    gap: '20px',
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      border: '4px solid rgba(255,255,255,0.1)',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
    }}></div>
    <span style={{ 
      fontSize: '18px', 
      fontWeight: 500,
      color: 'rgba(255,255,255,0.9)',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    }}>
      Loading players...
    </span>
  </div>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <div style={{
    textAlign: 'center',
    padding: '60px',
    color: '#fff',
    background: 'rgba(229,62,62,0.1)',
    borderRadius: '20px',
    border: '1px solid rgba(229,62,62,0.2)',
    backdropFilter: 'blur(10px)',
  }}>
    <div style={{ 
      fontSize: '60px', 
      marginBottom: '20px',
      animation: 'bounce 2s ease-in-out infinite',
    }}>⚠️</div>
    <h3 style={{ 
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 700,
      color: '#fc8181',
    }}>
      Unable to load players
    </h3>
    <p style={{ 
      marginBottom: '30px', 
      opacity: 0.8,
      fontSize: '16px',
      lineHeight: 1.6,
    }}>
      {message}
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: 600,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={e => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
        }}
        onMouseOut={e => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
        }}
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
    padding: '60px',
    color: '#fff',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  }}>
    <div style={{ 
      fontSize: '60px', 
      marginBottom: '20px',
      animation: 'pulse 2s ease-in-out infinite',
    }}>📋</div>
    <h3 style={{ 
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 700,
      color: 'rgba(255,255,255,0.9)',
    }}>
      No players found
    </h3>
    <p style={{ 
      opacity: 0.8,
      fontSize: '16px',
      lineHeight: 1.6,
    }}>
      {message}
    </p>
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
    <div 
      className={`player-card ${isInStartingXI ? 'in-starting-xi' : ''}`}
      style={{
        background: isInStartingXI 
          ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)'
          : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        border: isInStartingXI 
          ? '1px solid rgba(255,215,0,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
      }}
    >
      {isInStartingXI && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
          color: '#000',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          ⚽ Starting XI
        </div>
      )}
      
      <div className="player-header" style={{
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span className="player-name" style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            {player.name}
          </span>
          <span className="player-position" style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {positionIcons[player.position] || ''} {player.position}
          </span>
        </div>
        <span className="player-id" style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'monospace',
        }}>
          ID: {player.id}
        </span>
      </div>
      
      <div className="player-details" style={{
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ fontSize: '16px' }}>🏟️</span>
          <span className="player-team" style={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
          }}>
            {player.team}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ fontSize: '20px' }}>{getFlagEmoji(player.nationality)}</span>
          <span className="player-nationality" style={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
          }}>
            {player.nationality}
          </span>
        </div>
      </div>
      
      <div className="player-actions" style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <button 
          onClick={handleAddToBench}
          aria-label={`Add ${player.name} to bench`}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease',
            flex: 1,
            minWidth: '120px',
          }}
          onMouseOver={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
          }}
          onMouseOut={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(40, 167, 69, 0.3)';
          }}
        >
          Add to Bench
        </button>
        
        {onAddToStartingXI && (
          <button 
            onClick={handleAddToStartingXI}
            aria-label={isInStartingXI ? `${player.name} already in Starting XI` : `Add ${player.name} to Starting XI`}
            title={isInStartingXI ? 'Already in Starting XI' : 'Add to Starting XI'}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              background: isInStartingXI 
                ? 'linear-gradient(135deg, #ffc107 0%, #ffca2c 100%)'
                : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
              color: isInStartingXI ? '#000' : '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isInStartingXI 
                ? '0 4px 16px rgba(255, 193, 7, 0.3)'
                : '0 4px 16px rgba(23, 162, 184, 0.3)',
              transition: 'all 0.3s ease',
              flex: 1,
              minWidth: '120px',
            }}
            onMouseOver={e => {
              if (!isInStartingXI) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.4)';
              }
            }}
            onMouseOut={e => {
              if (!isInStartingXI) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(23, 162, 184, 0.3)';
              }
            }}
          >
            {isInStartingXI ? 'In Starting XI' : 'Add to Starting XI'}
          </button>
        )}
        
        {showDeleteButton && onDeletePlayer && (
          <button 
            onClick={handleDelete}
            aria-label={`Delete ${player.name}`}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(220, 53, 69, 0.3)',
              transition: 'all 0.3s ease',
              flex: 1,
              minWidth: '120px',
            }}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(220, 53, 69, 0.3)';
            }}
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: 280,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}>
          <img
            src={realMadridTeam}
            alt="Real Madrid Team - Click to view all clubs"
            className="main-interactive-img"
            style={{
              width: 280,
              height: 180,
              objectFit: 'cover',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: 20,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
            }}
            onClick={() => setView('clubs')}
            onKeyDown={(e) => e.key === 'Enter' && setView('clubs')}
            tabIndex={0}
            role="button"
            aria-label="View all clubs"
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.05) translateY(-5px)';
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1) translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          />
          <button
            style={{
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setView('clubs')}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
            }}
            aria-label="View all clubs"
          >
            View Clubs
          </button>
        </div>
        
        {/* Position Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: 280,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}>
          <img
            src={defensaImg}
            alt="Player Positions - Click to view all positions"
            className="main-interactive-img"
            style={{
              width: 280,
              height: 180,
              objectFit: 'cover',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: 20,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
            }}
            onClick={() => setView('positions')}
            onKeyDown={(e) => e.key === 'Enter' && setView('positions')}
            tabIndex={0}
            role="button"
            aria-label="View all positions"
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.05) translateY(-5px)';
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1) translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          />
          <button
            style={{
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setView('positions')}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
            }}
            aria-label="View all positions"
          >
            View Positions
          </button>
        </div>
        
        {/* Nation Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: 280,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}>
          <img
            src={nationImg}
            alt="Player Nations - Click to view all nations"
            className="main-interactive-img"
            style={{
              width: 280,
              height: 180,
              objectFit: 'cover',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              marginBottom: 20,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
            }}
            onClick={() => setView('nations')}
            onKeyDown={(e) => e.key === 'Enter' && setView('nations')}
            tabIndex={0}
            role="button"
            aria-label="View all nations"
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.05) translateY(-5px)';
              e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1) translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
            }}
          />
          <button
            style={{
              padding: '14px 32px',
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setView('nations')}
            onMouseOver={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
            }}
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
        <div style={{ 
          color: '#fc8181', 
          fontWeight: 'bold', 
          marginBottom: 16,
          padding: '12px 16px',
          background: 'rgba(229,62,62,0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(229,62,62,0.2)',
          backdropFilter: 'blur(10px)',
        }}>
          ⚠️ Warning: Duplicate player IDs detected in this view! IDs: {duplicates.map(([id]) => id).join(', ')}
        </div>
      );
    }
  }

  // Add search interface for player views
  const searchInterface = (view === 'players' || view === 'players-by-position' || view === 'players-by-nation') && (
    <div style={{
      marginBottom: '30px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1,
          minWidth: '250px',
          position: 'relative',
        }}>
          <input
            type="text"
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search players by name, team, or nationality..."
            style={{
              width: '100%',
              padding: '14px 20px 14px 50px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onFocus={e => {
              e.target.style.border = '1px solid rgba(102, 126, 234, 0.5)';
              e.target.style.background = 'rgba(255,255,255,0.15)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onBlur={e => {
              e.target.style.border = '1px solid rgba(255,255,255,0.2)';
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'scale(1)';
            }}
          />
          <span style={{
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
          }}>
            🔍
          </span>
        </div>
        {searchTerm && (
          <button
            onClick={() => onSearchChange && onSearchChange('')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(229,62,62,0.2)',
              color: '#fc8181',
              border: '1px solid rgba(229,62,62,0.3)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
            onMouseOver={e => {
              e.target.style.background = 'rgba(229,62,62,0.3)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.target.style.background = 'rgba(229,62,62,0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="player-list-container" style={{
      color: '#fff',
      position: 'relative',
    }}>
      {duplicateIdWarning}
      {searchInterface}
      {content}
    </div>
  );
};

export default PlayerList; 