package com.example.beaver_bargains.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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


    public Item createItem(ItemDto itemDto, List<MultipartFile> images, String userEmail) throws IOException {
        User seller = userService.getUserByEmail(userEmail);
        if (seller == null) {
            throw new RuntimeException("User not found");
        }

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile image : images) {
            String imageUrl = fileStorageService.storeFile(image);
            imageUrls.add(imageUrl);
        }

        Item item = new Item();
        item.setTitle(itemDto.getTitle());
        item.setDescription(itemDto.getDescription());
        item.setPrice(itemDto.getPrice());
        item.setListingDate(LocalDateTime.now());
        item.setImageUrls(imageUrls);
        item.setTags(new HashSet<>(itemDto.getTags()));
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

    public Item updateItem(Long itemId, ItemDto itemDto, List<MultipartFile> newImages, String userEmail) throws IOException {
        Item existingItem = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        
        existingItem.setTitle(itemDto.getTitle());
        existingItem.setDescription(itemDto.getDescription());
        existingItem.setPrice(itemDto.getPrice());
        existingItem.setTags(new HashSet<>(itemDto.getTags()));

        if (newImages != null && !newImages.isEmpty()) {
            for (String oldImageUrl : existingItem.getImageUrls()) {
                fileStorageService.deleteFile(oldImageUrl);
            }

            List<String> newImageUrls = new ArrayList<>();
            for (MultipartFile image : newImages) {
                String newImageUrl = fileStorageService.storeFile(image);
                newImageUrls.add(newImageUrl);
            }
            existingItem.setImageUrls(newImageUrls);
        }

        return itemRepository.save(existingItem);
    }

    public void deleteItem(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        for (String imageUrl : item.getImageUrls()) {
            fileStorageService.deleteFile(imageUrl);
        }
        itemRepository.delete(item);
    }

    public List<Item> searchItems(String query, List<String> tags, String userEmail) {
        User currentUser = userService.getUserByEmail(userEmail);
        
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Item> cq = cb.createQuery(Item.class);
        Root<Item> root = cq.from(Item.class);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.notEqual(root.get("seller"), currentUser));
        predicates.add(cb.equal(root.get("status"), ItemStatus.ACTIVE));

        if (query != null && !query.trim().isEmpty()) {
            String[] keywords = query.toLowerCase().split("\\s+");
            for (String keyword : keywords) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + keyword + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + keyword + "%")
                ));
            }
        }

        if (tags != null && !tags.isEmpty()) {
            predicates.add(root.get("tags").in(tags));
        }

        cq.where(cb.and(predicates.toArray(new Predicate[0])));
        cq.orderBy(cb.desc(root.get("listingDate")));

        List<Item> results = entityManager.createQuery(cq).getResultList();

        if (query != null && !query.trim().isEmpty()) {
            String[] keywords = query.toLowerCase().split("\\s+");
            return results.stream()
                .sorted((item1, item2) -> Integer.compare(
                    calculateRelevanceScore(item2, keywords),
                    calculateRelevanceScore(item1, keywords)
                ))
                .collect(Collectors.toList());
        }

        return results;
    }

    private final Set<String> DEFAULT_TAGS = new HashSet<>(Arrays.asList("Free", "Electronics", "Furniture", "Kitchen", "Books", "Clothing", "Sports", "Toys"));
    public Set<String> getAllTags(String userEmail) {
        User currentUser = userService.getUserByEmail(userEmail);
        
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<String> cq = cb.createQuery(String.class);
        Root<Item> root = cq.from(Item.class);

        cq.select(root.get("tags")).distinct(true);
        cq.where(
            cb.and(
                cb.notEqual(root.get("seller"), currentUser),
                cb.equal(root.get("status"), ItemStatus.ACTIVE)
            )
        );

        Set<String> tags = new HashSet<>(entityManager.createQuery(cq).getResultList());
        tags.addAll(DEFAULT_TAGS);

        return tags;
    }

    private int calculateRelevanceScore(Item item, String[] keywords) {
        int score = 0;
        for (String keyword : keywords) {
            if (item.getTitle().toLowerCase().contains(keyword)) {
                score += 2;
            }
            if (item.getDescription().toLowerCase().contains(keyword)) {
                score += 1;
            }
        }
        return score;
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
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));    
        User buyer = userService.getUserById(buyerId);
        item.setStatus(ItemStatus.SOLD);
        item.setBuyer(buyer);
        item.setPurchaseDate(purchaseDate);
        return itemRepository.save(item);
    }

    public Item reactivateItem(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(ItemStatus.ACTIVE);
        return itemRepository.save(item);
    }

    public List<Item> getPurchasedItemsByUser(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return itemRepository.findByBuyerAndStatus(user, ItemStatus.SOLD);
    }
}