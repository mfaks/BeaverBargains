package com.example.beaver_bargains.dto;

import java.util.List;

import com.example.beaver_bargains.entity.User;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profileImageUrl;
    private List<Long> itemIds;
    private List<Long> purchasedItemIds;

    public UserDto(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.bio = user.getBio();
        this.profileImageUrl = user.getProfileImageUrl();
    }

    public User toUser() {
        User user = new User();
        user.setId(this.id);
        user.setFirstName(this.firstName);
        user.setLastName(this.lastName);
        user.setEmail(this.email);
        user.setBio(this.bio);
        user.setProfileImageUrl(this.profileImageUrl);
        return user;
    }

}