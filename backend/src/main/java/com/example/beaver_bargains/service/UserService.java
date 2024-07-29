package com.example.beaver_bargains.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.beaver_bargains.dto.UserBioUpdateDto;
import com.example.beaver_bargains.dto.UserDto;
import com.example.beaver_bargains.dto.UserLoginDto;
import com.example.beaver_bargains.dto.UserRegistrationDto;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.UserRepository;
import com.example.beaver_bargains.security.CustomUserDetails;
import com.example.beaver_bargains.service.CustomExceptions.EmailAlreadyExistsException;
import com.example.beaver_bargains.service.CustomExceptions.ResourceNotFoundException;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new EmailAlreadyExistsException("Email already associated with a registered account");
        }
        User user = new User();
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        return userRepository.save(user);
    }

    public User authenticateUser(UserLoginDto loginDto) {
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            return user;
        } else {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new CustomUserDetails(user);
    }

    public boolean userExists(String email) {        
        return userRepository.findByEmail(email).isPresent();
    }

    public UserDto getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDto(user);
    }

    public UserDto updateBiography(Long userId, UserBioUpdateDto userBioUpdateDto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setBio(userBioUpdateDto.getBio());
        user = userRepository.save(user);
        return new UserDto(user);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserDto updateProfileImage(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
        
        try {
            String profileImageUrl = saveProfileImage(file);
            user.setProfileImageUrl(profileImageUrl);
            user = userRepository.save(user);
            return new UserDto(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process the image file", e);
        }
    }

    private String saveProfileImage(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String uploadDir = "uploads/profile-images/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        return "http://localhost:8080/uploads/profile-images/" + fileName;
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    public UserDto removeProfileImage(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
        user.setProfileImageUrl(null);
        user = userRepository.save(user);
        if (user.getProfileImageUrl() != null) {
            deleteProfileImageFile(user.getProfileImageUrl());
        }
        return new UserDto(user);
    }
    
    private void deleteProfileImageFile(String imageUrl) {
        try {
            String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            Path filePath = Paths.get("uploads/profile-images/", fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete profile image file: " + e.getMessage());
        }
    }
}