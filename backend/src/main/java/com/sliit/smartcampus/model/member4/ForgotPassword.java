package com.sliit.smartcampus.model.member4;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "forgot_passwords")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForgotPassword {

    @Id
    private String id;

    private Integer otp;

    private LocalDateTime expirationTime;

    private LocalDateTime lastSentAt;

    private Integer resendCount;

    @DBRef
    private User user;
}
