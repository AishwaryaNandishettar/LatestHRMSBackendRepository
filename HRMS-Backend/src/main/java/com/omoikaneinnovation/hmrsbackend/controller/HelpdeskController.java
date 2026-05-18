package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.HelpdeskTicket;
import com.omoikaneinnovation.hmrsbackend.service.HelpdeskService;
import com.omoikaneinnovation.hmrsbackend.repository.UserRepository;
import com.omoikaneinnovation.hmrsbackend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/helpdesk")
@CrossOrigin("*")
public class HelpdeskController {

    private final HelpdeskService service;

    @Autowired
    private UserRepository userRepository;

    public HelpdeskController(HelpdeskService service) {
        this.service = service;
    }

    // CREATE - any role can create a ticket
    @PostMapping
    public HelpdeskTicket create(@RequestBody HelpdeskTicket t, Authentication auth) {
        if (auth != null && auth.getName() != null) {
            t.setRaisedBy(auth.getName());
        }
        return service.create(t);
    }

    // GET ALL - admin/hr sees all, manager sees own + team, employee sees only their own
    @GetMapping
    public List<HelpdeskTicket> getAll(Authentication auth,
                                       @RequestParam(required = false) String role,
                                       @RequestParam(required = false) String email) {
        String userRole = role != null ? role : "";
        String userEmail = email != null ? email : (auth != null ? auth.getName() : "");

        if (userRole.equalsIgnoreCase("ADMIN") || userRole.equalsIgnoreCase("HR")) {
            return service.getAll();
        } else if (userRole.equalsIgnoreCase("MANAGER")) {
            // Manager sees their own tickets + all tickets raised by their team members
            List<HelpdeskTicket> result = new ArrayList<>(service.getByUser(userEmail));

            // Find team members (users whose managerEmail == this manager's email)
            List<User> teamMembers = userRepository.findByManagerEmail(userEmail);
            for (User member : teamMembers) {
                List<HelpdeskTicket> memberTickets = service.getByUser(member.getEmail());
                result.addAll(memberTickets);
            }

            return result;
        } else {
            return service.getByUser(userEmail);
        }
    }

    // UPDATE STATUS
    @PutMapping("/{id}")
    public HelpdeskTicket update(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        String status = body.getOrDefault("status", "Resolved");
        String resolvedBy = auth != null ? auth.getName() : body.getOrDefault("resolvedBy", "Admin");
        return service.updateStatus(id, status, resolvedBy);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
