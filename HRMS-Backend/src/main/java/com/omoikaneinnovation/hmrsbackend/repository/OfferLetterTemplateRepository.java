package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.OfferLetterTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferLetterTemplateRepository extends MongoRepository<OfferLetterTemplate, String> {
    
    // Find all templates by company name
    List<OfferLetterTemplate> findByCompanyName(String companyName);
    
    // Find active templates only
    List<OfferLetterTemplate> findByIsActiveTrue();
    
    // Find by template name
    Optional<OfferLetterTemplate> findByTemplateName(String templateName);
    
    // Find active templates by company
    List<OfferLetterTemplate> findByCompanyNameAndIsActiveTrue(String companyName);
}
