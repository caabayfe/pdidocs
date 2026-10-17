/**
 * API for reading ECC Queue audited message data.
 * Provides read, query, and statistics operations for the
 * sn_mid_infra_ecc_queue_audited_message and
 * sn_mid_infra_ecc_queue_audited_message_metric tables.
 *
 * @class ECCQueueAuditedMessageAPI
 */
var ECCQueueAuditedMessageAPI = Class.create();
ECCQueueAuditedMessageAPI.prototype = {
    initialize: function () {
        this.validationUtil = undefined;
        // Table names
        this.AUDITED_MESSAGE_TABLE = 'sn_mid_infra_ecc_queue_audited_message';
        this.AUDITED_MESSAGE_METRIC_TABLE = 'sn_mid_infra_ecc_queue_audited_message_metric';

        // Field names for audited message
        this.MESSAGE_FIELDS = {
            TOPIC: 'topic',
            SOURCE: 'source',
            APPLICATION: 'application',
            MID: 'mid',
            LAST_OCCURRENCE: 'last_occurrence'
        };

        // Field names for audited message metric
        this.METRIC_FIELDS = {
            MESSAGE: 'message',
            DECISION: 'decision',
            COUNT: 'count',
            AGGREGATED_ON: 'aggregated_on'
        };

        // Decision enum values
        this.DECISION = {
            ACCEPT: 'accept',
            REJECT: 'reject'
        };

        this.MAX_BULK_UPSERT_ENTRIES = 1000;
    },

    // ========== Audited Message Methods ==========

    /**
     * Gets an audited message by sys_id.
     *
     * @param {string} sysId - sys_id of the audited message.
     * @returns {GlideRecord|null} The audited message record, or null if not found.
     * @throws {InvalidValueError} If sysId fails validation.
     */
    getAuditedMessage: function (sysId) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateSysId(sysId, 'sysId');

        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        if (gr.get(sysId)) {
            return gr;
        }
        return null;
    },

    /**
     * Gets a single audited message by the unique combination of topic, source, and MID server.
     *
     * @param {string} topic - Topic identifier.
     * @param {string} [source] - Source identifier. Optional.
     * @param {string} midSysId - sys_id of the MID server.
     * @returns {GlideRecord|null} The first matching audited message record, or null if not found.
     * @throws {InvalidValueError} If any parameter fails validation.
     */
    getAuditedMessageByTopicSourceMid: function (topic, source, midSysId) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateNonEmptyString(topic, 'topic');
        validationUtil.validateString(source, 'source');
        validationUtil.validateSysId(midSysId, 'midSysId');

        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.addQuery(this.MESSAGE_FIELDS.TOPIC, topic);
        gr.addQuery(this.MESSAGE_FIELDS.SOURCE, source);
        gr.addQuery(this.MESSAGE_FIELDS.MID, midSysId);
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            return gr;
        }
        return null;
    },

    /**
     * Gets all audited messages for a given topic.
     *
     * @param {string} topic - Topic identifier.
     * @param {number} [limit=500] - Maximum number of records to return.
     * @returns {Array<Object>} Array of plain objects with audited message field values.
     * @throws {InvalidValueError} If topic fails validation.
     */
    getAuditedMessageByTopic: function (topic, limit) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateNonEmptyString(topic, 'topic');
        limit = limit || 500;

        var results = [];
        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.addQuery(this.MESSAGE_FIELDS.TOPIC, topic);
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(this._snapshotMessageRecord(gr));
        }
        return results;
    },

    /**
     * Gets all audited messages for a given MID server.
     *
     * @param {string} midSysId - sys_id of the MID server.
     * @param {number} [limit=500] - Maximum number of records to return.
     * @returns {Array<Object>} Array of plain objects with audited message field values.
     * @throws {InvalidValueError} If midSysId fails validation.
     */
    getAuditedMessageByMid: function (midSysId, limit) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateSysId(midSysId, 'midSysId');
        limit = limit || 500;

        var results = [];
        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.addQuery(this.MESSAGE_FIELDS.MID, midSysId);
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(this._snapshotMessageRecord(gr));
        }
        return results;
    },

    /**
     * Gets all audited messages matching a topic and source combination.
     *
     * @param {string} topic - Topic identifier.
     * @param {string} [source] - Source identifier. Optional.
     * @param {number} [limit=500] - Maximum number of records to return.
     * @returns {Array<Object>} Array of plain objects with audited message field values.
     * @throws {InvalidValueError} If topic fails validation.
     */
    getAuditedMessageByTopicAndSource: function (topic, source, limit) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateNonEmptyString(topic, 'topic');
        validationUtil.validateString(source, 'source');
        limit = limit || 500;

        var results = [];
        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.addQuery(this.MESSAGE_FIELDS.TOPIC, topic);
        gr.addQuery(this.MESSAGE_FIELDS.SOURCE, source);
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(this._snapshotMessageRecord(gr));
        }
        return results;
    },

    /**
     * Gets all audited messages matching a topic and MID server combination.
     *
     * @param {string} topic - Topic identifier.
     * @param {string} midSysId - sys_id of the MID server.
     * @param {number} [limit=500] - Maximum number of records to return.
     * @returns {Array<Object>} Array of plain objects with audited message field values.
     * @throws {InvalidValueError} If any parameter fails validation.
     */
    getAuditedMessageByTopicAndMid: function (topic, midSysId, limit) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateNonEmptyString(topic, 'topic');
        validationUtil.validateSysId(midSysId, 'midSysId');
        limit = limit || 500;

        var results = [];
        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.addQuery(this.MESSAGE_FIELDS.TOPIC, topic);
        gr.addQuery(this.MESSAGE_FIELDS.MID, midSysId);
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(this._snapshotMessageRecord(gr));
        }
        return results;
    },

    /**
     * Queries audited messages using a GlideRecord encoded query string.
     *
     * @param {string} [encodedQuery] - Encoded query string (e.g. "topic=foo^mid=bar"). Optional.
     * @param {number} [limit=100] - Maximum number of records to return.
     * @param {string} [orderBy] - Field name to order results by. Optional.
     * @returns {Array<string>} Array of sys_ids for matching records.
     */
    queryAuditedMessages: function (encodedQuery, limit, orderBy) {
        limit = limit || 100;
        var results = [];

        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        if (encodedQuery) {
            gr.addEncodedQuery(encodedQuery);
        }
        if (orderBy) {
            gr.orderBy(orderBy);
        }
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(gr.getUniqueValue());
        }
        return results;
    },

    /**
     * Returns aggregate statistics across all audited messages.
     *
     * @returns {{totalCount: number, byTopic: Object<string, number>}}
     *   totalCount: total number of records;
     *   byTopic: record count keyed by topic;
     */
    getAuditedMessageStats: function () {
        var stats = {
            totalCount: 0,
            byTopic: {},
        };

        var ga = new GlideAggregate(this.AUDITED_MESSAGE_TABLE);
        ga.addAggregate('COUNT');
        ga.groupBy(this.MESSAGE_FIELDS.TOPIC);
        ga.query();

        while (ga.next()) {
            var topic = ga.getValue(this.MESSAGE_FIELDS.TOPIC);
            var count = parseInt(ga.getAggregate('COUNT'));

            stats.totalCount += count;

            if (!stats.byTopic[topic]) {
                stats.byTopic[topic] = 0;
            }
            stats.byTopic[topic] += count;
        }

        return stats;
    },

    // ========== Audited Message Metric Methods ==========

    /**
     * Gets an audited message metric by sys_id.
     *
     * @param {string} sysId - sys_id of the metric record.
     * @returns {GlideRecord|null} The metric record, or null if not found.
     * @throws {InvalidValueError} If sysId fails validation.
     */
    getAuditedMessageMetric: function (sysId) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateSysId(sysId, 'sysId');

        var gr = new GlideRecord(this.AUDITED_MESSAGE_METRIC_TABLE);
        if (gr.get(sysId)) {
            return gr;
        }
        return null;
    },

    /**
     * Gets all metric records for a given audited message.
     *
     * @param {string} messageSysId - sys_id of the parent audited message.
     * @param {number} [limit=500] - Maximum number of records to return.
     * @returns {Array<Object>} Array of plain objects with metric field values.
     * @throws {InvalidValueError} If messageSysId fails validation.
     */
    getAuditedMessageMetricsByMessage: function (messageSysId, limit) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateSysId(messageSysId, 'messageSysId');
        limit = limit || 500;

        var results = [];
        var gr = new GlideRecord(this.AUDITED_MESSAGE_METRIC_TABLE);
        gr.addQuery(this.METRIC_FIELDS.MESSAGE, messageSysId);
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(this._snapshotMetricRecord(gr));
        }
        return results;
    },

    /**
     * Gets a single metric record by the unique combination of message, decision, and aggregation date.
     *
     * @param {string} messageSysId - sys_id of the parent audited message.
     * @param {string} decision - Decision value; must be 'accept' or 'reject'.
     * @param {string} aggregatedOn - Aggregation date (GlideDate string, e.g. "2026-01-01").
     * @returns {GlideRecord|null} The metric record, or null if not found.
     * @throws {InvalidValueError} If any parameter fails validation.
     */
    getAuditedMessageMetricByMessageDecisionDate: function (messageSysId, decision, aggregatedOn) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateSysId(messageSysId, 'messageSysId');
        validationUtil.validateNonEmptyString(decision, 'decision');
        validationUtil.validateOneOf(decision, [this.DECISION.ACCEPT, this.DECISION.REJECT], 'decision');
        validationUtil.validateNonEmptyString(aggregatedOn, 'aggregatedOn');

        var gr = new GlideRecord(this.AUDITED_MESSAGE_METRIC_TABLE);
        gr.addQuery(this.METRIC_FIELDS.MESSAGE, messageSysId);
        gr.addQuery(this.METRIC_FIELDS.DECISION, decision);
        gr.addQuery(this.METRIC_FIELDS.AGGREGATED_ON, aggregatedOn);
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            return gr;
        }
        return null;
    },

    /**
     * Queries audited message metrics using a GlideRecord encoded query string.
     *
     * @param {string} [encodedQuery] - Encoded query string. Optional.
     * @param {number} [limit=100] - Maximum number of records to return.
     * @param {string} [orderBy] - Field name to order results by. Optional.
     * @returns {Array<string>} Array of sys_ids for matching records.
     */
    queryAuditedMessageMetrics: function (encodedQuery, limit, orderBy) {
        limit = limit || 100;
        var results = [];

        var gr = new GlideRecord(this.AUDITED_MESSAGE_METRIC_TABLE);
        if (encodedQuery) {
            gr.addEncodedQuery(encodedQuery);
        }
        if (orderBy) {
            gr.orderBy(orderBy);
        }
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            results.push(gr.getUniqueValue());
        }
        return results;
    },

    /**
     * Returns aggregate statistics for all metrics linked to a given audited message.
     *
     * @param {string} messageSysId - sys_id of the parent audited message.
     * @param {number} [limit=500] - Maximum number of metric rows to process.
     * @returns {{totalCount: number, accept: number, reject: number, byDate: Object<string, {accept: number, reject: number}>}}
     *   totalCount: sum of all counts;
     *   accept: sum of counts for accepted decisions;
     *   reject: sum of counts for rejected decisions;
     *   byDate: per-date breakdown keyed by aggregated_on value.
     * @throws {InvalidValueError} If messageSysId fails validation or a stored decision is not a valid value.
     */
    getAuditedMessageMetricStats: function (messageSysId, limit) {
        var validationUtil = this._getValidationUtil();
        validationUtil.validateSysId(messageSysId, 'messageSysId');
        limit = limit || 500;

        var stats = {
            totalCount: 0,
            accept: 0,
            reject: 0,
            byDate: {}
        };

        var gr = new GlideRecord(this.AUDITED_MESSAGE_METRIC_TABLE);
        gr.addQuery(this.METRIC_FIELDS.MESSAGE, messageSysId);
        gr.setLimit(limit);
        gr.query();

        while (gr.next()) {
            var decision = gr.getValue(this.METRIC_FIELDS.DECISION);
            validationUtil.validateOneOf(decision, [this.DECISION.ACCEPT, this.DECISION.REJECT], 'decision');
            var count = parseInt(gr.getValue(this.METRIC_FIELDS.COUNT)) || 0;
            var date = gr.getValue(this.METRIC_FIELDS.AGGREGATED_ON);

            stats.totalCount += count;

            if (decision === this.DECISION.ACCEPT) {
                stats.accept += count;
            } else {
                stats.reject += count;
            }

            if (!stats.byDate[date]) {
                stats.byDate[date] = { accept: 0, reject: 0 };
            }
            if (decision === this.DECISION.ACCEPT) {
                stats.byDate[date].accept += count;
            } else {
                stats.byDate[date].reject += count;
            }
        }

        return stats;
    },

    // ========== Bulk Upsert Methods ==========

    /**
     * Bulk inserts or updates audited messages and their associated metric rows.
     *
     * Each entry in `payload.messages` is matched against
     * `sn_mid_infra_ecc_queue_audited_message` by the unique
     * (`topic`, `source`, `mid`) combination — inserted if absent, otherwise updated.
     * Each `metrics` entry under that message is matched against
     * `sn_mid_infra_ecc_queue_audited_message_metric` by the unique
     * (`message`, `decision`, `aggregated_on`) combination and is similarly
     * inserted or updated.
     *
     * @param {Object} payload
     * @param {Array<Object>} payload.messages - Array of audited message entries.
     *   Each entry: `{ topic, source?, application?, mid, last_occurrence, metrics? }`.
     *   Each metric: `{ decision: 'accept'|'reject', count: number, aggregated_on: 'YYYY-MM-DD' }`.
     * @returns {{processed: number, results: Array<Object>}} Per-entry result objects with `sysId`,
     *   `action` ('inserted' or 'updated'), and a `metrics` array carrying the same shape per metric.
     * @throws {Error|InvalidValueError} If `payload.messages` is not an array, or any entry fails validation.
     */
    bulkUpsertAuditedMessages: function (payload) {
        var validationUtil = this._getValidationUtil();
        if (!payload || !Array.isArray(payload.messages)) {
            throw new InvalidValueError('Invalid value for payload.messages: must be an array');
        }
        if (payload.messages.length > this.MAX_BULK_UPSERT_ENTRIES) {
            throw new InvalidValueError("Invalid value for messages: array must not exceed " + this.MAX_BULK_UPSERT_ENTRIES + ' entries');
        }

        // Phase 1: validate every entry before touching the DB.
        // Throwing here prevents any writes, giving all-or-nothing semantics without GlideTransaction.
        for (var i = 0; i < payload.messages.length; i++) {
            var entry = payload.messages[i];
            this._validateMessageEntry(entry, validationUtil);
            this._validateEntryMetrics(entry, validationUtil);
        }

        // Phase 2: write. Validation already passed; any error here is an unexpected DB failure.
        try {
            var results = [];
            for (var i = 0; i < payload.messages.length; i++) {
                var entry = payload.messages[i];
                var msgResult = this._upsertAuditedMessage(entry);
                var metricResults = [];
                if (Array.isArray(entry.metrics)) {
                    for (var j = 0; j < entry.metrics.length; j++) {
                        metricResults.push(
                            this._upsertAuditedMessageMetric(msgResult.sysId, entry.metrics[j])
                        );
                    }
                }
                msgResult.metrics = metricResults;
                results.push(msgResult);
            }
            return { processed: results.length, results: results };
        } catch (e) {
            gs.error('[ECCQueueAuditedMessageAPI] bulkUpsertAuditedMessages failed: ' + String(e && e.message ? e.message : e));
            throw e;
        }
    },

    /**
     * Validates all fields of a single audited message entry before any database writes.
     *
     * @param {Object} entry - The message entry to validate.
     * @param {string} entry.topic - Topic identifier. Must be a non-empty string.
     * @param {string} [entry.source] - Source identifier. May be empty or omitted.
     * @param {string} [entry.application] - sys_id of the ECC agent application. When present and non-null, must be a valid 32-character sys_id.
     * @param {string} entry.mid - sys_id of the MID server. Must be a valid 32-character sys_id.
     * @param {string} entry.last_occurrence - Timestamp of the last occurrence. Must be a {@code YYYY-MM-DD} date
     *   or {@code YYYY-MM-DD HH:MM:SS} datetime string — the prefix is consumed by the cross-field
     *   {@code aggregated_on} comparison and by the monotonic {@code last_occurrence} guard, both of which depend
     *   on lexicographic ordering being equivalent to chronological ordering.
     * @param {Object} validationUtil - ValidationUtility instance to use for field checks.
     * @throws {InvalidValueError} If any required field is missing, empty, or fails format validation.
     * @private
     */
    _validateMessageEntry: function (entry, validationUtil) {
        validationUtil.validateNonEmptyString(entry.topic, 'topic');
        validationUtil.validateString(entry.source, 'source');
        validationUtil.validateSysId(entry.mid, 'mid');
        if (entry.application !== undefined && entry.application !== null) {
            validationUtil.validateSysId(entry.application, 'application');
        }
        validationUtil.validateNonEmptyString(entry.last_occurrence, 'last_occurrence');
        if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(entry.last_occurrence)) {
            throw new InvalidValueError('Invalid value for last_occurrence: must be a date in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format');
        }
    },

    /**
     * Validates every metric entry on a message and enforces the cross-field invariant that no
     * metric's {@code aggregated_on} date may exceed the parent message's {@code last_occurrence}
     * date — otherwise the message would appear to have metric activity after its last-seen time.
     *
     * @param {Object} entry - The pre-validated message entry whose metrics are to be checked.
     * @param {Object} validationUtil - ValidationUtility instance to use for field checks.
     * @throws {InvalidValueError} If any metric is malformed or violates the date invariant.
     * @private
     */
    _validateEntryMetrics: function (entry, validationUtil) {
        if (!Array.isArray(entry.metrics)) {
            return;
        }
        var occDate = String(entry.last_occurrence).slice(0, 10);
        for (var k = 0; k < entry.metrics.length; k++) {
            var metricEntry = entry.metrics[k];
            this._validateEntryMetric(metricEntry, validationUtil);
            if (metricEntry.aggregated_on > occDate) {
                throw new InvalidValueError(
                    'Invalid value for metric.aggregated_on: ' + metricEntry.aggregated_on +
                    ' is later than last_occurrence date ' + occDate);
            }
        }
    },

    /**
     * Inserts or updates a single audited message row matched by (topic, source, mid).
     * Caller must have already validated {@code entry} via {@link _validateMessageEntry}.
     * If a matching row exists it is updated in place; otherwise a new row is inserted.
     *
     * @param {Object} entry - Pre-validated message entry (see {@link _validateMessageEntry}).
     * @returns {{sysId: string, topic: string, source: string, mid: string, action: string}}
     *   Result object where {@code action} is {@code 'inserted'} or {@code 'updated'}.
     * @throws {Error} If the underlying GlideRecord write is denied (ACL failure).
     * @private
     */
    _upsertAuditedMessage: function (entry) {
        // undefined/null source canonicalized to '' for consistent (topic, source, mid) matching
        var source = entry.source || '';
        var existing = this._findAuditedMessage(entry.topic, source, entry.mid);
        return existing
            ? this._updateAuditedMessageRow(existing, entry, source)
            : this._insertAuditedMessageRow(entry, source);
    },

    /**
     * Looks up the audited message row matched by (topic, source, mid).
     *
     * @returns {GlideRecord|null} Positioned GlideRecord if found, otherwise null.
     * @private
     */
    _findAuditedMessage: function (topic, source, midSysId) {
        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.addQuery(this.MESSAGE_FIELDS.TOPIC, topic);
        gr.addQuery(this.MESSAGE_FIELDS.SOURCE, source);
        gr.addQuery(this.MESSAGE_FIELDS.MID, midSysId);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr : null;
    },

    /**
     * Applies caller-supplied fields to an existing audited message row and updates it.
     *
     * {@code last_occurrence} is monotonic non-decreasing: a stale or replayed batch carrying an
     * older timestamp will not move the stored value backward, preserving the invariant that
     * {@code last_occurrence} is on or after the latest metric {@code aggregated_on}.
     *
     * No-op writes are suppressed: if neither {@code application} nor {@code last_occurrence} would
     * actually change, {@code gr.update()} is skipped so we don't bump {@code sys_updated_on},
     * fire business rules, or reset auto-flush age on a stale/replayed batch.
     *
     * @private
     */
    _updateAuditedMessageRow: function (gr, entry, source) {
        var dirty = false;
        if (entry.application !== undefined && entry.application !== null) {
            var priorApp = String(gr.getValue(this.MESSAGE_FIELDS.APPLICATION) || '');
            if (String(entry.application) !== priorApp) {
                gr.setValue(this.MESSAGE_FIELDS.APPLICATION, entry.application);
                dirty = true;
            }
        }
        var prior = String(gr.getValue(this.MESSAGE_FIELDS.LAST_OCCURRENCE) || '');
        if (entry.last_occurrence > prior) {
            gr.setValue(this.MESSAGE_FIELDS.LAST_OCCURRENCE, entry.last_occurrence);
            dirty = true;
        }
        var resultSysId = gr.getUniqueValue();
        if (dirty) {
            resultSysId = gr.update();
            if (!resultSysId) {
                throw new Error('Failed to update audited message in ' + this.AUDITED_MESSAGE_TABLE + ' (likely cause: caller lacks the required role)');
            }
        }
        return this._buildAuditedMessageResult(resultSysId, entry, source, 'updated');
    },

    /**
     * Inserts a new audited message row using the canonicalized field values.
     *
     * @private
     */
    _insertAuditedMessageRow: function (entry, source) {
        var gr = new GlideRecord(this.AUDITED_MESSAGE_TABLE);
        gr.initialize();
        gr.setValue(this.MESSAGE_FIELDS.TOPIC, entry.topic);
        gr.setValue(this.MESSAGE_FIELDS.SOURCE, source);
        if (entry.application !== undefined && entry.application !== null) {
            gr.setValue(this.MESSAGE_FIELDS.APPLICATION, entry.application);
        }
        gr.setValue(this.MESSAGE_FIELDS.MID, entry.mid);
        gr.setValue(this.MESSAGE_FIELDS.LAST_OCCURRENCE, entry.last_occurrence);
        var resultSysId = gr.insert();
        if (!resultSysId) {
            throw new Error('Failed to insert audited message into ' + this.AUDITED_MESSAGE_TABLE + ' (likely cause: caller lacks the required role)');
        }
        return this._buildAuditedMessageResult(resultSysId, entry, source, 'inserted');
    },

    _buildAuditedMessageResult: function (sysId, entry, source, action) {
        return {
            sysId: String(sysId),
            topic: entry.topic,
            source: source,
            mid: entry.mid,
            action: action
        };
    },

    /**
     * Validates all fields of a single metric entry before any database writes.
     *
     * @param {Object} metricEntry - The metric entry to validate.
     * @param {'accept'|'reject'} metricEntry.decision - Decision value. Must be exactly {@code 'accept'} or {@code 'reject'}.
     * @param {string} metricEntry.aggregated_on - Aggregation date. Must be a non-empty string in {@code YYYY-MM-DD} format.
     * @param {number} metricEntry.count - Event count. Must be a non-negative integer.
     * @param {Object} validationUtil - ValidationUtility instance to use for field checks.
     * @throws {InvalidValueError} If any field is missing, has the wrong type, or fails format validation.
     * @private
     */
    _validateEntryMetric: function (metricEntry, validationUtil) {
        if (!metricEntry || typeof metricEntry !== 'object') {
            throw new InvalidValueError('Invalid value for metric: entry must be an object');
        }
        validationUtil.validateOneOf(metricEntry.decision, [this.DECISION.ACCEPT, this.DECISION.REJECT], 'decision');
        validationUtil.validateNonEmptyString(metricEntry.aggregated_on, 'aggregated_on');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(metricEntry.aggregated_on)) {
            throw new InvalidValueError('Invalid value for aggregated_on: must be a date in YYYY-MM-DD format');
        }
        var count = parseInt(metricEntry.count, 10);
        if (isNaN(count) || count < 0) {
            throw new InvalidValueError('Invalid value for metric.count: must be a non-negative integer');
        }
    },

    /**
     * Inserts or updates a single metric row matched by (message, decision, aggregated_on).
     * The supplied {@code count} is always added to the existing stored count on update; it is
     * never replaced. If no matching row exists a new row is inserted with the supplied count.
     *
     * @param {string} messageSysId - sys_id of the parent audited message row.
     * @param {Object} metricEntry - Pre-validated metric entry (see {@link _validateEntryMetric}).
     * @returns {{sysId: string, decision: string, aggregated_on: string, count: number, action: string}}
     *   Result object where {@code count} is the stored value after accumulation and {@code action}
     *   is {@code 'inserted'} or {@code 'updated'}.
     * @throws {Error} If the underlying GlideRecord write is denied (ACL failure).
     * @private
     */
    _upsertAuditedMessageMetric: function (messageSysId, metricEntry) {
        var count = parseInt(metricEntry.count, 10);

        var gr = new GlideRecord(this.AUDITED_MESSAGE_METRIC_TABLE);
        gr.addQuery(this.METRIC_FIELDS.MESSAGE, messageSysId);
        gr.addQuery(this.METRIC_FIELDS.DECISION, metricEntry.decision);
        gr.addQuery(this.METRIC_FIELDS.AGGREGATED_ON, metricEntry.aggregated_on);
        gr.setLimit(1);
        gr.query();

        var action;
        var storedCount;
        var resultSysId;
        if (gr.next()) {
            var existing = parseInt(gr.getValue(this.METRIC_FIELDS.COUNT), 10) || 0;
            storedCount = existing + count;
            gr.setValue(this.METRIC_FIELDS.COUNT, storedCount);
            resultSysId = gr.update();
            if (!resultSysId) {
                throw new Error('Failed to update metric in ' + this.AUDITED_MESSAGE_METRIC_TABLE + ' (likely cause: caller lacks the required role)');
            }
            action = 'updated';
        } else {
            gr.initialize();
            gr.setValue(this.METRIC_FIELDS.MESSAGE, messageSysId);
            gr.setValue(this.METRIC_FIELDS.DECISION, metricEntry.decision);
            gr.setValue(this.METRIC_FIELDS.AGGREGATED_ON, metricEntry.aggregated_on);
            gr.setValue(this.METRIC_FIELDS.COUNT, count);
            resultSysId = gr.insert();
            if (!resultSysId) {
                throw new Error('Failed to insert metric into ' + this.AUDITED_MESSAGE_METRIC_TABLE + ' (likely cause: caller lacks the required role)');
            }
            storedCount = count;
            action = 'inserted';
        }
        return {
            sysId: String(resultSysId),
            decision: metricEntry.decision,
            aggregated_on: metricEntry.aggregated_on,
            count: storedCount,
            action: action
        };
    },

    // ========== Private Helper Methods ==========

    /**
     * Snapshots all field values from a positioned audited message GlideRecord cursor into a plain object.
     * The caller is responsible for ensuring {@code gr.next()} has already been called successfully.
     *
     * @param {GlideRecord} gr - A positioned {@code sn_mid_infra_ecc_queue_audited_message} cursor.
     * @returns {{sys_id: string, topic: string, source: string, application: string, mid: string, last_occurrence: string}}
     * @private
     */
    _snapshotMessageRecord: function (gr) {
        return {
            sys_id: gr.getUniqueValue(),
            topic: gr.getValue(this.MESSAGE_FIELDS.TOPIC),
            source: gr.getValue(this.MESSAGE_FIELDS.SOURCE),
            application: gr.getValue(this.MESSAGE_FIELDS.APPLICATION),
            mid: gr.getValue(this.MESSAGE_FIELDS.MID),
            last_occurrence: gr.getValue(this.MESSAGE_FIELDS.LAST_OCCURRENCE)
        };
    },

    /**
     * Snapshots all field values from a positioned metric GlideRecord cursor into a plain object.
     * The caller is responsible for ensuring {@code gr.next()} has already been called successfully.
     *
     * @param {GlideRecord} gr - A positioned {@code sn_mid_infra_ecc_queue_audited_message_metric} cursor.
     * @returns {{sys_id: string, message: string, decision: string, count: string, aggregated_on: string}}
     * @private
     */
    _snapshotMetricRecord: function (gr) {
        return {
            sys_id: gr.getUniqueValue(),
            message: gr.getValue(this.METRIC_FIELDS.MESSAGE),
            decision: gr.getValue(this.METRIC_FIELDS.DECISION),
            count: gr.getValue(this.METRIC_FIELDS.COUNT),
            aggregated_on: gr.getValue(this.METRIC_FIELDS.AGGREGATED_ON)
        };
    },

    /**
     * Returns a lazily-initialized ValidationUtility instance.
     *
     * @returns {ValidationUtility} Shared ValidationUtility instance.
     * @private
     */
    _getValidationUtil: function () {
        if (this.validationUtil === undefined) {
            this.validationUtil = new ValidationUtility();
        }
        return this.validationUtil;
    },

    type: 'ECCQueueAuditedMessageAPI'
};
