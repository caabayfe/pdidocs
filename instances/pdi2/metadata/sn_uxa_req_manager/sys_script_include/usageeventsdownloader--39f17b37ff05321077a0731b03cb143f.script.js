var UsageEventsDownloader = Class.create();
UsageEventsDownloader.prototype = Object.extendsObject(UXADownloader, {
    // Constants
    TABLE_NAME: 'sys_uxa_event',
    SYSTEM_USER: 'system',
    LOG_PREFIX: '[UsageEventsDownloader] ',
    EVENT_LAST_DOWNLOAD_TIME_PROPERTY_NAME: 'sn_uxa_req_manager.downloader.eventlastdownloadtime',
	SET_LAST_DOWNLOAD_TIME_PROPRTY_VALUE: new GlideDateTime().getNumericValue(),

    // Field constants
    FIELD_EVENT_ID: 'event_id',
    FIELD_APPLICATION_ID: 'application_id',
    FIELD_DESCRIPTION: 'description',
    FIELD_DISPLAY_NAME: 'display_name',
    FIELD_TAGGED_EVENT_PROPERTIES: 'tagged_event_properties',
    FIELD_FINGERPRINT: 'fingerprint',
    FIELD_FINGERPRINT_ID: 'fingerprint_id',
    FIELD_PAGE_ID: 'page_id',
    FIELD_TYPE: 'type',
    FIELD_ACTIVE: 'active',
    FIELD_SYS_CREATED_BY: 'sys_created_by',
    FIELD_SYS_UPDATED_BY: 'sys_updated_by',

    initialize: function() {
        UXADownloader.prototype.initialize.call(this);
    },

    // ========== OVERRIDE REQUIRED GETTERS =========
    getCallerName: function() {
        return 'UsageEventsDownloader';
    },

    getEndpoint: function() {
        return '/api/now/uxaeventsdetailservice/getEventDetails';
    },

    getHttpMethod: function() {
        return 'GET';
    },

    getHeaders: function() {
        return {
            'version': 'v1',
			'eventlastdownloadtime': gs.getProperty(this.EVENT_LAST_DOWNLOAD_TIME_PROPERTY_NAME)
		};
    },

    downloadAndProcessResult: function() {
        var data = this.download();
        if (!data) {
            gs.warn(this.LOG_PREFIX + 'No data retrieved');
            return false;
        }

        // Process downloaded data
        this._processData(data);

        // Post-processing hook
        this._postProcess();

        return true;
    },

    _processData: function(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        if (data && data.result && Array.isArray(data.result)) {
            data = data.result;
        }
        if (!Array.isArray(data) || data.length === 0) {
            gs.info(this.LOG_PREFIX + 'No records to process');
            return 0;
        }

        var startTime = Date.now();
        var stats = {
            inserted: 0,
            updated: 0,
            skipped: 0,
            deleted: 0,
            errors: 0
        };

        // Collect event_ids
        var eventIds = [];
        var deleteEventIds = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].event_id) {
                eventIds.push(data[i].event_id);
                var active = data[i].active;
                if (active === 0 || active === false || active === '0') {
                    deleteEventIds.push(data[i].event_id);
                }
            }
        }

        // Query existing records
        var existingRecords = this._queryExistingRecords(eventIds);

        // Separate data
        var activeData = [];
        for (var i = 0; i < data.length; i++) {
            var active = data[i].active;
            if (active !== 0 && active !== false && active !== '0') {
                activeData.push(data[i]);
            }
        }

        // Process
        stats = this._processInserts(activeData, existingRecords, stats);
        stats = this._processUpdates(activeData, existingRecords, stats);
        stats = this._processDeletes(deleteEventIds, existingRecords, stats);

        // Log results
        var endTime = Date.now();
        var durationSec = Math.round((endTime - startTime) / 10) / 100;
        gs.info(this.LOG_PREFIX + 'Processed ' + data.length + ' records (' + durationSec + 's) - Inserted: ' + stats.inserted + ', Updated: ' + stats.updated + ', Skipped: ' + stats.skipped + ', Deleted: ' + stats.deleted + ', Errors: ' + stats.errors);

    },

    _queryExistingRecords: function(eventIds) {
        var existingRecords = {};
        if (eventIds.length > 0) {
            var gr = new GlideRecord(this.TABLE_NAME);
            gr.addQuery(this.FIELD_EVENT_ID, 'IN', eventIds);
            gr.query();
            while (gr.next()) {
                var eventId = gr.getValue(this.FIELD_EVENT_ID);
                var createdBy = gr.getValue(this.FIELD_SYS_CREATED_BY);
                var updatedBy = gr.getValue(this.FIELD_SYS_UPDATED_BY);
                var shouldSkip = (createdBy !== this.SYSTEM_USER || updatedBy !== this.SYSTEM_USER);
                existingRecords[eventId] = {
                    sys_id: gr.getUniqueValue(),
                    shouldSkip: shouldSkip
                };
            }
        }
        return existingRecords;
    },

    _processInserts: function(activeData, existingRecords, stats) {
        for (var i = 0; i < activeData.length; i++) {
            var sourceRecord = activeData[i];
            var existing = existingRecords[sourceRecord.event_id];
            if (existing) continue; // Skip if exists

            try {
                var gr = new GlideRecord(this.TABLE_NAME);
                gr.initialize();
                gr.setWorkflow(false);
                this._setFields(gr, sourceRecord);
                var result = gr.insert();
                if (result) {
                    stats.inserted++;
                } else {
                    stats.errors++;
                }
            } catch (e) {
                stats.errors++;
            }
        }
        return stats;
    },

    _processUpdates: function(activeData, existingRecords, stats) {
        var updateSysIds = [];
        var updateDataMap = {};
        for (var i = 0; i < activeData.length; i++) {
            var sourceRecord = activeData[i];
            var existing = existingRecords[sourceRecord.event_id];
            if (!existing) continue; // Skip if not exists
        
            if (existing.shouldSkip) {
                stats.skipped++;
                continue;
            }

            updateSysIds.push(existing.sys_id);
            updateDataMap[existing.sys_id] = sourceRecord;
            stats.updated++;
        }

        if (updateSysIds.length > 0) {
            try {
                var updateGr = new GlideRecord(this.TABLE_NAME);
                updateGr.addQuery('sys_id', 'IN', updateSysIds);
                updateGr.query();
                while (updateGr.next()) {
                    var sysId = updateGr.getUniqueValue();
                    var sourceRecord = updateDataMap[sysId];
                    updateGr.setWorkflow(false);
                    this._setFields(updateGr, sourceRecord);
                }
                updateGr.updateMultiple();
            } catch (e) {
                stats.errors += updateSysIds.length;
            }
        }
        return stats;
    },

    _processDeletes: function(deleteEventIds, existingRecords, stats) {
        var finalDeleteEventIds = [];
        for (var i = 0; i < deleteEventIds.length; i++) {
            var eventId = deleteEventIds[i];
            var existing = existingRecords[eventId];
            if (existing && !existing.shouldSkip) {
                finalDeleteEventIds.push(eventId);
            } else if (existing && existing.shouldSkip) {
                stats.skipped++;
            }
        }
        if (finalDeleteEventIds.length > 0) {
            try {
                var deleteGr = new GlideRecord(this.TABLE_NAME);
                deleteGr.addQuery(this.FIELD_EVENT_ID, 'IN', finalDeleteEventIds);
                deleteGr.deleteMultiple();
                stats.deleted = finalDeleteEventIds.length;
            } catch (e) {
                stats.errors += finalDeleteEventIds.length;
            }
        }
        return stats;
    },

    // Helper function to set fields
    _setFields: function(gr, sourceRecord) {
        gr.setValue(this.FIELD_EVENT_ID, sourceRecord.event_id);
        gr.setValue(this.FIELD_ACTIVE, true);
        gr.setValue(this.FIELD_APPLICATION_ID, sourceRecord.appsee_sysid);
        gr.setValue(this.FIELD_DESCRIPTION, sourceRecord.description);
        gr.setValue(this.FIELD_DISPLAY_NAME, sourceRecord.display_name == null ? '' : String(sourceRecord.display_name));
        gr.setValue(this.FIELD_TAGGED_EVENT_PROPERTIES, sourceRecord.tagged_event_properties);
        gr.setValue(this.FIELD_FINGERPRINT, sourceRecord.fingerprint);
        gr.setValue(this.FIELD_FINGERPRINT_ID, sourceRecord.fingerprint_id);
        gr.setValue(this.FIELD_PAGE_ID, sourceRecord.page_id);
        gr.setValue(this.FIELD_TYPE, sourceRecord.fingerprint ? 'oob_tagged' : 'default');
    },

    /**
     * Post-processing hook for custom operations
     * Override this method in extended implementations if needed
     * @private
     */
    _postProcess: function() {
        // Extension point for post-processing operations
        gs.setProperty(this.EVENT_LAST_DOWNLOAD_TIME_PROPERTY_NAME, this.SET_LAST_DOWNLOAD_TIME_PROPRTY_VALUE);
        gs.debug('UsageEventsDownloader: Post-processing completed (' + this.getCallerName() + ')');
    },

    type: 'UsageEventsDownloader'
});
