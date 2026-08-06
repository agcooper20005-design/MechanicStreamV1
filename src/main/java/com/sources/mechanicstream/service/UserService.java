package com.sources.mechanicstream.service;


import com.sources.mechanicstream.model.Role;
import com.sources.mechanicstream.model.User;
import com.sources.mechanicstream.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    /** POST */
    @Transactional
    public User createUser(
            String username,
            String rawPassword,
            Role role){
        if(userRepository.existsByUsername(username)){
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    /** GET */
    public User findByUsername(String username){
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Username not found"));
    }


}
