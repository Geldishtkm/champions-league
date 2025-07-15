import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';
import MyTeam from './MyTeam';
import StartingXI from './StartingXI';
import ChampionsLogo from './ChampionsLogo';
import PlayerGuesser from './PlayerGuesser';
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
      console.log('Fetching players with credentials:', username, password);
      const authHeader = 'Basic ' + btoa(username + ':' + password);
      console.log('Auth header:', authHeader);
      const response = await fetch('http://localhost:8080/champ/v1/player', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
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
    if (isLoggedIn) {
      fetchPlayers();
    }
  }, [isLoggedIn, username, password]);

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

  // Add renderActiveTab function
  function renderActiveTab() {
    switch (activeTab) {
      case 'player-list':
        return (
          <PlayerList 
            players={filteredPlayers} 
            onAddPlayer={addPlayerToBench}
            mainTeamIds={myTeam.filter(slot => slot.player).map(slot => slot.player.id)}
            benchIds={bench.map(p => p.id)}
            benchFull={bench.length >= 23}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onDeletePlayer={deletePlayer}
            frontendStartingXI={frontendStartingXI}
            onAddToFrontendStartingXI={addToFrontendStartingXI}
            loading={loading}
            error={error}
            onRetry={fetchPlayers}
          />
        );
      case 'starting-xi':
        return (
          <div>
            <StartingXI 
              startingXIPlayers={frontendStartingXI}
              onRemoveFromStartingXI={removeFromFrontendStartingXI}
              maxPlayers={11}
            />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={clearAllData}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🧹 Clear All Data (Debug)
              </button>
            </div>
          </div>
        );
      case 'player-guesser':
        return <PlayerGuesser players={players} username={username} password={password} />;
      case 'add-player':
        return <PlayerForm onAddPlayer={addPlayer} onEditPlayer={editPlayer} editingPlayer={editingPlayer} players={players} onAddToBench={addPlayerToBench} onAddToFrontendStartingXI={addToFrontendStartingXI} />;
      case 'my-team':
        return (
          <MyTeam 
            players={players}
            myTeam={myTeam}
            bench={bench}
            onAddToSlot={addToSlot}
            onRemoveFromSlot={removeFromSlot}
            onRemoveFromBench={removeFromBench}
            selectedFormation={selectedFormation}
            setSelectedFormation={setSelectedFormation}
            formations={FORMATIONS}
          />
        );
      default:
        return <PlayerList players={filteredPlayers} onAddPlayer={addPlayerToBench} mainTeamIds={myTeam.filter(slot => slot.player).map(slot => slot.player.id)} benchIds={bench.map(p => p.id)} benchFull={bench.length >= 23} searchTerm={searchTerm} onSearchChange={setSearchTerm} />;
    }
  }

  // Render login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="app" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0,123,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(40,167,69,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite',
          zIndex: 1,
        }} />

        <header className="app-header" style={{ 
          background: 'none', 
          boxShadow: 'none',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '10px',
              animation: 'bounce 2s ease-in-out infinite',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}>
              ⚽
            </div>
            <h1 style={{ 
              color: '#fff', 
              fontWeight: 900, 
              letterSpacing: 2, 
              fontSize: 42, 
              marginBottom: 10, 
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 3s ease-in-out infinite',
            }}>
              Champions League Fantasy League
            </h1>
            <div style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 18,
              fontWeight: 300,
              letterSpacing: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              Build Your Dream Team • Compete for Glory
            </div>
          </div>
        </header>

        <main className="app-main" style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flex: 1,
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            maxWidth: 450,
            width: '100%',
            margin: '40px auto',
            padding: 40,
            borderRadius: 30,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'slideUp 1s ease-out',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              borderRadius: '50%',
              opacity: 0.1,
              animation: 'rotate 10s linear infinite',
            }} />
            <div style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #007bff, #0056b3)',
              borderRadius: '50%',
              opacity: 0.1,
              animation: 'rotate 8s linear infinite reverse',
            }} />

            <div style={{ textAlign: 'center', marginBottom: 30, position: 'relative', zIndex: 3 }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                <span style={{ fontSize: 40, color: 'white' }}>🔐</span>
              </div>
              <h2 style={{ 
                fontWeight: 800, 
                color: '#2d3748', 
                margin: 0, 
                fontSize: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Welcome Back!
              </h2>
              <div style={{ 
                color: '#718096', 
                fontSize: 16, 
                marginTop: 8, 
                marginBottom: 0,
                fontWeight: 500,
              }}>
                Sign in to access your fantasy team
              </div>
            </div>

            <form onSubmit={handleLogin} style={{ marginTop: 30, position: 'relative', zIndex: 3 }}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  fontWeight: 700, 
                  color: '#2d3748', 
                  display: 'block', 
                  marginBottom: 8,
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  Username
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                  padding: '2px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 16,
                      outline: 'none',
                      background: 'white',
                      transition: 'all 0.3s ease',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    }}
                    onFocus={e => {
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onBlur={e => {
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)';
                      e.target.style.transform = 'scale(1)';
                    }}
                    required
                    autoComplete="username"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  fontWeight: 700, 
                  color: '#2d3748', 
                  display: 'block', 
                  marginBottom: 8,
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}>
                  Password
                </label>
                <div style={{
                  position: 'relative',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                  padding: '2px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 16,
                      outline: 'none',
                      background: 'white',
                      transition: 'all 0.3s ease',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    }}
                    onFocus={e => {
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onBlur={e => {
                      e.target.parentElement.style.background = 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)';
                      e.target.style.transform = 'scale(1)';
                    }}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {loginError && (
                <div style={{ 
                  color: '#e53e3e', 
                  marginBottom: 20, 
                  fontWeight: 600, 
                  textAlign: 'center',
                  padding: '12px 16px',
                  background: 'rgba(229, 62, 62, 0.1)',
                  borderRadius: 8,
                  border: '1px solid rgba(229, 62, 62, 0.2)',
                  animation: 'shake 0.5s ease-in-out',
                }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '18px 0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  marginTop: 8,
                  marginBottom: 4,
                  outline: 'none',
                  position: 'relative',
                  overflow: 'hidden',
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
                <span style={{ position: 'relative', zIndex: 2 }}>Sign In</span>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s',
                }} />
              </button>
            </form>

            <div style={{ 
              textAlign: 'center', 
              marginTop: 24, 
              color: '#a0aec0', 
              fontSize: 14,
              fontWeight: 500,
              position: 'relative',
              zIndex: 3,
            }}>
              <span style={{ marginRight: 8 }}>🔒</span>
              Your credentials are encrypted and secure
            </div>
          </div>
        </main>

        <style>{`
          @keyframes slideUp {
            from { 
              opacity: 0; 
              transform: translateY(60px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes gradientShift {
            0%, 100% { filter: hue-rotate(0deg); }
            50% { filter: hue-rotate(30deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          button:hover div {
            left: 100%;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        top: '5%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        zIndex: 1,
      }} />
      <div style={{
        position: 'fixed',
        top: '70%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(0,123,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse',
        zIndex: 1,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: '15%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(40,167,69,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite',
        zIndex: 1,
      }} />

      <header className="app-header" style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '10px',
          }}>
            <div style={{
              fontSize: '50px',
              animation: 'bounce 3s ease-in-out infinite',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}>
              ⚽
            </div>
            <h1 style={{
              color: '#fff',
              fontWeight: 900,
              letterSpacing: 2,
              fontSize: 36,
              margin: 0,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 4s ease-in-out infinite',
            }}>
              Champions League Fantasy League
            </h1>
            <div style={{
              fontSize: '50px',
              animation: 'bounce 3s ease-in-out infinite 1s',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}>
              🏆
            </div>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            fontWeight: 300,
            letterSpacing: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            Welcome back! Ready to build your dream team?
          </div>
        </div>
      </header>

      {/* Global message display */}
      {message.text && (
        <div className={`global-message ${message.type}`} style={{
          padding: '16px 20px',
          borderRadius: '12px',
          margin: '20px auto',
          maxWidth: '600px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: message.type === 'success' ? 'rgba(40,167,69,0.1)' : message.type === 'error' ? 'rgba(229,62,62,0.1)' : 'rgba(0,123,255,0.1)',
          color: message.type === 'success' ? '#68d391' : message.type === 'error' ? '#fc8181' : '#63b3ed',
          border: `1px solid ${message.type === 'success' ? 'rgba(40,167,69,0.2)' : message.type === 'error' ? 'rgba(229,62,62,0.2)' : 'rgba(0,123,255,0.2)'}`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          animation: 'slideDown 0.5s ease-out',
          position: 'relative',
          zIndex: 3,
        }}>
          {message.text}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          margin: '20px auto',
          maxWidth: '600px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: 'rgba(229,62,62,0.1)',
          color: '#fc8181',
          border: '1px solid rgba(229,62,62,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          animation: 'shake 0.5s ease-in-out',
          position: 'relative',
          zIndex: 3,
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              marginLeft: '12px',
              background: 'none',
              border: 'none',
              color: '#fc8181',
              cursor: 'pointer',
              fontSize: '18px',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={e => e.target.style.background = 'rgba(229,62,62,0.2)'}
            onMouseOut={e => e.target.style.background = 'none'}
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          margin: '20px auto',
          maxWidth: '600px',
          fontWeight: '600',
          textAlign: 'center',
          backgroundColor: 'rgba(0,123,255,0.1)',
          color: '#63b3ed',
          border: '1px solid rgba(0,123,255,0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 3,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #63b3ed',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Loading...
          </div>
        </div>
      )}

      <nav className="app-navigation" style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 2,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={`Switch to ${tab.label} tab`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '25px',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255,255,255,0.1)',
              color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.8)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id 
                ? '0 8px 32px rgba(102, 126, 234, 0.4)'
                : '0 4px 12px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseOver={e => {
              if (activeTab !== tab.id) {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }
            }}
            onMouseOut={e => {
              if (activeTab !== tab.id) {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
          >
            <span className="tab-icon" style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            <span className="tab-label" style={{ fontSize: '0.9rem' }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main" style={{
        flex: 1,
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeIn 0.8s ease-out',
        }}>
          {renderActiveTab()}
        </div>
      </main>

      <footer className="app-footer" style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        padding: '1.5rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 2,
      }}>
        <p style={{ margin: 0, fontWeight: 500, letterSpacing: 1 }}>
          © 2024 Champions League Fantasy League • Built with ⚽ and ❤️
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(30deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default App; 