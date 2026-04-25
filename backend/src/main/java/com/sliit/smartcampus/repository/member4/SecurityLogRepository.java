package com.sliit.smartcampus.repository.member4;

import com.sliit.smartcampus.model.member4.SecurityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityLogRepository extends MongoRepository<SecurityLog, String> {
    List<SecurityLog> findTop20ByOrderByTimestampDesc();
}
