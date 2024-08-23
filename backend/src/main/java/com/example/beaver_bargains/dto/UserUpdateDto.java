package com.example.beaver_bargains.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateDto {
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profileImageUrl;
    private String currentPassword;
    private String newPassword;
}