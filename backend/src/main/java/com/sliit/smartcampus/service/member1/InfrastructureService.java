package com.sliit.smartcampus.service.member1;

import com.sliit.smartcampus.model.member1.Infrastructure;
import com.sliit.smartcampus.repository.member1.InfrastructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InfrastructureService {
    private final InfrastructureRepository infrastructureRepository;

    public List<Infrastructure> getAllInfrastructure() {
        return infrastructureRepository.findAll();
    }

    public Infrastructure addInfrastructure(Infrastructure infrastructure) {
        if (infrastructure.getStatus() == null) infrastructure.setStatus("AVAILABLE");
        return infrastructureRepository.save(infrastructure);
    }

    public Infrastructure updateInfrastructure(String id, Infrastructure updated) {
        Infrastructure existing = infrastructureRepository.findById(id).orElseThrow();
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setLocation(updated.getLocation());
        existing.setCapacity(updated.getCapacity());
        existing.setStatus(updated.getStatus());
        existing.setImageUrl(updated.getImageUrl());
        existing.setAvailableFrom(updated.getAvailableFrom());
        existing.setAvailableUntil(updated.getAvailableUntil());
        return infrastructureRepository.save(existing);
    }

    public void deleteInfrastructure(String id) {
        infrastructureRepository.deleteById(id);
    }
}
