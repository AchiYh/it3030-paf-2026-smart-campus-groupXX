package com.sliit.smartcampus.repository.member1;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sliit.smartcampus.model.member1.Resource;
import com.sliit.smartcampus.model.member1.ResourceStatus;
import com.sliit.smartcampus.model.member1.ResourceType;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}
