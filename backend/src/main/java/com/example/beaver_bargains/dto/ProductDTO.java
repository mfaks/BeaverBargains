package com.example.beaver_bargains.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductDto {
    private Long id;
    private String name; 
    private String description;
    private BigDecimal price;
}
