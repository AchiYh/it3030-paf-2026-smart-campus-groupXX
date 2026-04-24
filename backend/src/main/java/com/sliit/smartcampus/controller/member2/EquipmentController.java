package com.sliit.smartcampus.controller.member2;

import com.sliit.smartcampus.model.member2.Equipment;
import com.sliit.smartcampus.service.member2.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/equipment")
@RequiredArgsConstructor
public class EquipmentController {
    private final EquipmentService equipmentService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }
}