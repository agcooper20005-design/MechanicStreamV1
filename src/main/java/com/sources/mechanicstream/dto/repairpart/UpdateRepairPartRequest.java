package com.sources.mechanicstream.dto.repairpart;

import com.sources.mechanicstream.model.PartCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record UpdateRepairPartRequest(
        @NotNull
        @Positive
        Integer quantity,

        @NotBlank
        String partNumber,

        @NotBlank
        String partName,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal unitPrice,

        @NotNull
        PartCondition partCondition
) {
}
