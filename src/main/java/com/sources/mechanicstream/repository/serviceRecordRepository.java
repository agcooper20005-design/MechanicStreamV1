package com.sources.mechanicstream.repository;

import com.sources.mechanicstream.model.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface serviceRecordRepository extends JpaRepository<ServiceRecord, Long> {
}
