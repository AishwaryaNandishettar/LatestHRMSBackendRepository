package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * OfferLetterTemplate Model
 * Stores uploaded PDF templates for different companies/organizations
 */
@Document(collection = "offer_letter_templates")
public class OfferLetterTemplate {

    @Id
    private String id;

    private String templateName;        // e.g., "Hero FinCorp Template"
    private String companyName;         // e.g., "Hero FinCorp"
    private String uploadedBy;          // User who uploaded
    private LocalDateTime uploadedAt;   // Upload timestamp
    private String fileType;            // "application/pdf"
    private byte[] templateData;        // PDF file bytes
    private boolean isActive;           // Active/Inactive status
    private String description;         // Optional description

    // Constructors
    public OfferLetterTemplate() {
        this.uploadedAt = LocalDateTime.now();
        this.isActive = true;
    }

    public OfferLetterTemplate(String templateName, String companyName, byte[] templateData) {
        this.templateName = templateName;
        this.companyName = companyName;
        this.templateData = templateData;
        this.uploadedAt = LocalDateTime.now();
        this.isActive = true;
        this.fileType = "application/pdf";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getTemplateData() {
        return templateData;
    }

    public void setTemplateData(byte[] templateData) {
        this.templateData = templateData;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
