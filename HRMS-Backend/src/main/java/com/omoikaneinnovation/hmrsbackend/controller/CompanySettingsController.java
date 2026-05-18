package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.CompanySettings;
import com.omoikaneinnovation.hmrsbackend.repository.CompanySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/company-settings")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app", "https://*.ngrok-free.dev"})
public class CompanySettingsController {

    @Autowired
    private CompanySettingsRepository repo;

    /** Default weekly off days if none configured */
    private static final List<String> DEFAULT_WEEKLY_OFF = Arrays.asList("SATURDAY", "SUNDAY");

    /**
     * GET /api/company-settings?companyId=xxx
     * Returns the company settings (or defaults if not configured)
     */
    @GetMapping
    public ResponseEntity<CompanySettings> getSettings(@RequestParam(required = false) String companyId) {
        if (companyId != null && !companyId.isBlank()) {
            return repo.findByCompanyId(companyId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    CompanySettings defaults = new CompanySettings();
                    defaults.setCompanyId(companyId);
                    defaults.setWeeklyOffDays(DEFAULT_WEEKLY_OFF);
                    return ResponseEntity.ok(defaults);
                });
        }
        // No companyId — return first settings or defaults
        return repo.findAll().stream().findFirst()
            .map(ResponseEntity::ok)
            .orElseGet(() -> {
                CompanySettings defaults = new CompanySettings();
                defaults.setWeeklyOffDays(DEFAULT_WEEKLY_OFF);
                return ResponseEntity.ok(defaults);
            });
    }

    /**
     * POST /api/company-settings
     * Save or update company settings
     */
    @PostMapping
    public ResponseEntity<CompanySettings> saveSettings(@RequestBody CompanySettings settings) {
        // Upsert: if a record exists for this companyId, update it
        if (settings.getCompanyId() != null) {
            repo.findByCompanyId(settings.getCompanyId()).ifPresent(existing -> {
                settings.setId(existing.getId()); // preserve MongoDB _id for update
            });
        }
        // Normalize day names to uppercase
        if (settings.getWeeklyOffDays() != null) {
            settings.setWeeklyOffDays(
                settings.getWeeklyOffDays().stream()
                    .map(String::toUpperCase)
                    .collect(java.util.stream.Collectors.toList())
            );
        }
        return ResponseEntity.ok(repo.save(settings));
    }
}
