package com.sources.mechanicstream.controller;

import com.sources.mechanicstream.dto.repairpart.CreateRepairPartRequest;
import com.sources.mechanicstream.dto.repairpart.RepairPartResponse;
import com.sources.mechanicstream.dto.repairpart.UpdateRepairPartRequest;
import com.sources.mechanicstream.service.RepairPartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RepairPartController {
    private final RepairPartService repairPartService;
    
    /** POST */
    @PostMapping("/repair-parts")
    public RepairPartResponse createRepairPart(@Valid @RequestBody CreateRepairPartRequest request) {
        return repairPartService.createRepairPart(request);
    }

    /** PUT */
    @PutMapping("/repair-part/{repairId}")
    public RepairPartResponse updateRepairPart(@PathVariable Long repairId, @Valid @RequestBody UpdateRepairPartRequest request) {
        return repairPartService.updateRepairPart(repairId, request);
    }

    /** GET */
    @GetMapping("/repair-orders/{repairOrderId}/parts")
    public List<RepairPartResponse> findByRepairOrderId(@PathVariable Long repairOrderId) {
        return repairPartService.findByRepairOrderId(repairOrderId);
    }


    /** DELETE */
    @DeleteMapping("/repair-parts/{partId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRepairPart(@PathVariable Long partId) {
        repairPartService.deleteRepairPartById(partId);
    }
    
}
