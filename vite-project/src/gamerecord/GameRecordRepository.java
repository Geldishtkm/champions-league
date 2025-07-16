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

    // Find all users with the highest score
    @Query("SELECT gr FROM GameRecord gr WHERE gr.score = (SELECT MAX(g.score) FROM GameRecord g)")
    List<GameRecord> findRecordsWithMaxScore();
} 