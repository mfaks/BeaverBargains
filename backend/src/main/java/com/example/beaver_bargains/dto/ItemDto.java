package com.example.beaver_bargains.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemDto implements Serializable{
    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private LocalDateTime listingDate;
    private LocalDateTime purchaseDate;
    private List<String> imageUrls;
    private Set<String> tags;
    private String status;
    private Long sellerId;
    private Long buyerId;
}