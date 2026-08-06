package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.Address;
import com.sources.mechanicstream.model.Car;
import com.sources.mechanicstream.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long>{

}
