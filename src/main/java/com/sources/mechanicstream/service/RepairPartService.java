package com.sources.mechanicstream.service;

import com.sources.mechanicstream.dto.repairpart.CreateRepairPartRequest;
import com.sources.mechanicstream.dto.repairpart.RepairPartResponse;
import com.sources.mechanicstream.dto.repairpart.UpdateRepairPartRequest;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.RepairOrder;
import com.sources.mechanicstream.model.RepairPart;
import com.sources.mechanicstream.repository.RepairOrderRepository;
import com.sources.mechanicstream.repository.RepairPartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RepairPartService {
    private final RepairPartRepository repairPartRepository;
    private final RepairOrderRepository repairOrderRepository;

    /** POST */
    /// create repair part
    @Transactional
    public RepairPartResponse createRepairPart(CreateRepairPartRequest request) {
        RepairOrder repairOrder = repairOrderRepository.findById(request.repairOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Repair Order Not Found With Id: " + request.repairOrderId()));

        RepairPart repairPart = new RepairPart();

        repairPart.setQuantity(request.quantity());
        repairPart.setPartNumber(request.partNumber());
        repairPart.setPartName(request.partName());
        repairPart.setUnitPrice(request.unitPrice());
        repairPart.setPartCondition(request.partCondition());
        repairPart.setRepairOrder(repairOrder);

        RepairPart saved =  repairPartRepository.save(repairPart);
        return toResponse(saved);
    }

    /** GET */
    /// Find all repair parts belonging to a repair order.
    public List<RepairPartResponse> findByRepairOrderId(Long repairOrderId) {
        if(!repairOrderRepository.existsById(repairOrderId)){
            throw new ResourceNotFoundException("Repair Order Not Found with Id: " + repairOrderId);
        }

        return repairPartRepository.findByRepairOrderId(repairOrderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** PUT */
    /// Update repair part
    @Transactional
    public RepairPartResponse updateRepairPart(Long repairPartId, UpdateRepairPartRequest request) {
        RepairPart repairPart = repairPartRepository.findById(repairPartId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Part Not Found With ID: " +  repairPartId));

        repairPart.setQuantity(request.quantity());
        repairPart.setPartNumber(request.partNumber());
        repairPart.setPartName(request.partName());
        repairPart.setUnitPrice(request.unitPrice());
        repairPart.setPartCondition(request.partCondition());

        return toResponse(repairPart);
    }

    /** DELETE */
    /// Delete repair part
    @Transactional
    public void deleteRepairPartById(Long repairPartId) {
        RepairPart repairPart = repairPartRepository.findById(repairPartId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair Part not found with ID: " + repairPartId));
        repairPartRepository.delete(repairPart);
    }


    private RepairPartResponse toResponse(RepairPart repairPart) {
        return new RepairPartResponse(
                repairPart.getId(),
                repairPart.getQuantity(),
                repairPart.getPartNumber(),
                repairPart.getPartName(),
                repairPart.getUnitPrice(),
                repairPart.getPartCondition(),
                repairPart.getRepairOrder().getId()
        );
    }
}
