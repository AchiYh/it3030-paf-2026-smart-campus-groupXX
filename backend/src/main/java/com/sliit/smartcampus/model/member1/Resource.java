package com.sliit.smartcampus.model.member1;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @Field
    private String name;

    @Field
    private ResourceType type;

    @Field
    private Integer capacity;

    @Field
    private String location;

    @Field
    private String availabilityWindows;

    @Field
    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Field
    private String description;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
