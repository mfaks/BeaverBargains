package com.example.beaver_bargains.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    @Cacheable(value = "favoriteItemIds", key = "#userEmail")
    public List<Long> getFavoriteItemIds(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUser(user).stream()
                .map(favorite -> favorite.getItem().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "favoriteItemIds", key = "#userEmail")
    public void addFavorite(String userEmail, Long itemId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        Favorite favorite = new Favorite(user, item);
        favoriteRepository.save(favorite);
    }

    @Transactional
    @CacheEvict(value = "favoriteItemIds", key = "#userEmail")
    public void removeFavorite(String userEmail, Long itemId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));

        List<Favorite> favorites = favoriteRepository.findByUserAndItem(user, item);

        if (!favorites.isEmpty()) {
            favoriteRepository.deleteAll(favorites);
        }
    }
}
