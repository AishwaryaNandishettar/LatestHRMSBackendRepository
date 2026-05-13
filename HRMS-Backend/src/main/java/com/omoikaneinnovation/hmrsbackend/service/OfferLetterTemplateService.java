package com.omoikaneinnovation.hmrsbackend.service;

import com.omoikaneinnovation.hmrsbackend.model.OfferLetterTemplate;
import com.omoikaneinnovation.hmrsbackend.repository.OfferLetterTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class OfferLetterTemplateService {

    private final OfferLetterTemplateRepository repository;

    public OfferLetterTemplateService(OfferLetterTemplateRepository repository) {
        this.repository = repository;
    }

    /**
     * Upload a new PDF template
     */
    public OfferLetterTemplate uploadTemplate(
            String templateName,
            String companyName,
            String uploadedBy,
            String description,
            MultipartFile file
    ) throws IOException {
        
        // Validate file type
        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        // Create template entity
        OfferLetterTemplate template = new OfferLetterTemplate();
        template.setTemplateName(templateName);
        template.setCompanyName(companyName);
        template.setUploadedBy(uploadedBy);
        template.setDescription(description);
        template.setTemplateData(file.getBytes());
        template.setFileType(file.getContentType());

        return repository.save(template);
    }

    /**
     * Get all templates
     */
    public List<OfferLetterTemplate> getAllTemplates() {
        return repository.findAll();
    }

    /**
     * Get active templates only
     */
    public List<OfferLetterTemplate> getActiveTemplates() {
        try {
            return repository.findByIsActiveTrue();
        } catch (Exception e) {
            // If method doesn't exist or fails, return all templates
            return repository.findAll();
        }
    }

    /**
     * Get templates by company
     */
    public List<OfferLetterTemplate> getTemplatesByCompany(String companyName) {
        return repository.findByCompanyNameAndIsActiveTrue(companyName);
    }

    /**
     * Get template by ID
     */
    public Optional<OfferLetterTemplate> getTemplateById(String id) {
        return repository.findById(id);
    }

    /**
     * Delete template
     */
    public void deleteTemplate(String id) {
        repository.deleteById(id);
    }

    /**
     * Toggle template active status
     */
    public OfferLetterTemplate toggleActiveStatus(String id) {
        OfferLetterTemplate template = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        template.setActive(!template.isActive());
        return repository.save(template);
    }
}
