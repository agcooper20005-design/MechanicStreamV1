package com.sources.mechanicstream.controller;

import com.sources.mechanicstream.dto.laboritems.CreateLaborItemRequest;
import com.sources.mechanicstream.dto.laboritems.LaborItemResponse;
import com.sources.mechanicstream.dto.laboritems.UpdateLaborItemRequest;
import com.sources.mechanicstream.service.LaborItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LaborItemController {

    private final LaborItemService laborItemService;

    @PostMapping("/labor-item")
    public LaborItemResponse createLaborItem(@Valid @RequestBody CreateLaborItemRequest request){
        return  laborItemService.createLaborItem(request);
    }

    /** PUT  */
    @PutMapping("/labor-item/{laborItemId}")
    public LaborItemResponse updateLaborItem(@PathVariable Long laborItemId, @Valid @RequestBody UpdateLaborItemRequest request){
        return laborItemService.updateLaborItem(laborItemId, request);
    }

    @GetMapping("/labor-item")
    public List<LaborItemResponse> getLaborItems(){
        return laborItemService.getLaborItems();
    }


    @GetMapping("/repair-orders/{repairOrderId}/labor-items")
    public List<LaborItemResponse> getRepairOrders(@PathVariable Long repairOrderId){
        return laborItemService.getLaborItemsByRepairOrderId(repairOrderId);
    }


    /** DELETE */
    @DeleteMapping("/labor-item/{laborItemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLaborItem(@PathVariable Long laborItemId){
        laborItemService.deleteLaborItem(laborItemId);
    }

}
