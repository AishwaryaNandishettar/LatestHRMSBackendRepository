package com.omoikaneinnovation.hmrsbackend.repository;

import com.omoikaneinnovation.hmrsbackend.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AttendanceRepository
        extends MongoRepository<Attendance, String> {

    List<Attendance> findByUserId(String userId);
    List<Attendance> findByUserIdIn(List<String> userIds);

    Attendance findByUserIdAndDate(String userId, String date);

    // ✅ ADD THESE
    List<Attendance> findByDateStartingWith(String month);

    List<Attendance> findByUserIdAndDateStartingWith(String userId, String month);
    
    List<Attendance> findByUserIdInAndDateStartingWith(List<String> userIds, String month);
}
