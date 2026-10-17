const CentralCacheHttpLog = {

    TABLE_NAME: 'sys_og_conversational_cache_http_log',

    TABLE_FIELDS: {
        SYS_ID: 'sys_id',
        SYS_UPDATED_ON: 'sys_updated_on',
        REQUEST_ID: 'request_id',
        CACHE_NAME: 'cache_name',
        STATUS: 'status',
        RESPONSE_HTTP_STATUS: 'response_http_status',
        MESSAGE: 'message',
        VALUE: 'value',
        TTL_SECONDS: 'ttl_seconds',
        ATTRIBUTES: 'attributes'
    },

    STATUS_CHOICES: {
        PROCESSING: 'processing',
        SUCCESS: 'success',
        FAILURE: 'failure'
    },

    /** Instruction returned by claimSetCache(). Not a choice field on the table. */
    ACTIONS: {
        EXECUTE: 'execute',
        REPLAY: 'replay',
        REJECT: 'reject'
    },

	/** sys_nextwave_feature record gating both the log writes and the setCache dedup gate. */
    FEATURE_FLAG: 'com.glide.cs.og.cache_http_log',

    PROPERTIES: {
        RECLAIM_SECONDS: 'com.glide.cs.og.cache.http_log.processing.reclaim.seconds'
    },

    /** max_length is not enforced by the platform, so the cap is applied in code. */
    MESSAGE_MAX_LENGTH: 1000,
    DEFAULT_RECLAIM_SECONDS: 120,
    CONFLICT_HTTP_STATUS: 409,

    /** Runtime log table, not metadata. Never captured in update sets. */
    IS_METADATA: false,

    LOGGER: new global.ConversationalCacheLogger(),

    // =========================================================================
    // CRUD
    // =========================================================================

    initialize: function() {
    },

    /**
     * @param {String} sysId
     * @returns {GlideRecord|null}
     */
    getRecord: function(sysId) {
        if (gs.nil(sysId)) {
            return null;
        }
        const gr = new GlideRecord(this.TABLE_NAME);
        return gr.get(sysId) ? gr : null;
    },

    /**
     * Queries on exactly the columns covered by the unique index.
     *
     * @param {String} requestId
     * @param {String} cacheName
     * @returns {GlideRecord|null}
     */
    getRecordByKey: function(requestId, cacheName) {
        if (gs.nil(requestId) || gs.nil(cacheName)) {
            return null;
        }
        const gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery(this.TABLE_FIELDS.REQUEST_ID, requestId);
        gr.addQuery(this.TABLE_FIELDS.CACHE_NAME, cacheName);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr : null;
    },

    /**
     * @param {Object} fields Keys match TABLE_FIELDS values.
     * @returns {String|null} sys_id, or null when the insert was rejected.
     */
    createRecord: function(fields) {
        const gr = new GlideRecord(this.TABLE_NAME);
        gr.initialize();
        gr.setValue(this.TABLE_FIELDS.REQUEST_ID, fields.request_id);
        gr.setValue(this.TABLE_FIELDS.CACHE_NAME, fields.cache_name);
        gr.setValue(this.TABLE_FIELDS.STATUS, fields.status);
        gr.setValue(this.TABLE_FIELDS.ATTRIBUTES, fields.attributes);
        if (!gs.nil(fields.response_http_status)) {
            gr.setValue(this.TABLE_FIELDS.RESPONSE_HTTP_STATUS, fields.response_http_status);
        }
        if (!gs.nil(fields.message)) {
            gr.setValue(this.TABLE_FIELDS.MESSAGE, this.__message(fields.message));
        }
        if (!gs.nil(fields.value)) {
            gr.setValue(this.TABLE_FIELDS.VALUE, this.__value(fields.value));
        }
        if (!gs.nil(fields.ttl_seconds)) {
            gr.setValue(this.TABLE_FIELDS.TTL_SECONDS, fields.ttl_seconds);
        }
        const sysId = gr.insert();
        return gs.nil(sysId) ? null : sysId;
    },

    /**
     * Only fields present on the object are written.
     *
     * @param {String} sysId
     * @param {Object} fields Keys match TABLE_FIELDS values.
     * @returns {Boolean}
     */
    updateRecord: function(sysId, fields) {
        const gr = this.getRecord(sysId);
        if (!gr) {
            this.LOGGER.error('CentralCacheHttpLog.updateRecord row not found: ' + sysId);
            return false;
        }
        if (!gs.nil(fields.status)) {
            gr.setValue(this.TABLE_FIELDS.STATUS, fields.status);
        }
        if (!gs.nil(fields.response_http_status)) {
            gr.setValue(this.TABLE_FIELDS.RESPONSE_HTTP_STATUS, fields.response_http_status);
        }
        if (!gs.nil(fields.message)) {
            gr.setValue(this.TABLE_FIELDS.MESSAGE, this.__message(fields.message));
        }
        if (!gs.nil(fields.value)) {
            gr.setValue(this.TABLE_FIELDS.VALUE, this.__value(fields.value));
        }
        if (!gs.nil(fields.ttl_seconds)) {
            gr.setValue(this.TABLE_FIELDS.TTL_SECONDS, fields.ttl_seconds);
        }
        if (!gs.nil(fields.attributes)) {
            gr.setValue(this.TABLE_FIELDS.ATTRIBUTES, fields.attributes);
        }
        gr.update();
        return true;
    },

    /**
     * @param {String} sysId
     * @returns {Boolean}
     */
    deleteRecord: function(sysId) {
        const gr = this.getRecord(sysId);
        if (!gr) {
            return false;
        }
        gr.deleteRecord();
        return true;
    },

    // =========================================================================
    // Public API
    // =========================================================================

    /**
     * Default off. The ledger stays inert until deliberately enabled, and CCS-side
     * retry must not be switched on before this returns true.
     *
     * TODO wire to the sys_nextwave_feature flag once its API is confirmed.
     *
     * @returns {Boolean}
     */
    isEnabled: function() {
        return NextwaveFeature.isEnabled(this.FEATURE_FLAG);
    },

    /**
     * Dedup gate for setCache. Returns one of:
     *
     *   { action: EXECUTE, logSysId }  run the set_script, then call resolve()
     *   { action: REPLAY,  response }  return this response, do not execute
     *   { action: REJECT,  httpStatus, message }  identical request in flight
     *
     * Fails open: if the ledger errors, returns EXECUTE with a null logSysId rather
     * than blocking the cache write.
     *
     * @param {String} requestId
     * @param {String} cacheName
     * @param {String} traceId
     * @returns {Object}
     */
    claimSetCache: function(requestId, cacheName, traceId) {
        if (!this.isEnabled() || gs.nil(requestId)) {
            return { action: this.ACTIONS.EXECUTE, logSysId: null };
        }
        try {
            const existing = this.getRecordByKey(requestId, cacheName);
            if (existing) {
                return this.__decide(existing, traceId);
            }

            const sysId = this.createRecord({
                request_id: requestId,
                cache_name: cacheName,
                status: this.STATUS_CHOICES.PROCESSING,
                attributes: this.__attributes(traceId)
            });

            if (!gs.nil(sysId)) {
                return { action: this.ACTIONS.EXECUTE, logSysId: sysId };
            }

            // Insert rejected by the unique index - another request claimed this key
            // first. Follow its state.
            const winner = this.getRecordByKey(requestId, cacheName);
            return winner
                ? this.__decide(winner, traceId)
                : { action: this.ACTIONS.EXECUTE, logSysId: null };

        } catch (err) {
            this.LOGGER.error('CentralCacheHttpLog.claimSetCache failed, failing open: ' + err);
            return { action: this.ACTIONS.EXECUTE, logSysId: null };
        }
    },

    /**
     * Resolve a row claimed by claimSetCache(). Safe to call with a null logSysId.
     *
     * @param {String} logSysId
     * @param {String} status One of STATUS_CHOICES.
     * @param {Object} response Wire response, may be null.
     * @param {Number} httpStatus
     * @returns {Boolean}
     */
    resolve: function(logSysId, status, response, httpStatus) {
        if (!this.isEnabled() || gs.nil(logSysId)) {
            return false;
        }
        response = response || {};
        return this.updateRecord(logSysId, {
            status: status,
            response_http_status: httpStatus,
            message: response.message,
            value: response.value,
            ttl_seconds: response.ttl
        });
    },

    // =========================================================================
    // Internal
    // =========================================================================

    /**
     * Branch on an existing row's status.
     *
     * @param {GlideRecord} gr
     * @param {String} traceId
     * @returns {Object} A claimSetCache() decision.
     */
    __decide: function(gr, traceId) {
        const sysId = gr.getUniqueValue();
        const status = gr.getValue(this.TABLE_FIELDS.STATUS);

        if (status === this.STATUS_CHOICES.SUCCESS) {
            return {
                action: this.ACTIONS.REPLAY,
                response: {
                    cache_name: gr.getValue(this.TABLE_FIELDS.CACHE_NAME),
                    status: this.STATUS_CHOICES.SUCCESS,
                    message: gr.getValue(this.TABLE_FIELDS.MESSAGE) || 'success',
                    value: gr.getValue(this.TABLE_FIELDS.VALUE) || '',
                    ttl: gr.getValue(this.TABLE_FIELDS.TTL_SECONDS),
                    // Current trace_id, not the stored one, so the replay is traceable
                    // to the call that triggered it.
                    trace_id: traceId || 'unknown'
                }
            };
        }

        if (status === this.STATUS_CHOICES.PROCESSING) {
            if (!this.__isStale(gr)) {
                return {
                    action: this.ACTIONS.REJECT,
                    httpStatus: this.CONFLICT_HTTP_STATUS,
                    message: 'an identical request is already in flight'
                };
            }
            this.LOGGER.warn('CentralCacheHttpLog reclaiming stale processing row ' + sysId);
        }

        // Failure, or a reclaimed processing row. Re-execute and update in place.
        this.updateRecord(sysId, { status: this.STATUS_CHOICES.PROCESSING });
        return { action: this.ACTIONS.EXECUTE, logSysId: sysId };
    },

    /**
     * Whether a processing row has outlived the reclaim threshold, which happens when
     * the pod holding it died mid-flight.
     *
     * @param {GlideRecord} gr
     * @returns {Boolean}
     */
    __isStale: function(gr) {
        let seconds = parseInt(gs.getProperty(this.PROPERTIES.RECLAIM_SECONDS,
            String(this.DEFAULT_RECLAIM_SECONDS)), 10);
        if (isNaN(seconds) || seconds <= 0) {
            seconds = this.DEFAULT_RECLAIM_SECONDS;
        }
        const updated = new GlideDateTime(gr.getValue(this.TABLE_FIELDS.SYS_UPDATED_ON));
        const ageMs = (new GlideDateTime()).getNumericValue() - updated.getNumericValue();
        return (ageMs / 1000) > seconds;
    },

    /**
     * setCache impersonates from the x-request-user-id header, so sys_created_by will be
     * the impersonated user rather than the service account. Record the session user so
     * the row stays attributable.
     *
     * @param {String} traceId
     * @returns {String} JSON
     */
    __attributes: function(traceId) {
        return JSON.stringify({
            trace_id: traceId || 'unknown',
            session_user: gs.getUserName()
        });
    },

    /** @returns {String} */
    __message: function(message) {
        return String(message).substring(0, this.MESSAGE_MAX_LENGTH);
    },

    /** Values can arrive as objects - table caches return a record map. @returns {String} */
    __value: function(value) {
        return (typeof value === 'string') ? value : JSON.stringify(value);
    },

    type: 'CentralCacheHttpLog'
};
