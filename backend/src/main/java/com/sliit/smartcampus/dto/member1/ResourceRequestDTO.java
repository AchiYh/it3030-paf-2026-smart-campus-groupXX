package com.sliit.smartcampus.dto.member1;

import com.sliit.smartcampus.model.member1.ResourceType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequestDTO {

    @NotBlank
    private String name;

    @NotNull
    private ResourceType type;

    @Min(1)
    private Integer capacity;

    @NotBlank
    private String location;

    private String availabilityWindows;

    private String description;
}
