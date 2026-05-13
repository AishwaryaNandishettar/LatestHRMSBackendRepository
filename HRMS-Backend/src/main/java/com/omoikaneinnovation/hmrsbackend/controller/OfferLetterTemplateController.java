package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.OfferLetterTemplate;
import com.omoikaneinnovation.hmrsbackend.service.OfferLetterTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.omoikaneinnovation.hmrsbackend.service.OfferLetterEmailService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/offer-templates")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.ngrok-free.dev", "https://*.vercel.app"})
public class OfferLetterTemplateController {

    @Autowired
    private OfferLetterTemplateService service;

   @Autowired
private OfferLetterEmailService mailService;
    /**
     * Upload a new PDF template
     */

    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadTemplate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("templateName") String templateName,
            @RequestParam("companyName") String companyName,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            OfferLetterTemplate template = service.uploadTemplate(
                    templateName, companyName, uploadedBy, description, file
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Template uploaded successfully");
            response.put("templateId", template.getId());
            response.put("templateName", template.getTemplateName());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all templates (metadata only, no PDF bytes)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllTemplates() {
        List<OfferLetterTemplate> templates = service.getActiveTemplates();
        
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
    }

    /**
     * Get templates by company name
     */
    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<Map<String, Object>>> getTemplatesByCompany(
            @PathVariable String companyName
    ) {
        List<OfferLetterTemplate> templates = service.getTemplatesByCompany(companyName);
        
        List<Map<String, Object>> response = templates.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("templateName", t.getTemplateName());
            map.put("companyName", t.getCompanyName());
            map.put("uploadedBy", t.getUploadedBy());
            map.put("uploadedAt", t.getUploadedAt());
            map.put("description", t.getDescription());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Download template PDF by ID
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable String id) {
        try {
            OfferLetterTemplate template = service.getTemplateById(id)
                    .orElseThrow(() -> new RuntimeException("Template not found"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    template.getTemplateName() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(template.getTemplateData());

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get template PDF as base64 for preview
     */
    @GetMapping("/preview/{id}")
    public ResponseEntity<Map<String, Object>> getTemplatePreview(@PathVariable String id) {
        try {
            OfferLetterTemplate template = service.getTemplateById(id)
                    .orElseThrow(() -> new RuntimeException("Template not found"));

            String base64 = java.util.Base64.getEncoder()
                    .encodeToString(template.getTemplateData());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("templateName", template.getTemplateName());
            response.put("companyName", template.getCompanyName());
            response.put("pdfBase64", base64);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Delete template
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTemplate(@PathVariable String id) {
        try {
            service.deleteTemplate(id);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Template deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * Toggle template active status
     */
    @PutMapping("/toggle/{id}")
    public ResponseEntity<Map<String, Object>> toggleActiveStatus(@PathVariable String id) {
        try {
            OfferLetterTemplate template = service.toggleActiveStatus(id);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("isActive", template.isActive());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PostMapping("/send-offer-letter")
public ResponseEntity<?> sendOfferLetter(
        @RequestParam("to") String to,
        @RequestParam("subject") String subject,
        @RequestParam("candidateName") String candidateName,
        @RequestParam("file") MultipartFile file
) {

    try {

        mailService.sendOfferLetter(
                to,
                subject,
                candidateName,
                file
        );

        return ResponseEntity.ok("Email sent");

    } catch (Exception e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}
}
