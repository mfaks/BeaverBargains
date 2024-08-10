package com.example.beaver_bargains.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.entity.ItemStatus;
import com.example.beaver_bargains.entity.User;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findBySeller(User seller);
    List<Item> findBySellerNot(User seller);
    List<Item> findByStatus(ItemStatus status);
    List<Item> findByStatusAndSellerNot(ItemStatus status, User seller);
    List<Item> findByBuyerAndStatus(User buyer, ItemStatus status);
}
