package com.sources.mechanicstream.dto.repairorder;

import jakarta.validation.constraints.NotBlank;

public record UpdateRepairOrderRequest(

        @NotBlank
        String mechanicNotes

) {
}
