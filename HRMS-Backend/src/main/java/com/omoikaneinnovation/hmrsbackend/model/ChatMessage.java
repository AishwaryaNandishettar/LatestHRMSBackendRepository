package com.omoikaneinnovation.hmrsbackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    private String id;

    private String senderEmail;
    private String receiverEmail;
    private String content;

    private Instant timestamp;

    private boolean seen;
    private boolean delivered;

    private String fileUrl;
    private String fileName;
    private String fileType; // image, pdf, doc
}