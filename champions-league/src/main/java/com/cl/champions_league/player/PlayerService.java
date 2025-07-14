package com.cl.champions_league.player;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Random;
import java.util.Map;
import java.util.HashMap;

@Component
public class PlayerService {

    private final PlayerRepository playerRepository;

    @Autowired
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> getPlayers() {
        return playerRepository.findAll();
    }

    public List<Player> getPlayersFromTeam(String teamName) {
        return playerRepository.findAll().stream()
                .filter(player -> teamName.equals(player.getTeamName()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByName(String searchText) {
        return playerRepository.findAll().stream()
                .filter(player -> player.getName().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByPos(String searchText) {
        return playerRepository.findAll().stream()
                .filter(player -> player.getPos().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByNation(String searchText) {
        return playerRepository.findAll().stream()
                .filter(player -> player.getNation().toLowerCase().contains(searchText.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<Player> getPlayersByTeamAndPosition(String team, String position){
        return playerRepository.findAll().stream()
                .filter(player -> team.equals(player.getTeamName()) && position.equals(player.getPos()))
                .collect(Collectors.toList());
    }

    public Player addPlayer(Player player) {
        return playerRepository.save(player);
    }

    public Player updatePlayer(Player updatedPlayer) {
        Optional<Player> existingPlayer = playerRepository.findByName(updatedPlayer.getName());

        if (existingPlayer.isPresent()) {
            Player playerToUpdate = existingPlayer.get();
            playerToUpdate.setName(updatedPlayer.getName());
            playerToUpdate.setTeamName(updatedPlayer.getTeamName());
            playerToUpdate.setPos(updatedPlayer.getPos());
            playerToUpdate.setNation(updatedPlayer.getNation());
            playerRepository.save(playerToUpdate);
            return playerToUpdate;
        }
        return null;
    }

    @Transactional
    public void deletePlayer(String playerName) {
        playerRepository.deleteByName(playerName);
    }

    // === NEW METHOD FOR THE TRUE OR FALSE GAME ===

    /**
     * Returns random player info without the player's name,
     * but includes the actual name internally for validation.
     */
    public Map<String, Object> getRandomPlayerWithoutName() {
        List<Player> players = playerRepository.findAll();
        if (players.isEmpty()) return null;

        Random random = new Random();
        Player player = players.get(random.nextInt(players.size()));

        Map<String, Object> data = new HashMap<>();
        data.put("nation", player.getNation());
        data.put("pos", player.getPos());
        data.put("age", player.getAge());
        data.put("mp", player.getMp());
        data.put("starts", player.getStarts());
        data.put("min", player.getMin());
        data.put("gls", player.getGls());
        data.put("ast", player.getAst());
        data.put("pk", player.getPk());
        data.put("crdY", player.getCrdY());
        data.put("crdR", player.getCrdR());
        data.put("xG", player.getxG());
        data.put("xAG", player.getxAG());
        data.put("teamName", player.getTeamName());

        // Include actual name internally for answer checking
        data.put("actualName", player.getName());

        return data;
    }

    /**
     * Validates if the user's guess matches the actual player name.
     * Returns true if correct, false otherwise.
     */
    public boolean validateGuess(String actualName, String userGuess) {
        return actualName.equalsIgnoreCase(userGuess);
    }
}