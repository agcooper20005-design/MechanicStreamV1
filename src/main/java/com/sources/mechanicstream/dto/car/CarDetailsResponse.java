package com.sources.mechanicstream.dto.car;


public record CarDetailsResponse(
        Long id,
        Integer year,
        String make,
        String model,
        CarResponse customer
) {}
