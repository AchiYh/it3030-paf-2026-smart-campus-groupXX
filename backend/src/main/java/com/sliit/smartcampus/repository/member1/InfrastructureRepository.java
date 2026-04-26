package com.sliit.smartcampus.repository.member1;

import com.sliit.smartcampus.model.member1.Infrastructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InfrastructureRepository extends MongoRepository<Infrastructure, String> {
    List<Infrastructure> findByType(String type);
    List<Infrastructure> findByStatus(String status);
    List<Infrastructure> findByLocationContainingIgnoreCase(String location);
}
