import React, { useEffect, useState } from "react";

const ChampionsSection = () => {
  console.log("ChampionsSection mounted");
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching top 3 champions...");
    fetch("http://localhost:8080/api/gamerecords/top3")
      .then((res) => res.json())
      .then((data) => {
        console.log("Top 3 champions data:", data);
        setChampions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading champions...</div>;

  // Only show unique users with their highest score (should already be unique from backend)
  const uniqueChampions = champions.map(record => ({
    username: record.user.username,
    score: record.score
  }));

  return (
    <div className="champions-section" style={{
      margin: "1.2rem auto",
      maxWidth: 800,
      background: "#23294d",
      borderRadius: 18,
      boxShadow: "0 2px 12px 0 rgba(31, 38, 135, 0.10)",
      border: "none",
      padding: "1.2rem 2.5rem 1rem 2.5rem",
      color: "#e0e6f7",
      textAlign: "center",
      position: 'relative',
    }}>
      <h2 style={{
        fontWeight: 700,
        fontSize: "1.6rem",
        marginBottom: "0.7rem",
        letterSpacing: 0.5,
        color: '#e0e6f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}>
        <span role="img" aria-label="trophy" style={{fontSize: '1.7rem'}}>🏆</span>
        Our Champions
      </h2>
      {uniqueChampions.length === 0 ? (
        <div style={{ color: '#bfc6e6', fontWeight: 500, fontSize: '1.1rem', margin: '1.5rem 0' }}>No champions yet!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1.2rem', zIndex: 2, position: 'relative', justifyContent: 'center', alignItems: 'stretch', width: '100%' }}>
          {uniqueChampions.map((champ, idx) => (
            <div key={champ.username} style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 220,
              fontSize: '1.13rem',
              background: idx === 0 ? '#2e335c' : idx === 1 ? '#2a3052' : '#262a44',
              borderRadius: 10,
              boxShadow: '0 1px 4px #23294d22',
              border: 'none',
              color: '#e0e6f7',
              fontWeight: 500,
              padding: '0.7rem 1.2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              position: 'relative',
              letterSpacing: 0.2,
              fontFamily: 'Segoe UI, Arial, sans-serif',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
              <span style={{ fontWeight: 700 }}>{champ.username}</span>
              <span style={{ fontWeight: 400, fontSize: '1.01rem', color: '#bfc6e6' }}>Score: <b style={{ color: '#e0e6f7' }}>{champ.score}</b></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChampionsSection; 