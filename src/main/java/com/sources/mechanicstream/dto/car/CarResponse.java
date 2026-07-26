package com.sources.mechanicstream.dto.car;

public record CarResponse(
        Long id,
        Integer year,
        String make,
        String model,
        String trim,
        String vin,
        String licensePlate,
        Integer mileage,
        String color,

        Long customerId
) {


}


