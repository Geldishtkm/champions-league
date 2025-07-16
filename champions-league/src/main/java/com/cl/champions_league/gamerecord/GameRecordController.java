package com.cl.champions_league.gamerecord;

import com.cl.champions_league.player.User;
import com.cl.champions_league.player.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gamerecords")
public class GameRecordController {
    private final GameRecordService gameRecordService;
    private final UserRepository userRepository;

    @Autowired
    public GameRecordController(GameRecordService gameRecordService, UserRepository userRepository) {
        this.gameRecordService = gameRecordService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public GameRecord addRecord(@RequestBody GameRecordRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        GameRecord record = new GameRecord(request.getGuess(), request.getScore(), user);
        return gameRecordService.save(record);
    }

    @GetMapping
    public List<GameRecord> getAllRecords() {
        return gameRecordService.getAllRecords();
    }

    @GetMapping("/user/{userId}")
    public List<GameRecord> getRecordsByUser(@PathVariable Long userId) {
        return gameRecordService.getRecordsByUser(userId);
    }

    @GetMapping("/champions")
    public List<GameRecord> getChampions() {
        return gameRecordService.getChampions();
    }

    @GetMapping("/top3")
    public List<GameRecord> getTop3() {
        return gameRecordService.getTop3UniqueUsersByHighestScore();
    }

    // DTO for incoming requests
    public static class GameRecordRequest {
        private String guess;
        private int score;
        private Long userId;

        public String getGuess() { return guess; }
        public void setGuess(String guess) { this.guess = guess; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
} 