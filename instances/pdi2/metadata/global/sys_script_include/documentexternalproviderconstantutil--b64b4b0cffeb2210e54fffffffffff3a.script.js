var DocumentExternalProviderConstantUtil = Class.create();
DocumentExternalProviderConstantUtil.prototype = {
    initialize: function() {},

    EXTENSION_POINT_NAME: "global.MultiProviderDocumentAPI",
    UNSUPPORTED_PROVIDER_SYS_ID: "40a74750873520106e337f9719cb0bbc",

    actions: {
        UPDATE_DOCUMENT_ACTION_NAME: "Update Document Content",
        GET_DOCUMENT_PATH_ACTION_NAME: "Get Document Path",
        CONNECT_DOCUMENT_ACTION_NAME: "Connect Document From GoogleDrive Using ID",
        GET_ALL_VERSIONS_ACTION_NAME: "Get All Versions of Document",
        LOOK_UP_FILES_AND_FOLDERS_ACTION_NAME: "look_up_incremental_files_and_folders"
    },

    tables: {
        DOCUMENT: 'ds_document',
        DOCUMENT_VERSION: "ds_document_version",
        PROVIDER_DETAIL: "mp_provider_detail",
    },

    tableColumns: {
        PROVIDER_NAME: "provider_name",
        EXTERNAL_PROVIDER: "external_provider",
        MP_DOCUMENT: "mp_document",
        SYS_CREATED_ON: "sys_created_on",
        MP_DOCUMENT_VERSION: "mp_document_version",
        SYS_ID: "sys_id",
    },

    operations: {
        UPLOAD: "upload",
        UPDATE: "update",
        SYNC: "syncDown"
    },

    googleDrive: {
        PROVIDER_NAME: "googledrive",
        FILE_TYPE: "googleapps",
        MIME_TYPE: "application/vnd.google-apps.document"
    },

    fileType: {
        FILE: "file",
        FOLDER: "folder"
    },

    lookUpOutput: {
        NAME: "name",
        TYPE: "type",
        ITEM_ID: "itemId",
        CREATED: "created",
        UPDATED: "updated",
        ADDITIONAL_ATTRIBUTES: "additionalAttributes",
        PAGE_TOKEN: "pageToken",
        COUNT: "count",
        MIME_TYPE: "mimeType",
        SIZE: "size",
        FILE_URL: "fileUrl",
        FILE_EXTENSION: "fileExtension",
        ORIGINAL_FILE_NAME: "originalFileName",
        OWNER: "owner",
        FILE_PATH: "filePath"
    },

    status: {
        SUCCESS: "success",
        ERROR: "error"
    },

    statusCode: {
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500
    },

    emptyVersionAttachmentMessage: "Default version is empty, so cannot upload to provider",
    noPermissionMessage: "Current user does not have access to update a record",
    emptyDocumentSysIdMessage: "Document sys_id is missing",
    emptyProviderDetailSysIdMessage: "Provider detail sys_id is missing",
    invalidDocumentSysIdMessage: "Input Document Sys ID is empty or invalid, please pass a valid sysID",
    noExtensionConfiguredMessage: "No Extension configured for the provided provider",
    unsupportedProviderSysIdMessage: "Provider with Id 40a74750873520106e337f9719cb0bbc(OneDrive default - V1) is not supported",
    syncProblemMessage: "Encountered problem while syncing version",
    emptyProviderItemIdMessage: "Provider item ID is missing for attachment",
    emptyDocumentNameMessage: "Document name is required",
    failedVersionCreationMessage: "Unable to create document version",

    type: 'DocumentExternalProviderConstantUtil'
};
