package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByAssignee(String assignee);

    List<Task> findByAssignedBy(String assignedBy);
    
    List<Task> findByAssigneeIn(List<String> assignees);
}