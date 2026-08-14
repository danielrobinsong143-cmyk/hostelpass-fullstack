package com.hostelpass.common;

/**
 * Generic success-response envelope for single-object endpoints (e.g. approve/deny
 * responses in Section 7). Kept separate from PageResponse, which is list-specific.
 * Will be used by controllers built in a later phase; defined now alongside the rest
 * of the shared 'common' package so the contract is fixed before endpoints are written.
 *
 * Constructor and getters are hand-written (not Lombok-generated) for this class.
 * The previous version relied on Lombok's @AllArgsConstructor, but its static
 * factory methods construct the class from within itself (new ApiResponse<>(...)),
 * and annotation processing did not run in the build environment that reported the
 * compile failure — leaving only the implicit default no-arg constructor and causing
 * "cannot infer type arguments (actual and formal argument lists differ in length)".
 * Writing this by hand removes any dependency on annotation-processor configuration.
 */
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }
}
