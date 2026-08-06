package com.sources.mechanicstream.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAddressRequest(
        String street,
        String city,
        String state,
        String zip,

        @NotNull(message = "Customer Id is required")
        Long customerId
) {
}
