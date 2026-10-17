var CloudStorageConstants = Class.create();

CloudStorageConstants.CLOUD_STORAGE_PROCESSOR = "CloudStorageProcessor";
CloudStorageConstants.VALIDATE_PERSISTENCE_RESPONSE = "_validatePersistenceResponse";
CloudStorageConstants.CALCULATE_TOTAL_USAGE = "calculateTotalUsage";

CloudStorageConstants.PERSISTENCE_API_CODE = {
    EMPTY_RESPONSE: "CLD1001",
    MANDATORY_ATTRIBUTES_MISSING: "CLD1002",
    EMPTY_COLLECTION_TIME: "CLD1003",
    NO_NEW_USAGE_DATA: "CLD1004",
    PAYLOAD_PROCESSING_ERROR: "CLD1005",
    MISSING_TIER_1_DATA: "CLD1006"
};

CloudStorageConstants.STORAGE_ERROR_CODES = {
    CLD1001: 'Response from Persistence API is empty',
    CLD1002: 'Mandatory attributes are Missing or has empty value from Persistence API for ',
    CLD1003: 'Collection Start Time has empty value from Persistence API for ',
    CLD1004: 'Persistence API is returning same data for the last 3 days. Ensure Persistence job is running for ',
    CLD1005: 'Exception while calculating pool capacity from Persistence API: ',
    CLD1006: 'Missing Tier 1 data from the Persistence API Response'
};

CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES = {
    PERSISTENCE_API: "Persistence API"
};
