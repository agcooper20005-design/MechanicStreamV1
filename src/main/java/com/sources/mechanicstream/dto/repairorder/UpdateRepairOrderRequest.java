package com.sources.mechanicstream.dto.repairorder;

public record UpdateRepairOrderRequest(
        Integer mileageIn,
        Integer mileageOut,


        String customerComplaint,
        String diagnosis,
        String recommendations,
        String mechanicNotes

) {
}
