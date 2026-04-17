package com.sliit.smartcampus.service.member3.ticketing;

import com.sliit.smartcampus.exception.BadRequestException;
import com.sliit.smartcampus.exception.ResourceNotFoundException;
import com.sliit.smartcampus.model.member3.ticketing.Attachment;
import com.sliit.smartcampus.model.member3.ticketing.Attachment.AttachmentType;
import com.sliit.smartcampus.model.member4.User;
import com.sliit.smartcampus.repository.member3.ticketing.AttachmentRepository;
import com.sliit.smartcampus.repository.member3.ticketing.TicketRepository;
import com.sliit.smartcampus.repository.member4.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.InvalidPathException;
import java.util.Locale;
import java.util.UUID;

@Service
public class ImageUploadService {

    private static final int MAX_IMAGES_PER_TICKET = 3;

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public ImageUploadService(
            AttachmentRepository attachmentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public Attachment uploadTicketImage(String ticketId, String uploadedBy, MultipartFile file) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        long currentImageCount = attachmentRepository.countByTicketIdAndType(ticketId, AttachmentType.IMAGE);
        if (currentImageCount >= MAX_IMAGES_PER_TICKET) {
            throw new BadRequestException("A ticket can have a maximum of 3 images");
        }

        String originalName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "image";
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < originalName.length() - 1) {
            extension = "." + originalName.substring(dotIndex + 1).replaceAll("[^a-zA-Z0-9]", "").toLowerCase(Locale.ROOT);
        }

        String storedFileName = UUID.randomUUID() + extension;
        Path uploadDir = Paths.get("uploads", "member3", "tickets", ticketId).toAbsolutePath().normalize();
        Path destination = uploadDir.resolve(storedFileName);

        try {
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BadRequestException("Failed to store image: " + ex.getMessage());
        }

        Attachment attachment = Attachment.builder()
                .ticketId(ticketId)
                .fileName(originalName)
                .storageUrl(destination.toString())
                .mimeType(contentType)
                .fileSizeBytes(file.getSize())
                .uploadedBy(uploadedBy)
                .type(AttachmentType.IMAGE)
                .build();

        return attachmentRepository.save(attachment);
    }

    public void deleteAttachment(String ticketId, String attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", attachmentId));

        if (!attachment.getTicketId().equals(ticketId)) {
            throw new BadRequestException("Attachment does not belong to the specified ticket");
        }

        User currentUser = getCurrentUser();
        boolean isPrivileged = currentUser.getRole() == User.Role.ADMIN
                || currentUser.getRole() == User.Role.TECHNICIAN;
        boolean isOwner = attachment.getUploadedBy() != null
                && (attachment.getUploadedBy().equals(currentUser.getId())
                || attachment.getUploadedBy().equalsIgnoreCase(currentUser.getEmail()));

        if (!isPrivileged && !isOwner) {
            throw new AccessDeniedException("You are not authorized to delete this attachment");
        }

        if (StringUtils.hasText(attachment.getStorageUrl())) {
            try {
                Path path = Paths.get(attachment.getStorageUrl());
                Files.deleteIfExists(path);
            } catch (InvalidPathException | IOException ex) {
                throw new BadRequestException("Failed to delete stored file: " + ex.getMessage());
            }
        }

        attachmentRepository.deleteById(attachmentId);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }
}