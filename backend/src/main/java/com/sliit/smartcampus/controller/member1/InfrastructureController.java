package com.sliit.smartcampus.controller.member1;

import com.sliit.smartcampus.model.member1.Infrastructure;
import com.sliit.smartcampus.service.member1.InfrastructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/infrastructure")
@RequiredArgsConstructor
public class InfrastructureController {
    private final InfrastructureService infrastructureService;

    @GetMapping
    public ResponseEntity<List<Infrastructure>> getAll() {
        return ResponseEntity.ok(infrastructureService.getAllInfrastructure());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Infrastructure> create(@RequestBody Infrastructure infrastructure) {
        return ResponseEntity.ok(infrastructureService.addInfrastructure(infrastructure));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Infrastructure> update(@PathVariable String id, @RequestBody Infrastructure infrastructure) {
        return ResponseEntity.ok(infrastructureService.updateInfrastructure(id, infrastructure));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        infrastructureService.deleteInfrastructure(id);
        return ResponseEntity.noContent().build();
    }
}
