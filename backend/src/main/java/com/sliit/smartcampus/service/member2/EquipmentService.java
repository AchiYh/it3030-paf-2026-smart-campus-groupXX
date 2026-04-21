package com.sliit.smartcampus.service.member2;

import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member2.Equipment;
import com.sliit.smartcampus.repository.member2.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {
    private final EquipmentRepository equipmentRepository;

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment getEquipmentById(String id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
    }

    @Transactional
    public void decrementAvailableCount(String equipmentId, int quantity) {
        Equipment equipment = getEquipmentById(equipmentId);
        if (equipment.getAvailableCount() < quantity) {
            throw new BadRequestException("Not enough stock. Only " + equipment.getAvailableCount() + " available.");
        }
        equipment.setAvailableCount(equipment.getAvailableCount() - quantity);
        equipmentRepository.save(equipment);
    }

    @Transactional
    public void incrementAvailableCount(String equipmentId, int quantity) {
        Equipment equipment = getEquipmentById(equipmentId);
        equipment.setAvailableCount(equipment.getAvailableCount() + quantity);
        equipmentRepository.save(equipment);
    }
}