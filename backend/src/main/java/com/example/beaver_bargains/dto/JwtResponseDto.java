package com.example.beaver_bargains.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtResponseDto {
    private String token;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profileImageUrl;
    private boolean emailVerified;
}