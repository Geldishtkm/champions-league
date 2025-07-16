import React, { useState, useEffect } from 'react';

const PlayerForm = ({ onAddPlayer, onEditPlayer, editingPlayer, players = [], onAddToBench, onAddToFrontendStartingXI, fetchPlayers }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Forward');
  const [team, setTeam] = useState('');
  const [nationality, setNationality] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Search states
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false);
  const [showPositionSuggestions, setShowPositionSuggestions] = useState(false);
  const [showNationalitySuggestions, setShowNationalitySuggestions] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name || '');
      setPosition(editingPlayer.position || 'Forward');
      setTeam(editingPlayer.team || '');
      setNationality(editingPlayer.nationality || '');
    } else {
      // Reset form when not editing
      setName('');
      setPosition('Forward');
      setTeam('');
      setNationality('');
    }
  }, [editingPlayer]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Helper functions for filtering
  const getFilteredNames = () => {
    if (!name.trim()) return [];
    return [...new Set(players
      .filter(p => p.name.toLowerCase().includes(name.toLowerCase()))
      .map(p => p.name)
    )].slice(0, 5);
  };

  const getFilteredTeams = () => {
    if (!team.trim()) return [];
    return [...new Set(players
      .filter(p => p.team.toLowerCase().includes(team.toLowerCase()))
      .map(p => p.team)
    )].slice(0, 5);
  };

  const getFilteredPositions = () => {
    if (!position.trim()) return [];
    return [...new Set(players
      .filter(p => p.position.toLowerCase().includes(position.toLowerCase()))
      .map(p => p.position)
    )].slice(0, 5);
  };

  const getFilteredNationalities = () => {
    if (!nationality.trim()) return [];
    return [...new Set(players
      .filter(p => p.nationality.toLowerCase().includes(nationality.toLowerCase()))
      .map(p => p.nationality)
    )].slice(0, 5);
  };

  // Suggestion component
  const SuggestionList = ({ suggestions, onSelect, onClose, field }) => {
    if (suggestions.length === 0) return null;
    return (
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              fontSize: '14px'
            }}
            onMouseDown={() => {
              if (field === 'name') {
                // Auto-fill all fields from matched player
                const matchedPlayer = players.find(p => p.name === suggestion);
                if (matchedPlayer) {
                  setName(matchedPlayer.name);
                  setPosition(matchedPlayer.position || 'Forward');
                  setTeam(matchedPlayer.team || '');
                  setNationality(matchedPlayer.nationality || '');
                } else {
                  setName(suggestion);
                }
              } else if (field === 'team') {
                setTeam(suggestion);
              } else if (field === 'position') {
                setPosition(suggestion);
              } else if (field === 'nationality') {
                setNationality(suggestion);
              }
              onClose();
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            {suggestion}
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - only name is required
    if (!name.trim()) {
      showMessage('error', 'Player name is required');
      return;
    }

    setLoading(true);
    
    try {
      const playerData = { 
        name: name.trim(), 
        position: position.trim() || 'Unknown', 
        team: team.trim() || 'Unknown', 
        nationality: nationality.trim() || 'Unknown' 
      };

      if (editingPlayer) {
        // Editing existing player
        await onEditPlayer(editingPlayer.id, playerData);
        showMessage('success', 'Player updated successfully!');
      } else {
        // Adding new player to backend first
        const addedPlayer = await onAddPlayer(playerData);
        
        // Then add to bench (like the player cards do)
        if (onAddToBench && addedPlayer) {
          // Use the player returned from backend (with proper ID)
          onAddToBench(addedPlayer);
        }
        
        showMessage('success', 'Player added to team!');
        // Reset form only for new players
        setName('');
        setPosition('Forward');
        setTeam('');
        setNationality('');
        if (fetchPlayers) await fetchPlayers(); // Refresh player list after add
      }
    } catch (error) {
      showMessage('error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToStartingXI = async (e) => {
    e.preventDefault();
    
    // Validation - only name is required
    if (!name.trim()) {
      showMessage('error', 'Player name is required');
      return;
    }

    setLoading(true);
    
    try {
      const playerData = { 
        name: name.trim(), 
        position: position.trim() || 'Unknown', 
        team: team.trim() || 'Unknown', 
        nationality: nationality.trim() || 'Unknown' 
      };

      // Add player to team first
      const addedPlayer = await onAddPlayer(playerData);
      
      // Then add to starting XI (frontend-only)
      if (onAddToFrontendStartingXI && addedPlayer) {
        // Use the player returned from backend (with proper ID)
        onAddToFrontendStartingXI(addedPlayer);
      }
      
      showMessage('success', 'Player added to team and Starting XI!');
      // Reset form
      setName('');
      setPosition('Forward');
      setTeam('');
      setNationality('');
      if (fetchPlayers) await fetchPlayers(); // Refresh player list after add
    } catch (error) {
      showMessage('error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (editingPlayer) {
      // Reset form to original values
      setName(editingPlayer.name || '');
      setPosition(editingPlayer.position || 'Forward');
      setTeam(editingPlayer.team || '');
      setNationality(editingPlayer.nationality || '');
    } else {
      // Clear form
      setName('');
      setPosition('Forward');
      setTeam('');
      setNationality('');
    }
  };

  return (
    <form className="player-form-container" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {editingPlayer ? 'Edit Player' : 'Add New Player'}
      </h2>
      
      {/* Message display */}
      {message.text && (
        <div className={`message ${message.type}`} style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Name *</label>
        <input 
          className="form-input" 
          value={name} 
          onChange={e => {
            setName(e.target.value);
            setShowNameSuggestions(true);
          }}
          onFocus={() => setShowNameSuggestions(true)}
          onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
          required 
          disabled={loading}
          placeholder="Enter player name"
        />
        {showNameSuggestions && (
          <SuggestionList
            suggestions={getFilteredNames()}
            onSelect={setName}
            onClose={() => setShowNameSuggestions(false)}
            field="name"
          />
        )}
      </div>
      
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Position (optional)</label>
        <input 
          className="form-input" 
          value={position} 
          onChange={e => {
            setPosition(e.target.value);
            setShowPositionSuggestions(true);
          }}
          onFocus={() => setShowPositionSuggestions(true)}
          onBlur={() => setTimeout(() => setShowPositionSuggestions(false), 200)}
          disabled={loading}
          placeholder="Enter position (optional)"
        />
        {showPositionSuggestions && (
          <SuggestionList
            suggestions={getFilteredPositions()}
            onSelect={setPosition}
            onClose={() => setShowPositionSuggestions(false)}
            field="position"
          />
        )}
      </div>
      
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Team (optional)</label>
        <input 
          className="form-input" 
          value={team} 
          onChange={e => {
            setTeam(e.target.value);
            setShowTeamSuggestions(true);
          }}
          onFocus={() => setShowTeamSuggestions(true)}
          onBlur={() => setTimeout(() => setShowTeamSuggestions(false), 200)}
          disabled={loading}
          placeholder="Enter team name (optional)"
        />
        {showTeamSuggestions && (
          <SuggestionList
            suggestions={getFilteredTeams()}
            onSelect={setTeam}
            onClose={() => setShowTeamSuggestions(false)}
            field="team"
          />
        )}
      </div>
      
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Nationality (optional)</label>
        <input 
          className="form-input" 
          value={nationality} 
          onChange={e => {
            setNationality(e.target.value);
            setShowNationalitySuggestions(true);
          }}
          onFocus={() => setShowNationalitySuggestions(true)}
          onBlur={() => setTimeout(() => setShowNationalitySuggestions(false), 200)}
          disabled={loading}
          placeholder="Enter nationality (optional)"
        />
        {showNationalitySuggestions && (
          <SuggestionList
            suggestions={getFilteredNationalities()}
            onSelect={setNationality}
            onClose={() => setShowNationalitySuggestions(false)}
            field="nationality"
          />
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '12px', flexDirection: editingPlayer ? 'row' : 'column' }}>
        {editingPlayer ? (
          // Edit mode - single button
          <>
            <button 
              className="submit-btn" 
              type="submit"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : 'Update Player'}
            </button>
            
            <button 
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: '1rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          // Add mode - two buttons
          <>
            <button 
              className="submit-btn" 
              type="submit"
              disabled={loading}
              style={{ 
                flex: 1,
                padding: '1rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Saving...' : 'Add to My Team (Bench)'}
            </button>
            
            <button 
              type="button"
              onClick={handleAddToStartingXI}
              disabled={loading}
              style={{
                padding: '1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Saving...' : 'Add to My Team + Starting XI'}
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default PlayerForm; 