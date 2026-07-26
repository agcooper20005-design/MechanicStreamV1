package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.LaborItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaborItemRepository extends JpaRepository<LaborItem,Long> {

    List<LaborItem> findByRepairOrderId(Long repairOrderId);

    void deleteByRepairOrderId(Long repairOrderId);
}
