package com.sources.mechanicstream.controller;


import com.sources.mechanicstream.dto.customer.CreateCustomerRequest;
import com.sources.mechanicstream.dto.customer.CustomerResponse;
import com.sources.mechanicstream.dto.customer.UpdateCustomerRequest;
import com.sources.mechanicstream.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /** POST */
    @PostMapping
    public CustomerResponse createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return customerService.createCustomer(request);
    }
    /** PUT */
    @PutMapping("/{customerId}")
    public CustomerResponse updateCustomer(@PathVariable Long customerId, @Valid @RequestBody UpdateCustomerRequest request) {
        return customerService.updateCustomer(customerId, request);
    }

    /** GET */
    @GetMapping
    public List<CustomerResponse> getCustomers() {
        return customerService.getCustomers();
    }

    @GetMapping("/{customerId}")
    public CustomerResponse getCustomerById(@PathVariable Long customerId) {
        return customerService.getCustomerById(customerId);
    }

    /** DELETE */
    @DeleteMapping("/{customerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void  deleteCustomer(@PathVariable Long customerId) {
        customerService.deleteCustomer(customerId);
    }



}
