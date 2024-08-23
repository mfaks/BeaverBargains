package com.example.beaver_bargains.dto;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtResponseDto implements Serializable{
    private static final long serialVersionUID = 1L;

    private String token;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profileImageUrl;
}