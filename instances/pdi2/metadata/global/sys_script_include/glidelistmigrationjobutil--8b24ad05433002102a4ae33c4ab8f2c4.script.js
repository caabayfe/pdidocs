/** Represents a util to migrate glide list references in the archive tables. Before X, we were copying the display values
 * for glide_list type columns during archiving which has been changed in X to copy the actual field value.
 * This class is created to migrate the old records which were already archived before X.
 * **/
var GlideListMigrationJobUtil = Class.create();
GlideListMigrationJobUtil.prototype = {
    initialize: function() {
        this.MIGRATION_JOB_PREFIX = "glidelist.migrationjob: ";
        this.MIGRATION_TRIGGER = "glidelist.migrationjob.trigger.";
        this.MIGRATION_MARKER = "glidelist.migrationjob.marker.";
        this.MIGRATION_COMPLETE = "glidelist.migrationjob.complete.";
        this.MIGRATION_MARKER_SEPARATOR = ";";
        this.SYS_STATUS = "sys_status";
        this.NAME = "name";
        this.VALUE = "value";
        this.SYS_ARCHIVE_LOG = "sys_archive_log";
        this.SYS_ARCHIVED = "sys_archived";
        this.SYS_DICTIONARY = "sys_dictionary";
        this.ELEMENT = "element";
        this.INTERNAL_TYPE = "internal_type";
        this.REFERENCE = "reference";
        this.SYS_TRIGGER = "sys_trigger";
        this.TRIGGER_TYPE = "trigger_type";
        this.SYS_ID = "sys_id";
        this.NUMBER_OF_DAYS_TO_LOOK = 5; //This optimizes the query. The bigger the number, the bigger the row scans.
        //Do not set the following to a lower value which can cause conflicts based on the archive timestamp.
        //e.g. Setting this to 5 will likely cause issues as there could be multiple records archived at the same timestamp.
        this.MAX_RECORDS_MIGRATION = 10000;
    },

    /**
     * Creates a migration job trigger for each passed in archive table if one does not exist already.
     * This method accepts an array of archive table names.
     *
     * Example Usage: 
     * var tables = ["ar_incident", "ar_table2"];//list of tables to do the migration for
     * new GlideListMigrationJobUtil().setupMigration(tables);
     * **/
    setupMigration: function(arTables) {
        for (var i = 0; i < arTables.length; i++) {
            var tableName = arTables[i];
            if (!this._isValid(tableName)) {
                gs.error(MIGRATION_JOB_PREFIX + "Invalid table or not a archive table: " + tableName);
                continue;
            }

            var fields = this._getGlideListFields(tableName);
            if (!fields) {
                gs.error(MIGRATION_JOB_PREFIX + "Table: " + tableName + " does not have any glide_list columns");
                continue;
            }

            this._scheduleJob(tableName, fields);
        }
    },

    /**
     * Copies the glide list field names raw value from the payload xml to the archive table.
     * After the migration is succesful, it does copy the glide list reference element in sys_dictionary.
     * This method gets called by the trigger job repeatly until the migration is complet, in which case the 
     * trigger gets removed eventually by this method. 
     * 
     * Example Usage:
     * new GlideListMigrationJobUtil().migrate("ar_incident", "watch_list,work_notes_list");
     * **/
    migrate: function(arTableName, fieldNames) {
        if (this._getSysStatusValue(this.MIGRATION_COMPLETE + arTableName)) {
            gs.info(this.MIGRATION_JOB_PREFIX + "Table " + arTableName + " is already migrated");
            return;
        }
        gs.info(this.MIGRATION_JOB_PREFIX + "Starting migration run for " + arTableName);
        var fields = fieldNames.split(',');
        var marker = this._getMarker(arTableName);

        if (this._allFieldsCopied(arTableName, marker)) {
            gs.info(this.MIGRATION_JOB_PREFIX + "All glide list fields are copied!!");
            this._clean(arTableName);
            gs.info(this.MIGRATION_JOB_PREFIX + "Migration Done!!!");
            return;
        }

        this._migrateNextChunks(arTableName, fields, marker);
        gs.info(this.MIGRATION_JOB_PREFIX + "Finishing migration run for " + arTableName);
    },

    _allFieldsCopied: function(arTableName, marker) {
        if (!marker) return true; //This should not happen

        var markerList = marker.split(this.MIGRATION_MARKER_SEPARATOR);
        if (markerList.length > 1) {
            var lastArchivedDateTime = new GlideDateTime(markerList[0]);
            var oldestArchiveDateTime = new GlideDateTime(this._getOldestArchivedDateTime(arTableName));
            return lastArchivedDateTime.onOrBefore(oldestArchiveDateTime);
        }

        return false;
    },

    _clean: function(arTableName) {
        var triggerSysId = this._getSysStatusValue(this.MIGRATION_TRIGGER + arTableName);
        var triggerGr = new GlideRecord(this.SYS_TRIGGER);
        if (triggerGr.get(triggerSysId)) {
            triggerGr.setValue(this.TRIGGER_TYPE, 0); //run once
            triggerGr.update();
            gs.log(this.MIGRATION_JOB_PREFIX + "updating trigger with name: " + triggerGr.getValue(this.NAME) + " to run once");
        }

        this._removeMarker(this.MIGRATION_TRIGGER + arTableName);
        this._removeMarker(this.MIGRATION_MARKER + arTableName);
        this._createSysStatus(this.MIGRATION_COMPLETE + arTableName, "Migration Complete");
    },

    _migrateNextChunks: function(arTableName, fields, marker) {
        var markerInfo = marker.split(this.MIGRATION_MARKER_SEPARATOR);
        var dateTimeMarker = markerInfo[0];
        var lastMigratedArchiveDateTime = '';
        var lastSysIdMigrated = '';
        var migrationCount = 0;

        try {
            var archiveTableGr = this._getArchiveTableGr(arTableName, fields, dateTimeMarker);
            while (archiveTableGr.next()) {
                lastMigratedArchiveDateTime = archiveTableGr.getValue(this.SYS_ARCHIVED);
                lastSysIdMigrated = archiveTableGr.getUniqueValue();

                var archiveLogGr = new GlideRecord(this.SYS_ARCHIVE_LOG);
                archiveLogGr.addQuery('id', archiveTableGr.getUniqueValue());
                archiveLogGr.addNullQuery('restored');
                archiveLogGr.query();

                if (archiveLogGr.next()) {
                    gs.info(this.MIGRATION_JOB_PREFIX + 'Migrating id:' + archiveTableGr.getUniqueValue());
                    var payloadXML = new GlideXMLDocument();
                    payloadXML.parse(archiveLogGr.getValue('payload'));

                    for (var i = 0; i < fields.length; i++) {
                        var referencedValue = payloadXML.selectSingleNodeText('//' + fields[i]);
                        if (!referencedValue) {
                            gs.log(this.MIGRATION_JOB_PREFIX + 'No field value in archive log with glide_list name: ' + fields[i]);
                            continue;
                        }

                        archiveTableGr.setValue(fields[i], referencedValue);
                    }

                    if (archiveTableGr.update())
                        migrationCount++;
                }
            }
        } finally {
            gs.info(this.MIGRATION_JOB_PREFIX + 'Number of records migrated in this run:' + migrationCount);
            if (!lastMigratedArchiveDateTime || migrationCount == 0 || dateTimeMarker == lastMigratedArchiveDateTime)
                lastMigratedArchiveDateTime = this._getEndMarker(dateTimeMarker);

            this._saveMarker(arTableName, lastMigratedArchiveDateTime + this.MIGRATION_MARKER_SEPARATOR + lastSysIdMigrated);
        }
    },

    _getEndMarker: function(startMarker) {
        var endMarker = new GlideDateTime(startMarker);
        endMarker.addDays(-this.NUMBER_OF_DAYS_TO_LOOK);
        return endMarker;
    },

    _getArchiveTableGr: function(arTableName, fields, startMarker) {
        var archiveTableGr = new GlideRecord(arTableName);
        archiveTableGr.addQuery(this.SYS_ARCHIVED, '<=', startMarker);
        var endMarker = this._getEndMarker(startMarker);
        archiveTableGr.addQuery(this.SYS_ARCHIVED, '>=', endMarker);

        var first = archiveTableGr.addNotNullQuery(fields[0]); //We always have atleast one field
        for (var index = 1; index < fields.length; index++)
            first.addOrCondition(fields[index], "!=", 'NULL');

        archiveTableGr.orderByDesc(this.SYS_ARCHIVED);
        archiveTableGr.setLimit(this.MAX_RECORDS_MIGRATION);
        archiveTableGr.query();

        return archiveTableGr;
    },

    _saveMarker: function(arTableName, newMarker) {
        gs.info(this.MIGRATION_JOB_PREFIX + "Saving new marker:" + newMarker + " for table:" + arTableName);
        var gr = new GlideRecord(this.SYS_STATUS);
        gr.addQuery(this.NAME, this.MIGRATION_MARKER + arTableName);
        gr.query();
        if (gr.next()) {
            gr.setValue(this.VALUE, newMarker);
            gr.update();
        } else
            gs.error(this.MIGRATION_JOB_PREFIX + "sys_status for migration job does not exist");
    },

    _getMarker: function(arTableName) {
        var name = this.MIGRATION_MARKER + arTableName;
        var statusValue = this._getSysStatusValue(name);
        if (statusValue) return statusValue;

        var initialMarker = this._getLatestArchivedDateTime(arTableName);
        initialMarker += this.MIGRATION_MARKER_SEPARATOR;
        this._createSysStatus(name, initialMarker);
        return initialMarker;
    },

    _removeMarker: function(statusName) {
        var gr = this._getSysStatusGr(statusName);
        gr.next();
        gr.deleteRecord();
    },

    _getSysStatusValue: function(statusName) {
        var gr = this._getSysStatusGr(statusName);
        if (gr.next())
            return gr.getValue(this.VALUE);

        return "";
    },

    _getSysStatusGr: function(statusName) {
        var gr = new GlideRecord(this.SYS_STATUS);
        gr.addQuery(this.NAME, statusName);
        gr.query();
        return gr;
    },

    _getLatestArchivedDateTime: function(arTableName) {
        return this._getBorderArchivedDateTime(arTableName, false);
    },

    _getOldestArchivedDateTime: function(arTableName) {
        return this._getBorderArchivedDateTime(arTableName, true);
    },

    _getBorderArchivedDateTime: function(arTableName, oldest) {
        var archiveTable = new GlideRecord(arTableName);
        if (oldest)
            archiveTable.orderBy(this.SYS_ARCHIVED);
        else
            archiveTable.orderByDesc(this.SYS_ARCHIVED);
        archiveTable.setLimit(1);
        archiveTable.query();
        return archiveTable.next() ? archiveTable.getValue(this.SYS_ARCHIVED) : "";
    },

    _scheduleJob: function(arTableName, fields) {
        var hourly = 60 * 60 * 1000;
        var when = new GlideDateTime();
        when.addSeconds(60);
        var triggerName = this.MIGRATION_JOB_PREFIX + arTableName;
        if (!this._isTriggerExists(arTableName)) {
            gs.log(this.MIGRATION_JOB_PREFIX + 'creating trigger for table: ' + arTableName);
            var trigger = new GlideRecord(this.SYS_TRIGGER);
            trigger.initialize();
            trigger.setValue('state', 0);
            trigger.setValue(this.TRIGGER_TYPE, 1);
            trigger.setValue('repeat', new GlideDuration(hourly));
            trigger.setValue('next_action', when);
            trigger.setValue(this.NAME, triggerName);
            trigger.setValue('script', "new GlideListMigrationJobUtil().migrate('" + arTableName + "', '" + fields + "');");
            trigger.setWorkflow(false);
            trigger.setRunEngines(false);

            var sysId = trigger.insert();
            this._createSysStatus(this.MIGRATION_TRIGGER + arTableName, sysId);
            gs.log(this.MIGRATION_JOB_PREFIX + 'created trigger for table: ' + arTableName + ' with sys_id: ' + sysId);
        } else
            gs.warn(this.MIGRATION_JOB_PREFIX + "trigger with name " + triggerName + " arleady exists");
    },

    _isTriggerExists: function(arTableName) {
        var triggerSysId = this._getSysStatusValue(this.MIGRATION_TRIGGER + arTableName);
        var triggerGr = new GlideRecord(this.SYS_TRIGGER);
        return triggerGr.get(triggerSysId);
    },

    _createSysStatus: function(name, value) {
        var sysStatusGr = new GlideRecord(this.SYS_STATUS);
        sysStatusGr.initialize();
        sysStatusGr.setValue(this.NAME, name);
        sysStatusGr.setValue(this.VALUE, value);
        sysStatusGr.insert();
    },

    _isValid: function(arTableName) {
        if (!arTableName.startsWith('ar_')) return false;
        var archiveTableGr = new GlideRecord(arTableName);
        if (!archiveTableGr.isValid()) return false;

        return true;
    },

    _getGlideListFields: function(arTableName) {
        var dictionaryGr = new GlideRecord(this.SYS_DICTIONARY);
        dictionaryGr.addQuery(this.NAME, arTableName);
        dictionaryGr.addQuery(this.INTERNAL_TYPE, 'glide_list');
        dictionaryGr.query();
        var fields = [];
        while (dictionaryGr.next())
            fields.push(dictionaryGr.getValue(this.ELEMENT));

        return fields.join();
    },

    type: 'GlideListMigrationJobUtil'
};
