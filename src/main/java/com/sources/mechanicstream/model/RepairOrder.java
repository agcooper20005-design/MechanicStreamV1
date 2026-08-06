package com.sources.mechanicstream.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class RepairOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;





    @PositiveOrZero
    private Integer mileageIn;
    @PositiveOrZero
    private Integer mileageOut;


    @ManyToOne(optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RepairOrderStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;

    @Column(length = 2000)
    private String customerComplaint;

    @Column(length = 2000)
    private String diagnosis;

    @Column(length = 2000)
    private String recommendations;

    @Column(length = 2000)
    private String mechanicNotes;


}
