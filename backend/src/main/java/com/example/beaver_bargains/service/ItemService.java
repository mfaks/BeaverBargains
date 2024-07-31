package com.example.beaver_bargains.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.beaver_bargains.dto.ItemDto;
import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.ItemRepository;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    public Item createItem(ItemDto itemDto, MultipartFile image, String userEmail) throws IOException {
        User seller = userService.getUserByEmail(userEmail);
        if (seller == null) {
            throw new RuntimeException("User not found");
        }

        String imageUrl = fileStorageService.storeFile(image);

        Item item = new Item();
        item.setTitle(itemDto.getTitle());
        item.setDescription(itemDto.getDescription());
        item.setPrice(itemDto.getPrice());
        item.setListingDate(LocalDateTime.now());
        item.setImageUrl(imageUrl);
        item.setSeller(seller);

        return itemRepository.save(item);
    }

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public List<Item> getItemsByUser(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return itemRepository.findBySeller(user);
    }

    public Item updateItem(Long itemId, ItemDto itemDto, MultipartFile image, String userEmail) throws IOException {
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        User user = userService.getUserByEmail(userEmail);
        if (user == null || !existingItem.getSeller().equals(user)) {
            throw new RuntimeException("Unauthorized to update this item");
        }

        existingItem.setTitle(itemDto.getTitle());
        existingItem.setDescription(itemDto.getDescription());
        existingItem.setPrice(itemDto.getPrice());

        if (image != null) {
            fileStorageService.deleteFile(existingItem.getImageUrl());
            String newImageUrl = fileStorageService.storeFile(image);
            existingItem.setImageUrl(newImageUrl);
        }

        return itemRepository.save(existingItem);
    }

    public void deleteItem(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        User user = userService.getUserByEmail(userEmail);
        if (user == null || !item.getSeller().equals(user)) {
            throw new RuntimeException("Unauthorized to delete this item");
        }

        itemRepository.delete(item);
        fileStorageService.deleteFile(item.getImageUrl());
    }
}