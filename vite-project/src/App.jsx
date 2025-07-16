import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';
import MyTeam from './MyTeam';
import StartingXI from './StartingXI';
import ChampionsLogo from './ChampionsLogo';
import PlayerGuesser from './PlayerGuesser';
import Register from './Register';
import ChampionsSection from './ChampionsSection';
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
  const [showRegister, setShowRegister] = useState(false);
  const [userId, setUserId] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const text = await response.text();
      if (response.ok) {
        setIsLoggedIn(true);
        setActiveTab('player-list');
        // Fetch userId after successful login
        const userInfoRes = await fetch(`http://localhost:8080/api/users/by-username/${username}`);
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          setUserId(userInfo.id);
        }
      } else {
        setLoginError(text); // Shows "Username not found" or "Incorrect password"
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
      const authHeader = 'Basic ' + btoa(username + ':' + password);
      console.log('Fetching players with credentials:', username, password);
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
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPlayer)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const addedPlayer = await response.json();
      // Do NOT call fetchPlayers here yet; let the bench update first
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
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json'
        },
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

  // Helper to normalize position
  const normalizePosition = (pos) => {
    if (!pos) return '';
    const position = pos.toString().toUpperCase().trim();
    const positionMap = {
      'GK': 'Goalkeeper',
      'G': 'Goalkeeper',
      'GOALKEEPER': 'Goalkeeper',
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
    return positionMap[position] || position;
  };

  // Add player to the bench (up to 23)
  const addPlayerToBench = (player) => {
    // Normalize all fields, not just position
    const normalizedPlayer = {
      ...player,
      id: player.id || player.playerId || player._id || `temp_${Math.random().toString(36).substr(2, 9)}`,
      team: player.teamName || player.team || '',
      position: normalizePosition(player.pos || player.position || ''),
      nationality: player.nation || player.nationality || '',
    };
    console.log('addPlayerToBench called with:', normalizedPlayer.name, normalizedPlayer.id, 'Position:', normalizedPlayer.position, 'Team:', normalizedPlayer.team, 'Nationality:', normalizedPlayer.nationality);
    console.log('Current bench players:', bench.map(p => `${p.name} (${p.id})`));
    console.log('Current main team players:', myTeam.filter(slot => slot.player).map(slot => `${slot.player.name} (${slot.player.id})`));
    
    // Check if player is already in main team
    const isInMainTeam = myTeam.some(slot => slot.player && slot.player.id === normalizedPlayer.id);
    if (isInMainTeam) {
      console.log('Player already in main team:', normalizedPlayer.name);
      showMessage('info', `${normalizedPlayer.name} is already in your main team!`);
      return;
    }
    
    // Check if player is already in bench
    const isInBench = bench.some(p => p.id === normalizedPlayer.id);
    if (isInBench) {
      console.log('Player already in bench:', normalizedPlayer.name);
      showMessage('info', `${normalizedPlayer.name} is already on the bench!`);
      return;
    }
    
    // Check if bench is full
    if (bench.length >= 23) {
      console.log('Bench is full');
      showMessage('error', 'Bench is full (maximum 23 players)');
      return;
    }
    
    console.log('Adding player to bench:', normalizedPlayer.name);
    setBench(prev => {
      console.log('Previous bench:', prev.map(p => p.name));
      const newBench = [...prev, normalizedPlayer];
      console.log('New bench:', newBench.map(p => p.name));
      return newBench;
    });
    showMessage('success', `${normalizedPlayer.name} added to bench!`);
  };

  // Add player from bench to a specific slot
  const addToSlot = (slotIdx, player) => {
    // Normalize position
    const normalizedPlayer = { ...player, position: normalizePosition(player.position) };
    setMyTeam(prev => {
      if (prev.some(slot => slot.player && slot.player.id === normalizedPlayer.id)) return prev;
      const updated = prev.map((slot, idx) => idx === slotIdx ? { ...slot, player: normalizedPlayer } : slot);
      return updated;
    });
    setBench(prev => prev.filter(p => p.id !== normalizedPlayer.id));
    showMessage('success', `${normalizedPlayer.name} added to formation!`);
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
        return <PlayerGuesser
          players={players}
          username={username}
          password={password}
          userId={userId}
        />;
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
        return null;
    }
  }

  // Restore all sign in/register UI and logic as described above, including all interactivity, design, and confetti effects.
  // ... (full code for sign in/register UI and logic as previously provided) ...

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

      {/* CONDITIONAL AUTH UI */}
      { !isLoggedIn && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          zIndex: 10,
          background: 'linear-gradient(135deg, #f6e27a 0%, #2a0845 100%)',
          overflow: 'auto',
        }}>
          {/* Soft gold radial overlay */}
          <div style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(circle, rgba(230,196,99,0.13) 0%, transparent 70%)',
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'blur(2px)',
          }} />
          {showRegister ? (
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Trophy accent */}
              <div style={{ position: 'absolute', top: -56, left: '50%', transform: 'translateX(-50%)', zIndex: 3, pointerEvents: 'none' }}>
                <span style={{ fontSize: 40, color: '#e6c463', filter: 'drop-shadow(0 0 8px #e6c46388)' }}>🏆</span>
              </div>
              <div style={{
                maxWidth: 420,
                width: '100%',
                margin: '40px auto',
                padding: 40,
                borderRadius: 32,
                background: 'linear-gradient(135deg, #f6e27a 0%, #6441a5 100%)',
                boxShadow: '0 8px 40px 0 #2a084555, 0 2px 16px 0 #fff2',
                border: '2.5px solid #7c6ee6',
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideUp 1s cubic-bezier(.77,0,.18,1)',
                backdropFilter: 'blur(18px)',
              }}>
                <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, #e6c463 0%, transparent 100%)', marginBottom: 18, borderRadius: 2 }} />
                <Register onRegisterSuccess={() => setShowRegister(false)} />
                <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, transparent 0%, #e6c463 100%)', marginTop: 18, borderRadius: 2 }} />
                <div style={{ textAlign: 'center', marginTop: 18 }}>
                  <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', color: '#e6c463', fontWeight: 700, fontSize: 16, cursor: 'pointer', textDecoration: 'underline', letterSpacing: 1, textShadow: '0 2px 8px #2a0845' }}>Already have an account? <span style={{ color: '#fff', textShadow: '0 2px 8px #e6c463' }}>Sign In</span></button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 420, width: '100%', margin: '40px auto', padding: 40, borderRadius: 32, background: 'linear-gradient(135deg, #f6e27a 0%, #6441a5 100%)', boxShadow: '0 8px 40px 0 #2a084555, 0 2px 16px 0 #fff2', border: '2.5px solid #7c6ee6', position: 'relative', overflow: 'hidden', animation: 'slideUp 1s cubic-bezier(.77,0,.18,1)', backdropFilter: 'blur(18px)' }}>
              {/* Trophy accent */}
              <div style={{ position: 'absolute', top: -56, left: '50%', transform: 'translateX(-50%)', zIndex: 3, pointerEvents: 'none' }}>
                <span style={{ fontSize: 40, color: '#e6c463', filter: 'drop-shadow(0 0 8px #e6c46388)' }}>🏆</span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 3 }}>
                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #6441a5 0%, #f6e27a 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 4px 18px #e6c46355', animation: 'pulse 2s ease-in-out infinite', border: '2px solid #7c6ee6' }}>
                  <span style={{ fontSize: 40, color: '#e6c463', textShadow: '0 2px 8px #2a0845' }}>⚽</span>
                </div>
                <h2 style={{ fontWeight: 900, color: '#fff', margin: 0, fontSize: 32, letterSpacing: 2, textShadow: '0 2px 8px #e6c463' }}>Sign In</h2>
                <div style={{ color: '#e6c463', fontSize: 16, marginTop: 8, marginBottom: 0, fontWeight: 600, textShadow: '0 2px 8px #2a0845' }}>Log in to your Champions League account</div>
                <div style={{ height: 2, width: '100%', background: 'linear-gradient(90deg, #e6c463 0%, transparent 100%)', margin: '18px 0 0 0', borderRadius: 2 }} />
              </div>
              <form onSubmit={handleLogin} style={{ marginTop: 24, position: 'relative', zIndex: 3 }}>
                {loginError && (
                  <div style={{ marginBottom: 16, color: '#e6c463', background: 'rgba(230,196,99,0.10)', border: '1.2px solid #e6c463', borderRadius: 9, padding: '10px 16px', textAlign: 'center', fontWeight: 700, fontSize: 15, animation: 'shake 0.5s', textShadow: '0 2px 8px #2a0845' }}>{loginError}</div>
                )}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#2a0845', marginBottom: 8, fontSize: 15, letterSpacing: 1, textShadow: '0 2px 8px #e6c463' }}>Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '13px 18px', borderRadius: 12, border: '1.5px solid #e6c463', fontSize: 16, background: 'rgba(255,255,255,0.13)', color: '#fff', outline: 'none', fontWeight: 600, boxShadow: '0 1px 4px #e6c46322', transition: 'all 0.2s', letterSpacing: 1 }} onFocus={e => e.target.style.border = '1.5px solid #fff'} onBlur={e => e.target.style.border = '1.5px solid #e6c463'} autoComplete="username" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#2a0845', marginBottom: 8, fontSize: 15, letterSpacing: 1, textShadow: '0 2px 8px #e6c463' }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '13px 18px', borderRadius: 12, border: '1.5px solid #e6c463', fontSize: 16, background: 'rgba(255,255,255,0.13)', color: '#fff', outline: 'none', fontWeight: 600, boxShadow: '0 1px 4px #e6c46322', transition: 'all 0.2s', letterSpacing: 1 }} onFocus={e => e.target.style.border = '1.5px solid #fff'} onBlur={e => e.target.style.border = '1.5px solid #e6c463'} autoComplete="current-password" />
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(90deg, #6441a5 0%, #2a0845 100%)', color: '#fff', border: '2px solid #e6c463', borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 18px #e6c46355', marginTop: 8, transition: 'all 0.2s', letterSpacing: 2, textShadow: '0 2px 8px #e6c463' }} onMouseOver={e => { e.target.style.background = 'linear-gradient(90deg, #2a0845 0%, #6441a5 100%)'; e.target.style.color = '#e6c463'; e.target.style.transform = 'translateY(-2px) scale(1.03)'; e.target.style.boxShadow = '0 8px 32px #e6c46344'; }} onMouseOut={e => { e.target.style.background = 'linear-gradient(90deg, #6441a5 0%, #2a0845 100%)'; e.target.style.color = '#fff'; e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 4px 18px #e6c46355'; }}>Sign In</button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <button onClick={() => setShowRegister(true)} style={{ background: 'none', border: 'none', color: '#e6c463', fontWeight: 700, fontSize: 16, cursor: 'pointer', textDecoration: 'underline', letterSpacing: 1, textShadow: '0 2px 8px #2a0845' }}>Don&apos;t have an account? <span style={{ color: '#fff', textShadow: '0 2px 8px #e6c463' }}>Register</span></button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* END CONDITIONAL AUTH UI */}

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

      <ChampionsLogo />
      <ChampionsSection />

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