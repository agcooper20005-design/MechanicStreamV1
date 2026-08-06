package com.sources.mechanicstream.dto.login;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String username;
    private String role;
    private String message;

}
