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
        return gameRecordRepository.save(record);
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
} 