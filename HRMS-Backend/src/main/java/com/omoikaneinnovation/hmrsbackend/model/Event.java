package com.omoikaneinnovation.hmrsbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;

import lombok.Data;
import lombok.NoArgsConstructor;



@Data

@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;
    private String title;
    private String date;
    private String type;        // HR / Meeting / Holiday / Payroll
    private String description; // Full description shown on detail page
    private String createdBy;   // HR/Admin userId
}
