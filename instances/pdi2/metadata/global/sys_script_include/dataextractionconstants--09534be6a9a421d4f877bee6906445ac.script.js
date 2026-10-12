var DataExtractionConstants = Class.create();
DataExtractionConstants.prototype = {
    initialize: function() {

        //Properties
        this.MAX_NUMBER_OTHER_FEATURES = this.getIntProperty(
            "max_number_other_features", -1
        );

        this.MAX_NUMBER_RECORDS_FOR_TRAINING = this.getIntProperty(
            "max_number_records_for_training", -1
        );

        this.MAX_PAGINATION_RECORDS = this.getIntProperty(
            "max_pagination_records", 5000, 5000
        );

        this.MAX_NUMBER_OF_ATTACHMENT_FOR_TRAINING = this.getIntProperty(
            "max_number_of_attachment_for_training", -1
        );

        this.MAX_BYTE_SIZE_FOR_ATTACHMENTS = this.getIntProperty(
            "max_byte_size_for_attachments", 5242880, 5242880
        );

        this.SUPPORTED_ATTACHMENT_TYPES = gs.getProperty(
            "glide.platform_ml_task.supported_attachment_types",
            "PDF,XLS,XLSX,DOCX,CSV,EML,TXT"
        ).split(",");

        // supported use cases
        this.SUPPORTED_USE_CASES = {
            "SINGLE_TABLE": "Single table",
            "TWO_TABLE_JOIN": "Two tables joined by a reference field",
            "TWO_TABLE_JOIN_WITH_M2M": "Two tables joined by a m2m table",
        };

        this.ERROR_TYPES = {
            "CONTRACT_DEFINITION_ERROR": "The contract is invalid or mandatory fields are missing",
            "USE_CASE_ERROR": "The contract do not describe a valid use case",
            "SECURITY_ERROR": "Invalid Access to the data",
            "VALIDATION_ERROR": "The tables, fields or encoded queries are invalid",
            "DATA_ERROR": "There was an error while processing the data",
            "UNKNOWN": "An error have happened, check logs for more info"
        };

        this.ALL_SUPPORTED_ATTACHMENT_TYPES = {
            "PDF": "application/pdf",
            "XLS": "application/vnd.ms-excel",
            "XLSX": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "DOCX": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "CSV": "text/csv",
            "EML": "message/rfc822",
            "TXT": "text/plain"
        };

        this.ORDER_TYPES = {
            "ASC": "Ascending",
            "DESC": "Descending",
            "EMPTY": "Empty" //default
        };

        this.OTHER_FEATURES_TYPES = {
            "ATTACHMENT": "attachment",
            "ARRAY": "array"
        };

        this.UNKNOWN_TAG = "UNKNOWN";
        this.ATTACHMMENT_LABEL = "attachmentText";
        this.ERROR_TYPE_KEY = "errorType";
        this.ERROR_MESSAGE_KEY = "errorMessages";
        this.VALID_ROTATION_TYPES = ["rotate"];
        this.TABLES = {
            SYS_ATTACHMENT: "sys_attachment",
            SYS_TABLE_ROTATION: "sys_table_rotation",
            SYS_TABLE_ROTATION_SCHEDULE: "sys_table_rotation_schedule"
        };
        this.READ_REPLICA_DB_CATEGORY = "task_intelligence";

    },

    getIntProperty: function(property, defaultValue, limit) {
        if (gs.nil(property))
            return null;

        var propertySuffix = "glide.platform_ml_task.";
        var propertyValue = parseInt(
            gs.getProperty(propertySuffix + property, defaultValue)
        ) || defaultValue;

        return (!gs.nil(limit) && (propertyValue > parseInt(limit))) ? parseInt(limit) : propertyValue;
    },

    type: 'DataExtractionConstants'
};
