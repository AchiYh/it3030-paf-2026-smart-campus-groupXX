package com.sliit.smartcampus.repository.member3.ticketing;

import com.sliit.smartcampus.model.member3.ticketing.Attachment;
import com.sliit.smartcampus.model.member3.ticketing.Attachment.AttachmentType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends MongoRepository<Attachment, String> {

    List<Attachment> findByTicketIdOrderByCreatedAtDesc(String ticketId);

    long countByTicketIdAndType(String ticketId, AttachmentType type);
}