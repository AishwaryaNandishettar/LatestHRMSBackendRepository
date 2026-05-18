package com.omoikaneinnovation.hmrsbackend.config;

import com.omoikaneinnovation.hmrsbackend.model.Event;
import com.omoikaneinnovation.hmrsbackend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Seeds sample calendar events for the current month on first startup.
 * Only runs if the events collection is empty.
 */
@Component
@RequiredArgsConstructor
public class EventDataSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;

    @Override
    public void run(String... args) {
        long count = eventRepository.count();
        if (count >= 5) {
            return; // enough events already — skip
        }
        // Clear any stale dummy data (e.g. the 2 hardcoded events from HomeController)
        eventRepository.deleteAll();

        LocalDate now = LocalDate.now();
        int year  = now.getYear();
        int month = now.getMonthValue();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        List<Event> seeds = List.of(

            // ── Week 1 ──
            event(date(year, month, 1,  fmt), "Company All-Hands Meeting",
                  "Meeting",
                  "Monthly all-hands meeting for the entire organization. All employees are expected to attend. Agenda includes Q1 review, upcoming goals, and open Q&A with leadership."),

            event(date(year, month, 3,  fmt), "Payroll Processing Day",
                  "Payroll",
                  "Finance team processes payroll for all employees. Ensure timesheets and attendance records are submitted before EOD on the previous working day."),

            // ── Week 2 ──
            event(date(year, month, 7,  fmt), "HR Policy Update Session",
                  "HR",
                  "HR department will walk through the updated leave policy, work-from-home guidelines, and the new performance review cycle. Attendance is mandatory for all permanent staff."),

            event(date(year, month, 10, fmt), "Team Building Workshop",
                  "Meeting",
                  "Cross-department team building activity organized by HR. Activities include collaborative problem-solving exercises and a networking lunch. Venue: Conference Hall B."),

            // ── Week 3 ──
            event(date(year, month, 14, fmt), "Public Holiday – Spring Festival",
                  "Holiday",
                  "Office closed for the Spring Festival public holiday. Emergency support staff on rotation — check the on-call schedule shared by your manager."),

            event(date(year, month, 17, fmt), "Mid-Month Performance Check-In",
                  "HR",
                  "Managers to conduct brief 1:1 check-ins with direct reports to review progress against monthly KPIs. Use the performance module to log notes and ratings."),

            // ── Week 4 ──
            event(date(year, month, 21, fmt), "Recruitment Drive – Campus Hiring",
                  "HR",
                  "HR and department heads will attend the campus recruitment drive at City Engineering College. Interview panels to be confirmed by the recruitment team by the 18th."),

            event(date(year, month, 24, fmt), "Sprint Review & Demo",
                  "Meeting",
                  "Engineering teams present completed sprint deliverables to stakeholders. Product managers to prepare demo environments. Meeting link will be shared via Work Chat."),

            // ── Week 5 / End of Month ──
            event(date(year, month, 28, fmt), "Month-End Payroll Cutoff",
                  "Payroll",
                  "Last day to submit expense reimbursements, overtime claims, and attendance corrections for the current month. Submissions after this date will be processed in the next cycle."),

            event(date(year, month, 30, fmt), "Town Hall – Q&A with CEO",
                  "Meeting",
                  "Open town hall session with the CEO and senior leadership. Employees can submit questions in advance via the Work Chat #townhall channel. Session will be recorded.")
        );

        eventRepository.saveAll(seeds);
        System.out.println("[EventDataSeeder] Seeded " + seeds.size() + " calendar events.");
    }

    private Event event(String date, String title, String type, String description) {
        Event e = new Event();
        e.setTitle(title);
        e.setDate(date);
        e.setType(type);
        e.setDescription(description);
        e.setCreatedBy("system");
        return e;
    }

    /** Returns the date string, clamped to the last day of the month if needed. */
    private String date(int year, int month, int day, DateTimeFormatter fmt) {
        LocalDate d = LocalDate.of(year, month, 1);
        int lastDay = d.lengthOfMonth();
        return LocalDate.of(year, month, Math.min(day, lastDay)).format(fmt);
    }
}
