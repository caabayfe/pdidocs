var DocumentManagementConstantUtil = Class.create();
DocumentManagementConstantUtil.prototype = {
    initialize: function() {},

    tables: {
        DOCUMENT: "ds_document",
        DOCUMENT_VERSION: "ds_document_version",
        DOCUMENT_REFERENCES: "ds_document_references",
        SYS_ATTACHMENT: "sys_attachment",
        SYS_USER: "sys_user"
    },

    tableColumns: {
        TABLE_NAME: "table_name",
        TABLE_SYS_ID: "table_sys_id",
        CREATED_BY: "sys_created_by",
        FILE_NAME: "file_name",
        USER_NAME: "user_name",
        SYS_ID: "sys_id",
        SYS_CREATED_ON: "sys_created_on",
        DOCUMENT: "document",
        TARGET_RECORD: "target_record",
        NAME: "name",
        SIZE_BYTES: "size_bytes",
        CONTENT_TYPE: "content_type",
    },


    status: {
        SUCCESS: "success",
        ERROR: "error",
        PARTIAL_SUCCESS: "partial_success"
    },

    statusCode: {
        OK: 200,
        CREATED: 201,
        MULTI_STATUS: 207,
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500
    },

    operationTypes: {
        CONVERT_ATTACHMENT: "convertAttachment",
        LINK_FROM_DMS: "dmsDocument",
        CREATE_FROM_CLOUD: "cloudDocument"
    },

    requestFields: {
        ATTACHMENT_SYS_ID: "attachmentSysId",
        DOCUMENT_SYS_ID: "documentSysId",
        TARGET_TABLE_NAME: "targetTableName",
        TARGET_RECORD_SYS_ID: "targetRecordSysId",
        PROVIDER_ID: "providerId",
        PROVIDER_ITEM_ID: "providerItemId",
        DOCUMENT_NAME: "documentName",
        TYPE: "type",
        DATA: "data"
    },

    requestBodyInvalidMessage: "Request body must be a non-empty array of operations",
    operationLimitExceededMessage: "Maximum 10 operations allowed per API call. Current request has more than 10 operations.",
    invalidOperationStructureFieldsMessage: "Invalid operation structure. Each operation must have 'type' and 'data' fields",
    invalidOperationStructureDataMessage: "Invalid operation structure. 'data' must be a non-empty array",
    unknownOperationTypeMessage: "Unknown operation type: ",
    mpPluginNotInstalledMessage: "Multi-Provider plugin is not installed. Cloud operations require the Multi-Provider plugin to be activated.",
    failedToConvertAttachmentMessage: "Failed to convert attachment to document",
    failedToLinkDocumentMessage: "Failed to link document ",
    failedToCreateDocumentMessage: "Failed to create document for target record",
    failedToAttachFromProviderMessage: "Failed to attach document from provider",
    unexpectedErrorMessage: "An unexpected error occurred.",
    fieldRequiredMessage: " is required",
    attachmentAlreadyConvertedMessage: 'Attachment is already linked to a document version',
    failedDocumentCreationMessage: 'Failed to create the document',
    emptySysIdMessage: 'sys_id is missing',
    invalidSysIdMessage: 'Input Sys ID is invalid or access denied, please pass a valid sysID',
    invalidOwnerProvidedMessage: 'Provided owner sys_id does not exist in sys_user table.',
    ownerMismatchMessage: 'Cannot link document: Current user must be the attachment creator. Use createDocFromAttachment for standalone documents.',
    inputStreamRequiredMessage: 'Input stream is required',
    inputStreamTypeMessage: 'Input stream must be of type GlideScriptableInputStream',
    contentTypeRequiredMessage: 'Content type is required and must be a non-empty string',
    fileNameRequiredMessage: 'File name is required and must be a non-empty string',
    fileNameExtensionMessage: 'File name must include a valid extension',
    failedToCreateAndLinkDocumentMessage: 'Failed to create and link document.',
    failedToRetrieveVersionMessage: 'Failed to retrieve created version record',
    failedToAttachFileMessage: 'Failed to attach file to document version. Document structure created but file not attached.',
    failedToMoveAttachmentMessage: 'Failed to move attachment to document version',

    type: 'DocumentManagementConstantUtil'
};
