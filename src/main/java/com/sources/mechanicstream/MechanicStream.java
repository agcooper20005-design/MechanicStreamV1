package com.sources.mechanicstream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MechanicStream {
    public static void main(String[] args) {
        SpringApplication.run(MechanicStream.class, args);
        System.out.println("Host: " + "http://localhost:8089");
        System.out.println("SwaggerUi: " + "http://localhost:8089/swagger-ui/index.html");
    }

}
