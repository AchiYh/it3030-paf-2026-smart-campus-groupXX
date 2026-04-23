package com.sliit.smartcampus.service.member1;

import java.util.List;

import com.sliit.smartcampus.dto.member1.ResourceRequestDTO;
import com.sliit.smartcampus.dto.member1.ResourceResponseDTO;
import com.sliit.smartcampus.model.member1.ResourceStatus;
import com.sliit.smartcampus.model.member1.ResourceType;

public interface ResourceService {

    List<ResourceResponseDTO> getAllResources();

    ResourceResponseDTO getResourceById(String id);

    ResourceResponseDTO createResource(ResourceRequestDTO dto);

    ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto);

    ResourceResponseDTO updateStatus(String id, String status);

    void deleteResource(String id);

    List<ResourceResponseDTO> searchResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status);
}

