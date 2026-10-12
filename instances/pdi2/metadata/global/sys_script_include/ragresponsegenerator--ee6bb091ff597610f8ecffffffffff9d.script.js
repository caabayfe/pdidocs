var RAGResponseGenerator = Class.create();
RAGResponseGenerator.prototype = {
    initialize: function(userUtterance, searchProfileName, caller, locale, conversation, callerContext, signalsContext, perf) {
        this.userUtterance = userUtterance;
        this.searchProfileName = searchProfileName;
        this.caller = caller;
        this.locale = locale;
        this.conversation = conversation;
        this.logger = new sn_log.GlideLogger("global.rag_response_generator");
        this.chunkingConfiguration = JSON.parse(new sn_ais.AisUtil().getChunkingConfiguration());
        this.callerContext = callerContext;
        this.signalsContext = (typeof signalsContext == 'string' ? JSON.parse(signalsContext) : signalsContext) || {};
        this.propertyPrefix = "nextwave.rag_query";
        this.searchSourceParameters = null;
        this.perf = perf || null;
    },

    fetchQueryDetails: function(queryDetails) {
        /*Only when the queryDetails is empty, generate queryDetails by reading values from searchProfile and transforming them according to the mapping configuration.*/
        if (gs.nil(queryDetails)) {
            queryDetails = [];

            var searchSourcesMapped = JSON.parse(sn_ais.AisUtil.getSearchSourceDetails(this.searchProfileName));
            if (gs.nil(searchSourcesMapped) || (Array.isArray(searchSourcesMapped) && searchSourcesMapped.length == 0))
                throw "No valid mapped Search sources for given search profile.";

            for (var mapIdx = 0; mapIdx < searchSourcesMapped.length; mapIdx++) {
                var searchSourceObject = searchSourcesMapped[mapIdx];
                var datasourceType = searchSourceObject.datasource_type;
                var sourceTableName = searchSourceObject.source_name;
                var searchSourceConfigObj = {};

                if (datasourceType && datasourceType == global.RAGResponseGeneratorConstants.DATASOURCE_TYPE_EXTERNAL) {
                    searchSourceConfigObj = Object.assign({}, global.RAGSearchSourceDetailsMappingConfiguration.EXTERNAL_CONTENT_SOURCE_MAPPING);
                    searchSourceConfigObj.sourceTableName = sourceTableName;
                    searchSourceConfigObj.group = "external"; // All external sources → single RAG request
                } else if (sourceTableName == global.RAGResponseGeneratorConstants.KB_SOURCE_TABLE) {
                    searchSourceConfigObj = global.RAGSearchSourceDetailsMappingConfiguration.KB_SOURCE_MAPPING;
                } else if (sourceTableName == global.RAGResponseGeneratorConstants.CATALOG_SOURCE_TABLE) {
                    searchSourceConfigObj = global.RAGSearchSourceDetailsMappingConfiguration.CATALOG_SOURCE_MAPPING;
                } else if (sourceTableName == global.RAGResponseGeneratorConstants.SKILL_SOURCE_TABLE) {
                    searchSourceConfigObj = global.RAGSearchSourceDetailsMappingConfiguration.SKILL_SOURCE_MAPPING;
                } else {
                    var groupId = searchSourceObject.groupId;
                    if (gs.nil(groupId))
                        continue;
                    searchSourceConfigObj.sourceTableName = sourceTableName;
                    searchSourceConfigObj.groupId = groupId;
                    searchSourceConfigObj.group = groupId;
                    searchSourceConfigObj.addChunkingFormat = true;
                }

                queryDetails.push(Object.assign({}, searchSourceConfigObj));
            }
        }

        return queryDetails;
    },

    /*
     * Priority logic:
     * 1. If the property is NOT present:
     *    - Use incoming queryDetails.
     *    - If queryDetails is empty, fall back to the search profile.
     *
     * 2. If the property IS present:
     *    - Prioritize the property value.
     *    - If the property is missing data or causes an error:
     *        a) Use incoming queryDetails.
     *        b) If queryDetails is empty, fall back to the search profile.
     */
    retrieveResults: function(queryDetails) {
        this.logger.debug("Retrieve RAG response for passed query details : {0} ", JSON.stringify(queryDetails));
        var ssUtils = new sn_ais_assist.AISearchSemanticSearchUtils();
        if (!ssUtils.isDprIngestionCompleted()) {
            throw 'DPR Ingestion is not completed.';
        }

        // ── Preprocessing ─────────────────────────────────────────────────
        if (this.perf) this.perf.startSection('Preprocessing');

        //Parse details via property
        var groupDetails;
        var requestDetails = this._parseSearchRequestDetails();
        if (!gs.nil(requestDetails) && requestDetails.queryDetails) {
            queryDetails = requestDetails.queryDetails; //overriding queryDetails from property
            groupDetails = requestDetails.groupDetails;
        }

        queryDetails = this.fetchQueryDetails(queryDetails);
        this.logger.debug("Retrieve RAG response for formatted query details : {0} ", JSON.stringify(queryDetails));

        if (this._hasGrouping(queryDetails, groupDetails))
            return this._retrieveGroupedResults(queryDetails, groupDetails || {});

        return this._retrieveUngroupedResults(queryDetails);
    },

    _parseSearchRequestDetails: function() {
        var searchRequestDetails = gs.getProperty(this.propertyPrefix + '_' + this.searchProfileName) || gs.getProperty(this.propertyPrefix);

        if (gs.nil(searchRequestDetails)) {
            this.logger.debug("Property not found or empty.");
            return null;
        }

        var parsedDetails;
        try {
            parsedDetails = JSON.parse(searchRequestDetails);
        } catch (parseError) {
            this.logger.error("Invalid JSON in property: " + parseError.message);
            return null;
        }

        if (gs.nil(parsedDetails.queryDetails)) {
            this.logger.error("queryDetails is missing in property.");
            return null;
        }

        this.logger.debug("Fetched queryDetails and groupDetails from property.");
        return {
            queryDetails: parsedDetails.queryDetails,
            groupDetails: parsedDetails.groupDetails || {}
        };
    },

    /**
     * Creates one RAG request per queryDetail entry.
     * This method is invoked when no grouping is active, preserving the existing behavior.
     */
    _retrieveUngroupedResults: function(queryDetails) {
        var ragRequests = [];
        for (var idx = 0; idx < queryDetails.length; idx++) {
            var ragRequestDetails = this.getRequestDetailsForSource(queryDetails[idx]);
            var sourceDetails = this._buildSourceDetails(ragRequestDetails);
            var config = this._buildRequestConfig(ragRequestDetails);

            var ragRequest = this.createRAGRequest(this.userUtterance, this.searchProfileName, sourceDetails, config.semanticConfigDetails, config.chunkingDetails, config.advancedConfigDetails, config.additionalInfo);
            ragRequests.push(ragRequest);
        }

        return this._executeAndFormat(ragRequests);
    },

    /**
     * Groups queryDetails by 'group' field and creates one RAG request per group.
     * Invoked only when grouping is active (groupDetails provided or group field present on entries).
     */
    _retrieveGroupedResults: function(queryDetails, groupDetails) {
        this.logger.debug("Executing grouped retrieval with groupDetails: {0}", JSON.stringify(groupDetails));

        var groupedQueryDetails = this._groupQueryDetails(queryDetails);
        this.logger.debug("Grouped query details: {0}", JSON.stringify(Object.keys(groupedQueryDetails)));

        var ragRequests = [];
        var isGroupedFlags = []; // parallel array: true if this request came from a named group

        for (var groupKey in groupedQueryDetails) {
            if (!groupedQueryDetails.hasOwnProperty(groupKey))
                continue;

            var groupEntries = groupedQueryDetails[groupKey];
            var isNamedGroup = groupKey.indexOf('_ungrouped_') !== 0; // true for "group_1", false for "_ungrouped_0"
            var groupConfig = groupDetails[groupKey.replace('group_', '')] || null;

            var ragRequest = this._buildRAGRequestForGroup(groupEntries, groupConfig);
            ragRequests.push(ragRequest);
            isGroupedFlags.push(isNamedGroup);
        }

        return this._executeAndFormat(ragRequests, isGroupedFlags);
    },

    /**
     * Shared: executes RAG requests and formats the responses into a table-keyed result map.
     */
    _executeAndFormat: function(ragRequests, isGroupedFlags) {
        if (this.perf) this.perf.endSection('Preprocessing');

        // ── Retrieval ─────────────────────────────────────────────────────
        if (this.perf) this.perf.startSection('Retrieval');
        this.logger.debug('Number of RAG request count: {0}', ragRequests.length);
        var ragResponses = new sn_search.RAGRetrievalAPI().retrieveMultiple(ragRequests);
        this.logger.debug('retrieveResults: RAG Response before formatting -> {0}', JSON.stringify(ragResponses));
        if (this.perf) this.perf.endSection('Retrieval');

        // ── Postprocessing ────────────────────────────────────────────────
        if (this.perf) this.perf.startSection('Postprocessing');

        var formattedRAGResults = {};
        for (var respIdx = 0; respIdx < ragResponses.length; respIdx++) {
            var isGrouped = isGroupedFlags && isGroupedFlags[respIdx] === true;
            var responseMap = this.getFormattedResult(ragResponses[respIdx], isGrouped) || {};
            for (var tableName in responseMap) {
                if (!responseMap.hasOwnProperty(tableName))
                    continue;

                var resultsForTable = responseMap[tableName] || [];
                if (gs.nil(formattedRAGResults[tableName]))
                    formattedRAGResults[tableName] = [];

                formattedRAGResults[tableName] = formattedRAGResults[tableName].concat(resultsForTable);
            }
        }

        var signalsCorrelationData = ragResponses.length > 0 ? ragResponses[0].getSignalsCorrelationData() : {};

        if (this.perf) this.perf.endSection('Postprocessing');
        return {
            results: formattedRAGResults,
            signalsCorrelationData
        };
    },

    _getSearchSourceParameters: function() {
        if (!gs.nil(this.searchSourceParameters))
            return this.searchSourceParameters;

        try {
            var rawParams = sn_ais.AisUtil.getSearchSourceParameters(this.searchProfileName);
            this.searchSourceParameters = gs.nil(rawParams) ? {} : JSON.parse(rawParams);
        } catch (e) {
            this.logger.error("Failed to fetch search source parameters: " + e.message);
            this.searchSourceParameters = {};
        }

        return this.searchSourceParameters;
    },

    /**
     * Normalizes a raw group params object by flattening the nested `passageFormat` block
     * into the canonical field names expected by getRequestDetailsForSource.
     * Top-level groupParams fields take precedence over passageFormat fields.
     * passageFormat field mapping:
     *   name               → chunkingMode
     *   limit              → chunkSize
     *   limitType          → chunkUnit
     *   expansionStrategy  → expansionStrategy
     *   snippetExpansionCount → snippetExpansionCount
     *   expandedSnippetSize   → expandedSnippetSize
     */
    _normalizeGroupParams: function(rawGroupParams) {
        var normalized = Object.assign({}, rawGroupParams);
        var pf = rawGroupParams.passageFormat;
        if (!gs.nil(pf)) {
            if (gs.nil(normalized.chunkingMode)) normalized.chunkingMode = pf.name;
            if (gs.nil(normalized.chunkSize)) normalized.chunkSize = pf.limit;
            if (gs.nil(normalized.chunkUnit)) normalized.chunkUnit = pf.limitType;
            if (gs.nil(normalized.expansionStrategy)) normalized.expansionStrategy = pf.expansionStrategy;
            if (gs.nil(normalized.snippetExpansionCount)) normalized.snippetExpansionCount = pf.snippetExpansionCount;
            if (gs.nil(normalized.expandedSnippetSize)) normalized.expandedSnippetSize = pf.expandedSnippetSize;
        }
        return normalized;
    },

    /**
     * Priority resolver used by getRequestDetailsForSource.
     * Returns the first non-null/undefined value across groupVal, detailVal, defaultVal.
     * Uses strict checks so explicit false and 0 are treated as real values, not missing.
     */
    _resolveParam: function(groupVal, detailVal, defaultVal) {
        if (groupVal !== undefined && groupVal !== null) return groupVal;
        if (detailVal !== undefined && detailVal !== null) return detailVal;
        return defaultVal;
    },

    /**
     * Returns true if grouping is active: either groupDetails is provided and non-empty,
     * or at least one queryDetail entry has a 'group' field.
     * Note: fetchQueryDetails sets 'group' for external sources (groupId + '_external')
     * and for non-external sources in non-default groups, so this check covers both
     * the property path and the search-profile path.
     */
    _hasGrouping: function(queryDetails, groupDetails) {
        if (groupDetails && Object.keys(groupDetails).length > 0)
            return true;

        for (var idx = 0; idx < queryDetails.length; idx++) {
            if (!gs.nil(queryDetails[idx].group) && queryDetails[idx].group !== undefined)
                return true;
        }

        return false;
    },

    /**
     * Groups queryDetails by their 'group' field.
     * Entries without a 'group' field are each assigned a unique key so they produce individual RAG requests.
     * Entries with the same 'group' value are collected together to produce a single RAG request with multiple sources.
     */
    _groupQueryDetails: function(queryDetails) {
        var grouped = {};
        var ungroupedIdx = 0;

        for (var idx = 0; idx < queryDetails.length; idx++) {
            var entry = queryDetails[idx];
            var groupKey;

            if (!gs.nil(entry.group) && entry.group !== undefined) {
                groupKey = "group_" + entry.group;
            } else {
                groupKey = "_ungrouped_" + ungroupedIdx;
                ungroupedIdx++;
            }

            if (!grouped[groupKey])
                grouped[groupKey] = [];

            grouped[groupKey].push(entry);
        }

        return grouped;
    },

    /**
     * Builds a single RAGRetrievalRequest for a group of queryDetail entries.
     * If groupConfig is provided, it supplies request-level configuration (limit, documentMatchCount, documentMatchThreshold, chunking, etc.).
     * Otherwise, the first entry in the group provides request-level configuration as a fallback.
     * Each entry contributes its own RAGRetrievalSource to the request.
     */
    _buildRAGRequestForGroup: function(groupEntries, groupConfig) {
        var primaryDetail = this.getRequestDetailsForSource(groupEntries[0]);
        if (groupConfig)
            primaryDetail = this._mergeGroupConfig(primaryDetail, groupConfig);

        var sourceDetails = this._buildSourceDetails(primaryDetail);
        var config = this._buildRequestConfig(primaryDetail);

        var ragSources = [];
        for (var i = 0; i < groupEntries.length; i++) {
            var detail = this.getRequestDetailsForSource(groupEntries[i]);

            var ragSource = new sn_search.RAGRetrievalSource()
                .sourceTableName(detail.sourceTableName)
                .fields(detail.fieldsToFetch)
                .filter(detail.applyFilter)
                .condition(detail.conditions)
                .validateWithSearchProfile(detail.validateWithSearchProfile)
                .applyDynamicFilter(detail.applyDynamicFilter);

            ragSources.push(ragSource);
        }

        return this.createRAGRequest(this.userUtterance, this.searchProfileName, sourceDetails, config.semanticConfigDetails, config.chunkingDetails, config.advancedConfigDetails, config.additionalInfo, ragSources);
    },

    /**
     * Builds source-level details from ragRequestDetails.
     */
    _buildSourceDetails: function(ragRequestDetails) {
        return {
            tableName: ragRequestDetails.sourceTableName,
            fieldsToFetch: ragRequestDetails.fieldsToFetch,
            limit: ragRequestDetails.limit,
            applyFilter: ragRequestDetails.applyFilter,
            conditions: ragRequestDetails.conditions,
            validateWithSearchProfile: ragRequestDetails.validateWithSearchProfile,
            applyDynamicFilter: ragRequestDetails.applyDynamicFilter
        };
    },

    _normalizeRestParams: function(params) {
        var keyMap = {
            'semanticModel': 'semantic.model',
            'qThreshold': 'q.threshold',
            'rrf_k': 'rrf.k'
        };
        var normalized = {};
        for (var k in params) {
            if (params.hasOwnProperty(k)) {
                var val = params[k];
                normalized[keyMap[k] || k] = Array.isArray(val) ? val : [String(val)];
            }
        }
        return normalized;
    },

    /**
     * Builds all request-level configuration objects from ragRequestDetails.
     * Returns { semanticConfigDetails, advancedConfigDetails, chunkingDetails, additionalInfo }.
     */
    _buildRequestConfig: function(ragRequestDetails) {
        var semanticConfigDetails = {
            documentMatchCount: ragRequestDetails.documentMatchCount,
            documentMatchThreshold: ragRequestDetails.documentMatchThreshold,
            embeddingModelId: ragRequestDetails.embeddingModelId,
            semanticIndexNames: ragRequestDetails.semanticIndexNames,
            semanticMode: ragRequestDetails.semanticMode,
            semanticGroupBy: ragRequestDetails.semanticGroupBy,
            booleanMode: ragRequestDetails.booleanMode
        };

        var restParams = {
            'semantic.model': ragRequestDetails.semanticModel,
            'q.threshold': ragRequestDetails.qThreshold,
            'rrf.k': ragRequestDetails.rrfK,
            'q.type': ragRequestDetails.qType
        };

        if (!gs.nil(ragRequestDetails.additionalRestParams))
            var mergedRestParams = Object.assign({}, restParams, this._normalizeRestParams(ragRequestDetails.additionalRestParams));

        var advancedConfigDetails = {
            restParams: mergedRestParams || restParams,
            addChunkingFormat: ragRequestDetails.addChunkingFormat,
            includeFeatureVectors: ragRequestDetails.includeFeatureVectors
        };

        var chunkingDetails = {
            mode: ragRequestDetails.chunkingMode,
            chunkSize: ragRequestDetails.chunkSize,
            chunkUnit: ragRequestDetails.chunkUnit,
            maxPassagesPerDoc: ragRequestDetails.maxPassagesPerDoc,
            expansionStrategy: ragRequestDetails.expansionStrategy,
            snippetExpansionCount: ragRequestDetails.snippetExpansionCount,
            expandedSnippetSize: ragRequestDetails.expandedSnippetSize
        };

        var additionalInfo = {
            offset: ragRequestDetails.offset,
            facetFilters: ragRequestDetails.facetFilters,
            disableSpellCheck: ragRequestDetails.disableSpellCheck,
            debug: ragRequestDetails.debug,
            sortField: ragRequestDetails.sortField,
            sortAscending: ragRequestDetails.sortAscending,
            locale: this.locale || ""
        };

        var additionalContext = {};
        var conversation = this.conversation;
        additionalContext.conversation = (typeof conversation == "string" ? JSON.parse(conversation) : conversation) || {};

        //Support New Customer Gemma EM:
        try {
            var embeddingModelDetails = JSON.parse(new sn_ais.SemanticUtil().getEffectiveEmbeddingModelDetails(global.RAGResponseGeneratorConstants.DEFAULT_HYBRID_SEMANTIC_SEARCH_CONFIGURATION_SYS_ID)) || {};
        } catch (ex) {
            this.logger.error("Exception occured while retrieving the embeddingModelDetails");
        }

        if (!gs.nil(embeddingModelDetails) && embeddingModelDetails.effectiveEmbeddingModelVersion)
            additionalContext.effectiveEmbeddingModelVersion = embeddingModelDetails.effectiveEmbeddingModelVersion;


        additionalInfo.additionalContext = JSON.stringify(additionalContext);

        return {
            semanticConfigDetails: semanticConfigDetails,
            advancedConfigDetails: advancedConfigDetails,
            chunkingDetails: chunkingDetails,
            additionalInfo: additionalInfo
        };
    },

    /**
     * Merges explicit groupDetails config over the defaults derived from the first entry.
     * Any key present in groupConfig that also exists in primaryDetail will override the default.
     */
    _mergeGroupConfig: function(primaryDetail, groupConfig) {
        for (var key in groupConfig) {
            if (groupConfig.hasOwnProperty(key) && primaryDetail.hasOwnProperty(key))
                primaryDetail[key] = groupConfig[key];
        }

        return primaryDetail;
    },

    getRequestDetailsForSource: function(queryDetail) {
        var ragRequestDetails = {};

        var groupParams = {};
        var groupId = queryDetail.groupId;
        if (!gs.nil(groupId)) {
            var allGroupParams = this._getSearchSourceParameters();
            groupParams = this._normalizeGroupParams(allGroupParams[groupId] || {});
        }

        ragRequestDetails.sourceTableName = queryDetail.sourceTableName;
        ragRequestDetails.fieldsToFetch = queryDetail.fieldsToFetch; //If fieldsToFetch is absent, we cannot return any columns in the response
        ragRequestDetails.addChunkingFormat = this._resolveParam(groupParams.addChunkingFormat, queryDetail.addChunkingFormat, false);
        ragRequestDetails.includeFeatureVectors = this._resolveParam(groupParams.includeFeatureVectors, queryDetail.includeFeatureVectorsInResponse, false);

        ragRequestDetails.applyDynamicFilter = this._resolveParam(groupParams.applyDynamicFilter, queryDetail.applyDynamicFilter, true);
        ragRequestDetails.applyFilter = this._resolveParam(groupParams.applyFilter, queryDetail.applyFilter, true);

        ragRequestDetails.conditions = this._resolveParam(groupParams.conditions, queryDetail.conditions, "");
        ragRequestDetails.validateWithSearchProfile = this._resolveParam(groupParams.validateWithSearchProfile, queryDetail.validateWithSearchProfile, false);
        ragRequestDetails.documentMatchCount = this._resolveParam(groupParams.docMatchCount, queryDetail.documentMatchCount, global.RAGResponseGeneratorConstants.DEFAULT_DOCUMENT_MATCH_COUNT); //1000
        ragRequestDetails.documentMatchThreshold = this._resolveParam(groupParams.threshold, queryDetail.documentMatchThreshold, global.RAGResponseGeneratorConstants.DEFAULT_DOCUMENT_MATCH_THRESHOLD); //0.0
        ragRequestDetails.embeddingModelId = this._resolveParam(groupParams.embeddingModelId, queryDetail.embeddingModelId, global.RAGResponseGeneratorConstants.DEFAULT_EMBEDDING_MODEL); //E5FT
        ragRequestDetails.semanticIndexNames = this._resolveParam(groupParams.dprFields, queryDetail.semanticIndexNames, global.RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_INDEX_NAMES); //['title', 'body']
        ragRequestDetails.semanticMode = this._resolveParam(groupParams.semanticMode, queryDetail.semanticMode, global.RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_MODE); //'KEYWORD'

        ragRequestDetails.semanticGroupBy = this._resolveParam(groupParams.semanticGroupby, queryDetail.semanticGroupBy, global.RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_GROUPBY); //'ALL'
        ragRequestDetails.booleanMode = this._resolveParam(groupParams.queryMode, queryDetail.booleanMode, global.RAGResponseGeneratorConstants.DEFAULT_BOOLEAN_MODE); //'OR'
        ragRequestDetails.semanticModel = this._resolveParam(groupParams.semanticModel, queryDetail.semanticModel, global.RAGResponseGeneratorConstants.DEFAULT_SEMANTIC_MODEL); //['semantic_title_body']
        ragRequestDetails.qThreshold = this._resolveParam(groupParams.qThreshold, queryDetail.qThreshold, global.RAGResponseGeneratorConstants.DEFAULT_Q_THRESHOLD); //['80']
        ragRequestDetails.rrfK = this._resolveParam(groupParams.rrfK, queryDetail.rrfK, global.RAGResponseGeneratorConstants.DEFAULT_RRFK); //['3']
        ragRequestDetails.qType = this._resolveParam(groupParams.qType, queryDetail.qType, global.RAGResponseGeneratorConstants.DEFAULT_Q_TYPE); //['glide.v2']

        ragRequestDetails.chunkingMode = this._resolveParam(groupParams.chunkingMode, queryDetail.chunkingMode, global.RAGResponseGeneratorConstants.CHUNKING_MODE_SMALL_TO_BIG); //SMALL_TO_BIG
        ragRequestDetails.chunkSize = this._resolveParam(groupParams.chunkSize, queryDetail.chunkSize, this.getDefaultValueForModeParameter(ragRequestDetails.chunkingMode, global.RAGResponseGeneratorConstants.CHUNKING_PARAMETER_CHUNK_SIZE));
        ragRequestDetails.chunkUnit = this._resolveParam(groupParams.chunkUnit, queryDetail.chunkUnit, this.getDefaultValueForModeParameter(ragRequestDetails.chunkingMode, global.RAGResponseGeneratorConstants.CHUNKING_PARAMETER_CHUNK_UNIT));
        ragRequestDetails.maxPassagesPerDoc = this._resolveParam(groupParams.numChunksPerDoc, queryDetail.maxPassagesPerDoc, this.getDefaultValueForModeParameter(ragRequestDetails.chunkingMode, global.RAGResponseGeneratorConstants.CHUNKING_PARAMETER_MAX_PASSAGES_PER_DOC));
        ragRequestDetails.expansionStrategy = this._resolveParam(groupParams.expansionStrategy, queryDetail.expansionStrategy, global.RAGResponseGeneratorConstants.EXPANSION_STRATEGY_BIDIRECTIONAL);
        ragRequestDetails.snippetExpansionCount = this._resolveParam(groupParams.snippetExpansionCount, queryDetail.snippetExpansionCount, global.RAGResponseGeneratorConstants.SNIPPET_EXPANSION_COUNT); //'3'
        ragRequestDetails.expandedSnippetSize = this._resolveParam(groupParams.expandedSnippetSize, queryDetail.expandedSnippetSize, this.getDefaultValueForModeParameter(ragRequestDetails.chunkingMode, global.RAGResponseGeneratorConstants.CHUNKING_PARAMETER_EXPANDED_SNIPPET_SIZE));

        ragRequestDetails.offset = this._resolveParam(groupParams.offset, queryDetail.offset, 0);
        ragRequestDetails.facetFilters = this._resolveParam(groupParams.facetFilters, queryDetail.facetFilters, []);
        ragRequestDetails.disableSpellCheck = this._resolveParam(groupParams.disableSpellCheck, queryDetail.disableSpellCheck, null);
        ragRequestDetails.debug = this._resolveParam(groupParams.debug, queryDetail.debug, false);
        ragRequestDetails.sortField = this._resolveParam(groupParams.sortField, queryDetail.sortField, global.RAGResponseGeneratorConstants.DEFAULT_SORT_FIELD);
        ragRequestDetails.sortAscending = this._resolveParam(groupParams.sortAscending, queryDetail.sortAscending, false);
        ragRequestDetails.limit = this._resolveParam(groupParams.searchLimit, queryDetail.limit, global.RAGResponseGeneratorConstants.DEFAULT_LIMIT);

        ragRequestDetails.additionalRestParams = this._resolveParam(groupParams.restfulParams, queryDetail.additionalRestParams, undefined);

        return ragRequestDetails;
    },

    createRAGRequest: function(query, searchProfile, sourceDetails, semanticConfigDetails, chunkingDetails, advancedConfigDetails, additionalInfo, ragSources) {
        /* The purpose of applyDynamicFilter is to enforce the hasDynamicFilter check at the search source level.
           To maintain backward compatibility with existing RAG use cases, if this attribute is enabled, the hasDynamicFilter column in the search source will be respected.*/
        if (!ragSources) {
            var ragSource = new sn_search.RAGRetrievalSource()
                .sourceTableName(sourceDetails.tableName)
                .fields(sourceDetails.fieldsToFetch)
                .filter(sourceDetails.applyFilter)
                .condition(sourceDetails.conditions)
                .validateWithSearchProfile(sourceDetails.validateWithSearchProfile)
                .applyDynamicFilter(sourceDetails.applyDynamicFilter);
            ragSources = [ragSource];
        }

        var chunkingFormat = new sn_search.RAGRetrievalChunkingFormat()
            .mode(chunkingDetails.mode)
            .chunkSize(chunkingDetails.chunkSize)
            .chunkUnit(chunkingDetails.chunkUnit)
            .maxPassagesPerDoc(chunkingDetails.maxPassagesPerDoc);

        if (chunkingDetails.mode == global.RAGResponseGeneratorConstants.CHUNKING_MODE_SMALL_TO_BIG) {
            chunkingFormat = chunkingFormat
                .expansionStrategy(chunkingDetails.expansionStrategy)
                .snippetExpansionCount(chunkingDetails.snippetExpansionCount)
                .expandedSnippetSize(chunkingDetails.expandedSnippetSize);
        }

        var semanticConfig = new sn_search.RAGRetrievalSemanticConfiguration()
            .documentMatchCount(semanticConfigDetails.documentMatchCount)
            .documentMatchThreshold(semanticConfigDetails.documentMatchThreshold)
            .embeddingModelId(semanticConfigDetails.embeddingModelId)
            .semanticIndexNames(semanticConfigDetails.semanticIndexNames)
            .mode(semanticConfigDetails.semanticMode)
            .groupBy(semanticConfigDetails.semanticGroupBy);

        if (advancedConfigDetails.addChunkingFormat)
            semanticConfig = semanticConfig.chunkingFormat(chunkingFormat);

        var advancedConfig = new sn_search.RAGRetrievalAdvancedQueryConfiguration()
            .additionalRestParameters(advancedConfigDetails.restParams)
            .includeFeatureVectorsInResponse(advancedConfigDetails.includeFeatureVectors);

        var uiContext = this.signalsContext.uiContext ? (typeof this.signalsContext.uiContext === 'string' ? this.signalsContext.uiContext : JSON.stringify(this.signalsContext.uiContext)) : {};

        var parsedAdditionalContext = JSON.parse(additionalInfo.additionalContext);
        if (this.signalsContext.enableSignalLogging && !parsedAdditionalContext.searchContextConfigId) {
            parsedAdditionalContext.searchContextConfigId = this.signalsContext.searchContextConfigId;
            additionalInfo.additionalContext = JSON.stringify(parsedAdditionalContext);
        }

        var ragRequest = new sn_search.RAGRetrievalRequest()
            .searchProfile(searchProfile)
            .query(query)
            .offset(additionalInfo.offset)
            .limit(sourceDetails.limit)
            .sources(ragSources)
            .advancedQueryConfiguration(advancedConfig)
            .booleanMode(semanticConfigDetails.booleanMode)
            .semanticConfiguration(semanticConfig)
            .locale(additionalInfo.locale)
            .facetFilters(additionalInfo.facetFilters)
            .additionalContext(additionalInfo.additionalContext)
            .debug(additionalInfo.debug)
            .sortField(additionalInfo.sortField)
            .sortAscending(additionalInfo.sortAscending)
            .flattenKBB(false)
            .enableSignalLogging(this.signalsContext.enableSignalLogging)
            .uiContext(uiContext);

        if (additionalInfo.disableSpellCheck !== null)
            ragRequest.disableSpellCheck(additionalInfo.disableSpellCheck);

        var caller = this.caller || this.searchProfileName;
        var callingSource = global.RAGResponseGeneratorConstants.DEFAULT_CALLING_SOURCE;
        ragRequest.ragAnalyticsPayload(new sn_search.RAGAnalyticsPayload()
            .caller(caller)
            .callingSource(callingSource)
        );

        return ragRequest;
    },

    getFormattedResult: function(ragResponse, isGrouped) {
        var resultMap = {};
        if (gs.nil(ragResponse) || gs.nil(ragResponse.getSearchResults))
            return resultMap;

        var searchResults = ragResponse.getSearchResults() || [];
        var tableName = (!gs.nil(searchResults) && searchResults.length > 0) ? searchResults[0].getTable() : '';
        var docType = (!gs.nil(searchResults) && searchResults.length > 0) ? searchResults[0].getDocumentType() : '';
        var aisKbbUtil = new sn_ais_assist.AisKBBUtil();

        var formattedRAGResult = searchResults.map((result) => {
            var sysId = result.getSysId();
            var docId = result.getAisDocId();
            var title = result.getTitle();
            var text = result.getText();
            var table = result.getTable();
            var recordClass = result.getRecordClassName();
            var url = result.getUrl();
            var score = result.getScore();
            var semanticScore = result.getSemanticSimilarity();
            var columns = result.getColumns();
            var documentType = result.getDocumentType();
            var parentTitle = result.getParentTitle();
            var parentSysId = result.getParentSysId();
            var additionalAttributes = result.getAdditionalAttributes();

            /* This is specific to KBB */
            if (documentType == global.RAGResponseGeneratorConstants.DOCUMENT_TYPE_GR && !gs.nil(parentSysId) &&
                recordClass == "kb_knowledge_block" && aisKbbUtil.isKbbEnabledForTable(table))
                sysId = parentSysId + '-' + sysId;

            var response = {};
            response.id = sysId;
            response.ais_doc_id = docId;
            response.title = title;
            response.text = text;
            response.table = table;
            response.recordClass = recordClass;
            response.url = url;
            response.score = score;
            response.semanticScore = semanticScore;
            response.columns = columns;
            response.documentType = documentType;
            response.parentTitle = parentTitle;
            response.parentSysId = parentSysId;
            response.additionalAttributes = additionalAttributes;
            response.portalResolvedUrl = !gs.nil(this.callerContext) && documentType != global.RAGResponseGeneratorConstants.DOCUMENT_TYPE_EXTERNAL ?
                sn_cs.VASystemObject.resolvePortalUrl(
                    recordClass || table,
                    // For attachment document type, we want to refer to the parent record containing the attachment
                    documentType == global.RAGResponseGeneratorConstants.DOCUMENT_TYPE_ATTACHMENT ? parentSysId : sysId,
                    this.callerContext.pageContext) :
                null;

            // Use the modern catalog page id so AIEL renders the new page.
            if (response.portalResolvedUrl && response.portalResolvedUrl.indexOf('id=va_sc_cat_item') !== -1) {
                response.portalResolvedUrl = response.portalResolvedUrl
                    .replace(/id=va_sc_cat_item_guide(&|$)/, 'id=nw_sc_cat_item_guide$1')
                    .replace(/id=va_sc_cat_item(&|$)/, 'id=nw_sc_cat_item$1');
            }

            if (gs.nil(result.getChunks()))
                return response;

            // Map chunks properly and return each chunk object
            var chunks = result.getChunks().map((chunk) => {
                return {
                    chunk_id: chunk.getChunkId(),
                    chunk_text: chunk.getText(),
                    chunk_format: chunk.getChunkFormat(),
                    chunk_score: chunk.getSemanticSimilarityScore()
                };
            });

            response.chunks = chunks;
            return response;
        });

        if (!gs.nil(docType) && docType !== '' && docType == global.RAGResponseGeneratorConstants.DOCUMENT_TYPE_EXTERNAL)
            resultMap[docType] = formattedRAGResult || [];
        else if (isGrouped)
            resultMap["CUSTOM_TABLE"] = formattedRAGResult || [];
        else if (!gs.nil(tableName) && tableName !== '')
            resultMap[tableName] = formattedRAGResult || [];

        return resultMap;
    },

    getDefaultValueForModeParameter: function(mode, parameter) {
        var response = this.chunkingConfiguration;
        var result = null;

        response.forEach(entry => {
            if (entry.mode === mode) {
                entry.applicableParameters.forEach(param => {
                    if (param.internal_name === parameter) {
                        result = param.default_value;
                        return;
                    }
                });
            }
        });
        return result;
    },

    type: 'RAGResponseGenerator'
};
