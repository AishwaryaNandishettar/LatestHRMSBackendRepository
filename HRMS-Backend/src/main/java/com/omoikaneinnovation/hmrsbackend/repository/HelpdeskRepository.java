package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.HelpdeskTicket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HelpdeskRepository extends MongoRepository<HelpdeskTicket, String> {
    List<HelpdeskTicket> findByRaisedBy(String raisedBy);
}