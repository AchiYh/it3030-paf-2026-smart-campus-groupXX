package com.sliit.smartcampus.service.member1.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sliit.smartcampus.dto.member1.ResourceRequestDTO;
import com.sliit.smartcampus.dto.member1.ResourceResponseDTO;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member1.Resource;
import com.sliit.smartcampus.model.member1.ResourceStatus;
import com.sliit.smartcampus.model.member1.ResourceType;
import com.sliit.smartcampus.repository.member1.ResourceRepository;
import com.sliit.smartcampus.service.member1.ResourceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToDTO(resource);
    }

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = new Resource();
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
        resource.setDescription(dto.getDescription());
        resource.setStatus(ResourceStatus.ACTIVE);

        Resource savedResource = resourceRepository.save(resource);
        return mapToDTO(savedResource);
    }

    @Override
    public ResourceResponseDTO updateResource(
            String id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
        resource.setDescription(dto.getDescription());
        return mapToDTO(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponseDTO updateStatus(String id, String status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));
        resource.setStatus(ResourceStatus.valueOf(status));
        return mapToDTO(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public List<ResourceResponseDTO> searchResources(ResourceType type, String location, Integer minCapacity,
            ResourceStatus status) {
        List<Resource> resources = location != null && !location.isBlank()
                ? resourceRepository.findByLocationContainingIgnoreCase(location)
                : resourceRepository.findAll();

        return resources.stream()
                .filter(resource -> type == null || resource.getType() == type)
                .filter(resource -> status == null || resource.getStatus() == status)
                .filter(resource -> minCapacity == null
                        || (resource.getCapacity() != null && resource.getCapacity() >= minCapacity))
                .map(this::mapToDTO)
                .toList();
    }

    private ResourceResponseDTO mapToDTO(Resource resource) {
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setAvailabilityWindows(resource.getAvailabilityWindows());
        dto.setStatus(resource.getStatus());
        dto.setDescription(resource.getDescription());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        return dto;
    }
}

