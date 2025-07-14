import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';
import MyTeam from './MyTeam';
import StartingXI from './StartingXI';
import ChampionsLogo from './ChampionsLogo';
import PlayerGuesser from './PlayerGuesser';
import PlayerListBasicAuth from './PlayerListBasicAuth';
import './App.css';

const FORMATIONS = {
  '5-3-2': [
    { id: 1, label: 'GK', position: 'Goalkeeper' },
    { id: 2, label: 'LB', position: 'Defender' },
    { id: 3, label: 'CB', position: 'Defender' },
    { id: 4, label: 'CB', position: 'Defender' },
    { id: 5, label: 'CB', position: 'Defender' },
    { id: 6, label: 'RB', position: 'Defender' },
    { id: 7, label: 'CM', position: 'Midfielder' },
    { id: 8, label: 'CM', position: 'Midfielder' },
    { id: 9, label: 'CM', position: 'Midfielder' },
    { id: 10, label: 'ST', position: 'Forward' },
    { id: 11, label: 'ST', position: 'Forward' },
  ],
  '4-4-2': [
    { id: 1, label: 'GK', position: 'Goalkeeper' },
    { id: 2, label: 'LB', position: 'Defender' },
    { id: 3, label: 'CB', position: 'Defender' },
    { id: 4, label: 'CB', position: 'Defender' },
    { id: 5, label: 'RB', position: 'Defender' },
    { id: 6, label: 'LM', position: 'Midfielder' },
    { id: 7, label: 'CM', position: 'Midfielder' },
    { id: 8, label: 'CM', position: 'Midfielder' },
    { id: 9, label: 'RM', position: 'Midfielder' },
    { id: 10, label: 'ST', position: 'Forward' },
    { id: 11, label: 'ST', position: 'Forward' },
  ],
  '4-3-3': [
    { id: 1, label: 'GK', position: 'Goalkeeper' },
    { id: 2, label: 'LB', position: 'Defender' },
    { id: 3, label: 'CB', position: 'Defender' },
    { id: 4, label: 'CB', position: 'Defender' },
    { id: 5, label: 'RB', position: 'Defender' },
    { id: 6, label: 'CM', position: 'Midfielder' },
    { id: 7, label: 'CM', position: 'Midfielder' },
    { id: 8, label: 'CM', position: 'Midfielder' },
    { id: 9, label: 'LW', position: 'Forward' },
    { id: 10, label: 'ST', position: 'Forward' },
    { id: 11, label: 'RW', position: 'Forward' },
  ],
};

function App() {
  const [activeTab, setActiveTab] = useState('player-list');
  const [selectedFormation, setSelectedFormation] = useState('5-3-2');
  const [myTeam, setMyTeam] = useState(FORMATIONS['5-3-2'].map(slot => ({ ...slot, player: null })));
  const [bench, setBench] = useState([]); // array of player objects
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [frontendStartingXI, setFrontendStartingXI] = useState([]); // array of player objects (frontend-only)
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    // Test credentials by making a simple request
    try {
      const response = await fetch('http://localhost:8080/champ/v1/player', {
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setIsLoggedIn(true);
        setActiveTab('player-list');
      } else if (response.status === 401) {
        setLoginError('Invalid username or password.');
      } else {
        setLoginError('Login failed. Server returned status: ' + response.status);
      }
    } catch (err) {
      setLoginError('Network error. Please check your connection.');
    }
  };

  // Fetch all players
  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/champ/v1/player');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw player data from backend:', data);
      
      // Helper function to normalize position
      const normalizePosition = (pos) => {
        if (!pos) return '';
        const position = pos.toString().toUpperCase().trim();
        
        // Map abbreviations to full position names
        const positionMap = {
          'GK': 'Goalkeeper',
          'G': 'Goalkeeper',
          'DEF': 'Defender',
          'DEFENDER': 'Defender',
          'D': 'Defender',
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
        
        return positionMap[position] || position;
      };

      // Normalize player data and ensure proper ID
      const normalized = data.map((p, index) => {
        const rawPosition = p.pos || p.position || '';
        const normalizedPosition = normalizePosition(rawPosition);
        
        const normalizedPlayer = {
          ...p,
          id: p.id || p.playerId || p._id || `temp_${index}`, // Ensure ID exists
          team: p.teamName || p.team || '',
          position: normalizedPosition,
          nationality: p.nation || p.nationality || '',
        };
        console.log(`Normalized player ${index}:`, normalizedPlayer.name, 'ID:', normalizedPlayer.id, 'Position:', rawPosition, '→', normalizedPosition);
        return normalizedPlayer;
      });
      
      // Check for duplicate IDs
      const ids = normalized.map(p => p.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn('Duplicate IDs detected after normalization:', duplicateIds);
      }
      
      setPlayers(normalized);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please check your connection.');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove fetchStartingXI and updateStartingXI functions and all fetch calls to /champ/v1/player/startingXI
  // Remove startingXI state and any usage of setStartingXI that depends on backend
  // Remove useEffect call to fetchStartingXI
  // Remove any props or logic that passes startingXI or updateStartingXI to child components

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Add player (POST)
  const addPlayer = async (newPlayer) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/champ/v1/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const addedPlayer = await response.json();
      await fetchPlayers();
      showMessage('success', 'Player added successfully!');
      return addedPlayer; // Return the added player with proper ID
    } catch (err) {
      console.error('Error adding player:', err);
      showMessage('error', 'Failed to add player. Please try again.');
      throw err; // Re-throw to be handled by caller
    } finally {
      setLoading(false);
    }
  };

  // Add player to team and starting XI
  const addPlayerToTeamAndStartingXI = async (newPlayer) => {
    setLoading(true);
    try {
      // First add to team
      const response = await fetch('http://localhost:8080/champ/v1/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const addedPlayer = await response.json();
      
      // Then add to starting XI
      const currentStartingXI = [...frontendStartingXI];
      if (currentStartingXI.length < 11) {
        currentStartingXI.push(addedPlayer);
        setFrontendStartingXI(currentStartingXI);
      }
      
      await fetchPlayers();
      showMessage('success', 'Player added to team and Starting XI!');
    } catch (err) {
      console.error('Error adding player to team and starting XI:', err);
      showMessage('error', 'Failed to add player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Edit player (PUT)
  const editPlayer = async (id, updatedPlayer) => {
    setLoading(true);
    try {
      console.log('Editing player with ID:', id);
      console.log('Updated player data:', updatedPlayer);
      
      // Check if this is a temporary ID (frontend-only player)
      if (id && id.toString().startsWith('temp_')) {
        console.log('This is a frontend-only player, adding to backend first');
        
        // For frontend-only players, add them to backend first, then update
        const response = await fetch('http://localhost:8080/champ/v1/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPlayer)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error text:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const addedPlayer = await response.json();
        console.log('Added frontend player to backend:', addedPlayer);
        
        // Update the player in frontend state with the new backend ID
        // This will be handled by fetchPlayers() which refreshes the player list
        
        await fetchPlayers();
        setEditingPlayer(null);
        showMessage('success', 'Player added to backend and updated successfully!');
        return;
      }
      
      // Regular backend player update
      const response = await fetch(`http://localhost:8080/champ/v1/player/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayer)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      await fetchPlayers();
      setEditingPlayer(null); // Clear editing state
      showMessage('success', 'Player updated successfully!');
    } catch (err) {
      console.error('Error updating player:', err);
      showMessage('error', `Failed to update player: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete player (DELETE)
  const deletePlayer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/champ/v1/player/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchPlayers();
      showMessage('success', 'Player deleted successfully!');
    } catch (err) {
      console.error('Error deleting player:', err);
      showMessage('error', 'Failed to delete player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update myTeam slots when formation changes
  useEffect(() => {
    setMyTeam(prev => {
      const newFormation = FORMATIONS[selectedFormation];
      // Try to keep players in their positions if possible
      const newTeam = newFormation.map((slot, idx) => {
        const prevSlot = prev.find(s => s.label === slot.label && s.position === slot.position);
        return prevSlot ? { ...slot, player: prevSlot.player } : { ...slot, player: null };
      });
      
      // Any players that don't fit go to the bench
      const lostPlayers = prev.filter(s => s.player && !newFormation.some(f => f.player && f.player.id === s.player.id));
      lostPlayers.forEach(s => {
        if (s.player && !bench.some(p => p.id === s.player.id) && bench.length < 23) {
          setBench(b => [...b, s.player]);
        }
      });
      return newTeam;
    });
    // eslint-disable-next-line
  }, [selectedFormation]);

  // Add player to the bench (up to 23)
  const addPlayerToBench = (player) => {
    console.log('addPlayerToBench called with:', player.name, player.id);
    console.log('Current bench players:', bench.map(p => `${p.name} (${p.id})`));
    console.log('Current main team players:', myTeam.filter(slot => slot.player).map(slot => `${slot.player.name} (${slot.player.id})`));
    
    // Check if player is already in main team
    const isInMainTeam = myTeam.some(slot => slot.player && slot.player.id === player.id);
    if (isInMainTeam) {
      console.log('Player already in main team:', player.name);
      showMessage('info', `${player.name} is already in your main team!`);
      return;
    }
    
    // Check if player is already in bench
    const isInBench = bench.some(p => p.id === player.id);
    if (isInBench) {
      console.log('Player already in bench:', player.name);
      showMessage('info', `${player.name} is already on the bench!`);
      return;
    }
    
    // Check if bench is full
    if (bench.length >= 23) {
      console.log('Bench is full');
      showMessage('error', 'Bench is full (maximum 23 players)');
      return;
    }
    
    console.log('Adding player to bench:', player.name);
    setBench(prev => {
      console.log('Previous bench:', prev.map(p => p.name));
      const newBench = [...prev, player];
      console.log('New bench:', newBench.map(p => p.name));
      return newBench;
    });
    showMessage('success', `${player.name} added to bench!`);
  };

  // Add player from bench to a specific slot
  const addToSlot = (slotIdx, player) => {
    setMyTeam(prev => {
      if (prev.some(slot => slot.player && slot.player.id === player.id)) return prev;
      const updated = prev.map((slot, idx) => idx === slotIdx ? { ...slot, player } : slot);
      return updated;
    });
    setBench(prev => prev.filter(p => p.id !== player.id));
    showMessage('success', `${player.name} added to formation!`);
  };

  // Remove player from a specific slot (by index), add back to bench if space
  const removeFromSlot = (slotIdx) => {
    setMyTeam(prev => {
      const slot = prev[slotIdx];
      if (slot.player && bench.length < 23) {
        setBench(b => b.some(p => p.id === slot.player.id) ? b : [...b, slot.player]);
        showMessage('success', `${slot.player.name} moved to bench!`);
      } else if (slot.player) {
        showMessage('info', `${slot.player.name} removed from formation (bench is full)`);
      }
      return prev.map((slot, idx) => idx === slotIdx ? { ...slot, player: null } : slot);
    });
  };

  // Add player to the first available slot for their position
  const addPlayerFromList = (player) => {
    setMyTeam(prev => {
      // Prevent duplicate players
      if (prev.some(slot => slot.player && slot.player.id === player.id)) return prev;
      // Find first empty slot for this position
      const idx = prev.findIndex(slot => slot.position === player.position && !slot.player);
      if (idx === -1) return prev; // No available slot
      const updated = prev.map((slot, i) => i === idx ? { ...slot, player } : slot);
      return updated;
    });
  };

  // Remove player from bench
  const removeFromBench = (playerId) => {
    const player = bench.find(p => p.id === playerId);
    setBench(prev => prev.filter(p => p.id !== playerId));
    if (player) {
      showMessage('success', `${player.name} removed from bench!`);
    }
  };

  // Add player to frontend Starting XI
  const addToFrontendStartingXI = (player) => {
    console.log('addToFrontendStartingXI called with:', player.name, player.id);
    console.log('Current Starting XI players:', frontendStartingXI.map(p => `${p.name} (${p.id})`));
    
    // Check if player is already in Starting XI
    const isInStartingXI = frontendStartingXI.some(p => p.id === player.id);
    if (isInStartingXI) {
      console.log('Player already in Starting XI:', player.name);
      showMessage('info', `${player.name} is already in the Starting XI!`);
      return;
    }
    
    // Check if Starting XI is full (max 11 players)
    if (frontendStartingXI.length >= 11) {
      console.log('Starting XI is full');
      showMessage('error', 'Starting XI is full! Remove a player first.');
      return;
    }
    
    console.log('Adding player to Starting XI:', player.name);
    setFrontendStartingXI(prev => {
      console.log('Previous Starting XI:', prev.map(p => p.name));
      const newStartingXI = [...prev, player];
      console.log('New Starting XI:', newStartingXI.map(p => p.name));
      return newStartingXI;
    });
    showMessage('success', `${player.name} added to Starting XI!`);
  };

  // Remove player from frontend Starting XI
  const removeFromFrontendStartingXI = (playerId) => {
    const player = frontendStartingXI.find(p => p.id === playerId);
    setFrontendStartingXI(prev => prev.filter(p => p.id !== playerId));
    if (player) {
      showMessage('success', `${player.name} removed from Starting XI!`);
    }
  };

  // Debug function to clear all data (for testing)
  const clearAllData = () => {
    setFrontendStartingXI([]);
    setBench([]);
    setMyTeam(FORMATIONS[selectedFormation].map(slot => ({ ...slot, player: null })));
    showMessage('info', 'All data cleared for testing!');
  };

  // Handle edit player - set editing player and switch to add player tab
  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setActiveTab('add-player');
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'player-list', label: 'Player List', icon: '👥' },
    { id: 'starting-xi', label: 'Starting XI', icon: '⚽' },
    { id: 'player-guesser', label: 'Player Guesser', icon: '❓' },
    { id: 'add-player', label: 'Add Player', icon: '➕' },
    { id: 'my-team', label: 'My Team', icon: '🏆' }
  ];

  // Render login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Champions League Fantasy League</h1>
        </header>
        <main className="app-main">
          <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px #0001' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label>Username:</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Password:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} required />
              </div>
              {loginError && <div style={{ color: 'red', marginBottom: 16 }}>{loginError}</div>}
              <button type="submit" style={{ width: '100%', padding: 12, background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}>Login</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Champions League Fantasy League</h1>
      </header>

      {/* Global message display */}
      {message.text && (
        <div className={`global-message ${message.type}`} style={{
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '16px auto',
          maxWidth: '600px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#d1ecf1',
          color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#0c5460',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : message.type === 'error' ? '#f5c6cb' : '#bee5eb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '16px auto',
          maxWidth: '600px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: '12px',
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '16px auto',
          maxWidth: '600px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        }}>
          Loading...
        </div>
      )}

      <nav className="app-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={`Switch to ${tab.label} tab`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {renderActiveTab()}
      </main>

      <footer className="app-footer">
        <p>© 2024 Champions League Fantasy League</p>
      </footer>
    </div>
  );
}

export default App; 