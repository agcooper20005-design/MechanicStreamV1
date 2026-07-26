package com.sources.mechanicstream.dto.repairorder;

import com.sources.mechanicstream.model.RepairOrderStatus;

import java.time.LocalDateTime;

public record RepairOrderResponse(
        Long id,
        Long customerId,
        Long carId,
        RepairOrderStatus status,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        LocalDateTime updatedAt,
        String mechanicNotes
) {
}
