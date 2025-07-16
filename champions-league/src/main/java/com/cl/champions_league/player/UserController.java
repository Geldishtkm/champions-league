package com.cl.champions_league.player;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
public ResponseEntity<String> register(@RequestBody User user) {
    try {
        userService.register(user.getUsername(), user.getPassword());
        return ResponseEntity.ok("User registered successfully!");
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}

    @PostMapping("/login")
public ResponseEntity<String> login(@RequestBody User user) {
    User found = userService.findByUsername(user.getUsername());
    if (found == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username not found");
    }
    boolean matches = userService.checkPassword(user.getPassword(), found.getPassword());
    if (!matches) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password");
    }
    return ResponseEntity.ok("Login successful!");
}
}