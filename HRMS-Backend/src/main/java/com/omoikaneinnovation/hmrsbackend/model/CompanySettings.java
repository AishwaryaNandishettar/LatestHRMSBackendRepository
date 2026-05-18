package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

/**
 * Stores company-level configuration like weekly off days.
 * Collection: company_settings
 * One document per company (identified by companyId).
 */
@Document(collection = "company_settings")
public class CompanySettings {

    @Id
    private String id;

    private String companyId; // links to the company

    /**
     * Weekly off days — list of day names in uppercase.
     * Examples: ["SATURDAY", "SUNDAY"], ["SUNDAY"], ["WEDNESDAY", "SUNDAY"]
     * Default: ["SATURDAY", "SUNDAY"]
     */
    private List<String> weeklyOffDays;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public List<String> getWeeklyOffDays() { return weeklyOffDays; }
    public void setWeeklyOffDays(List<String> weeklyOffDays) { this.weeklyOffDays = weeklyOffDays; }
}
