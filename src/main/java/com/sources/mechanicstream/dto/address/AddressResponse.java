package com.sources.mechanicstream.dto.address;

public record AddressResponse(
        Long id,
        Long customerId,
        String street,
        String city,
        String state,
        String zip
) {
}
