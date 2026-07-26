package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.RepairOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {
    List<RepairOrder> findByCarId(Long carId);

    List<RepairOrder> findByCustomerId(Long customerId);

}
