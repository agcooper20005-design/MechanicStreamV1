package com.sources.mechanicstream.dto.laboritems;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record UpdateLaborItemRequest(


        @NotNull
        @Positive
        BigDecimal hours,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal laborRate,

        @NotBlank
        String technician

) {
}
