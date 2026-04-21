package com.sliit.smartcampus.model.member2;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "equipment")
public class Equipment {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String location;
    private int totalCount;
    private int availableCount;
    private String status; // ACTIVE, OUT_OF_SERVICE
}