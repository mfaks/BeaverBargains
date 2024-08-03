package com.example.beaver_bargains.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.beaver_bargains.entity.Favorite;
import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.FavoriteRepository;
import com.example.beaver_bargains.repository.ItemRepository;
import com.example.beaver_bargains.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    public List<Long> getFavoriteItemIds(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUser(user).stream()
                .map(favorite -> favorite.getItem().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(String userEmail, Long itemId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (favoriteRepository.findByUserAndItem(user, item).isPresent()) {
            throw new RuntimeException("Item is already favorited");
        }

        Favorite favorite = new Favorite(user, item);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String userEmail, Long itemId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Item item = itemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));

        favoriteRepository.findByUserAndItem(user, item)
            .ifPresentOrElse(
                favorite -> favoriteRepository.delete(favorite),
                () -> {
                    throw new RuntimeException("Favorite not found");
                });
    }
}
