package com.example.beaver_bargains.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.beaver_bargains.service.FavoriteService;

@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {
    
    @Autowired
    private FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Long> body, Authentication authentication) {
        String userEmail = authentication.getName();
        Long itemId = body.get("itemId");
        favoriteService.addFavorite(userEmail, itemId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Long>> getFavorites(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Long> favorites = favoriteService.getFavoriteItemIds(userEmail);
        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long itemId, Authentication authentication) {
        String userEmail = authentication.getName();
        favoriteService.removeFavorite(userEmail, itemId);
        return ResponseEntity.ok().build();
    }
}
