package com.example.beaver_bargains.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.beaver_bargains.dto.ItemDto;
import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.service.ItemService;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestPart("item") ItemDto itemDto,
            @RequestPart("images") List<MultipartFile> images, Authentication authentication) throws IOException {
        String userEmail = authentication.getName();
        Item createdItem = itemService.createItem(itemDto, images, userEmail);
        return ResponseEntity.ok(createdItem);
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = itemService.getAllItemsExceptUser(userEmail);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Item>> getItemsByUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = itemService.getItemsByUser(userEmail);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<Item> updateItem(@PathVariable Long itemId, @RequestPart("item") ItemDto itemDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images, Authentication authentication)
            throws IOException {
        String userEmail = authentication.getName();
        Item updatedItem = itemService.updateItem(itemId, itemDto, images, userEmail);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteItem(@PathVariable Long itemId, Authentication authentication) {
        String userEmail = authentication.getName();
        itemService.deleteItem(itemId, userEmail);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/marketplace")
    public ResponseEntity<List<Item>> getAllActiveItems(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = itemService.getAllActiveItemsExceptUser(userEmail);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchItems(@RequestParam(required = false) String query,
            @RequestParam(required = false) List<String> tags, Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = itemService.searchItems(query, tags, userEmail);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/tags")
    public ResponseEntity<Set<String>> getAllTags(Authentication authentication) {
        String userEmail = authentication.getName();
        Set<String> tags = itemService.getAllTags(userEmail);
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/user/active")
    public ResponseEntity<List<Item>> getActiveItemsByUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = itemService.getActiveItemsByUser(userEmail);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/user/sold")
    public ResponseEntity<List<Item>> getSoldItemsByUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = itemService.getSoldItemsByUser(userEmail);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{itemId}/mark-as-sold")
    public ResponseEntity<Item> markItemAsSold(@PathVariable Long itemId, @RequestParam Long buyerId,
            @RequestParam String purchaseDate, Authentication authentication) {
        String sellerEmail = authentication.getName();
        LocalDateTime parsedPurchaseDate = LocalDateTime.parse(purchaseDate);
        Item updatedItem = itemService.markItemAsSold(itemId, buyerId, parsedPurchaseDate, sellerEmail);
        return ResponseEntity.ok(updatedItem);
    }

    @PutMapping("/{itemId}/reactivate")
    public ResponseEntity<Item> reactivateItem(@PathVariable Long itemId, Authentication authentication) {
        String userEmail = authentication.getName();
        Item reactivatedItem = itemService.reactivateItem(itemId, userEmail);
        return ResponseEntity.ok(reactivatedItem);
    }

    @GetMapping("/user/purchased")
    public ResponseEntity<List<Item>> getPurchasedItemsByUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> purchasedItems = itemService.getPurchasedItemsByUser(userEmail);
        return ResponseEntity.ok(purchasedItems);
    }
}
