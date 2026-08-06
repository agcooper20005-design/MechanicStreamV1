package com.sources.mechanicstream.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Address{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String street;


    private String city;


    private String state;


    private String zip;


    @OneToOne
    @JoinColumn(name = "customer", nullable = false, unique = true)
    private Customer customer;


}
