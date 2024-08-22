package com.example.beaver_bargains.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.beaver_bargains.dto.UserDto;
import com.example.beaver_bargains.dto.UserLoginDto;
import com.example.beaver_bargains.dto.UserRegistrationDto;
import com.example.beaver_bargains.dto.UserUpdateDto;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.repository.UserRepository;
import com.example.beaver_bargains.security.CustomUserDetails;
import com.example.beaver_bargains.service.CustomExceptions.EmailAlreadyExistsException;
import com.example.beaver_bargains.service.CustomExceptions.InvalidEmailDomainException;
import com.example.beaver_bargains.service.CustomExceptions.ResourceNotFoundException;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#result.id"),
            @CacheEvict(value = "userByEmail", key = "#result.email"),
            @CacheEvict(value = "userDetails", key = "#result.id")
    })
    public User registerUser(UserRegistrationDto registrationDto) {
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new EmailAlreadyExistsException("Email already associated with a registered account");
        }

        if (!registrationDto.getEmail().toLowerCase().endsWith("@oregonstate.edu")) {
            throw new InvalidEmailDomainException(
                    "Registration is only allowed with an '@oregonstate.edu' email address");
        }

        User user = new User();
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setEmailVerified(false);
        user.setVerificationToken(generateVerificationToken());
        User savedUser = userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());

        return savedUser;
    }

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#result.id"),
            @CacheEvict(value = "userByEmail", key = "#result.email"),
            @CacheEvict(value = "userDetails", key = "#result.id")
    })
    public User verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token"));
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        return userRepository.save(user);
    }

    public User authenticateUser(UserLoginDto loginDto) {
        User user = getUserByEmail(loginDto.getEmail());
        if (passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            return user;
        } else {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    @Cacheable(value = "userId", key = "#email")
    public Long getUserId(String email) {
        User user = getUserByEmail(email);
        return user.getId();
    }

    @Cacheable(value = "userById", key = "#userId")
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Cacheable(value = "userByEmail", key = "#email")
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Cacheable(value = "userExists", key = "#email")
    public boolean userExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    @Cacheable(value = "userDetails", key = "#email")
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = getUserByEmail(email);
        return new CustomUserDetails(user);
    }

    @Cacheable(value = "userDetails", key = "#userId")
    public UserDto getUserDetails(Long userId) {
        User user = getUserById(userId);
        return new UserDto(user);
    }

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#userId"),
            @CacheEvict(value = "userByEmail", key = "#result.email"),
            @CacheEvict(value = "userDetails", key = "#userId")
    })
    public UserDto updateBiography(Long userId, UserUpdateDto userUpdateDto) {
        User user = getUserById(userId);
        user.setBio(userUpdateDto.getBio());
        user = userRepository.save(user);
        return new UserDto(user);
    }

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#userId"),
            @CacheEvict(value = "userByEmail", key = "#result.email"),
            @CacheEvict(value = "userDetails", key = "#userId")
    })
    public User changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid old password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#userId"),
            @CacheEvict(value = "userByEmail", key = "#result.email"),
            @CacheEvict(value = "userDetails", key = "#userId")
    })
    public UserDto updateProfileImage(Long userId, MultipartFile image) {
        User user = getUserById(userId);

        try {
            String imageUrl = fileStorageService.storeFile(image);
            if (user.getProfileImageUrl() != null) {
                fileStorageService.deleteFile(user.getProfileImageUrl());
            }

            user.setProfileImageUrl(imageUrl);
            user = userRepository.save(user);
            return new UserDto(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process the image file", e);
        }
    }

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#userId"),
            @CacheEvict(value = "userByEmail", key = "#result.email"),
            @CacheEvict(value = "userDetails", key = "#userId")
    })
    public UserDto removeProfileImage(Long userId) {
        User user = getUserById(userId);

        if (user.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(user.getProfileImageUrl());
            user.setProfileImageUrl(null);
            user = userRepository.save(user);
        }
        return new UserDto(user);
    }

    @Caching(evict = {
            @CacheEvict(value = "userById", key = "#userId"),
            @CacheEvict(value = "userByEmail", allEntries = true),
            @CacheEvict(value = "userDetails", key = "#userId"),
            @CacheEvict(value = "userId", allEntries = true),
            @CacheEvict(value = "userExists", allEntries = true)
    })
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
}