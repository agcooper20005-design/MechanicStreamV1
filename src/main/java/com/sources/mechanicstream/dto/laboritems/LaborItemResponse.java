package com.sources.mechanicstream.dto.laboritems;

import java.math.BigDecimal;

public record LaborItemResponse(
        Long id,
        BigDecimal hours,
        BigDecimal laborRate,
        String technician,
        Long repairOrderId
) {
}
