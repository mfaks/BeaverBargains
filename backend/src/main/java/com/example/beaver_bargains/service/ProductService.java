package com.example.beaver_bargains.service;
import com.example.beaver_bargains.dto.ProductDTO;

public interface ProductService {
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO getProductById(Long id);
}
