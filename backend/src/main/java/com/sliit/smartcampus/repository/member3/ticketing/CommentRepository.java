package com.sliit.smartcampus.repository.member3.ticketing;

import com.sliit.smartcampus.model.member3.ticketing.Comment;
import com.sliit.smartcampus.model.member3.ticketing.Comment.Visibility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    List<Comment> findByTicketIdAndVisibilityOrderByCreatedAtAsc(String ticketId, Visibility visibility);
}