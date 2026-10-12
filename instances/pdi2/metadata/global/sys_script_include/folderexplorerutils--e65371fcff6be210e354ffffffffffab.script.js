var FolderExplorerUtils = Class.create();
FolderExplorerUtils.prototype = {
    initialize: function() {},

    /**
     * Get a query parameter from the request object.
     * @param {RESTAPIRequest} request - The REST request object.
     * @param {string} key - The name of the parameter to retrieve.
     * @returns {string|null} The parameter value, or null if not found.
     */
    getParam: function(request, key) {
        try {
            var val = request.queryParams[key];
            if (!val) return null;

            if (Array.isArray(val)) {
                val = val[0];
            }

            if (typeof val === 'string') {
                val = val.replace(/[^\w\s\-@.]/g, '');
            }

            return val || null;
        } catch (e) {
            this.logError('FolderExplorerUtils.getParam', e);
            throw e;
        }
    },

    /**
     * Returns a cleaned version of a query parameter (lowercase, trimmed).
     * @param {RESTAPIRequest} request - The REST request object.
     * @param {string} key - The parameter name to clean.
     * @returns {string|null} The cleaned string.
     */
    getCleanStringParam: function(request, key) {
        try {
            var val = this.getParam(request, key);
            // Ensure it's not null or undefined
            if (val !== null && val !== undefined) {
                return String(val).toLowerCase().trim();
            }
            return '';
        } catch (e) {
            this.logError('FolderExplorerUtils.getCleanStringParam', e);
            throw e;
        }
    },

    /**
     * Extracts a boolean query param. Returns true only for 'true' (case-insensitive).
     * All other values (false, undefined, invalid) return false.
     *
     * @param {RESTAPIRequest} request - The request object.
     * @param {string} key - The param name.
     * @returns {boolean}
     */
    getBooleanParam: function(request, key) {
        try {
            var val = this.getCleanStringParam(request, key);
            return val === 'true';
        } catch (e) {
            this.logError('FolderExplorerUtils.getBooleanParam', e);
            throw e;
        }
    },

    /**
     * Checks if the provided value is a valid 32-character hexadecimal sysID.
     * @param {string} value - The string to validate as a sysID.
     * @returns {boolean} True if the value matches the Sys ID format, otherwise false.
     * @throws Throws an error if any unexpected exception occurs during processing.
     */
    isValidSysId: function(value) {
        try {
            return GlideStringUtil.isEligibleSysID(value);
        } catch (e) {
            this.logError('FolderExplorerUtils.isValidSysId', e);
            throw e;
        }
    },

    /**
     * Validates if a sys_id is in correct format and exists in the specified table.
     * Returns false if sys_id is invalid format, or record not found.
     *
     * @param {string} tableName - Name of the ServiceNow table.
     * @param {string} sysId - sys_id to validate.
     * @returns {boolean} True if a valid record exists for the sys_id in the table.
     */
    isValidRecord: function(tableName, sysId) {
        try {
            if (!tableName || !sysId) return false;

            // Use existing sys_id format checker
            if (!this.isValidSysId(sysId)) return false;

            // Check if record exists
            var gr = new GlideRecordSecure(tableName);
            if (gr.get(sysId)) {
                return true;
            }
            return false;

        } catch (e) {
            this.logError('FolderExplorerUtils.isValidRecord', e);
            throw e;
        }
    },

    /**
     * Extract pagination values (limit, page, offset) with validation.
     * @param {RESTAPIRequest} request - The REST request.
     * @param {number} defaultLimit - Default number of records.
     * @param {number} maxLimit - Maximum allowed limit.
     * @param {number} defaultPage - Default page number.
     * @returns {object} Pagination config: { limit, page, offset }
     */
    getPaginationParams: function(request, defaultLimit, maxLimit, defaultPage) {
        try {
            var rawLimit = this.getParam(request, 'limit');
            var parsedLimit = parseInt(rawLimit, 10);
            var limit = (isNaN(parsedLimit) || parsedLimit < 1) ? defaultLimit : Math.min(parsedLimit, maxLimit);

            var rawPage = this.getParam(request, 'page');
            var page = isNaN(parseInt(rawPage)) || parseInt(rawPage) < defaultPage ? defaultPage : parseInt(rawPage);

            var offset = (page - 1) * limit;

            return {
                limit: limit,
                page: page,
                offset: offset
            };
        } catch (e) {
            this.logError('FolderExplorerUtils.getPaginationParams', e);
            throw e;
        }
    },

    /**
     * Identify unsupported query parameters by comparing to an allowlist.
     * @param {object} params - The request.queryParams object.
     * @param {Array<string>} allowed - List of allowed parameter names.
     * @returns {Array<string>} Array of invalid parameter names.
     */
    getInvalidParams: function(queryParams, allowedParams) {
        try {
            var invalidParams = [];
            for (var key in queryParams) {
                if (queryParams.hasOwnProperty(key) && allowedParams.indexOf(key) === -1) {
                    invalidParams.push(key);
                }
            }
            return invalidParams;
        } catch (e) {
            this.logError('FolderExplorerUtils.getInvalidParams', e);
            throw e;
        }
    },

    /**
     * Fetches user access permissions (canRead, canWrite)
     *
     * @param {string} tableName - Name of the table.
     * @param {string} sysId - sys_id of the record to check.
     * @returns {Object|null} Permissions object or null if invalid.
     */
    getRecordPermissions: function(tableName, sysId) {
        try {
            var gr = new GlideRecordSecure(tableName);
            if (gr.get(sysId))
                return {
                    can_read: gr.canRead(),
                    can_write: gr.canWrite()
                };
            return null;

        } catch (e) {
            this.logError('FolderExplorerUtils.getRecordPermissions', e);
            throw e;
        }
    },


    /** 
     * Converts a byte value into a human-readable string with appropriate units. 
     * @param {number} bytes - The number of bytes to format. 
     * @returns {string} A formatted string representing the size in appropriate units (B, KB, MB, GB, TB). 
     * @throws Throws an error if any unexpected exception occurs during processing. */
    formatBytes: function(bytes) {
        try {
            if (bytes === null || bytes === undefined || typeof bytes !== 'number' || bytes <= 0) return '0 B';
            var k = 1024;
            var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            var size = bytes / Math.pow(k, i);
            return size.toFixed(2) + ' ' + sizes[i];
        } catch (e) {
            this.logError('FolderExplorerUtils.formatBytes', e);
            throw e;
        }
    },

    /**
     * Get a count of records from a table after applying filters.
     * @param {string} tableName - The table to query.
     * @param {object} filterOptions - Key-value filter map.
     * @returns {number} The number of records.
     */
    getFilteredCount: function(tableName, filterOptions) {
        try {
            var gr = new GlideRecordSecure(tableName);
            this.applyCommonFilters(gr, filterOptions);
            gr.setFields(['sys_id']);
            gr.query();
            var count = gr.getRowCount();
            return count;
        } catch (e) {
            this.logError('FolderExplorerUtils.getFilteredCount', e);
            throw e;
        }
    },

    /**
     * Extracts filter options from the request into a field/operator/value structure.
     * @param {Object} params - An object containing all parameters.
     * @param {RESTAPIRequest} params.query - The REST API request object.
     * @param {boolean} params.isHierarchical - Indicates if the query is hierarchical.
     * @param {string} params.targetTable - The target table name.
     * @param {string} params.targetSysId - The target record sys_id.
     * @param {string} params.folderSysId - Sys_id of the hierarchical folder root.
     * @param {boolean} params.isValidParentDetails - Whether a valid target table and sys_id combo exists.
     * @param {boolean} params.isValidFolderSysId - Whether a folder sys_id is provided.
     * @param {Array<string>} params.linkedFolders - Array of linked folder sys_ids.
     * @param {Array<string>} params.linkedDocuments - Array of linked document sys_ids.
     * @param {string} params.folderHierarchySysId - Sys_id of the record hierarchy for ds_folder table.
     * @returns {Object} Filter options object with encodedQuery property.
     */
    extractFilterOptions: function({
        query,
        isHierarchical,
        targetTable,
        targetSysId,
        folderSysId,
        isValidParentDetails,
        isValidFolderSysId,
        linkedFolders,
        linkedDocuments,
        folderHierarchySysId
    }) {
        function joinOr(partsArr) {
            return partsArr.length > 0 ? partsArr.join('^OR') : '';
        }

        function buildFolderHierarchyQuery(folderHierarchySysId, folderSysId) {
            return 'parent_folderIN_HIERARCHY' + folderHierarchySysId + '@' + folderSysId + '@0@true';
        }

        function buildSysIdInQuery(sysIds) {
            return 'sys_idIN' + sysIds.join(',');
        }

        function buildParentFolderQuery(folderSysId) {
            return 'parent_folder=' + folderSysId;
        }

        function combineQueryParts(builtQuery, userQuery) {
            if (builtQuery && userQuery) return builtQuery + '^' + userQuery;
            if (builtQuery) return builtQuery;
            return userQuery;
        }

        try {
            var filterOptions = {};

            var userQuery = ((query.queryParams['query'] && query.queryParams['query'][0]) || '').toString().trim();
            var builtQuery = '';

            var linkedItemsSysIds = linkedFolders.concat(linkedDocuments);

            if (isHierarchical && !!folderHierarchySysId) {
                if (isValidParentDetails) {
                    // Build the hierarchical query for linkedFolders
                    if (linkedFolders.length > 0) {
                        var parts = linkedFolders.map(function(sysId) {
                            return buildFolderHierarchyQuery(folderHierarchySysId, sysId);
                        });

                        // Join parts with ^OR to build the query string
                        builtQuery = joinOr(parts);
                    }
                    // Append the sys_idIN condition with ^OR
                    if (builtQuery !== '')
                        builtQuery += '^OR';
                    builtQuery += buildSysIdInQuery(linkedItemsSysIds);
                } else if (isValidFolderSysId) {
                    builtQuery = buildFolderHierarchyQuery(folderHierarchySysId, folderSysId);
                    builtQuery += '^OR' + buildParentFolderQuery(folderSysId);
                }
            } else {
                if (isValidParentDetails)
                    builtQuery = buildSysIdInQuery(linkedItemsSysIds);
                else if (isValidFolderSysId)
                    builtQuery = buildParentFolderQuery(folderSysId);
            }
            // Combine builtQuery and userQuery if both exist
            filterOptions.encodedQuery = combineQueryParts(builtQuery, userQuery);

            return filterOptions;

        } catch (e) {
            this.logError('FolderExplorerUtils.extractFilterOptions', e);
            throw e;
        }
    },

    /**
     * Applies common filters (like nameLIKE, sys_created_byLIKE, etc.)
     * to a GlideRecord instance based on the filterOptions object.
     * @param {GlideRecord} gr - The GlideRecord to apply filters to.
     * @param {object} options - Map of field -> condition.
     */
    applyCommonFilters: function(gr, options) {
        try {
            var encodedQuery = options.encodedQuery;
            if (encodedQuery && typeof encodedQuery === 'string') {
                gr.addEncodedQuery(encodedQuery.trim(), true);
            }
        } catch (e) {
            this.logError('FolderExplorerUtils.applyCommonFilters', e);
            throw e;
        }
    },

    /**
     * Retrieves a list of linked folder or document sys_ids based on a given table name and target record.
     * It queries either ds_folder_references or ds_document_references depending on the referenceTable passed.
     *
     * @param {string} tableName - The value of the table_name field to match (usually the target table).
     * @param {string} targetSysId - The sys_id of the record being referenced.
     * @param {string} referenceTable - Either 'ds_folder_references' or 'ds_document_references'.
     * @param {Object} [entityDeleteAccessMap] - Object that will be populated with delete access flags for each reference.
     * @param {boolean} fetchPermissions - Whether to evaluate and return delete permissions for each reference.
     * @returns {Array<string>} - Array of linked folder or document sys_ids.
     */
    getLinkedRecords: function(tableName, targetSysId, referenceTable, entityDeleteAccessMap, fetchPermissions) {
        var records = [];
        var referenceField;

        try {
            if (referenceTable === 'ds_folder_references') {
                referenceField = 'folder';
            } else if (referenceTable === 'ds_document_references') {
                referenceField = 'document';
            } else {
                throw new Error('Unsupported reference table: ' + referenceTable);
            }
            var gr = new GlideRecordSecure(referenceTable);
            gr.addQuery('table_name', tableName);
            gr.addQuery('target_record', targetSysId);
            gr.setFields([referenceField, 'sys_id']);
            gr.query();

            while (gr.next()) {
                var refId = gr.getValue(referenceField);
                if (refId) {
                    records.push(refId);
                    if (fetchPermissions && entityDeleteAccessMap)
                        entityDeleteAccessMap[refId] = {
                            reference_sys_id: gr.getValue('sys_id'),
                            can_delete_reference: gr.canDelete()
                        };
                }
            }
        } catch (e) {
            this.logError('FolderExplorerUtils.getLinkedRecords', e);
            throw e;
        }

        return records;
    },


    /**
     * Builds a mapping from document sys_id to its default version ID,
     * and collects a list of all default version IDs.
     *
     * @param {GlideRecord[]} documents - Array of GlideRecord objects representing documents.
     * @returns {Object} An object containing:
     *   - {Object} docToVersionMap: Map of document sys_id -> default_version sys_id
     *   - {string[]} versionIds: Array of default version sys_ids
     */

    getDocumentVersionIdsMap: function(documents) {
        try {
            var docToVersionMap = {};
            var versionIds = [];

            for (var i = 0; i < documents.length; i++) {
                var doc = documents[i];
                var defaultVersionId = doc.default_version;
                if (defaultVersionId) {
                    docToVersionMap[doc.sys_id] = defaultVersionId;
                    versionIds.push(defaultVersionId);
                }
            }

            return {
                docToVersionMap: docToVersionMap,
                versionIds: versionIds
            };
        } catch (e) {
            this.logError('FolderExplorerUtils.getDocumentVersionIdsMap', e);
            throw e;
        }
    },

    /**
     * Retrieves document version records for a list of version IDs and categorizes them.
     *
     * @param {string[]} versionIds - Array of document version sys_ids.
     * @returns {Object} An object containing:
     *   - {Object} versionMap: Map of version sys_id -> { type, sys_id, url }
     *   - {string[]} versionSysIds: List of version IDs
     */
    getDocumentVersionRecords: function(versionIds) {
        try {
            var versionMap = {};
            var versionSysIds = [];

            if (!versionIds || versionIds.length === 0) return {
                versionMap,
                versionSysIds
            };

            var versionGR = new GlideRecordSecure('ds_document_version');
            versionGR.addQuery('sys_id', 'IN', versionIds.join(','));
            versionGR.query();
            while (versionGR.next()) {
                var sysId = versionGR.getValue('sys_id');
                var url = versionGR.getValue('url') || null;
                var type = versionGR.getValue('type') || null;

                versionMap[sysId] = {
                    type: versionGR.getValue('type'),
                    sys_id: sysId,
                    url: url
                };

                versionSysIds.push(sysId);

            }

            return {
                versionMap: versionMap,
                versionSysIds: versionSysIds
            };
        } catch (e) {
            this.logError('FolderExplorerUtils.getDocumentVersionRecords', e);
            throw e;
        }
    },

    /**
     * Retrieves metadata for attachments linked to the given version IDs.
     *
     * @param {string[]} attachmentVersionIds - Array of document version sys_ids of type 'attachment'.
     * @returns {Object} attachmentMap - Map of version sys_id -> metadata object, where metadata includes:
     *   - {string} contentType: MIME type of the file
     *   - {number} sizeBytes: Size in bytes
     *   - {string} sizeFormatted: Human-readable size (e.g., "2.5 MB")
     *   - {string|null} fileExtension: File extension (e.g., "pdf", "docx") or null if not present
     */
    getAttachmentMetadataMap: function(attachmentVersionIds) {
        try {
            var attachmentMap = {};

            if (!attachmentVersionIds || attachmentVersionIds.length === 0) return attachmentMap;

            var attachmentGR = new GlideRecordSecure('sys_attachment');
            attachmentGR.addQuery('table_name', 'ds_document_version');
            attachmentGR.addQuery('table_sys_id', 'IN', attachmentVersionIds.join(','));
            attachmentGR.query();

            while (attachmentGR.next()) {
                var tableSysId = attachmentGR.getValue('table_sys_id');

                var meta = {
                    contentType: attachmentGR.getValue('content_type'),
                    sizeBytes: parseInt(attachmentGR.getValue('size_bytes') || 0, 10),
                    sizeFormatted: this.formatBytes(parseInt(attachmentGR.getValue('size_bytes') || 0, 10)),
                    fileExtension: null,
                    attachmentSysId: attachmentGR.getValue('sys_id')
                };

                var fileName = attachmentGR.getValue('file_name') || '';
                var lastDot = fileName.lastIndexOf('.');
                if (lastDot !== -1 && lastDot < fileName.length - 1) {
                    meta.fileExtension = fileName.substring(lastDot + 1).toLowerCase();
                }

                attachmentMap[tableSysId] = meta;
            }

            return attachmentMap;
        } catch (e) {
            this.logError('FolderExplorerUtils.getAttachmentMetadataMap', e);
            throw e;
        }
    },

    /**
     * Builds the response object for a folder record.
     * @param {GlideRecord} gr - The ds_folder record.
     * @returns {object} Folder data.
     */
    buildFolderResponse: function(folderGR) {
        try {
            return {
                sys_id: folderGR.getValue('sys_id'),
                name: folderGR.getValue('name'),
                type: 'folder',
                parent_folder: folderGR.parent_folder.getDisplayValue(),
                sys_created_on: folderGR.getValue('sys_created_on'),
                sys_created_by: folderGR.getValue('sys_created_by'),
                sys_updated_on: folderGR.getValue('sys_updated_on'),
                sys_updated_by: folderGR.getValue('sys_updated_by'),
                owner: folderGR.owner.getDisplayValue()
            };
        } catch (e) {
            this.logError('FolderExplorerUtils.buildFolderResponse', e);
            throw e;
        }
    },

    /**
     * Builds the response object for a document record, including metadata.
     * @param {GlideRecord} gr - The ds_document record.
     * @param {object|null} meta - Metadata object from version.
     * @param {boolean} fetchPermissions - Flag indicating whether to include permission in the response.
     * @returns {object} Document data.
     */
    buildDocumentResponse: function(doc, meta, fetchPermissions) {

        try {
            var attachmentSysId = null;
            var versionContentType = null;
            var versionSizeFormatted = null;
            var fileExtension = null;
            var sizeInBytes = 0;
            if (meta) {
                versionContentType = meta.contentType;
                versionSizeFormatted = meta.sizeFormatted;
                fileExtension = meta.fileExtension;
                sizeInBytes = meta.sizeBytes;
                attachmentSysId = meta.attachmentSysId;

            }
            var response = {
                sys_id: doc.sys_id,
                name: doc.name,
                type: 'document',
                parent_folder: doc.parent_folder,
                sys_created_on: doc.sys_created_on,
                sys_created_by: doc.sys_created_by,
                sys_updated_on: doc.sys_updated_on,
                sys_updated_by: doc.sys_updated_by,
                owner: doc.owner,

                // permission related metadta
                is_sharing_enabled: doc.is_sharing_enabled,
                is_admin_access_enabled: doc.is_admin_access_enabled,
                is_inheritance_enabled: doc.is_inheritance_enabled,

                // MultiProvider plugin-based
                is_external_cloud_enabled: doc.is_external_cloud_enabled,
                external_file_url: doc.external_file_url,
                is_sync_enabled: doc.is_sync_enabled,

                // Attachment metadata
                attachment_sys_id: attachmentSysId,
                content_type: versionContentType,
                size: versionSizeFormatted,
                size_bytes: sizeInBytes,
                file_extension: fileExtension
            };
            if (fetchPermissions) {
                response.can_read = doc.can_read;
                response.can_write = doc.can_write;
                response.can_delete = doc.can_delete;
            }
            return response;

        } catch (e) {
            this.logError('FolderExplorerUtils.buildDocumentResponse', e);
            throw e;
        }
    },

    /**
     * Builds a paginated response object for folders and documents.
     * @param {Object} params - The parameters object.
     * @param {number} params.page - The current page number.
     * @param {number} params.limit - The number of items per page.
     * @param {number} params.totalFolders - The total number of folders matching the filters.
     * @param {number} params.totalDocuments - The total number of documents matching the filters.
     * @param {boolean} params.fetchPermissions - Whether to include user access permissions in the response.
     * @param {Object} params.recordPermissions - The access permissions object for the target record.
     * @param {boolean} params.isValidParentDetails - Whether the target record (parent) is valid.
     * @param {Array<object>} params.paginatedResults - The array of paginated folder and document objects for the current page.
     * @returns {Object} The paginated response object containing pagination info and results.
     */
    buildPagedResponse: function({
        page,
        limit,
        totalFolders,
        totalDocuments,
        paginatedResults,
        linkedFolders,
        linkedDocuments,
        fetchPermissions,
        recordPermissions,
        isValidParentDetails
    }) {
        try {
            paginatedResults = paginatedResults || [];
            var response = {
                page: page,
                limit: limit,
                totalFolders: totalFolders,
                totalDocuments: totalDocuments,
                totalAvailable: totalFolders + totalDocuments,
                totalPages: Math.ceil((totalFolders + totalDocuments) / limit),
                totalFetched: paginatedResults.length,
                results: paginatedResults,
            };
            if (isValidParentDetails) {
                response.linkedFolders = linkedFolders || [];
                response.linkedDocuments = linkedDocuments || [];

                if (fetchPermissions)
                    response.recordPermissions = recordPermissions;
            }
            return response;
        } catch (e) {
            this.logError('FolderExplorerUtils.buildPagedResponse', e);
            throw e;
        }
    },

    /**
     * Logs an error message with a specified context to the system debug log.
     * @param {string} context - The context or function name where the error occurred.
     * @param {(Error|string)} error - The error object or error message string.
     */
    logError: function(context, error) {
        var ctx = context || 'UnknownContext';
        var errorMsg = '[ERROR] [' + ctx + ']';

        if (error && error.message) {
            errorMsg += ' ' + error.message;
        } else if (typeof error === 'string') {
            errorMsg += ' ' + error;
        } else {
            errorMsg += ' Unknown error occurred.';
        }

        gs.debug(errorMsg);
    },

    type: 'FolderExplorerUtils'
};
