const ErrorService = (function() {
    return class ErrorService {
        static ERROR_TYPES = {
            NOT_FOUND: "NOT_FOUND",
            UNAUTHORIZED: "UNAUTHORIZED",
            BAD_REQUEST: "BAD_REQUEST",
            ILLEGAL_STATE: "ILLEGAL_STATE",
            RECORD_CREATION_FAILED: "RECORD_CREATION_FAILED",
            UNKNOWN_ERROR: "UNKNOWN_ERROR",
            FORBIDDEN: "FORBIDDEN",
            RECORD_DELETION_FAILED: "RECORD_DELETION_FAILED"
        };

        static createError(errorType, message, extras = {}) {
            const error = {
                ...extras,
            };
            error.errorType = errorType;
            error.message = message;
            return Object.freeze(error);
        }

    }
})();
