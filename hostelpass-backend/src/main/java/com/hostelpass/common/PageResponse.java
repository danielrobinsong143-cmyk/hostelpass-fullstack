package com.hostelpass.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Standard shape for every paginated list endpoint in the API (SDD Section 7),
 * e.g. GET /outpass-requests, GET /outpass-requests/my, GET /audit-logs.
 * Wraps a Spring Data Page<T> into the { content, page, totalElements } contract
 * so the frontend never has to deal with Spring's native Page serialization.
 *
 * Constructor and getters are hand-written (not Lombok-generated) for this class.
 * See ApiResponse.java for the full explanation: this class's own static factory
 * method (from(...)) constructs itself, and annotation processing not running in
 * the reported build environment left only the implicit no-arg constructor,
 * causing the Phase 3 compile failure. Hand-writing removes that dependency.
 */
public class PageResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    public PageResponse(List<T> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public List<T> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }
}
