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
      margin: "2rem auto",
      maxWidth: 600,
      background: "rgba(40, 0, 60, 0.7)",
      borderRadius: 24,
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      border: "2px solid gold",
      padding: "2rem",
      color: "gold",
      textAlign: "center"
    }}>
      <h2 style={{ fontWeight: "bold", fontSize: "2rem", marginBottom: "1rem" }}>🏆 Our Champions (Top 3) 🏆</h2>
      {uniqueChampions.length === 0 ? (
        <div>No champions yet!</div>
      ) : (
        uniqueChampions.map((champ, idx) => (
          <div key={champ.username} style={{ margin: "1rem 0", fontSize: "1.2rem" }}>
            <b>{idx + 1}. {champ.username}</b> — Score: <b>{champ.score}</b>
          </div>
        ))
      )}
    </div>
  );
};

export default ChampionsSection; 