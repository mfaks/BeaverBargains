package com.example.beaver_bargains.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.entity.User;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findBySeller(User seller);
    List<Item> findBySellerNot(User seller);
}
