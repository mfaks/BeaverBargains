package com.example.beaver_bargains.entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id; 

    @ManyToOne
    private Order order;

    @ManyToOne
    private Product product;
    
    private int quantity;
    private BigDecimal price; 
}
