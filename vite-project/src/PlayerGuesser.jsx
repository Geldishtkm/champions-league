import React, { useState, useEffect } from 'react';

const PlayerGuesser = ({ players = [], username = 'admin', password = 'secret' }) => {
  const [currentGameData, setCurrentGameData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [result, setResult] = useState(null); // true | false | null
  const [loading, setLoading] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [allPlayers, setAllPlayers] = useState([]);

  // Generate a random true/false question about the player
  const generateQuestion = async (playerData) => {
    const questions = [];
    const authHeader = 'Basic ' + btoa(username + ':' + password);

    // Fetch other players for name questions
    try {
      console.log('Using credentials:', username, password);
      console.log('Auth header:', 'Basic ' + btoa(username + ':' + password));
      const response = await fetch('http://localhost:8080/champ/v1/player', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const allPlayers = await response.json();
        console.log('All players from database:', allPlayers);
        // Filter out the current player and get valid names
        const otherPlayers = allPlayers.filter(p => p.name && p.name !== playerData.actualName);
        console.log('Other players for name questions:', otherPlayers);
        // Create a 50/50 mix of true and false name questions
        if (otherPlayers.length > 0) {
          // Add 1 TRUE question (actual player name)
          questions.push({
            text: `Is his name ${playerData.actualName}?`,
            answer: true,
            type: 'name'
          });
          // Add 1 FALSE question (other player name)
          const randomOtherPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          questions.push({
            text: `Is his name ${randomOtherPlayer.name}?`,
            answer: false,
            type: 'name'
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch other players for name questions:', err);
    }

    // Fetch teams for team questions
    try {
      console.log('Using credentials:', username, password);
      console.log('Auth header:', 'Basic ' + btoa(username + ':' + password));
      const response = await fetch('http://localhost:8080/champ/v1/player', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const allPlayers = await response.json();
        console.log('All players for team questions:', allPlayers);
        // Get all unique team names from database
        const allTeams = allPlayers.map(p => p.team || p.teamName).filter(Boolean);
        const otherTeams = [...new Set(allTeams)];
        const currentTeam = playerData.teamName;
        const differentTeams = otherTeams.filter(team => team !== currentTeam);
        console.log('Available teams:', otherTeams);
        console.log('Different teams for false questions:', differentTeams);
        // Add 1 TRUE team question (actual team)
        questions.push({
          text: `Does he play for ${playerData.teamName}?`,
          answer: true,
          type: 'team'
        });
        // Add 1 FALSE team question (other team)
        if (differentTeams.length > 0) {
          const randomOtherTeam = differentTeams[Math.floor(Math.random() * differentTeams.length)];
          questions.push({
            text: `Does he play for ${randomOtherTeam}?`,
            answer: false,
            type: 'team'
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch other teams for team questions:', err);
    }

    // Randomly select one question from the pool (50/50 chance of true vs false)
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Fetch random player from backend
  const fetchRandomPlayer = async () => {
    setGameLoading(true);
    setError(null);
    setResult(null);
    setCurrentQuestion(null);
    const authHeader = 'Basic ' + btoa(username + ':' + password);
    try {
      console.log('Fetching random player for game from:', 'http://localhost:8080/champ/v1/player/game/random');
      const response = await fetch('http://localhost:8080/champ/v1/player/game/random', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const gameData = await response.json();
      console.log('Received game data from backend:', gameData);
      if (!gameData) {
        throw new Error('No game data available from backend');
      }
      console.log('Using backend game data:', gameData);
      setCurrentGameData(gameData);
      // Generate a question for this player using backend data
      const question = await generateQuestion(gameData);
      setCurrentQuestion(question);
      setGameLoading(false);
    } catch (err) {
      console.error('Failed to fetch game data from backend:', err);
      setError('Failed to load random player. Please try again.');
      setGameLoading(false);
    }
  };

  // Submit true/false guess
  const submitGuess = (userAnswer) => {
    if (!currentQuestion) return;

    setLoading(true);
    setError(null);
    
    const isCorrect = userAnswer === currentQuestion.answer;
    console.log('Question validation:', {
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect: isCorrect
    });
    
    setResult(isCorrect);
    
    // Update score
    setTotalGuesses(prev => prev + 1);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setLoading(false);
  };

  // Start new game
  const startNewGame = () => {
    fetchRandomPlayer();
  };

  useEffect(() => {
    fetchRandomPlayer();
  }, []);

  if (gameLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 24, marginBottom: 16 }}>Loading random player...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
        <button onClick={fetchRandomPlayer} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    );
  }

  if (!currentGameData || !currentQuestion) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div>No game data available.</div>
        <button onClick={fetchRandomPlayer} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 16 }}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="player-guesser-container" style={{ maxWidth: 500, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Player Stats Guesser!</h2>
      
      {/* Score Display */}
      <div style={{ textAlign: 'center', marginBottom: 24, fontSize: 16 }}>
        <span style={{ marginRight: 20 }}>Score: <b>{score}</b></span>
        <span>Total Guesses: <b>{totalGuesses}</b></span>
      </div>

      {/* Player Info (excluding info being questioned) */}
      <div style={{ marginBottom: 24, fontSize: 18, lineHeight: 1.7, background: '#f8f9fa', padding: 20, borderRadius: 8 }}>
        <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Player Info:</h3>
        {/* Only show info that is not being questioned */}
        {currentQuestion.type !== 'name' && currentGameData.actualName && <div><b>Name:</b> {currentGameData.actualName}</div>}
        {currentGameData.pos && <div><b>Position:</b> {currentGameData.pos}</div>}
        {currentQuestion.type !== 'team' && currentGameData.teamName && <div><b>Team:</b> {currentGameData.teamName}</div>}
        {currentGameData.nation && <div><b>Nationality:</b> {currentGameData.nation}</div>}
        {/* Show stats as additional info */}
        {currentGameData.age && <div><b>Age:</b> {currentGameData.age}</div>}
        {currentGameData.gls !== undefined && <div><b>Goals:</b> {currentGameData.gls}</div>}
        {currentGameData.ast !== undefined && <div><b>Assists:</b> {currentGameData.ast}</div>}
        {currentGameData.mp !== undefined && <div><b>Matches Played:</b> {currentGameData.mp}</div>}
        {currentGameData.min !== undefined && <div><b>Minutes:</b> {currentGameData.min}</div>}
        {currentGameData.xG !== undefined && <div><b>Expected Goals (xG):</b> {currentGameData.xG}</div>}
        {currentGameData.xAG !== undefined && <div><b>Expected Assists (xAG):</b> {currentGameData.xAG}</div>}
      </div>

      {/* Question */}
      <div style={{ marginBottom: 24, fontSize: 20, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
        {currentQuestion.text}
      </div>

      {/* True/False Buttons */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
        <button 
          onClick={() => submitGuess(true)}
          disabled={loading || result !== null}
          style={{ 
            padding: '12px 32px', 
            fontSize: 18, 
            borderRadius: 6, 
            background: '#28a745', 
            color: '#fff', 
            border: 'none', 
            cursor: (loading || result !== null) ? 'not-allowed' : 'pointer',
            opacity: (loading || result !== null) ? 0.6 : 1
          }}
        >
          TRUE
        </button>
        <button 
          onClick={() => submitGuess(false)}
          disabled={loading || result !== null}
          style={{ 
            padding: '12px 32px', 
            fontSize: 18, 
            borderRadius: 6, 
            background: '#dc3545', 
            color: '#fff', 
            border: 'none', 
            cursor: (loading || result !== null) ? 'not-allowed' : 'pointer',
            opacity: (loading || result !== null) ? 0.6 : 1
          }}
        >
          FALSE
        </button>
      </div>

      {/* Result Display */}
      {result !== null && (
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 18 }}>
          {result ? (
            <span style={{ color: 'green', fontWeight: 700 }}>🎉 Correct! Well done!</span>
          ) : (
            <span style={{ color: 'red', fontWeight: 700 }}>❌ Incorrect. The answer was {currentQuestion.answer ? 'TRUE' : 'FALSE'}.</span>
          )}
        </div>
      )}

      {/* Play Again Button */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button 
          onClick={startNewGame} 
          style={{ 
            padding: '12px 24px', 
            fontSize: 16, 
            borderRadius: 6, 
            background: '#007bff', 
            color: '#fff', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Next Question
        </button>
      </div>
    </div>
  );
};

export default PlayerGuesser; 