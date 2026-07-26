package com.sources.mechanicstream.dto.repairpart;

import com.sources.mechanicstream.model.PartCondition;

import java.math.BigDecimal;

public record RepairPartResponse(
        Long id,
        Integer quantity,
        String partNumber,
        String partName,
        BigDecimal unitPrice,
        PartCondition partCondition,
        Long repairOrderId
) {
}
