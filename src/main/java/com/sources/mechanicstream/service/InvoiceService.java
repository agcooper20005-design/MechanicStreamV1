package com.sources.mechanicstream.service;


import com.sources.mechanicstream.dto.car.CarResponse;
import com.sources.mechanicstream.dto.customer.CustomerResponse;
import com.sources.mechanicstream.dto.invoice.InvoiceResponse;
import com.sources.mechanicstream.dto.laboritems.LaborItemResponse;
import com.sources.mechanicstream.dto.repairorder.RepairOrderResponse;
import com.sources.mechanicstream.dto.repairpart.RepairPartResponse;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.*;
import com.sources.mechanicstream.repository.LaborItemRepository;
import com.sources.mechanicstream.repository.RepairOrderRepository;
import com.sources.mechanicstream.repository.RepairPartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceService {

    private final RepairOrderRepository repairOrderRepository;
    private final LaborItemRepository laborItemRepository;
    private final RepairPartRepository repairPartRepository;


    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByRepairOrderId(Long repairOrderId){

        RepairOrder repairOrder = repairOrderRepository.findById(repairOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("RepairOrder not found with ID: " + repairOrderId));

        List<RepairPart> repairParts = repairPartRepository.findByRepairOrderId(repairOrder.getId());

        List<LaborItem> laborItems = laborItemRepository.findByRepairOrderId(repairOrder.getId());

        BigDecimal partsSubtotal = calculatePartsSubtotal(repairParts);

        BigDecimal laborSubtotal = calculateLaborSubtotal(laborItems);

        BigDecimal subtotal = calculateSubtotal(partsSubtotal, laborSubtotal);

        BigDecimal taxRate = new BigDecimal("0.07");

        BigDecimal tax = calculateTax(subtotal, taxRate);

        BigDecimal total = calculateTotal(subtotal, tax);


        return toResponse(repairOrder,repairParts,laborItems,partsSubtotal,laborSubtotal,subtotal,tax,total);

    }




    /** Private Helpers */
    /// toResponse ///
    private InvoiceResponse toResponse(
            RepairOrder repairOrder,
            List<RepairPart> repairParts,
            List<LaborItem> laborItems,
            BigDecimal partsSubtotal,
            BigDecimal laborSubtotal,
            BigDecimal subtotal,
            BigDecimal tax,
            BigDecimal total
    ){
        return new InvoiceResponse(
                toCustomerResponse(repairOrder.getCustomer()),
                toCarResponse(repairOrder.getCar()),
                toRepairOrderResponse(repairOrder),
                repairParts.stream()
                        .map(this::toRepairPartResponse)
                        .toList(),
                laborItems.stream()
                        .map(this::toLaborPartResponse)
                .toList(),
                partsSubtotal,
                laborSubtotal,
                subtotal,
                tax,
                total

        );
    }

    private RepairPartResponse toRepairPartResponse(RepairPart part) {
        return new RepairPartResponse(
                part.getId(),
                part.getQuantity(),
                part.getPartNumber(),
                part.getPartName(),
                part.getUnitPrice(),
                part.getPartCondition(),
                part.getRepairOrder().getId()
        );
    }

    private LaborItemResponse toLaborPartResponse(LaborItem laborItem) {
        return new LaborItemResponse(
                laborItem.getId(),
                laborItem.getHours(),
                laborItem.getLaborRate(),
                laborItem.getTechnician(),
                laborItem.getRepairOrder().getId()
        );
    }

    private RepairOrderResponse toRepairOrderResponse(RepairOrder repairOrder){

        return new RepairOrderResponse(repairOrder.getId(),
                repairOrder.getCustomer().getId(),
                repairOrder.getCar().getId(),
                repairOrder.getMileageIn(),
                repairOrder.getMileageOut(),
                repairOrder.getStatus(),
                repairOrder.getCreatedAt(),
                repairOrder.getCompletedAt(),
                repairOrder.getUpdatedAt(),
                repairOrder.getCustomerComplaint(),
                repairOrder.getDiagnosis(),
                repairOrder.getRecommendations(),
                repairOrder.getMechanicNotes());
    }

    private CustomerResponse toCustomerResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getPhoneNumber(),
                customer.getEmail()
        );
    }

    private CarResponse toCarResponse(Car car){
        return new CarResponse(
                car.getId(),
                car.getYear(),
                car.getMake(),
                car.getModel(),
                car.getTrim(),
                car.getVin(),
                car.getLicensePlate(),
                car.getMileage(),
                car.getColor(),
                car.getCustomer().getId()
        );
    }


    /// Calculations ///
    private BigDecimal calculatePartsSubtotal(List<RepairPart> repairParts){
        return repairParts.stream()
                .map(repairPart ->
                        repairPart.getUnitPrice()
                                .multiply(BigDecimal.valueOf(repairPart.getQuantity()))
                        )
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateLaborSubtotal(List<LaborItem> laborItems){
        return laborItems.stream()
                .map(laborItem ->
                                laborItem.getLaborRate()
                                        .multiply(laborItem.getHours())
                        )
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateSubtotal(BigDecimal partsSubtotal, BigDecimal laborSubtotal){
        return partsSubtotal.add(laborSubtotal);
    }

    private BigDecimal calculateTax(
            BigDecimal subtotal,
            BigDecimal taxRate
    ){
        return subtotal.multiply(taxRate)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateTotal(
            BigDecimal subtotal,
            BigDecimal tax
    ){
        return subtotal.add(tax);
    }

}
