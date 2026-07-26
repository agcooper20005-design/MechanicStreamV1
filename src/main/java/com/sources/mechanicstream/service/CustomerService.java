package com.sources.mechanicstream.service;

import com.sources.mechanicstream.dto.customer.CreateCustomerRequest;
import com.sources.mechanicstream.dto.customer.CustomerResponse;
import com.sources.mechanicstream.dto.customer.UpdateCustomerRequest;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.Customer;
import com.sources.mechanicstream.model.RepairOrder;
import com.sources.mechanicstream.repository.CarRepository;
import com.sources.mechanicstream.repository.CustomerRepository;
import com.sources.mechanicstream.repository.RepairOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final RepairOrderRepository repairOrderRepository;
    private final CarRepository  carRepository;


    private final RepairOrderService repairOrderService;

    /** POST  */
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        Customer customer = new Customer();

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());

        Customer saved = customerRepository.save(customer);

        return toResponse(saved);
    }

    /** PUT */

    @Transactional
    public CustomerResponse updateCustomer(Long customerId, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + customerId));

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setEmail(request.email());

        return toResponse(customer);

    }

    /** GET */

    public List<CustomerResponse> getCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer with customerId: " + customerId + " not found"));
        return toResponse(customer);

    }

    /** DELETE */
    @Transactional
    public void deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));
        List<RepairOrder> repairOrders = repairOrderRepository.findByCustomerId(customerId);
        repairOrders.forEach(repairOrder -> {
            repairOrderService.deleteRepairOrder(repairOrder.getId());
        });
        carRepository.deleteAllByCustomerId(customerId);
        customerRepository.delete(customer);

    }


    /** Private Mappers */
    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getPhoneNumber(),
                customer.getEmail()
        );
    }
}
