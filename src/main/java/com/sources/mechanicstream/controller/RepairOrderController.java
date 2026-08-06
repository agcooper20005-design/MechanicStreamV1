package com.sources.mechanicstream.controller;

import com.sources.mechanicstream.dto.repairorder.CreateRepairOrderRequest;
import com.sources.mechanicstream.dto.repairorder.RepairOrderResponse;
import com.sources.mechanicstream.dto.repairorder.UpdateRepairOrderRequest;
import com.sources.mechanicstream.service.RepairOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RepairOrderController {

    private final RepairOrderService repairOrderService;

    /** POST */
    @PostMapping("/repair-orders")
    public RepairOrderResponse createRepairOrder(@Valid @RequestBody CreateRepairOrderRequest request) {
        return repairOrderService.createRepairOrder(request);
    }

    /** PUT  */


    /** PATCH */
    /// main patch, update
    @PatchMapping("/repair-orders/{repairOrderId}")
    public RepairOrderResponse updateRepairOrder(@PathVariable Long repairOrderId, @Valid @RequestBody UpdateRepairOrderRequest request) {
        return repairOrderService.updateRepairOrder(repairOrderId, request);
    }


    @PatchMapping("/repair-orders/{orderId}/complete")
    public RepairOrderResponse completeRepairOrder(@PathVariable Long orderId) {
        return repairOrderService.completeRepairOrder(orderId);
    }
    @PatchMapping("/repair-orders/{orderId}/cancel")
    public RepairOrderResponse cancelRepairOrder(@PathVariable Long orderId) {
        return repairOrderService.cancelRepairOrder(orderId);
    }
    @PatchMapping("/repair-orders/{orderId}/in-progress")
    public RepairOrderResponse inProgressRepairOrder(@PathVariable Long orderId) {
        return repairOrderService.inProgressRepairOrder(orderId);
    }
    @PatchMapping("/repair-orders/{orderId}/waiting-for-approval")
    public RepairOrderResponse waitingForApproval(@PathVariable Long orderId) {
        return repairOrderService.waitingForApprovalRepairOrder(orderId);
    }
    @PatchMapping("/repair-orders/{orderId}/waiting-for-parts")
    public RepairOrderResponse waitingForParts(@PathVariable Long orderId) {
        return repairOrderService.waitingForPartsRepairOrder(orderId);
    }
    @PatchMapping("/repair-orders/{orderId}/diagnosing")
    public RepairOrderResponse diagnoseRepairOrder(@PathVariable Long orderId) {
        return repairOrderService.diagnosingRepairOrder(orderId);
    }

    /** GET */
    @GetMapping("/repair-orders")
    public List<RepairOrderResponse> getRepairOrders(){
        return repairOrderService.getRepairOrders();
    }

    @GetMapping("/repair-orders/{orderId}")
    public RepairOrderResponse getRepairOrder(@PathVariable Long orderId){
        return repairOrderService.getRepairOrderById(orderId);
    }

    @GetMapping("/cars/{carId}/repairOrders")
    public List<RepairOrderResponse> getRepairOrdersByCarId(@PathVariable Long carId){
        return repairOrderService.getRepairOrdersByCarId(carId);
    }

    @GetMapping("/customers/{customerId}/repairOrders")
    public List<RepairOrderResponse> getRepairOrdersByCustomerId(@PathVariable Long customerId){
        return repairOrderService.getRepairOrdersByCustomerId(customerId);
    }


    /** DELETE */
    @DeleteMapping("/repair-orders/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRepairOrder(@PathVariable Long orderId) {
         repairOrderService.deleteRepairOrder(orderId);
    }
}
