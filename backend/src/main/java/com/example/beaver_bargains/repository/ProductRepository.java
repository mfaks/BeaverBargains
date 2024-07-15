package com.example.beaver_bargains.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.beaver_bargains.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {


}
