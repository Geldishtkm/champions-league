import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import MyTeam from './MyTeam';
import StartingXI from './StartingXI';
import ChampionsLogo from './ChampionsLogo';
import PlayerGuesser from './PlayerGuesser';
import Register from './Register';
import Login from './Login';
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
            players={players} 
            onAddPlayer={addPlayerToBench}
            mainTeamIds={myTeam.filter(slot => slot.player).map(slot => slot.player.id)}
            benchIds={bench.map(p => p.id)}
            benchFull={bench.length >= 23}
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
            <Register 
              onClose={() => setShowRegister(false)}
              onRegister={async (username, password, setSuccess) => {
                try {
                  const response = await fetch('http://localhost:8080/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                  });
                  if (response.ok) {
                    setSuccess(true);
                    setTimeout(() => setShowRegister(false), 2000);
                  } else {
                    const error = await response.text();
                    throw new Error(error);
                  }
                } catch (error) {
                  throw new Error('Registration failed: ' + error.message);
                }
              }}
            />
          ) : (
            <Login 
              onClose={() => setShowRegister(true)}
              onLogin={async (loginUsername, loginPassword) => {
                try {
                  const response = await fetch('http://localhost:8080/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: loginUsername, password: loginPassword })
                  });
                  const text = await response.text();
                  if (response.ok) {
                    // Set the username and password state variables for fetchPlayers
                    setUsername(loginUsername);
                    setPassword(loginPassword);
                    setIsLoggedIn(true);
                    setActiveTab('player-list');
                    // Fetch userId after successful login
                    const userInfoRes = await fetch(`http://localhost:8080/api/users/by-username/${loginUsername}`);
                    if (userInfoRes.ok) {
                      const userInfo = await userInfoRes.json();
                      setUserId(userInfo.id);
                    }
                  } else {
                    throw new Error(text);
                  }
                } catch (error) {
                  throw new Error(error.message || 'Network error. Please check your connection.');
                }
              }}
            />
          )}
        </div>
      )}
      {/* END CONDITIONAL AUTH UI */}

      <header className="app-header" style={{
        background: '#23294d', // single color tone, deep blue
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 2,
        boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)',
        paddingBottom: 0,
      }}>
        <div style={{
          textAlign: 'center',
          padding: '32px 0 0 0',
        }}>
          <h1 style={{
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 1,
            fontSize: 38,
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.10)',
            background: 'none',
            WebkitBackgroundClip: 'unset',
            WebkitTextFillColor: 'unset',
            backgroundClip: 'unset',
            filter: 'none',
            borderRadius: 0,
            padding: 0,
            position: 'relative',
            zIndex: 2,
            fontFamily: 'Segoe UI, Arial, sans-serif',
          }}>
            Champions League Fantasy League
          </h1>
        </div>
      </header>

      {/* Move ChampionsSection up here, before the main tab content */}
      <ChampionsSection />

      {isLoggedIn && (
        <nav className="app-navigation neon-nav" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '1.2rem 3.5rem',
          margin: '32px auto 36px auto',
          borderRadius: '32px',
          background: 'rgba(30, 34, 60, 0.55)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25), 0 1.5px 8px 0 rgba(0,212,255,0.10)',
          backdropFilter: 'blur(18px)',
          border: '1.5px solid rgba(0,212,255,0.18)',
          position: 'relative',
          zIndex: 10,
          minWidth: 600,
          maxWidth: 1000,
          width: '100%',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab neon-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.7rem',
                padding: '0.95rem 2.2rem',
                border: 'none',
                borderRadius: '22px',
                background: activeTab === tab.id
                  ? 'linear-gradient(120deg, rgba(0,212,255,0.18) 0%, rgba(255,0,255,0.13) 100%)'
                  : 'rgba(255,255,255,0.07)',
                color: activeTab === tab.id ? '#00eaff' : '#e0e0e0',
                fontWeight: 700,
                fontSize: '1.08rem',
                letterSpacing: '0.03em',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id
                  ? '0 0 16px 2px #00eaff, 0 2px 12px 0 rgba(0,212,255,0.10)'
                  : '0 2px 8px rgba(0,0,0,0.10)',
                position: 'relative',
                transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                outline: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #00eaff' : '3px solid transparent',
                textShadow: activeTab === tab.id ? '0 0 8px #00eaff, 0 0 2px #fff' : '0 1px 2px #222',
                minWidth: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseOver={e => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'rgba(0,212,255,0.10)';
                  e.target.style.color = '#00eaff';
                  e.target.style.boxShadow = '0 0 12px 2px #00eaff44';
                }
              }}
              onMouseOut={e => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                  e.target.style.color = '#e0e0e0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
                }
              }}
            >
              {/* Removed tab.icon span for a cleaner look */}
              <span className="tab-label" style={{ fontSize: '1.01rem', fontWeight: 600 }}>{tab.label}</span>
              {activeTab === tab.id && (
                <span style={{
                  position: 'absolute',
                  left: 18,
                  right: 18,
                  bottom: 7,
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #00eaff 0%, #ff00ff 100%)',
                  boxShadow: '0 0 12px 2px #00eaff99',
                  opacity: 0.85,
                  pointerEvents: 'none',
                  zIndex: 2,
                  animation: 'fadeIn 0.5s',
                }} />
              )}
            </button>
          ))}
        </nav>
      )}

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