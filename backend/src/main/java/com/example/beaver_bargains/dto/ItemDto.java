package com.example.beaver_bargains.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemDto {
    private String title;
    private String description;
    private BigDecimal price;
    private LocalDateTime listingDate;
}
