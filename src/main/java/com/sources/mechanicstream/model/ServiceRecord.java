package com.sources.mechanicstream.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ServiceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceType;
    private String description;

    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;

}
