package com.omoikaneinnovation.hmrsbackend.controller;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offer-letter")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.ngrok-free.dev", "https://*.vercel.app"})
public class OfferLetterController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private MongoTemplate mongoTemplate;

    /* ── Save offer letter data to MongoDB ── */
    @PostMapping("/save")
    public Map<String, String> saveOfferLetter(@RequestBody Map<String, Object> data) {
        try {
            data.put("savedAt", LocalDateTime.now().toString());
            if (mongoTemplate != null) {
                Map<String, Object> saved = mongoTemplate.save(data, "offer_letters");
                Object id = saved.get("_id");
                return Map.of("status", "success", "message", "Saved successfully",
                              "id", id != null ? id.toString() : "");
            }
            return Map.of("status", "success", "message", "Saved (no DB)", "id", "");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "Save failed: " + e.getMessage());
        }
    }

    /* ── Get all saved offer letters ── */
    @GetMapping("/all")
    public List<Map> getAllOfferLetters() {
        try {
            if (mongoTemplate != null) {
                return mongoTemplate.findAll(Map.class, "offer_letters");
            }
            return List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    @PostMapping("/send")
    public Map<String, String> sendOfferLetter(@RequestBody Map<String, Object> data) {
        try {
            // Helper to safely extract string values from Map<String, Object>
            java.util.function.Function<String, String> str = key ->
                data.getOrDefault(key, "") instanceof String s ? s.trim() : "";

            String to          = str.apply("candidateEmail");
            String name        = str.apply("candidateName").isEmpty() ? "Candidate" : str.apply("candidateName");
            String position    = str.apply("position");
            String department  = str.apply("department");
            String location    = str.apply("location");
            String joiningDate = str.apply("joiningDate");
            String ctc         = str.apply("ctc");
            String basic       = str.apply("basic");
            String hra         = str.apply("hra");
            String allowances  = str.apply("allowances");
            String bonus       = str.apply("bonus");
            String educationAllowance = str.apply("educationAllowance");
            String lta         = str.apply("lta");
            String mealCard    = str.apply("mealCard");
            String pf          = str.apply("pf");
            String gpa         = str.apply("gpa");
            String glic        = str.apply("glic");
            String mediClaim   = str.apply("mediClaim");
            String grossSalary = str.apply("grossSalary");
            String totalSsb    = str.apply("totalSsb");
            String grossFixedCtc = str.apply("grossFixedCtc");
            String variablePay = str.apply("variablePay");
            String grade       = str.apply("grade");
            String probation   = str.apply("probationPeriod").isEmpty() ? "3 months" : str.apply("probationPeriod");
            String notice      = str.apply("noticePeriod").isEmpty() ? "60 days" : str.apply("noticePeriod");
            String validUntil  = str.apply("offerValidUntil");
            String company     = str.apply("companyName").isEmpty() ? "OMOIKANE INNOVATIONS PVT LTD" : str.apply("companyName");
            String hrName      = str.apply("hrName").isEmpty() ? "HR Department" : str.apply("hrName");
            String hrDesignation = str.apply("hrDesignation").isEmpty() ? "Head - Talent Acquisition" : str.apply("hrDesignation");
            String today       = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));

            if (to.isBlank()) {
                return Map.of("status", "error", "message", "Candidate email is required");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Offer Letter - " + position + " at " + company);
            helper.setText(buildHtml(name, position, department, location, grade,
                    joiningDate, ctc, basic, hra, allowances, educationAllowance, lta,
                    grossSalary, mealCard, pf, gpa, glic, mediClaim, totalSsb,
                    grossFixedCtc, variablePay, bonus,
                    probation, notice, validUntil, company, hrName, hrDesignation, today), true);

            mailSender.send(message);
            return Map.of("status", "success", "message", "Offer letter sent to " + to);

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", "Failed to send: " + e.getMessage());
        }
    }

    private String buildHtml(String name, String position, String department,
                             String location, String grade, String joiningDate,
                             String ctc, String basic, String hra, String allowances,
                             String educationAllowance, String lta, String grossSalary,
                             String mealCard, String pf, String gpa, String glic,
                             String mediClaim, String totalSsb, String grossFixedCtc,
                             String variablePay, String bonus,
                             String probation, String notice, String validUntil,
                             String company, String hrName, String hrDesignation, String today) {

        StringBuilder sb = new StringBuilder(8192);

        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        sb.append("*{box-sizing:border-box;margin:0;padding:0}");
        sb.append("body{font-family:Arial,sans-serif;background:#f4f6f9;color:#222;font-size:13px;line-height:1.7}");
        sb.append(".wrap{max-width:720px;margin:20px auto;background:#fff;border:1px solid #ddd;box-shadow:0 2px 12px #0000001a}");
        sb.append(".hdr{padding:20px 36px;border-bottom:2px solid #1e3a5f;display:flex;justify-content:space-between;align-items:center}");
        sb.append(".co-name{font-size:22px;font-weight:700;color:#1e3a5f;letter-spacing:1px}");
        sb.append(".co-sub{font-size:11px;color:#6b7280;margin-top:2px}");
        sb.append(".bdy{padding:32px 36px}");
        sb.append(".date-line{font-weight:700;margin-bottom:6px}");
        sb.append(".cand-name{font-weight:700;margin-bottom:20px}");
        sb.append(".dear{font-weight:700;text-decoration:underline;margin-bottom:12px}");
        sb.append("p{margin-bottom:14px;font-size:13px;text-align:justify}");
        sb.append("strong{font-weight:700}");
        sb.append(".sal-table{width:100%;border-collapse:collapse;margin:20px 0}");
        sb.append(".sal-table caption{font-weight:700;font-size:13px;background:#1e3a5f;color:#fff;padding:8px;text-align:center;letter-spacing:1px}");
        sb.append(".sal-table th{background:#f0f4f8;padding:8px 12px;text-align:left;font-size:12px;border:1px solid #d1d5db;font-weight:700}");
        sb.append(".sal-table td{padding:7px 12px;border:1px solid #d1d5db;font-size:12px}");
        sb.append(".sal-table .sub-total td{font-weight:700;background:#e8f0fe}");
        sb.append(".sal-table .grand-total td{font-weight:700;background:#1e3a5f;color:#fff}");
        sb.append(".note-sec{margin-top:24px;font-size:12px}");
        sb.append(".note-sec p{font-style:italic;text-align:justify;margin-bottom:8px}");
        sb.append(".sig-sec{margin-top:28px}");
        sb.append(".sig-line{border-top:1px solid #555;width:200px;margin-top:44px;padding-top:5px;font-size:12px;font-weight:700}");
        sb.append(".ftr{background:#f8fafc;padding:14px 36px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;text-align:center}");
        sb.append("</style></head><body><div class='wrap'>");

        // Header
        sb.append("<div class='hdr'>");
        sb.append("<div><div class='co-name'>").append(esc(company)).append("</div>");
        sb.append("<div class='co-sub'>Official Offer Letter</div></div>");
        sb.append("</div>");

        // Body
        sb.append("<div class='bdy'>");
        sb.append("<div class='date-line'>Dated: ").append(esc(today)).append("</div>");
        sb.append("<div class='cand-name'>").append(esc(name)).append("</div>");
        sb.append("<p class='dear'>Dear ").append(esc(name.split(" ")[0])).append(",</p>");

        sb.append("<p>With reference to your application and subsequent interview, we are pleased to offer you the post of <strong>")
          .append(esc(position)).append("</strong>");
        if (!grade.isBlank()) sb.append(" in <strong>").append(esc(grade)).append("</strong>");
        sb.append(" in our Organization at <strong>").append(esc(location.isBlank() ? "our office" : location))
          .append("</strong> on the terms and conditions, mutually agreed upon.</p>");

        sb.append("<p>Please note that this is a Letter of Intent only and detailed Letter of Appointment shall be issued to you on joining your duties with us. In case, the terms and conditions are acceptable to you, please join the duties with us on or before <strong>").append(esc(joiningDate)).append("</strong>.</p>");

        // Salary Table
        sb.append("<table class='sal-table'>");
        sb.append("<caption>SALARY COMPUTATION</caption>");
        sb.append("<tr><th>Components</th><th>Per Annum</th><th>Per Month</th></tr>");

        sb.append(salRow("Basic", basic, true));
        sb.append(salRow("HRA", hra, true));
        sb.append(salRow("Special Allowance", allowances, true));
        if (!educationAllowance.isBlank()) sb.append(salRow("Education Allowance", educationAllowance, true));
        if (!lta.isBlank()) sb.append(salRow("LTA", lta, true));

        // Gross Salary sub-total
        String gs = grossSalary.isBlank() ? ctc : grossSalary;
        sb.append("<tr class='sub-total'><td><strong>Gross Salary</strong></td><td><strong>").append(esc(gs)).append("</strong></td><td>-</td></tr>");

        if (!mealCard.isBlank()) sb.append(salRow("Meal Card", mealCard, true));
        if (!pf.isBlank()) sb.append(salRow("Provident Fund", pf, true));
        if (!gpa.isBlank()) sb.append(salRow("GPA", gpa, true));
        if (!glic.isBlank()) sb.append(salRow("GLIC", glic, true));
        if (!mediClaim.isBlank()) sb.append(salRow("Medi Claim", mediClaim, true));

        if (!totalSsb.isBlank()) {
            sb.append("<tr class='sub-total'><td><strong>Total SSB</strong></td><td><strong>").append(esc(totalSsb)).append("</strong></td><td>-</td></tr>");
        }

        String gfc = grossFixedCtc.isBlank() ? ctc : grossFixedCtc;
        sb.append("<tr class='sub-total'><td><strong>Gross Fixed CTC</strong></td><td><strong>").append(esc(gfc)).append("</strong></td><td>-</td></tr>");

        if (!variablePay.isBlank()) {
            sb.append("<tr><td>Annual Variable Pay</td><td>").append(esc(variablePay)).append("</td><td>-</td></tr>");
        }

        sb.append("<tr class='grand-total'><td><strong>Total Cost to Company</strong></td><td><strong>").append(esc(ctc)).append("</strong></td><td>-</td></tr>");
        sb.append("</table>");

        // Notes
        sb.append("<div class='note-sec'>");
        sb.append("<p>&#x2022; Gratuity will be applicable as per law.</p>");
        sb.append("<p>&#x2022; Annual Performance based Variable Pay is applicable only for non-incentivized employees and will be paid as per Company Policy.</p>");
        sb.append("<p>&#x2022; For payout towards Variable Pay / Incentive programs, per the incentive policy the employee must remain an active employee of the Company (not having served notice of resignation), in good standing as determined by the Company in its sole discretion, without violation of any Company policies or procedures, in each case, as on the date of payout.</p>");
        sb.append("</div>");

        // Closing
        sb.append("<p style='margin-top:20px'>Thanking you,</p>");
        sb.append("<p>Yours sincerely,</p>");
        sb.append("<p><strong>For ").append(esc(company)).append("</strong></p>");

        sb.append("<div class='sig-sec'>");
        sb.append("<div class='sig-line'>").append(esc(hrName)).append("<br/>").append(esc(hrDesignation)).append("</div>");
        sb.append("</div>");

        // Important Notes
        sb.append("<div style='margin-top:28px;border-top:1px solid #e5e7eb;padding-top:16px'>");
        sb.append("<p style='font-weight:700;margin-bottom:8px'>Important Note: -</p>");
        sb.append("<p style='font-style:italic'>a) By signing this letter, you consent ").append(esc(company))
          .append(" to conduct your background verification before joining. Please note that the Company reserves the right to cancel/withdraw the offer in case of any negative/adverse inference that may arise out of the scheduled background checks.</p>");
        sb.append("<p style='font-style:italic'>b) As per company policy, if an employee resigns from the company within eighteen months of the date of joining, in that case all the joining expenses incurred by the company - relocation (packers &amp; movers), lodging / hotel expenses, joining travel, notice pay amount, joining bonus etc. will be recovered from the employee as applicable.</p>");
        sb.append("</div>");

        sb.append("</div>"); // end .bdy

        // Footer
        sb.append("<div class='ftr'>").append(esc(company))
          .append(" | This is an official offer letter. For queries, contact HR directly.</div>");

        sb.append("</div></body></html>");
        return sb.toString();
    }

    private String salRow(String label, String value, boolean showMonthly) {
        if (value == null || value.isBlank()) return "";
        String monthly = "";
        try {
            // Try to compute monthly from annual
            String cleaned = value.replaceAll("[^0-9.]", "");
            if (!cleaned.isBlank()) {
                double annual = Double.parseDouble(cleaned);
                monthly = String.format("%.0f", annual / 12);
            }
        } catch (Exception ignored) {}
        return "<tr><td>" + esc(label) + "</td><td>" + esc(value) + "</td><td>" + monthly + "</td></tr>";
    }

    private String esc(String s) {
        if (s == null || s.isBlank()) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
