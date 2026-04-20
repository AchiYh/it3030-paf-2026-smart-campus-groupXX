package com.sliit.smartcampus.dto.member1;

import java.time.LocalDateTime;

import com.sliit.smartcampus.model.member1.ResourceStatus;
import com.sliit.smartcampus.model.member1.ResourceType;

import lombok.Data;

@Data
public class ResourceResponseDTO {

    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private ResourceStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
