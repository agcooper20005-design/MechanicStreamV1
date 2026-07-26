package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarRepository extends JpaRepository<Car,Long> {
    List<Car> findByCustomerId(Long customerId);

    void deleteAllByCustomerId(Long customerId);
}
