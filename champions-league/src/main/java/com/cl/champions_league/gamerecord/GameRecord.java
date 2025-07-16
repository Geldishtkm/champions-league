package com.cl.champions_league.gamerecord;

import com.cl.champions_league.player.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_records")
public class GameRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String guess; // The guess or record value

    private int score; // The score for this guess

    private LocalDateTime timestamp; // When the guess was made

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public GameRecord() {}

    public GameRecord(String guess, int score, User user) {
        this.guess = guess;
        this.score = score;
        this.user = user;
        this.timestamp = java.time.LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGuess() { return guess; }
    public void setGuess(String guess) { this.guess = guess; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
} 