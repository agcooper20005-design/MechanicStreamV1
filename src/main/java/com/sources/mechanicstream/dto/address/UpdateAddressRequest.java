package com.sources.mechanicstream.dto.address;

public record UpdateAddressRequest(

        String street,
        String city,
        String state,
        String zip

) {
}
