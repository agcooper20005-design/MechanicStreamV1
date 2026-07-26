package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer,Long> {



}
