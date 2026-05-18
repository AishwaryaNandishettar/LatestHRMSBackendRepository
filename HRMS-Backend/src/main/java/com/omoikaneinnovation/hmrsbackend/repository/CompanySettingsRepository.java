package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.CompanySettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanySettingsRepository extends MongoRepository<CompanySettings, String> {
    Optional<CompanySettings> findByCompanyId(String companyId);
}
