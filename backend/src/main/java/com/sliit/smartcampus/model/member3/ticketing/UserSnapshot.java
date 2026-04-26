package com.sliit.smartcampus.model.member3.ticketing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSnapshot {

    private String id;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private String specialization;
    private String profilePicture;
}