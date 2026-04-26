package com.sliit.smartcampus.model.member1;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "infrastructure")
public class Infrastructure {
    @Id
    private String id;
    private String name;
    private String type; // e.g., Room, Lab, Equipment
    private String location;
    private Integer capacity;
    private String status; // AVAILABLE, UNAVAILABLE, MAINTENANCE
    private String imageUrl;
    private String availableFrom;
    private String availableUntil;
    private Map<String, Object> metadata; // For extra details like projector brand, etc.
}
