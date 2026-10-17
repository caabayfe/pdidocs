(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var utils = new FolderExplorerUtils();

    try {

        // Only allow specific query parameters to prevent injection/misuse
        var allowedParams = [
            'limit', 'page', 'type', 'query', 'table_name', 'record_sys_id', 'is_hierarchical', 'folder_sys_id', 'include_permissions'
        ];

        var error, recordPermissions;

        var invalidParams = utils.getInvalidParams(request.queryParams, allowedParams);

        if (invalidParams.length > 0) {
            gs.warn('[FolderExplorer API] Ignoring unsupported query parameter(s): ' + invalidParams.join(', '));
        }

        // Pagination
        var DEFAULT_LIMIT = 10;
        var MAX_LIMIT = 50;
        var DEFAULT_PAGE = 1;
        var pagination = utils.getPaginationParams(request, DEFAULT_LIMIT, MAX_LIMIT, DEFAULT_PAGE);

        // Ensure pagination is valid and fallback to safe defaults
        var limit = (pagination && !isNaN(pagination.limit)) ? pagination.limit : DEFAULT_LIMIT;
        var page = (pagination && !isNaN(pagination.page)) ? pagination.page : DEFAULT_PAGE;
        var offset = (pagination && !isNaN(pagination.offset)) ? pagination.offset : (page - 1) * limit;

        // Determine if only 'folder' or 'document' type should be fetched, or both (if undefined)
        var typeFilter = utils.getCleanStringParam(request, 'type');

        var targetTable = utils.getCleanStringParam(request, 'table_name');
        var targetSysId = utils.getParam(request, 'record_sys_id');
        var isHierarchical = utils.getBooleanParam(request, 'is_hierarchical');
        var fetchPermissions = utils.getBooleanParam(request, 'include_permissions');
        var hierarchicalRootSysId = utils.getParam(request, 'folder_sys_id');
        var isValidParentDetails = utils.isValidRecord(targetTable, targetSysId);

        if ((targetTable && !targetSysId) || (!targetTable && targetSysId)) {
            error = new sn_ws_err.ServiceError('Missing target parameter');
            error.setStatus(400);
            error.setMessage('Both target_table and target_sys_id must be provided together.');
            error.setErrorCode('INVALID_PARAMS');
            throw error;
        }

        if (targetTable && !GlideTableDescriptor.isValid(targetTable)) {
            error = new sn_ws_err.ServiceError('Invalid table');
            error.setStatus(400);
            error.setMessage('The provided target_table does not exist: ' + targetTable);
            error.setErrorCode('INVALID_TABLE');
            throw error;
        }

        if (targetTable && targetSysId && !isValidParentDetails) {
            error = new sn_ws_err.ServiceError('Invalid target record');
            error.setStatus(400);
            error.setMessage('No valid record found for sys_id "' + targetSysId + '" in table "' + targetTable + '".');
            error.setErrorCode('INVALID_RECORD');
            throw error;
        }

        var folderHierarchySysId = null;
        var rootFolderSysId = null;

        if (isHierarchical) {

            var folderHierarchyGR = new GlideRecord('sys_record_hierarchy');
            folderHierarchyGR.addQuery('table', 'ds_folder');
            folderHierarchyGR.addQuery('reference_field', 'parent_folder');
            folderHierarchyGR.setLimit(1);
            folderHierarchyGR.query();

            if (!folderHierarchyGR.next()) {
                error = new sn_ws_err.ServiceError('Record hierarchy not configured');
                error.setStatus(400);
                error.setMessage('Record hierarchy is not enabled for table "ds_folder" and reference field "parent_folder". Please configure it in sys_record_hierarchy.');
                error.setDetail('Record hierarchy is not enabled for table "ds_folder" and reference field "parent_folder". Please configure it in sys_record_hierarchy.');
                error.setErrorCode('RECORD_HIERARCHY_NOT_FOUND');
                throw error;
            }

            folderHierarchySysId = folderHierarchyGR.getUniqueValue();

            if (folderHierarchySysId) {
                var statusGr = new GlideRecord('sys_record_hierarchy_status');
                statusGr.addQuery('record_hierarchy', folderHierarchySysId);
                statusGr.addQuery('status', 'READY');
                statusGr.setLimit(1);
                statusGr.query();

                if (!statusGr.next()) {
                    // Hierarchy exists but not ready yet
                    error = new sn_ws_err.ServiceError('Record hierarchy not ready');
                    error.setStatus(503); // Service Unavailable
                    error.setMessage('Record hierarchy for table "ds_folder" is not ready. Please try again later.');
                    error.setDetail('Record hierarchy sys_id: ' + folderHierarchySysId + ' is not in READY state in sys_record_hierarchy_status.');
                    error.setErrorCode('RECORD_HIERARCHY_NOT_READY');
                    throw error;
                }
            }
        }

        if (!isValidParentDetails) {
            if (!hierarchicalRootSysId) {
                // No root folder provided, disable hierarchy and proceed normally
                gs.warn('[FolderExplorer API] Hierarchical mode enabled but no root folder sys_id or target_record provided. Disabling hierarchy mode.');
                if (isHierarchical)
                    isHierarchical = false;
            } else {
                var folderGR = new GlideRecordSecure('ds_folder');
                if (!folderGR.get(hierarchicalRootSysId)) {
                    error = new sn_ws_err.ServiceError('Invalid root folder');
                    error.setStatus(400);
                    error.setMessage('No folder found with sys_id: ' + hierarchicalRootSysId);
                    error.setDetail('The provided folder sys_id does not exist in ds_folder table.');
                    error.setErrorCode('INVALID_FOLDER_SYS_ID');
                    throw error;
                }
                // Set the root folder sys_id to the validated hierarchical root; remains null if no root folder was provided
                rootFolderSysId = hierarchicalRootSysId;
            }
        }

        if (isValidParentDetails && fetchPermissions)
            recordPermissions = utils.getRecordPermissions(targetTable, targetSysId);

        var folderRefDeleteAccessMap = {};
        var documentRefDeleteAccessMap = {};
        var linkedFolders = [];
        var linkedDocuments = [];

        if (isValidParentDetails) {
            linkedFolders = utils.getLinkedRecords(targetTable, targetSysId, 'ds_folder_references', folderRefDeleteAccessMap, fetchPermissions);
            linkedDocuments = utils.getLinkedRecords(targetTable, targetSysId, 'ds_document_references', documentRefDeleteAccessMap, fetchPermissions);
        }

        var isValidFolderSysId = !!rootFolderSysId;
        var filterOptions = utils.extractFilterOptions({
            query: request,
            isHierarchical: isHierarchical,
            targetTable: targetTable,
            targetSysId: targetSysId,
            folderSysId: rootFolderSysId,
            isValidParentDetails: isValidParentDetails,
            isValidFolderSysId: isValidFolderSysId,
            linkedFolders: linkedFolders,
            linkedDocuments: linkedDocuments,
            folderHierarchySysId: folderHierarchySysId
        });

        gs.debug("Explore API - filterOptions: " + filterOptions.encodedQuery);

        fetchData({
            typeFilter: typeFilter,
            offset: offset,
            limit: limit,
            page: page,
            filterOptions: filterOptions,
            utils: utils,
            response: response,
            linkedFolders: linkedFolders,
            linkedDocuments: linkedDocuments,
            folderRefDeleteAccessMap: folderRefDeleteAccessMap,
            documentRefDeleteAccessMap: documentRefDeleteAccessMap,
            fetchPermissions: fetchPermissions,
            recordPermissions: recordPermissions,
            isValidParentDetails: isValidParentDetails

        });
    } catch (e) {
        if (e instanceof sn_ws_err.ServiceError) {
            // It's an intentional service error (e.g., invalid param), rethrow it as-is
            throw e;
        }

        gs.error('[FolderExplorer API] Unexpected error: ' + e.message + '\nStack: ' + e.stack);
        error = new sn_ws_err.ServiceError('Unexpected server error');
        error.setStatus(500);
        error.setMessage('An unexpected error occurred. Please contact support.');
        error.setDetail(e.message);
        error.setErrorCode('UNEXPECTED_ERROR');
        throw error;
    }
})(request, response);

function fetchData(params) {

    // ---------- DATABASE-ONLY QUERY MODE ----------
    // Fast, efficient pagination using GlideRecord.chooseWindow()
    try {
        var {
            typeFilter,
            offset,
            limit,
            page,
            filterOptions,
            utils,
            response,
            linkedFolders,
            linkedDocuments,
            folderRefDeleteAccessMap,
            documentRefDeleteAccessMap,
            fetchPermissions,
            recordPermissions,
            isValidParentDetails
        } = params;

        var folderGR, docGR, meta;
        var paginatedResults = [];
        var totalFolders = 0,
            totalDocuments = 0;

        if (!typeFilter || typeFilter === 'folder') {
            totalFolders = utils.getFilteredCount('ds_folder', filterOptions);
        }
        if (!typeFilter || typeFilter === 'document') {
            totalDocuments = utils.getFilteredCount('ds_document', filterOptions);
        }

        // Fetch folders if requested
        if (!typeFilter || typeFilter === 'folder') {
            if (offset < totalFolders) {
                folderGR = new GlideRecordSecure('ds_folder');
                utils.applyCommonFilters(folderGR, filterOptions);
                folderGR.orderBy('sys_id');
                folderGR.chooseWindow(offset, offset + limit);
                folderGR.query();
                while (folderGR.next()) {
                    var folderResponse = utils.buildFolderResponse(folderGR);
                    if (fetchPermissions) {
                        if (isValidParentDetails) {
                            var folderSysId = folderGR.getValue('sys_id');
                            folderResponse.reference_details = folderRefDeleteAccessMap.hasOwnProperty(folderSysId) ? folderRefDeleteAccessMap[folderSysId] : null;
                        }
                        folderResponse.can_read = folderGR.canRead();
                        folderResponse.can_write = folderGR.canWrite();
                        folderResponse.can_delete = folderGR.canDelete();
                    }
                    paginatedResults.push(folderResponse);
                }
            }
        }

        // If not enough folders to fill the page, fetch documents
        var remaining = limit - paginatedResults.length;
        if (remaining <= 0) {
            response.setBody(utils.buildPagedResponse({
                page: page,
                limit: limit,
                totalFolders: totalFolders,
                totalDocuments: totalDocuments,
                paginatedResults: paginatedResults,
                linkedFolders: linkedFolders,
                linkedDocuments: linkedDocuments,
                fetchPermissions: fetchPermissions,
                recordPermissions: recordPermissions,
                isValidParentDetails: isValidParentDetails
            }));
            return;
        }

        if (!typeFilter || typeFilter === 'document') {
            // Calculate how many folders fetched before current page (to adjust docOffset)
            // Calculate how many folders were fetched before the current page offset.
            // This ensures we don't count more folders than actually exist,
            // helping to correctly adjust the document offset for pagination.
            var foldersFetchedBefore = 0;
            if (page > 1) {
                foldersFetchedBefore = Math.min(totalFolders, offset);
            }

            // Calculate document offset by subtracting folders fetched before current page to keep pagination consistent
            // Apply pagination window to fetch only the required documents:
            // Starts at 'docOffset' to skip documents already accounted for in previous pages/folders,
            // and fetches 'remaining' number of documents to fill the current page.
            // This optimizes the query by limiting results to just what's needed.
            var docOffset = Math.max(0, offset - foldersFetchedBefore);

            var documents = [];
            docGR = new GlideRecordSecure('ds_document');
            utils.applyCommonFilters(docGR, filterOptions);
            docGR.orderBy('sys_id');
            docGR.chooseWindow(docOffset, docOffset + remaining);
            docGR.query();
            while (docGR.next()) {
                // Create a new GlideRecord object and copy current record values
                var docData = {
                    sys_id: docGR.getValue('sys_id'),
                    name: docGR.getValue('name'),
                    default_version: docGR.getValue('default_version'), // Needed for getDocumentVersionIdsMap()
                    parent_folder: docGR.getDisplayValue('parent_folder'),
                    sys_created_on: docGR.getValue('sys_created_on'),
                    sys_created_by: docGR.getValue('sys_created_by'),
                    sys_updated_on: docGR.getValue('sys_updated_on'),
                    sys_updated_by: docGR.getValue('sys_updated_by'),
                    owner: docGR.getDisplayValue('owner'),
                    is_sharing_enabled: docGR.getValue('share_access') === "1",
                    is_admin_access_enabled: docGR.getValue('admins_access') === "1",
                    is_inheritance_enabled: docGR.getValue('inherited_access') === "1",

                    // MultiProvider plugin based fields (conditionally available)
                    is_external_cloud_enabled: docGR.isValidField('external') ? docGR.getValue('external') === "1" : null,
                    external_file_url: docGR.isValidField('external_file_url') ? docGR.getValue('external_file_url') : null,
                    is_sync_enabled: docGR.isValidField('sync_disabled') ? docGR.getValue('sync_disabled') !== "1" : null
                };

                if (fetchPermissions) {
                    docData.can_read = docGR.canRead();
                    docData.can_write = docGR.canWrite();
                    docData.can_delete = docGR.canDelete();
                }

                documents.push(docData);
            }

            // Extract mapping of document IDs to version IDs, and collect all version IDs
            var {
                docToVersionMap,
                versionIds
            } = utils.getDocumentVersionIdsMap(documents);

            // Fetch version record details and identify which ones are attachment-type
            var {
                versionMap,
                versionSysIds
            } = utils.getDocumentVersionRecords(versionIds);

            // Get metadata for all attachment-type document versions
            var attachmentMap = utils.getAttachmentMetadataMap(versionSysIds);

            for (var j = 0; j < documents.length; j++) {
                var doc = documents[j];
                var docId = doc.sys_id;
                var versionId = docToVersionMap[docId];
                var versionRecord = versionMap[versionId];
                var defaultVersion = null;
                meta = null;

                if (versionRecord) {
                    defaultVersion = {
                        version_id: versionRecord.sys_id || null,
                        url: versionRecord.url || null,
                        type: versionRecord.type || null
                    };

                    if (versionRecord.type === 'attachment')
                        meta = attachmentMap[versionId] || null;

                } else {
                    defaultVersion = {
                        version_id: versionId,
                        url: null,
                        type: null
                    };
                }

                var documentResponse = utils.buildDocumentResponse(doc, meta, fetchPermissions);
                documentResponse.default_version_details = defaultVersion;
                if (fetchPermissions && isValidParentDetails) {
                    var documentSysId = doc.sys_id;
                    documentResponse.reference_details = documentRefDeleteAccessMap.hasOwnProperty(documentSysId) ? documentRefDeleteAccessMap[documentSysId] : null;
                }
                paginatedResults.push(documentResponse);
            }
        }

        response.setBody(utils.buildPagedResponse({
            page: page,
            limit: limit,
            totalFolders: totalFolders,
            totalDocuments: totalDocuments,
            paginatedResults: paginatedResults,
            linkedFolders: linkedFolders,
            linkedDocuments: linkedDocuments,
            fetchPermissions: fetchPermissions,
            recordPermissions: recordPermissions,
            isValidParentDetails: isValidParentDetails
        }));
    } catch (e) {
        utils.logError('FolderExplorerAPI.fetchData', e);
        throw e;
    }
}
