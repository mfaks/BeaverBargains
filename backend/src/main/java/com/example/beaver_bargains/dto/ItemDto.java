package com.example.beaver_bargains.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemDto {
    private String title;
    private String description;
    private BigDecimal price;
}
