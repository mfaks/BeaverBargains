package com.example.beaver_bargains.entity;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    private String bio;
    private String profileImageUrl;

    @JsonIgnore
    @Column(nullable = false)
    private boolean emailVerified = false;

    @JsonIgnore
    @Column(unique = true)
    private String verificationToken;

    @OneToMany(mappedBy = "seller")
    @JsonIgnoreProperties("seller")
    private List<Item> items;

    @OneToMany(mappedBy = "buyer")
    @JsonIgnoreProperties("buyer")
    private List<Item> purchasedItems;
}