package com.cl.champions_league.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register a new user (hashes password)
    public void register(String username, String rawPassword) {
        // Check if username already exists
        if (userRepository.findByUsername(username) != null) {
            throw new IllegalArgumentException("Username already exists");
        }
        String hashedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(username, hashedPassword);
        userRepository.save(user);
    }

    // Find a user by username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Check if the raw password matches the hashed password
    public boolean checkPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}