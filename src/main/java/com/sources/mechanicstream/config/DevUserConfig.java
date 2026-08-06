package com.sources.mechanicstream.config;


import com.sources.mechanicstream.model.Role;
import com.sources.mechanicstream.repository.UserRepository;
import com.sources.mechanicstream.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile("dev")
@Configuration
public class DevUserConfig {
    @Bean
    CommandLineRunner commandLineRunner(
            UserService userService,
            UserRepository userRepository
    ){
        return args -> {
            if(!userRepository.existsByUsername("admin")){
                userService.createUser("admin","password123", Role.ADMIN);
            }
        };
    }

}
