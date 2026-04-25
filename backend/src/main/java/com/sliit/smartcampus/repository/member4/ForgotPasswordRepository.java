package com.sliit.smartcampus.repository.member4;

import com.sliit.smartcampus.model.member4.ForgotPassword;
import com.sliit.smartcampus.model.member4.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForgotPasswordRepository extends MongoRepository<ForgotPassword, String> {
    Optional<ForgotPassword> findByUser(User user);
}
