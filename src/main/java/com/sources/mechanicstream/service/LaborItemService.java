package com.sources.mechanicstream.service;


import com.sources.mechanicstream.dto.laboritems.CreateLaborItemRequest;
import com.sources.mechanicstream.dto.laboritems.LaborItemResponse;
import com.sources.mechanicstream.dto.laboritems.UpdateLaborItemRequest;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.LaborItem;
import com.sources.mechanicstream.model.RepairOrder;
import com.sources.mechanicstream.repository.LaborItemRepository;
import com.sources.mechanicstream.repository.RepairOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LaborItemService {

    private final LaborItemRepository laborItemRepository;
    private final RepairOrderRepository repairOrderRepository;

    /** POST */
    /// create labor item
    @Transactional
    public LaborItemResponse createLaborItem(CreateLaborItemRequest request) {
        LaborItem laborItem = new LaborItem();

        //find repair order
        RepairOrder repairOrder = repairOrderRepository.findById(request.repairOrderId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Repair Order Not Found With Id: " + request.repairOrderId()));

        laborItem.setLaborRate(request.laborRate());
        laborItem.setHours(request.hours());
        laborItem.setTechnician(request.technician());
        laborItem.setRepairOrder(repairOrder);
        LaborItem saved =  laborItemRepository.save(laborItem);

        return toResponse(saved);
    }

    /** GET */
    /// Get all labor items
    public List<LaborItemResponse> getLaborItems(){
        return laborItemRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /// get all labor items under a repair order id
    public List<LaborItemResponse> getLaborItemsByRepairOrderId(Long repairOrderId) {
        return laborItemRepository.findByRepairOrderId(repairOrderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** PUT */
    @Transactional
    public LaborItemResponse updateLaborItem(Long laborItemId, UpdateLaborItemRequest request) {
        LaborItem laborItem = laborItemRepository.findById(laborItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Labor Item Not Found With ID: " +  laborItemId));
        laborItem.setHours(request.hours());
        laborItem.setLaborRate(request.laborRate());
        laborItem.setTechnician(request.technician());

        return toResponse(laborItem);
    }

    /** DELETE */
    @Transactional
    public void deleteLaborItem(Long laborItemId){
        LaborItem laborItem = laborItemRepository.findById(laborItemId)
                .orElseThrow(() -> new ResourceNotFoundException("LaborItem Not Found With Id: " + laborItemId));

        laborItemRepository.delete(laborItem);
    }

    /** Private Helper */
    /// to response
    private LaborItemResponse toResponse(LaborItem laborItem) {
        return new LaborItemResponse(
                laborItem.getId(),
                laborItem.getHours(),
                laborItem.getLaborRate(),
                laborItem.getTechnician(),
                laborItem.getRepairOrder().getId()
        );
    }
}
