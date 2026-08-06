package com.sources.mechanicstream.service;

import com.sources.mechanicstream.dto.address.AddressResponse;
import com.sources.mechanicstream.dto.address.CreateAddressRequest;
import com.sources.mechanicstream.dto.address.UpdateAddressRequest;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.Address;
import com.sources.mechanicstream.model.Customer;
import com.sources.mechanicstream.repository.AddressRepository;
import com.sources.mechanicstream.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    /** POST */
    @Transactional
    public AddressResponse createAddress(CreateAddressRequest request) {
        Customer customer = customerRepository.
                findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));
        Address address = new Address();

        address.setStreet(request.street());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZip(request.zip());

        address.setCustomer(customer);

        Address savedAddress = addressRepository.save(address);

        return toResponse(savedAddress);
    }

    /** PATCH */
    @Transactional
    public AddressResponse updateAddress(Long addressId, UpdateAddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Address not found with ID: " + addressId));

        address.setStreet(request.street());
        address.setCity(request.city());
        address.setState(request.state());
        address.setZip(request.zip());

        return toResponse(address);

    }

    /** GET */
    public List<AddressResponse> getAddresses(){

        return addressRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();

    }


    /** Private Helpers */

    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getCustomer().getId(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZip()
        );
    }

}
