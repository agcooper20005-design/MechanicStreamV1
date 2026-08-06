package com.sources.mechanicstream.service;

import com.sources.mechanicstream.dto.repairorder.CreateRepairOrderRequest;
import com.sources.mechanicstream.dto.repairorder.RepairOrderResponse;
import com.sources.mechanicstream.dto.repairorder.UpdateRepairOrderRequest;
import com.sources.mechanicstream.exception.InvalidRelationshipException;
import com.sources.mechanicstream.exception.InvalidRepairOrderStateException;
import com.sources.mechanicstream.exception.ResourceNotFoundException;
import com.sources.mechanicstream.model.Car;
import com.sources.mechanicstream.model.Customer;
import com.sources.mechanicstream.model.RepairOrder;
import com.sources.mechanicstream.model.RepairOrderStatus;
import com.sources.mechanicstream.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RepairOrderService {

    private final RepairOrderRepository repairOrderRepository;
    private final CustomerRepository customerRepository;
    private final CarRepository carRepository;
    private final LaborItemRepository laborItemRepository;
    private final RepairPartRepository repairPartRepository;

    /** POST */
    /// Create Repair Order
    @Transactional
    public RepairOrderResponse createRepairOrder(CreateRepairOrderRequest request) {
        //Find Customer And Car
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer Not Found with ID: " + request.customerId()));

        Car car = carRepository.findById(request.carId())
                .orElseThrow(() -> new ResourceNotFoundException("Car Not Found with ID: " + request.carId()));

        if(!car.getCustomer().getId().equals(customer.getId())){
            throw new InvalidRelationshipException(
                    "Car with ID: " + car.getId()
                     + " does not belong to customer with ID "
                    + customer.getId()
            );
        }
        RepairOrder repairOrder = new RepairOrder();

        repairOrder.setStatus(RepairOrderStatus.OPEN);
        repairOrder.setCreatedAt(LocalDateTime.now());
        repairOrder.setCompletedAt(null);
        repairOrder.setCar(car);
        repairOrder.setCustomer(customer);
        repairOrder.setMileageIn(request.mileageIn());
        repairOrder.setCustomerComplaint(request.customerComplaint());
        repairOrder.setMechanicNotes(request.mechanicNotes());

        RepairOrder saved =  repairOrderRepository.save(repairOrder);

        return toResponse(saved);

    }

    /** PATCH */
    /// Complete Repair Order
    @Transactional
    public RepairOrderResponse completeRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        verifyStatusTransition(repairOrder, RepairOrderStatus.COMPLETED);


        repairOrder.setStatus(RepairOrderStatus.COMPLETED);
        repairOrder.setCompletedAt(LocalDateTime.now());
        repairOrder.setUpdatedAt(LocalDateTime.now());

        return toResponse(repairOrder);
    }
    /// Cancel Repair Order
    @Transactional
    public RepairOrderResponse cancelRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        verifyStatusTransition(repairOrder,RepairOrderStatus.CANCELLED);

        repairOrder.setStatus(RepairOrderStatus.CANCELLED);
        repairOrder.setCompletedAt(null);
        repairOrder.setUpdatedAt(LocalDateTime.now());

        return toResponse(repairOrder);
    }
    /// In progress repair order
    @Transactional
    public RepairOrderResponse inProgressRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        verifyStatusTransition(repairOrder,RepairOrderStatus.IN_PROGRESS);

        repairOrder.setStatus(RepairOrderStatus.IN_PROGRESS);
        repairOrder.setCompletedAt(null);
        repairOrder.setUpdatedAt(LocalDateTime.now());

        return toResponse(repairOrder);
    }
    /// Waiting for approval
    @Transactional
    public RepairOrderResponse waitingForApprovalRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        verifyStatusTransition(repairOrder,RepairOrderStatus.WAITING_FOR_APPROVAL);

        repairOrder.setStatus(RepairOrderStatus.WAITING_FOR_APPROVAL);
        repairOrder.setCompletedAt(null);
        repairOrder.setUpdatedAt(LocalDateTime.now());

        return toResponse(repairOrder);
    }
    /// Waiting for parts
    @Transactional
    public RepairOrderResponse waitingForPartsRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        verifyStatusTransition(repairOrder,RepairOrderStatus.WAITING_FOR_PARTS);

        repairOrder.setStatus(RepairOrderStatus.WAITING_FOR_PARTS);
        repairOrder.setCompletedAt(null);
        repairOrder.setUpdatedAt(LocalDateTime.now());

        return toResponse(repairOrder);
    }
    /// Diagnosing
    @Transactional
    public RepairOrderResponse diagnosingRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        verifyStatusTransition(repairOrder,RepairOrderStatus.DIAGNOSING);

        repairOrder.setStatus(RepairOrderStatus.DIAGNOSING);
        repairOrder.setCompletedAt(null);
        repairOrder.setUpdatedAt(LocalDateTime.now());

        return toResponse(repairOrder);
    }

    /** PUT */
    @Transactional
    public RepairOrderResponse updateRepairOrder(Long repairOrderId, UpdateRepairOrderRequest request) {
        RepairOrder repairOrder = repairOrderRepository
                .findById(repairOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("RepairOrder not found with id: " + repairOrderId));
        /// batch if statments

        if(request.customerComplaint() != null ){
            repairOrder.setCustomerComplaint(request.customerComplaint());
        }
        if (request.diagnosis() != null){
            repairOrder.setDiagnosis(request.diagnosis());
        }
        if(request.recommendations() != null){
            repairOrder.setRecommendations(request.recommendations());
        }
        if(request.mechanicNotes() != null){
            repairOrder.setMechanicNotes(request.mechanicNotes());
        }
        if(request.mileageIn() != null){
            repairOrder.setMileageIn(request.mileageIn());
        }
        if(request.mileageOut() != null){
            repairOrder.setMileageOut(request.mileageOut());
        }

        return toResponse(repairOrder);
    }



    /** GET */
    /// get one repair order by its repair order id
    public RepairOrderResponse getRepairOrderById(Long repairOrderId) {
        return toResponse(repairOrderRepository.findById(repairOrderId).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Repair Order Not Found with ID: " + repairOrderId)));
    }

    /// get all repair orders that exist
    public List<RepairOrderResponse> getRepairOrders(){

        return repairOrderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /// Get all repair orders under a car id
    public List<RepairOrderResponse> getRepairOrdersByCarId(Long carId){
        if(!carRepository.existsById(carId)){
            throw new  ResourceNotFoundException("Car Not Found with ID: " + carId);
        }
        return repairOrderRepository.findByCarId(carId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    /// get all repair orders under a customer id
    public List<RepairOrderResponse> getRepairOrdersByCustomerId(Long customerId){
        if(!customerRepository.existsById(customerId)){
            throw new  ResourceNotFoundException("Customer Not Found with ID: " + customerId);
        }

        return repairOrderRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** DELETE */
    /// Delete Repair Order
    @Transactional
    public void deleteRepairOrder(Long repairOrderId) {
        RepairOrder repairOrder = findRepairOrderById(repairOrderId);
        repairPartRepository.deleteByRepairOrderId(repairOrderId);
        laborItemRepository.deleteByRepairOrderId(repairOrderId);

        repairOrderRepository.delete(repairOrder);
    }


    /** Private Helpers */
    /// to response mapper to send back repair order response
    private RepairOrderResponse toResponse(RepairOrder repairOrder){

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

    /// find repair order and return
    private RepairOrder findRepairOrderById(Long repairOrderId){
        return repairOrderRepository.findById(repairOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("RepairOrder Not Found with ID: " + repairOrderId));
    }

    /// STATUS Verifier
    private void verifyStatusTransition(
            RepairOrder repairOrder,
            RepairOrderStatus targetStatus
    ) {
        RepairOrderStatus currentStatus = repairOrder.getStatus();

        if (currentStatus == targetStatus) {
            throw new InvalidRepairOrderStateException(
                    "Repair order is already " + targetStatus
            );
        }

        switch (targetStatus) {
            case CANCELLED -> {
                if(currentStatus == RepairOrderStatus.COMPLETED) {
                    throw new InvalidRepairOrderStateException(
                            "A completed repair order cannot be cancelled"
                    );
                }
            }
            case COMPLETED -> {
                if(currentStatus == RepairOrderStatus.CANCELLED) {
                    throw new InvalidRepairOrderStateException(
                            "A canceled repair order cannot be completed"
                    );
                }
            }
            case IN_PROGRESS, DIAGNOSING, WAITING_FOR_APPROVAL, WAITING_FOR_PARTS-> {
                if(currentStatus == RepairOrderStatus.COMPLETED) {
                    throw new InvalidRepairOrderStateException(
                            "Cannot change repair order from "
                                    + currentStatus
                                    + " to "
                                    + targetStatus
                    );
                }
            }
        }
    }


    private void verifyStatusChangeAllowed(
            RepairOrder repairOrder,
            RepairOrderStatus targetStatus
    ) {
        RepairOrderStatus currentStatus = repairOrder.getStatus();

        boolean allowed = switch (currentStatus) {
            case OPEN ->
                    targetStatus == RepairOrderStatus.DIAGNOSING
                            || targetStatus == RepairOrderStatus.CANCELLED;

            case DIAGNOSING ->
                    targetStatus == RepairOrderStatus.WAITING_FOR_APPROVAL
                            || targetStatus == RepairOrderStatus.CANCELLED;

            case WAITING_FOR_APPROVAL ->
                    targetStatus == RepairOrderStatus.WAITING_FOR_PARTS
                            || targetStatus == RepairOrderStatus.IN_PROGRESS
                            || targetStatus == RepairOrderStatus.CANCELLED;

            case WAITING_FOR_PARTS ->
                    targetStatus == RepairOrderStatus.IN_PROGRESS
                            || targetStatus == RepairOrderStatus.CANCELLED;

            case IN_PROGRESS ->
                    targetStatus == RepairOrderStatus.COMPLETED
                            || targetStatus == RepairOrderStatus.CANCELLED;

            case COMPLETED, CANCELLED -> false;
        };

        if (!allowed) {
            throw new InvalidRepairOrderStateException(
                    "Cannot change repair order from "
                            + currentStatus
                            + " to "
                            + targetStatus
            );
        }
    }


}
