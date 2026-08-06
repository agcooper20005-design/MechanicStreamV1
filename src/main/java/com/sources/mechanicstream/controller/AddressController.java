package com.sources.mechanicstream.controller;


import com.sources.mechanicstream.dto.address.AddressResponse;
import com.sources.mechanicstream.dto.address.CreateAddressRequest;
import com.sources.mechanicstream.dto.address.UpdateAddressRequest;
import com.sources.mechanicstream.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /** Post */
    @PostMapping
    public AddressResponse createAddress(@Valid @RequestBody CreateAddressRequest request) {
        return addressService.createAddress(request);
    }

    /** Patch */
    @PatchMapping("/{addressId}")
    public AddressResponse updateAddress(@PathVariable Long addressId, @Valid @RequestBody UpdateAddressRequest request) {
        return addressService.updateAddress(addressId, request);
    }


    /** GET */
    @GetMapping
    public List<AddressResponse> getAddress(){
        return addressService.getAddresses();
    }


}
