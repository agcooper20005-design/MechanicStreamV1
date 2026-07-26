package com.sources.mechanicstream.dto.repairpart;

import com.sources.mechanicstream.model.PartCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateRepairPartRequest(

        @NotNull(message = "Repair order ID is required")
        Long repairOrderId,


        @NotBlank(message = "Part number is required")
        String partNumber,

        @NotBlank(message = "Part name is required")
        String partName,

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.00",
        inclusive = true, message = "Unit price cannot be negative")
        BigDecimal unitPrice,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Part condition is required")
        PartCondition partCondition
) {
}
