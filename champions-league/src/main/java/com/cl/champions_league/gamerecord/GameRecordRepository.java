package com.cl.champions_league.gamerecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {
    // Find all records for a user
    List<GameRecord> findByUserId(Long userId);

    // Find the highest score among all records
    @Query("SELECT MAX(gr.score) FROM GameRecord gr")
    Integer findMaxScore();

    // Find all records with the highest score
    @Query("SELECT gr FROM GameRecord gr WHERE gr.score = (SELECT MAX(g.score) FROM GameRecord g)")
    List<GameRecord> findRecordsWithMaxScore();

    // Find the top 3 unique users by their highest score
    @Query("SELECT gr FROM GameRecord gr WHERE gr.id IN (SELECT MAX(g.id) FROM GameRecord g GROUP BY g.user.id) ORDER BY gr.score DESC LIMIT 3")
    List<GameRecord> findTop3UniqueUsersByHighestScore();
} 