package com.example.beaver_bargains.service;
import com.example.beaver_bargains.dto.ProductDto;

public interface ProductService {
    ProductDto createProduct(ProductDto productDTO);
    ProductDto getProductById(Long id);
}
