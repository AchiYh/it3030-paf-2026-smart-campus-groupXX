package com.sliit.smartcampus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // MongoDB auditing enabled for @CreatedDate and @LastModifiedDate annotations
}
