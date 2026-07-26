package com.sources.mechanicstream.dto.car;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateCarRequest(
        @NotNull(message = "Year is required")
        @Min(value = 1886, message = "Year must be 1886 or later")
        Integer year,

        @NotBlank(message = "Make is required")
        String make,

        @NotBlank(message = "Model is required")
        String model,

        String trim,
        String vin,
        String licensePlate,


        @PositiveOrZero
        Integer mileage,

        String color,

        @NotNull(message = "Customer ID is required")
        Long customerId
) {
}
