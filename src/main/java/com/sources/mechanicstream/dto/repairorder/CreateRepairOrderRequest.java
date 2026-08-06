package com.sources.mechanicstream.dto.repairorder;

import jakarta.validation.constraints.NotNull;

public record CreateRepairOrderRequest (
        @NotNull(message = "Customer ID is required")
        Long customerId,

        @NotNull(message = "Car ID is required")
        Long carId,
        Integer mileageIn,

        String customerComplaint,

        String mechanicNotes
        ){

}
