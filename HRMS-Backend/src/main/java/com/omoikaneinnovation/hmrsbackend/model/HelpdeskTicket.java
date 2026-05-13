package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "helpdesk")
public class HelpdeskTicket {

    @Id
    private String id;

    private String issue;
    private String remarks;
    private String raisedBy;       // email of the person who raised
    private String raisedByName;   // display name
    private String raisedByRole;   // EMPLOYEE / MANAGER / ADMIN
    private String attachment;
    private String attachmentData; // base64 encoded file content for in-browser preview

    private String status;
    private String resolvedBy;
    private String date;
    private String resolvedDate;

    // Getters + Setters

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getRaisedBy() { return raisedBy; }
    public void setRaisedBy(String raisedBy) { this.raisedBy = raisedBy; }

    public String getRaisedByName() { return raisedByName; }
    public void setRaisedByName(String raisedByName) { this.raisedByName = raisedByName; }

    public String getRaisedByRole() { return raisedByRole; }
    public void setRaisedByRole(String raisedByRole) { this.raisedByRole = raisedByRole; }

    public String getAttachment() { return attachment; }
    public void setAttachment(String attachment) { this.attachment = attachment; }

    public String getAttachmentData() { return attachmentData; }
    public void setAttachmentData(String attachmentData) { this.attachmentData = attachmentData; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(String resolvedDate) { this.resolvedDate = resolvedDate; }
}