package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.OfferLetterTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/offer-templates-simple")
@CrossOrigin(origins = "*")
public class OfferLetterTemplateControllerSimple {

    @Autowired(required = false)
    private MongoTemplate mongoTemplate;

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "API is working!");
        response.put("mongoTemplate", mongoTemplate != null ? "Connected" : "Not connected");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Simple test endpoint for upload functionality
     */
    @PostMapping("/test-upload")
    public ResponseEntity<Map<String, String>> testUpload() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Upload endpoint is reachable!");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Upload a new PDF template - SIMPLE VERSION
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadTemplate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("templateName") String templateName,
            @RequestParam("companyName") String companyName,
            @RequestParam(value = "uploadedBy", required = false, defaultValue = "Admin") String uploadedBy,
            @RequestParam(value = "description", required = false, defaultValue = "") String description
    ) {
        System.out.println("=== Upload Template Called ===");
        System.out.println("Template Name: " + templateName);
        System.out.println("Company Name: " + companyName);
        System.out.println("File: " + (file != null ? file.getOriginalFilename() : "null"));
        System.out.println("Uploaded By: " + uploadedBy);
        System.out.println("Description: " + description);
        
        try {
            // Validate inputs
            if (templateName == null || templateName.trim().isEmpty()) {
                System.out.println("ERROR: Template name is required");
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "Template name is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (companyName == null || companyName.trim().isEmpty()) {
                System.out.println("ERROR: Company name is required");
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "Company name is required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate file
            if (file == null || file.isEmpty()) {
                System.out.println("ERROR: No file uploaded");
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "No file uploaded");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file type
            String contentType = file.getContentType();
            System.out.println("File Content Type: " + contentType);
            System.out.println("File Size: " + file.getSize() + " bytes");
            
            if (contentType == null || !contentType.equals("application/pdf")) {
                System.out.println("ERROR: Invalid file type: " + contentType);
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "Only PDF files are allowed. Got: " + contentType);
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate file size (10MB limit)
            if (file.getSize() > 10 * 1024 * 1024) {
                System.out.println("ERROR: File too large: " + file.getSize());
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "File size exceeds 10MB limit");
                return ResponseEntity.badRequest().body(error);
            }

            // Check MongoDB
            if (mongoTemplate == null) {
                System.out.println("ERROR: MongoDB not configured");
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "MongoDB not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

            // Create template
            OfferLetterTemplate template = new OfferLetterTemplate();
            template.setTemplateName(templateName.trim());
            template.setCompanyName(companyName.trim());
            template.setUploadedBy(uploadedBy);
            template.setDescription(description != null ? description.trim() : "");
            template.setTemplateData(file.getBytes());
            template.setFileType(contentType);
            template.setUploadedAt(LocalDateTime.now());
            template.setActive(true);

            System.out.println("Saving to MongoDB...");
            
            // Save to MongoDB
            template = mongoTemplate.save(template, "offer_letter_templates");
            
            System.out.println("Saved successfully! ID: " + template.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Template uploaded successfully");
            response.put("templateId", template.getId());
            response.put("templateName", template.getTemplateName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            
            String errorMessage = e.getMessage();
            
            // Handle specific error types
            if (errorMessage != null) {
                if (errorMessage.contains("pattern data")) {
                    errorMessage = "File upload validation error. Please try with a different PDF file.";
                } else if (errorMessage.contains("multipart")) {
                    errorMessage = "File upload format error. Please refresh and try again.";
                } else if (errorMessage.contains("MaxUploadSizeExceededException")) {
                    errorMessage = "File size too large. Maximum allowed size is 10MB.";
                }
            } else {
                errorMessage = "Upload failed due to server error";
            }
            
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", errorMessage);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all templates
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllTemplates() {
        System.out.println("=== Get All Templates Called ===");
        
        try {
            if (mongoTemplate == null) {
                System.out.println("MongoDB not configured, returning empty list");
                return ResponseEntity.ok(List.of());
            }

            Query query = new Query();
            query.addCriteria(Criteria.where("isActive").is(true));
            
            List<OfferLetterTemplate> templates = mongoTemplate.find(query, OfferLetterTemplate.class, "offer_letter_templates");
            
            System.out.println("Found " + templates.size() + " templates");
            
            List<Map<String, Object>> response = templates.stream().map(t -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", t.getId());
                map.put("templateName", t.getTemplateName());
                map.put("companyName", t.getCompanyName());
                map.put("uploadedBy", t.getUploadedBy());
                map.put("uploadedAt", t.getUploadedAt());
                map.put("description", t.getDescription());
                map.put("isActive", t.isActive());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get template preview
     */
    @GetMapping("/preview/{id}")
    public ResponseEntity<Map<String, Object>> getTemplatePreview(@PathVariable String id) {
        System.out.println("=== Get Template Preview Called === ID: " + id);
        
        try {
            if (mongoTemplate == null) {
                System.out.println("ERROR: MongoDB not configured");
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "MongoDB not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

            Query query = new Query();
            query.addCriteria(Criteria.where("_id").is(id));
            
            OfferLetterTemplate template = mongoTemplate.findOne(query, OfferLetterTemplate.class, "offer_letter_templates");
            
            if (template == null) {
                System.out.println("ERROR: Template not found");
                Map<String, Object> error = new HashMap<>();
                error.put("status", "error");
                error.put("message", "Template not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            System.out.println("Template found, encoding to base64...");
            
            String base64 = java.util.Base64.getEncoder().encodeToString(template.getTemplateData());

            System.out.println("Base64 length: " + base64.length());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("templateName", template.getTemplateName());
            response.put("companyName", template.getCompanyName());
            response.put("pdfBase64", base64);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Download template
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable String id) {
        System.out.println("=== Download Template Called === ID: " + id);
        
        try {
            if (mongoTemplate == null) {
                System.out.println("ERROR: MongoDB not configured");
                return ResponseEntity.notFound().build();
            }

            Query query = new Query();
            query.addCriteria(Criteria.where("_id").is(id));
            
            OfferLetterTemplate template = mongoTemplate.findOne(query, OfferLetterTemplate.class, "offer_letter_templates");
            
            if (template == null) {
                System.out.println("ERROR: Template not found");
                return ResponseEntity.notFound().build();
            }

            System.out.println("Template found, sending file...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", template.getTemplateName() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(template.getTemplateData());

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete template
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTemplate(@PathVariable String id) {
        System.out.println("=== Delete Template Called === ID: " + id);
        
        try {
            if (mongoTemplate == null) {
                System.out.println("ERROR: MongoDB not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("status", "error", "message", "MongoDB not configured"));
            }

            Query query = new Query();
            query.addCriteria(Criteria.where("_id").is(id));
            
            mongoTemplate.remove(query, OfferLetterTemplate.class, "offer_letter_templates");
            
            System.out.println("Template deleted successfully");
            
            return ResponseEntity.ok(Map.of("status", "success", "message", "Template deleted"));
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
