package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.RepairOrder;
import com.sources.mechanicstream.model.RepairPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairPartRepository extends JpaRepository<RepairPart, Long> {
    List<RepairPart> findByRepairOrderId(Long repairOrderId);

    List<RepairPart> findByRepairOrder(RepairOrder repairOrder);

    void deleteByRepairOrderId(Long repairOrderId);

}
