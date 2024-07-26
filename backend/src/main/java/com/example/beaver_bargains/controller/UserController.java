package com.example.beaver_bargains.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.beaver_bargains.dto.ChangePasswordDto;
import com.example.beaver_bargains.dto.ProfileImageUpdateDto;
import com.example.beaver_bargains.dto.UserBioUpdateDto;
import com.example.beaver_bargains.dto.UserDto;
import com.example.beaver_bargains.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
        public ResponseEntity<UserDto> getUserDetails(@PathVariable Long userId) {
        UserDto userDto = userService.getUserDetails(userId);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/{userId}/biography")
    public ResponseEntity<UserDto> updateBiography(
            @PathVariable Long userId,
            @RequestBody UserBioUpdateDto userBioUpdateDto) {
        UserDto updatedUser = userService.updateBiography(userId, userBioUpdateDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long userId,
            @RequestBody ChangePasswordDto changePasswordDto) {
        userService.changePassword(userId, changePasswordDto.getOldPassword(), changePasswordDto.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/profile-icon")
    public ResponseEntity<UserDto> updateProfileIcon(
            @PathVariable Long userId,
            @RequestBody ProfileImageUpdateDto profileImageUpateDto) {
        UserDto updatedUser = userService.updateProfileIcon(userId, profileImageUpateDto);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}