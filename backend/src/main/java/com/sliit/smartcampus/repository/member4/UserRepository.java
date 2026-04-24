package com.sliit.smartcampus.repository.member4;

import com.sliit.smartcampus.model.member4.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    java.util.List<User> findByRole(User.Role role);

    Optional<User> findByOauthProviderAndOauthProviderId(String provider, String providerId);
}
