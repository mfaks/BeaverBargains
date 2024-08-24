package com.example.beaver_bargains.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.example.beaver_bargains.dto.JwtResponseDto;
import com.example.beaver_bargains.dto.UserLoginDto;
import com.example.beaver_bargains.dto.UserRegistrationDto;
import com.example.beaver_bargains.entity.User;
import com.example.beaver_bargains.security.CustomUserDetails;
import com.example.beaver_bargains.security.JwtUtil;
import com.example.beaver_bargains.service.CustomExceptions.EmailAlreadyExistsException;
import com.example.beaver_bargains.service.CustomExceptions.InvalidEmailDomainException;
import com.example.beaver_bargains.service.CustomExceptions.ResourceNotFoundException;
import com.example.beaver_bargains.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.frontend.url}", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        try {
            User user = userService.registerUser(registrationDto);
            return ResponseEntity.ok(user);
        } catch (InvalidEmailDomainException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/verify-email")
    public RedirectView verifyEmail(@RequestParam String token) {
        try {
            userService.verifyEmail(token);
            return new RedirectView(frontendUrl + "/login?verified=true");
        } catch (ResourceNotFoundException e) {
            return new RedirectView(frontendUrl + "/login?verified=false&error=invalid_token");
        } catch (Exception e) {
            return new RedirectView(frontendUrl + "/login?verified=false&error=server_error");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDto loginDto) {
        try {
            if (!userService.userExists(loginDto.getEmail())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Email not found. Please check your email or register for an account.");
            }
            User user = userService.getUserByEmail(loginDto.getEmail());
            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Email not verified. Please check your email for verification link.");
            }
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));

            final UserDetails userDetails = userService.loadUserByUsername(loginDto.getEmail());
            final String jwt = jwtUtil.generateToken(userDetails);

            CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
            User authenticatedUser = customUserDetails.getUser();

            JwtResponseDto response = new JwtResponseDto();
            response.setToken(jwt);
            response.setId(authenticatedUser.getId());
            response.setFirstName(authenticatedUser.getFirstName());
            response.setLastName(authenticatedUser.getLastName());
            response.setEmail(authenticatedUser.getEmail());
            response.setBio(authenticatedUser.getBio());
            response.setProfileImageUrl(authenticatedUser.getProfileImageUrl());
            response.setEmailVerified(authenticatedUser.isEmailVerified()); 
            
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}