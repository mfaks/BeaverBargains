package com.example.beaver_bargains.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

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
        logger.info("Attempting to register new user with email: {}", maskEmail(registrationDto.getEmail()));
        try {
            User user = userService.registerUser(registrationDto);
            logger.info("Successfully registered new user with ID: {}", user.getId());
            return ResponseEntity.ok(user);
        } catch (InvalidEmailDomainException e) {
            logger.warn("Registration failed due to invalid email domain: {}", maskEmail(registrationDto.getEmail()));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (EmailAlreadyExistsException e) {
            logger.warn("Registration failed due to existing email: {}", maskEmail(registrationDto.getEmail()));
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during user registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/verify-email")
    public RedirectView verifyEmail(@RequestParam String token) {
        logger.info("Attempting to verify email with token: {}", token);
        try {
            userService.verifyEmail(token);
            logger.info("Email verification successful for token: {}", token);
            return new RedirectView(frontendUrl + "/login?verified=true");
        } catch (ResourceNotFoundException e) {
            logger.warn("Email verification failed: invalid token {}", token);
            return new RedirectView(frontendUrl + "/login?verified=false&error=invalid_token");
        } catch (Exception e) {
            logger.error("Unexpected error during email verification", e);
            return new RedirectView(frontendUrl + "/login?verified=false&error=server_error");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDto loginDto) {
        logger.info("Login attempt for user: {}", maskEmail(loginDto.getEmail()));
        try {
            if (!userService.userExists(loginDto.getEmail())) {
                logger.warn("Login attempt failed: Email not found for {}", maskEmail(loginDto.getEmail()));
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Email not found. Please check your email or register for an account.");
            }
            
            User user = userService.getUserByEmail(loginDto.getEmail());
            logger.debug("User retrieved from database: {}", user.getId());
            
            if (!user.isEmailVerified()) {
                logger.warn("Login attempt failed: Email not verified for {}", maskEmail(loginDto.getEmail()));
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Email not verified. Please check your email for verification link.");
            }
            
            logger.debug("Attempting authentication for user: {}", maskEmail(loginDto.getEmail()));
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
            logger.debug("Authentication successful for user: {}", maskEmail(loginDto.getEmail()));

            final UserDetails userDetails = userService.loadUserByUsername(loginDto.getEmail());
            logger.debug("UserDetails loaded for user: {}", maskEmail(loginDto.getEmail()));

            final String jwt = jwtUtil.generateToken(userDetails);
            logger.debug("JWT token generated for user: {}", maskEmail(loginDto.getEmail()));

            CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
            User authenticatedUser = customUserDetails.getUser();

            JwtResponseDto response = new JwtResponseDto();
            response.setToken(jwt);
            response.setId(authenticatedUser.getId());
            response.setFirstName(authenticatedUser.getFirstName());
            response.setLastName(authenticatedUser.getLastName());
            response.setEmail(authenticatedUser.getEmail());
            response.setBio(authenticatedUser.getBio());

            logger.info("Login successful for user: {}", maskEmail(loginDto.getEmail()));
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            logger.warn("Login failed due to bad credentials for user: {}", maskEmail(loginDto.getEmail()));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        } catch (Exception e) {
            logger.error("Unexpected error during login for user: {}", maskEmail(loginDto.getEmail()), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    private String maskEmail(String email) {
        if (email == null || email.length() <= 4) {
            return "***";
        }
        return email.substring(0, 2) + "***" + email.substring(email.length() - 2);
    }
}