package com.omoikaneinnovation.hmrsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessageDto {
    private String groupId;
    private String senderEmail;
    private String content;
    private String senderName;
}