package com.omoikaneinnovation.hmrsbackend.controller;

import com.omoikaneinnovation.hmrsbackend.model.ChatGroup;
import com.omoikaneinnovation.hmrsbackend.model.ChatMessage;
import com.omoikaneinnovation.hmrsbackend.repository.ChatGroupRepository;
import com.omoikaneinnovation.hmrsbackend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app", "https://*.ngrok-free.dev"})
@RequiredArgsConstructor
public class ChatRestController {

    private final MessageRepository messageRepository;
    private final ChatGroupRepository chatGroupRepository;

    /* ================= CHAT HISTORY ================= */
    @GetMapping("/history")
    public List<ChatMessage> getChatHistory(
            @RequestParam String sender,
            @RequestParam String receiver
    ) {
        return messageRepository.findChat(sender, receiver);
    }

    /* ================= MARK SEEN ================= */
    @PutMapping("/seen")
    public void markSeen(
            @RequestParam String sender,
            @RequestParam String receiver
    ) {
        List<ChatMessage> messages =
                messageRepository.findUnseen(sender, receiver);

        messages.forEach(m -> m.setSeen(true));
        messageRepository.saveAll(messages);
    }

    /* ================= CREATE GROUP ================= */
    @PostMapping("/group")
    public ChatGroup createGroup(@RequestBody ChatGroup group) {
        return chatGroupRepository.save(group);
    }

    /* ================= GET GROUPS ================= */
    @GetMapping("/groups")
    public List<ChatGroup> getAllGroups() {
        return chatGroupRepository.findAll();
    }
}
