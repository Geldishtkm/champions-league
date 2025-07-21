import React, { useState, useEffect } from 'react';

const PlayerGuesser = ({ players = [], username = 'admin', password = 'secret', userId }) => {
  console.log('userId at component:', userId);
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

  // Function to submit guess record to backend
  const submitGuessToBackend = async (guess, score) => {
    console.log('Submitting guess to backend:', guess, score, userId);
    if (!userId) return;
    try {
      const response = await fetch('http://localhost:8080/api/gamerecords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess,
          score,
          userId
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save guess');
      }
      return await response.json();
    } catch (err) {
      console.error('Error saving guess:', err);
    }
  };

  // Submit true/false guess
  const submitGuess = (userAnswer) => {
    if (!currentQuestion) return;

    setLoading(true);
    setError(null);

    // Detailed logs for debugging
    console.log('userAnswer:', userAnswer, typeof userAnswer);
    console.log('currentQuestion.answer:', currentQuestion.answer, typeof currentQuestion.answer);
    const isCorrect = userAnswer === currentQuestion.answer;
    console.log('isCorrect:', isCorrect);
    console.log('Question validation:', {
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect: isCorrect
    });
    
    setResult(isCorrect);
    
    // Update score
    setTotalGuesses(prev => prev + 1);
    if (isCorrect) {
      console.log('isCorrect is true, will call setScore');
      setScore(prev => {
        const newScore = prev + 1;
        // Save the guess to backend
        console.log('Calling submitGuessToBackend from submitGuess');
        submitGuessToBackend(currentQuestion.text, newScore);
        return newScore;
      });
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
      <div className="player-guesser-glass" style={{ textAlign: 'center', padding: 60 }}>
        <div className="guesser-spinner" />
        <div style={{ fontSize: 24, marginTop: 24, color: '#00eaff', fontWeight: 700, letterSpacing: 1 }}>Loading random player...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-guesser-glass" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ color: '#ff4d6d', marginBottom: 24, fontWeight: 700, fontSize: 20 }}>{error}</div>
        <button className="guesser-btn guesser-btn-blue" onClick={fetchRandomPlayer}>
          Try Again
        </button>
      </div>
    );
  }

  if (!currentGameData || !currentQuestion) {
    return (
      <div className="player-guesser-glass" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ color: '#fff', fontSize: 20, marginBottom: 24 }}>No game data available.</div>
        <button className="guesser-btn guesser-btn-blue" onClick={fetchRandomPlayer}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="player-guesser-glass player-guesser-container">
      <h2 className="guesser-title">
        <span className="guesser-title-glow">Player</span>
        <span className="guesser-title-accent"> Guesser</span>
      </h2>
      {/* Score Display */}
      <div className="guesser-score-row">
        <span className="guesser-score-label">Score: <b className="guesser-score-glow">{score}</b></span>
        <span className="guesser-score-label">Total Guesses: <b>{totalGuesses}</b></span>
      </div>

      {/* Player Info (excluding info being questioned) */}
      <div className="guesser-player-info">
        <h3 className="guesser-section-title">Player Info</h3>
        {currentQuestion.type !== 'name' && currentGameData.actualName && <div><b>Name:</b> {currentGameData.actualName}</div>}
        {currentGameData.pos && <div><b>Position:</b> {currentGameData.pos}</div>}
        {currentQuestion.type !== 'team' && currentGameData.teamName && <div><b>Team:</b> {currentGameData.teamName}</div>}
        {currentGameData.nation && <div><b>Nationality:</b> {currentGameData.nation}</div>}
        {currentGameData.age && <div><b>Age:</b> {currentGameData.age}</div>}
        {currentGameData.gls !== undefined && <div><b>Goals:</b> {currentGameData.gls}</div>}
        {currentGameData.ast !== undefined && <div><b>Assists:</b> {currentGameData.ast}</div>}
        {currentGameData.mp !== undefined && <div><b>Matches Played:</b> {currentGameData.mp}</div>}
        {currentGameData.min !== undefined && <div><b>Minutes:</b> {currentGameData.min}</div>}
        {currentGameData.xG !== undefined && <div><b>Expected Goals (xG):</b> {currentGameData.xG}</div>}
        {currentGameData.xAG !== undefined && <div><b>Expected Assists (xAG):</b> {currentGameData.xAG}</div>}
      </div>

      {/* Question */}
      <div className="guesser-question">
        {currentQuestion.text}
      </div>

      {/* True/False Buttons */}
      <div className="guesser-btn-row">
        <button 
          className="guesser-btn guesser-btn-green"
          onClick={() => submitGuess(true)}
          disabled={loading || result !== null}
        >
          TRUE
        </button>
        <button 
          className="guesser-btn guesser-btn-red"
          onClick={() => submitGuess(false)}
          disabled={loading || result !== null}
        >
          FALSE
        </button>
      </div>

      {/* Result Display */}
      {result !== null && (
        <div className={`guesser-result ${result ? 'guesser-correct' : 'guesser-incorrect'}`}>
          {result ? (
            <span>🎉 Correct! Well done!</span>
          ) : (
            <span>❌ Incorrect. The answer was {currentQuestion.answer ? 'TRUE' : 'FALSE'}.</span>
          )}
        </div>
      )}

      {/* Play Again Button */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button 
          className="guesser-btn guesser-btn-blue"
          onClick={startNewGame}
        >
          Next Question
        </button>
      </div>
    </div>
  );
};

export default PlayerGuesser; 