package com.omoikaneinnovation.hmrsbackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "group_messages")
public class GroupMessage {

    @Id
    private String id;

    private String groupId;
    private String senderEmail;
    private String content;
    private Instant createdAt;
    private String senderName;
}