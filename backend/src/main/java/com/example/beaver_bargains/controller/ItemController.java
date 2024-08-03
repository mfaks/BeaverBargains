package com.example.beaver_bargains.controller;

import java.io.IOException;
import java.util.List;

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
            @RequestPart("image") MultipartFile image, Authentication authentication) throws IOException {
        String userEmail = authentication.getName();
        Item createdItem = itemService.createItem(itemDto, image, userEmail);
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
    public ResponseEntity<Item> updateItem(
            @PathVariable Long itemId,
            @RequestPart("item") ItemDto itemDto,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) throws IOException {
        String userEmail = authentication.getName();
        Item updatedItem = itemService.updateItem(itemId, itemDto, image, userEmail);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteItem(@PathVariable Long itemId, Authentication authentication) {
        String userEmail = authentication.getName();
        itemService.deleteItem(itemId, userEmail);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchItems(@RequestParam(required = false) String query, Authentication authentication) {
        String userEmail = authentication.getName();
        List<Item> items = (query != null && !query.trim().isEmpty()) 
            ? itemService.searchItems(query)
            : itemService.getAllItemsExceptUser(userEmail);
        return ResponseEntity.ok(items);
    }
}
