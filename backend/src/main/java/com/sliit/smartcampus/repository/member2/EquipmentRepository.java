package com.sliit.smartcampus.repository.member2;

import com.sliit.smartcampus.model.member2.Equipment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EquipmentRepository extends MongoRepository<Equipment, String> {
}