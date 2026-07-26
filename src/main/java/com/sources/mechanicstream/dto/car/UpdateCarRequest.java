package com.sources.mechanicstream.dto.car;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateCarRequest(

        @NotNull
        @Min(1886)
        Integer year,

        @NotBlank
        String make,

        @NotBlank
        String model,

        String trim,
        String vin,
        String licensePlate,

        @PositiveOrZero
        Integer mileage,

        String color


) {
}
