package com.cl.champions_league.gamerecord;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GameRecordService {
    private final GameRecordRepository gameRecordRepository;

    @Autowired
    public GameRecordService(GameRecordRepository gameRecordRepository) {
        this.gameRecordRepository = gameRecordRepository;
    }

    public GameRecord save(GameRecord record) {
        // Enforce: Only save if score is >= lowest score among top 3 unique users
        List<GameRecord> top3 = gameRecordRepository.findTop3UniqueUsersByHighestScore();
        if (top3.size() < 3) {
            // Less than 3 records, always allow
            return gameRecordRepository.save(record);
        } else {
            int minTop3Score = top3.stream().mapToInt(GameRecord::getScore).min().orElse(Integer.MIN_VALUE);
            if (record.getScore() >= minTop3Score) {
                return gameRecordRepository.save(record);
            } else {
                throw new IllegalArgumentException("Score is not high enough to be in the top 3.");
            }
        }
    }

    public List<GameRecord> getAllRecords() {
        return gameRecordRepository.findAll();
    }

    public List<GameRecord> getRecordsByUser(Long userId) {
        return gameRecordRepository.findByUserId(userId);
    }

    public List<GameRecord> getChampions() {
        return gameRecordRepository.findRecordsWithMaxScore();
    }

    public List<GameRecord> getTop3UniqueUsersByHighestScore() {
        return gameRecordRepository.findTop3UniqueUsersByHighestScore();
    }
} 