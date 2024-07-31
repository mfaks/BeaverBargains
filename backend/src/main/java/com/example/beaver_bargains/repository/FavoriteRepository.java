package com.example.beaver_bargains.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.beaver_bargains.entity.Favorite;
import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.entity.User;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    Optional<Favorite> findByUserAndItem(User user, Item item);
    void deleteByUserAndItem(User user, Item item);
}


