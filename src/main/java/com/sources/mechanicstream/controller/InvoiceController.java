package com.sources.mechanicstream.controller;

import com.sources.mechanicstream.dto.invoice.InvoiceResponse;
import com.sources.mechanicstream.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/repair-orders/{repairOrderId}")
    public InvoiceResponse getInvoiceByRepairOrderId(@PathVariable Long repairOrderId){
        return invoiceService.getInvoiceByRepairOrderId(repairOrderId);
    }
}
