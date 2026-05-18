package com.omoikaneinnovation.hmrsbackend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "performance")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Performance {

    @Id
    private String id;

    private String employeeId;
    private double overallScore;

    private List<MonthlyRating> monthlyRatings;
    private List<Parameter> parameters;
    private List<Review> reviews;

    public void setEmployeeId(String employeeId) {
    this.employeeId = employeeId;
}
}
