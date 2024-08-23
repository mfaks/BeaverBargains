package com.example.beaver_bargains.dto;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String email;
    private String password;
}