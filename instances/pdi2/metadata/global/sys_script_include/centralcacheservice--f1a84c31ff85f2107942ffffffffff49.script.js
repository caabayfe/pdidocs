var CentralCacheService = Class.create();
CentralCacheService.prototype = {
    initialize: function() {
        this._configTable = 'sys_og_conversational_cache_configuration';
        this._cols = {
            domain_enabled: 'domain_enabled',
            cache_name: 'cache_name',
            language_separated: 'language_separated',
            get_script: 'get_script',
            set_script: 'set_script',
            table: 'table',
            type: 'type',
            active: 'active',
            encoded_query: 'encoded_query',
            fields_to_include: 'fields_to_include',
            dependent_tables: 'dependent_tables',
            ttl: 'ttl'
        };
        this._limit = parseInt(gs.getProperty("com.glide.cs.og.cache.table.record.limit", 200));
        this._logger = new global.ConversationalCacheLogger();
        this._getScriptExecutionTimeMs = 0;
        this._setScriptExecutionTimeMs = 0;
    },

    getCache: function(cacheRequest) {
        var traceId = cacheRequest.trace_id || 'unknown';
        this._logger.setContext(cacheRequest ? cacheRequest.trace_id : '', this._extractConversation(cacheRequest ? cacheRequest.cache_name : ''));
        var response = {
            cache_name: '',
            status: '',
            message: '',
            value: {},
            ttl: '',
            trace_id: traceId
        };

        if (!cacheRequest || !cacheRequest.cache_name) {
            this._logger.error('CentralCacheService.getCache: missing cache_name. trace_id={0}', traceId);
            response.status = 'failure';
            response.message = 'missing cache_name';
            return response;
        }

        this._logger.debug('CentralCacheService.getCache: cache_name={0}, trace_id={1}', cacheRequest.cache_name, traceId);
        var cacheResult = this.getCacheByCacheName(cacheRequest.cache_name, traceId);
        if (cacheResult == null) {
            this._logger.error('CentralCacheService.getCache: unable to generate cache. cache_name={0}, trace_id={1}', cacheRequest.cache_name, traceId);
            response.status = 'failure';
            response.message = 'unable to generate cache for this request';
            return response;
        }

        this._logger.debug('CentralCacheService.getCache: success. cache_name={0}, trace_id={1}', cacheRequest.cache_name, traceId);
        response.cache_name = cacheRequest.cache_name;
        response.value = cacheResult.value;
        response.ttl = cacheResult.ttl;
        response.status = 'success';
        response.message = 'success';
        response.script_execution_time_ms = this._getScriptExecutionTimeMs;
        return response;
    },

    getCacheByCacheName: function(cache_name, traceId) {
        traceId = traceId || 'unknown';
        var parsedCacheKey = this._parseCacheKey(cache_name);
        this._logger.debug('Parsed cache key - baseName: {0}, params: {1}, trace_id={2}', parsedCacheKey.baseName, JSON.stringify(parsedCacheKey.params), traceId);

        var cacheConfig = this._getCacheConfig(parsedCacheKey.baseName, traceId);
        if (!cacheConfig) {
            return null;
        }
        cacheConfig.dynamicParams = parsedCacheKey.params;
        var cacheValue = this._getCacheFromConfig(cacheConfig, traceId);
        if (cacheValue == null) {
            return null;
        }
        return {
            value: cacheValue,
            ttl: cacheConfig.ttl
        };
    },

    setCache: function(cacheRequest) {
        var traceId = cacheRequest.trace_id || 'unknown';
        this._logger.setContext(cacheRequest ? cacheRequest.trace_id : '', this._extractConversation(cacheRequest ? cacheRequest.cache_name : ''));
        var response = {
            cache_name: '',
            status: '',
            message: '',
            value: {},
            ttl: '',
            trace_id: traceId
        };

        if (!cacheRequest || !cacheRequest.cache_name) {
            this._logger.error('CentralCacheService.setCache: missing cache_name. trace_id={0}', traceId);
            response.status = 'failure';
            response.message = 'missing cache_name';
            return response;
        }

        this._logger.debug('CentralCacheService.setCache: cache_name={0}, trace_id={1}', cacheRequest.cache_name, traceId);

        // Dedup gate. Both batch and single writes route through here, so a batch gets one
        // claim per cache_name under the batch's shared request_id.
        var claim = CentralCacheHttpLog.claimSetCache(cacheRequest.request_id, cacheRequest.cache_name, traceId);

        if (claim.action === CentralCacheHttpLog.ACTIONS.REJECT) {
            this._logger.warn('CentralCacheService.setCache: duplicate in flight. cache_name={0}, trace_id={1}', cacheRequest.cache_name, traceId);
            response.cache_name = cacheRequest.cache_name;
            response.status = 'failure';
            response.message = claim.message;
            // Lifted out and stripped by the operation script, which turns it into the
            // response status. Same pattern as script_execution_time_ms.
            response.http_status = claim.httpStatus;
            return response;
        }

        if (claim.action === CentralCacheHttpLog.ACTIONS.REPLAY) {
            this._logger.debug('CentralCacheService.setCache: replaying prior result, set_script not executed. cache_name={0}, trace_id={1}', cacheRequest.cache_name, traceId);
            return claim.response;
        }

        var cacheValue;
        try {
            cacheValue = this.setCacheByCacheName(cacheRequest, traceId);
        } catch (err) {
            // Release the claim so the next attempt retries immediately instead of waiting
            // out the staleness reclaim. Rethrown so the operation script still yields 500.
            CentralCacheHttpLog.resolve(claim.logSysId, CentralCacheHttpLog.STATUS_CHOICES.FAILURE, {
                message: 'failed to set cache: ' + err
            }, 500);
            throw err;
        }

        this._logger.debug('CentralCacheService.setCache: cache_name={0}, response:{1}, trace_id={2}', cacheRequest.cache_name, cacheValue, traceId);

        response.cache_name = cacheRequest.cache_name;
        response.ttl = cacheRequest.ttl || '';
        response.script_execution_time_ms = this._setScriptExecutionTimeMs;
        response.status = 'success';
        response.message = 'success';
        response.value = cacheValue;
        CentralCacheHttpLog.resolve(claim.logSysId, CentralCacheHttpLog.STATUS_CHOICES.SUCCESS, response, 200);
        return response;
    },

    isBatchRequest: function(body) {
        return body && body.requests && Array.isArray(body.requests);
    },
    processBatchGetCache: function(requests, traceId, originalDomain, originalLanguage) {
        var results = [];
        var scriptExecutionTimeMs = 0;

        for (var i = 0; i < requests.length; i++) {
            var entry = requests[i];
            var cacheRequest = {
                cache_name: String(entry.cacheName),
                language: entry.language ? String(entry.language) : '',
                domain: entry.domain ? String(entry.domain) : '',
                userId: entry.userId ? String(entry.userId) : '',
                trace_id: traceId
            };

            // Set domain and language context for this specific entry
            if (!gs.nil(cacheRequest.domain) && cacheRequest.domain != originalDomain)
                gs.getSession().setDomainID(cacheRequest.domain);
            if (!gs.nil(cacheRequest.language) && cacheRequest.language != originalLanguage)
                gs.getSession().setLanguage(cacheRequest.language);

            try {
                var result = this.getCache(cacheRequest);
                if (result.script_execution_time_ms) {
                    scriptExecutionTimeMs += result.script_execution_time_ms;
                    delete result.script_execution_time_ms;
                }
                results.push(result);
            } catch (err) {
                gs.error('Central Cache API batch getCache error for key [{0}]: {1}', entry.cacheName, err);
                results.push({
                    cache_name: entry.cacheName,
                    status: 'failure',
                    message: 'failed to get cache: ' + err,
                    trace_id: traceId
                });
            } finally {
                // Restore original session context after each entry
                gs.getSession().setDomainID(originalDomain);
                gs.getSession().setLanguage(originalLanguage);
            }
        }

        return {
            results: results,
            script_execution_time_ms: scriptExecutionTimeMs
        };
    },
    processBatchSetCache: function(requests, traceId, originalDomain, originalLanguage, originalUser, user, requestId) {
        var results = [];
        var scriptExecutionTimeMs = 0;

        for (var i = 0; i < requests.length; i++) {
            var entry = requests[i];
            var cacheRequest = {
                cache_name: String(entry.cacheName),
                language: entry.language ? String(entry.language) : '',
                domain: entry.domain ? String(entry.domain) : '',
                userId: entry.userId ? String(entry.userId) : '',
                value: entry.value ? String(entry.value) : '',
                request_id: requestId,
                trace_id: traceId
            };

            // Set user context if provided
            if (!gs.nil(user)) {
                gs.getSession().impersonate(user);
            }
            // Domain/language must apply regardless of impersonation - an impersonated
            // session defaults to the user's home domain, which can differ from the
            // domain the conversation is actually running in (e.g. MSP users with
            // access to multiple domains). Compare against the session's current
            // domain (post-impersonation), not originalDomain - the session always
            // starts as the nextwave-service integration user, so originalDomain is
            // the service account's domain, not the impersonated user's.
            if (!gs.nil(cacheRequest.domain) && cacheRequest.domain != gs.getSession().getCurrentDomainID())
                gs.getSession().setDomainID(cacheRequest.domain);
            if (!gs.nil(cacheRequest.language) && cacheRequest.language != gs.getSession().getLanguage())
                gs.getSession().setLanguage(cacheRequest.language);

            try {
                var result = this.setCache(cacheRequest);
                if (result.script_execution_time_ms) {
                    scriptExecutionTimeMs += result.script_execution_time_ms;
                    delete result.script_execution_time_ms;
                }
                results.push(result);
            } catch (err) {
                gs.error('Central Cache API batch setCache error for key [{0}]: {1}', entry.cacheName, err);
                results.push({
                    cache_name: entry.cacheName,
                    status: 'failure',
                    message: 'failed to set cache: ' + err,
                    trace_id: traceId
                });
            } finally {
                // Restore original session context after each entry
                gs.getSession().impersonate(originalUser);
                gs.getSession().setDomainID(originalDomain);
                gs.getSession().setLanguage(originalLanguage);
            }
        }

        return {
            results: results,
            script_execution_time_ms: scriptExecutionTimeMs
        };
    },

    setCacheByCacheName: function(cacheRequest, traceId) {
        traceId = traceId || 'unknown';
        var cache_name = cacheRequest.cache_name;
        var cache_value = cacheRequest.value;
        var parsedCacheKey = this._parseCacheKey(cache_name);
        this._logger.debug('Parsed cache key - baseName: {0}, params: {1}, trace_id={2}', parsedCacheKey.baseName, JSON.stringify(parsedCacheKey.params), traceId);

        var cacheConfig = this._getCacheConfig(parsedCacheKey.baseName, traceId);
        if (!cacheConfig) {
            return null;
        }
        cacheConfig.dynamicParams = parsedCacheKey.params;
        cacheRequest.ttl = cacheConfig.ttl;
        return this._populateScriptedCache(cacheConfig, cacheConfig.dynamicParams, cache_value, traceId);
    },

    _getCacheFromConfig: function(cacheConfig, traceId) {
        traceId = traceId || 'unknown';
        switch (String(cacheConfig.type)) {
            case 'table':
                return this._generateTableCache(cacheConfig, cacheConfig.dynamicParams, traceId);
            case 'scripted':
                return this._generateScriptedCache(cacheConfig, cacheConfig.dynamicParams, traceId);
            default:
                return null;
        }
    },

    _generateScriptedCache: function(cacheConfig, dynamicParams, traceId) {
        traceId = traceId || 'unknown';
        var scriptVars = dynamicParams || {};
        scriptVars.trace_id = traceId;
        return this._executeScriptForScriptedCache(cacheConfig, scriptVars, 'get_script', traceId);
    },

    _populateScriptedCache: function(cacheConfig, dynamicParams, cache_value, traceId) {
        traceId = traceId || 'unknown';
        var scriptVars = dynamicParams || {};
        scriptVars.cache_value = cache_value;
        scriptVars.trace_id = traceId;
        return this._executeScriptForScriptedCache(cacheConfig, scriptVars, 'set_script', traceId);
    },

    _executeScriptForScriptedCache: function(cacheConfig, scriptVars, scriptColumnName, traceId) {
        traceId = traceId || 'unknown';
        var startTime = new GlideDateTime().getNumericValue();
        var executionTimeMs = 0;
        try {
            var cacheConfigGr = new GlideRecord(this._configTable);
            cacheConfigGr.get(cacheConfig.id);
            var evaluator = new GlideScopedEvaluator(); // or GlideScopedEvaluator() in scoped apps
            var result = evaluator.evaluateScript(cacheConfigGr, scriptColumnName, scriptVars);
            var endTime = new GlideDateTime().getNumericValue();
            executionTimeMs = endTime - startTime;
            if (scriptColumnName === 'get_script') {
                this._getScriptExecutionTimeMs = executionTimeMs;
            } else if (scriptColumnName === 'set_script') {
                this._setScriptExecutionTimeMs = executionTimeMs;
            }
            this._logger.debug('CentralCacheService._executeScriptForScriptedCache {0} execution time: {1}ms, cache_name={2}, trace_id={3}', scriptColumnName, executionTimeMs, cacheConfig.cache_name, traceId);
            return result;
        } catch (e) {
            var endTime = new GlideDateTime().getNumericValue();
            executionTimeMs = endTime - startTime;
            if (scriptColumnName === 'get_script') {
                this._getScriptExecutionTimeMs = executionTimeMs;
            } else if (scriptColumnName === 'set_script') {
                this._setScriptExecutionTimeMs = executionTimeMs;
            }
            this._logger.error('CentralCacheService._executeScriptForScriptedCache {0}: {1} (execution time: {2}ms), cache_name={3}, trace_id={4}', scriptColumnName, e.message, executionTimeMs, cacheConfig.cache_name, traceId);
            throw e;
        }
    },

    _generateTableCache: function(cacheConfig, dynamicParams, traceId) {
        traceId = traceId || 'unknown';
        if (!cacheConfig.table) {
            this._logger.error('CentralCacheService._generateTableCache: missing table config. trace_id={0}', traceId);
            return null;
        }
        var associatedGr = new GlideRecord(cacheConfig.table);
        var values = {};
        associatedGr.setLimit(this._limit);
        var encodedQuery = this._substituteQueryParams(cacheConfig.encoded_query, dynamicParams, traceId);
        if (encodedQuery === null) {
            this._logger.error('CentralCacheService._generateTableCache: Failed to substitute query parameters. trace_id={0}', traceId);
            return null;
        }
        this._logger.debug('Substituted query: {0}, trace_id={1}', encodedQuery, traceId);
        associatedGr.addEncodedQuery(encodedQuery);
        associatedGr.query();
        while (associatedGr.next()) {
            values[associatedGr.getUniqueValue()] = this._gatherRecordData(associatedGr, cacheConfig.fields_to_include || "");
        }
        return values;
    },

    _gatherRecordData: function(associatedGr, fields_to_include) {
        var recordData = {};
        var fieldList = fields_to_include.split(',').map(function(item) {
                return item.trim();
            })
            .filter(function(item) {
                return item.length > 0;
            });
        var elements = associatedGr.getElements();
        for (var i = 0; i < elements.size(); i++) {
            var el = elements.get(i);
            if (fieldList.length > 0) {
                // if list is not empty, include only mentioned fields
                if (fieldList.includes(el.getName())) {
                    recordData[el.getName()] = el.getValue();
                }
            } else {
                recordData[el.getName()] = el.getValue();
            }
        }
        return recordData;
    },

    _getCacheConfig: function(cache_name, traceId) {
        traceId = traceId || 'unknown';
        var c = this._cols;
        var cfg = new GlideRecord(this._configTable);
        cfg.addQuery(c.cache_name, cache_name);
        cfg.addActiveQuery();
        cfg.setLimit(this._limit);
        cfg.query();
        if (!cfg.next()) {
            this._logger.debug('No configuration found for given cache name: {0}, trace_id={1}', cache_name, traceId);
            return null;
        }
        return {
            cache_name: cfg.getValue(c.cache_name),
            id: cfg.getUniqueValue(),
            type: cfg.getValue(c.type),
            get_script: cfg.getValue(c.get_script),
            set_script: cfg.getValue(c.set_script),
            language_separated: cfg.getValue(c.language_separated) == 1,
            table: cfg.getValue(c.table),
            encoded_query: cfg.getValue(c.encoded_query) || '',
            active: cfg.getValue(c.active) == 1,
            domain_enabled: cfg.getValue(c.domain_enabled) == 1,
            fields_to_include: cfg.getValue(c.fields_to_include),
            dependent_tables: cfg.getValue(c.dependent_tables),
            ttl: cfg.getValue(c.ttl)
        };
    },

    /**
     * Extracts the conversation id from a cache key for logging context.
     * Conversation-scoped caches use a key like "conversation:<id>" or a param named
     * "conversation_id:<id>" (e.g. lastReadMessage), which _parseCacheKey turns into
     * params.conversation / params.conversation_id. Returns '' when the key carries none.
     */
    _extractConversation: function(cache_name) {
        if (!cache_name) {
            return '';
        }
        var parsed = this._parseCacheKey(cache_name);
        if (!parsed || !parsed.params) {
            return '';
        }
        return parsed.params.conversation || parsed.params.conversation_id || '';
    },

    /**
     * Parses a cache key into base name and dynamic parameters
     * Format: base_name or key1:value1|key2:value2 or static_part|key1:value1|key2:value2
     * Examples:
     *   - "get_all_agents" -> {baseName: "get_all_agents", params: {}}
     *   - "agent:123abc" -> {baseName: "agent:{agent}", params: {agent: "123abc"}}
     *   - "agent:123abc|workflow:456def" -> {baseName: "agent:{agent}|workflow:{workflow}", params: {agent: "123abc", workflow: "456def"}}
     *   - "get_agents_workflow|agent:123abc|workflow:456def" -> {baseName: "get_agents_workflow|agent:{agent}|workflow:{workflow}", params: {agent: "123abc", workflow: "456def"}}
     */
    _parseCacheKey: function(cacheKey) {
        var result = {
            baseName: cacheKey,
            params: {}
        };

        if (!cacheKey || cacheKey.indexOf(':') === -1) {
            return result;
        }

        // Split by pipe to get individual parts
        var parts = cacheKey.split('|');
        var baseNameParts = [];

        // Parse all parts - they can be static (no colon) or dynamic (key:value)
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var separatorIndex = part.indexOf(':');
            if (separatorIndex > -1) {
                // Dynamic part: key:value
                var key = part.substring(0, separatorIndex).trim();
                var value = part.substring(separatorIndex + 1).trim();
                if (key) {
                    result.params[key] = value;
                    // Build base name with placeholder
                    baseNameParts.push(key + ':{' + key + '}');
                }
            } else {
                // Static part: no colon, use as-is
                baseNameParts.push(part.trim());
            }
        }

        // Construct the base name template
        if (baseNameParts.length > 0) {
            result.baseName = baseNameParts.join('|');
        }

        return result;
    },

    /**
     * Substitutes dynamic parameters in encoded query
     * Replaces placeholders like {agent} with actual values from dynamicParams
     * Example: "sys_id={agent}^active=true" with params {agent: "123abc"} -> "sys_id=123abc^active=true"
     * Returns null if required placeholders are missing
     */
    _substituteQueryParams: function(encodedQuery, dynamicParams, traceId) {
        traceId = traceId || 'unknown';
        if (!encodedQuery) {
            return encodedQuery;
        }

        // If no dynamic params but query has placeholders, check if any are required
        if (!dynamicParams) {
            if (encodedQuery.indexOf('{') > -1) {
                this._logger.warn('CentralCacheService._substituteQueryParams: Query contains placeholders but no parameters provided: {0}, trace_id={1}', encodedQuery, traceId);
            }
            return encodedQuery;
        }

        var result = encodedQuery;
        var missingPlaceholders = [];

        // Find all placeholders in the query
        var placeholderRegex = /\{([^}]+)\}/g;
        var match;
        var requiredKeys = {};
        while ((match = placeholderRegex.exec(encodedQuery)) !== null) {
            requiredKeys[match[1]] = true;
        }

        // Check for missing placeholders
        for (var requiredKey in requiredKeys) {
            if (requiredKeys.hasOwnProperty(requiredKey)) {
                if (!dynamicParams.hasOwnProperty(requiredKey)) {
                    missingPlaceholders.push(requiredKey);
                }
            }
        }

        if (missingPlaceholders.length > 0) {
            this._logger.error('CentralCacheService._substituteQueryParams: Missing required parameters: {0}, trace_id={1}', missingPlaceholders.join(', '), traceId);
            return null;
        }

        // Substitute parameters with sanitized values
        for (var key in dynamicParams) {
            if (dynamicParams.hasOwnProperty(key)) {
                var placeholder = '{' + key + '}';
                var value = this._sanitizeQueryValue(dynamicParams[key]);
                // Replace all occurrences of the placeholder
                while (result.indexOf(placeholder) > -1) {
                    result = result.replace(placeholder, value);
                }
            }
        }

        return result;
    },

    /**
     * Sanitizes a value to be used in an encoded query
     * Prevents injection by escaping special characters
     */
    _sanitizeQueryValue: function(value) {
        if (!value) {
            return '';
        }
        var sanitized = String(value);
        // Escape special characters that could break the query
        // ServiceNow encoded query uses ^ for AND, ^OR for OR, = for equals
        // We need to escape these to prevent injection
        sanitized = sanitized.replace(/\^/g, '^^');
        return sanitized;
    },

    type: 'CentralCacheService'
};
