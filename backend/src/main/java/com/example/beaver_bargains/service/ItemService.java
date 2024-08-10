package com.example.beaver_bargains.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.beaver_bargains.dto.ItemDto;
import com.example.beaver_bargains.entity.Item;
import com.example.beaver_bargains.entity.ItemStatus;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.ItemRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private FileStorageService fileStorageService;

    @PersistenceContext
    private EntityManager entityManager;

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
        item.setStatus(ItemStatus.ACTIVE);

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

    public List<Item> getAllItemsExceptUser(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return itemRepository.findBySellerNot(user);
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

    public List<Item> searchItems(String query) {

        if (query == null || query.trim().isEmpty()) {
            return getAllItems();
        }

        String[] keywords = query.toLowerCase().split("\\s+");

        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Item> criteriaQuery = criteriaBuilder.createQuery(Item.class);
        Root<Item> root = criteriaQuery.from(Item.class);

        List<Predicate> predicates = new ArrayList<>();

        for (String keyword : keywords) {
            Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + keyword + "%");
            Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),
                    "%" + keyword + "%");
            predicates.add(criteriaBuilder.or(titleMatch, descMatch));
        }

        criteriaQuery.where(criteriaBuilder.and(predicates.toArray(new Predicate[0])));
        criteriaQuery.orderBy(criteriaBuilder.desc(root.get("listingDate")));

        List<Item> results = entityManager.createQuery(criteriaQuery).getResultList();

        return results.stream()
                .map(item -> {
                    int score = 0;
                    for (String keyword : keywords) {
                        if (item.getTitle().toLowerCase().contains(keyword)) {
                            score += 2;
                        }
                        if (item.getDescription().toLowerCase().contains(keyword)) {
                            score += 1;
                        }
                    }
                    return new AbstractMap.SimpleEntry<>(item, score);
                })
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())).map(AbstractMap.SimpleEntry::getKey)
                .collect(Collectors.toList());
    }

    public List<Item> getAllActiveItems() {
        return itemRepository.findByStatus(ItemStatus.ACTIVE);
    }

    public List<Item> getAllActiveItemsExceptUser(String userEmail) {
        User currentUser = userService.getUserByEmail(userEmail);
        return itemRepository.findByStatusAndSellerNot(ItemStatus.ACTIVE, currentUser);
    }

    public List<Item> getActiveItemsByUser(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return itemRepository.findBySeller(user).stream()
                .filter(Item::isActive)
                .collect(Collectors.toList());
    }

    public List<Item> getSoldItemsByUser(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return itemRepository.findBySeller(user).stream()
                .filter(Item::isSold)
                .collect(Collectors.toList());
    }

    public Item markItemAsSold(Long itemId, Long buyerId, LocalDateTime purchaseDate, String sellerEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User seller = userService.getUserByEmail(sellerEmail);
        if (seller == null || !item.getSeller().equals(seller)) {
            throw new RuntimeException("User not authorized to update this item");
        }

        User buyer = userService.getUserById(buyerId);
        if (buyer == null) {
            throw new RuntimeException("Buyer not found");
        }

        item.setStatus(ItemStatus.SOLD);
        item.setBuyer(buyer);
        item.setPurchaseDate(purchaseDate);
        return itemRepository.save(item);
    }

    public Item reactivateItem(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User user = userService.getUserByEmail(userEmail);
        if (user == null || !item.getSeller().equals(user)) {
            throw new RuntimeException("Unauthorized to reactivate this item");
        }

        if (item.getStatus() != ItemStatus.SOLD) {
            throw new RuntimeException("Only sold items can be reactivated");
        }

        item.setStatus(ItemStatus.ACTIVE);
        return itemRepository.save(item);
    }

    public List<Item> getPurchasedItemsByUser(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return itemRepository.findByBuyerAndStatus(user, ItemStatus.SOLD);
    }
}