package com.sources.mechanicstream.dto.invoice;

import com.sources.mechanicstream.dto.car.CarResponse;
import com.sources.mechanicstream.dto.customer.CustomerResponse;
import com.sources.mechanicstream.dto.laboritems.LaborItemResponse;
import com.sources.mechanicstream.dto.repairorder.RepairOrderResponse;
import com.sources.mechanicstream.dto.repairpart.RepairPartResponse;

import java.math.BigDecimal;
import java.util.List;

public record InvoiceResponse(
        CustomerResponse customer,
        CarResponse car,
        RepairOrderResponse repairOrder,

        List<RepairPartResponse> repairParts,
        List<LaborItemResponse> laborItems,

        BigDecimal partsSubtotal,
        BigDecimal laborSubtotal,
        BigDecimal subtotal,
        BigDecimal tax,
        BigDecimal total
) {
}
