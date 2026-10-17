var AttachmentMigrationUtil = Class.create();
AttachmentMigrationUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    startMigration: function() {
        try {
            var response = {};
            var table = this.getParameter('sysparm_table');
            var owner = this.getParameter('sysparm_owner');

            var trackerGR = new GlideRecordSecure('sys_attachment_migration_tracker');
            trackerGR.addQuery('active', true);
            trackerGR.query();
            if (trackerGR.next()) {
                var currentMigrationTable = trackerGR.getValue('table_name');
                response.status = 'error';
                response.message = gs.getMessage('Migration in progress for table: {0}', currentMigrationTable);
                response = JSON.stringify(response);
                return response;
            }

            var tableName = this._getTableName(table);
            if (!tableName) {
                response.status = 'error';
                response.message = gs.getMessage('You do not have access to the table. Please select a valid table.');
                response = JSON.stringify(response);
                return response;
            }
            trackerGR = new GlideRecordSecure('sys_attachment_migration_tracker');
            trackerGR.initialize();
            trackerGR.table_name = tableName;
            trackerGR.owner = owner;
            trackerGR.active = true;
            trackerGR.status = 'in_progress';
            var migrationSysId = trackerGR.insert();
            this._triggerScheduledJob();
            response.status = 'success';
            response.message = gs.getMessage('Migration has started. <br/>You can monitor progress in <b>sys_attachment_migration_tracker</b> table by checking the record with Sys ID: {0}', migrationSysId);
            response = JSON.stringify(response);
            return response;
        } catch (e) {
            gs.error("Migration Utility | Error encountered while starting the migration: " + e);
        }
    },

    enqueueAttachmentBatch: function(tableName, owner) {
        try {
            var lastProcessed = '';
            var migrationSysId;
            var trackerGR = new GlideRecordSecure('sys_attachment_migration_tracker');
            trackerGR.addQuery('active', true);
            trackerGR.query();
            if (trackerGR.next()) {
                lastProcessed = trackerGR.getValue('last_processed_on');
                migrationSysId = trackerGR.sys_id.toString();
            }
            var minBatchSize = 100;
            var maxBatchSize = 500;
            var batchSize = gs.getProperty('glide.attachment.migration.batch_size', minBatchSize);
            if (batchSize < minBatchSize)
                batchSize = minBatchSize;
            else if (batchSize > maxBatchSize)
                batchSize = maxBatchSize;
            var batchInfo = this._getNextBatch(tableName, lastProcessed, batchSize);
            var attachments = batchInfo.attachments;
            lastProcessed = batchInfo.lastCreated;

            if (attachments.length === 0) {
                attachments = this._getNextRetryBatch(tableName, batchSize);
                if (attachments.length === 0) {
                    this._stopMigration(owner);
                    return;
                }
            }

            // Add batch to event queue
            gs.eventQueue('attachment.migration', null, JSON.stringify({
                attachments: attachments,
                owner: owner,
                migration_sys_id: migrationSysId
            }));

            // Update last processed timestamp
            this._updateLastProcessed(lastProcessed);
        } catch (e) {
            gs.error("Migration Utility | Error encountered while adding attachment batch to queue: " + e);
        }
    },

    _triggerScheduledJob: function() {
        try {
            var jobGR = new GlideRecordSecure('sysauto_script');
            if (jobGR.get('name', 'Migrate Attachments to Documents')) {
                SncTriggerSynchronizer.executeNow(jobGR);
            }
        } catch (e) {
            gs.error("Migration Utility | Error encountered while triggerring 'Migrate Attachments to Documents' scheduled job: " + e);
        }
    },

    _getNextBatch: function(tableName, lastProcessed, batchSize) {
        try {
            var attachGR = new GlideRecordSecure('sys_attachment');
            attachGR.addQuery('table_name', tableName);
            if (lastProcessed)
                attachGR.addQuery('sys_created_on', '>', lastProcessed);
            attachGR.orderBy('sys_created_on');
            attachGR.setLimit(batchSize);
            attachGR.query();

            var batch = [];
            var processedSysIds = [];
            var lastCreated = '';
            while (attachGR.next()) {
                batch.push({
                    sys_id: attachGR.sys_id.toString(),
                    file_name: attachGR.file_name.toString(),
                    table_name: tableName,
                    target_record_sys_id: attachGR.table_sys_id.toString()
                });
                processedSysIds.push(attachGR.getUniqueValue());
                lastCreated = attachGR.sys_created_on.getValue();
            }

            // Batch expansion
            attachGR = new GlideRecordSecure('sys_attachment');
            attachGR.addQuery('table_name', tableName);
            attachGR.addQuery('sys_created_on', lastCreated);
            attachGR.addQuery('sys_id', 'NOT IN', processedSysIds);
            attachGR.query();
            while (attachGR.next()) {
                batch.push({
                    sys_id: attachGR.sys_id.toString(),
                    file_name: attachGR.file_name.toString(),
                    table_name: tableName,
                    target_record_sys_id: attachGR.table_sys_id.toString(),
                });
            }
            return {
                attachments: batch,
                lastCreated: lastCreated
            };
        } catch (e) {
            gs.error("Migration Utility | Error encountered while getting the next batch of attachments: " + e);
        }
    },

    _getNextRetryBatch: function(tableName, batchSize) {
        try {
            var maxRetries = 3;
            var statusGR = new GlideRecordSecure('sys_attachment_migration_status');
            statusGR.addQuery('table_name', tableName);
            statusGR.addQuery('status', 'failed');
            statusGR.addQuery('retry_count', '<', maxRetries);
            statusGR.setLimit(batchSize);
            statusGR.query();

            var batch = [];
            while (statusGR.next()) {
                batch.push({
                    sys_id: statusGR.sys_id.toString(),
                    file_name: statusGR.file_name.toString(),
                    table_name: tableName,
                    target_record_sys_id: statusGR.table_sys_id.toString()
                });
            }
            return batch;
        } catch (e) {
            gs.error("Migration Utility | Error encountered while getting the next batch of attachments to retry migration: " + e);
        }
    },

    _updateLastProcessed: function(lastProcessed) {
        try {
            var trackerGR = new GlideRecordSecure('sys_attachment_migration_tracker');
            trackerGR.addQuery('active', true);
            trackerGR.query();
            if (trackerGR.next()) {
                trackerGR.setValue('last_processed_on', lastProcessed);
                trackerGR.update();
            }
        } catch (e) {
            gs.error("Migration Utility | Error encountered while updating the 'Last Processed' time of the batch's last attachment: " + e);
        }
    },

    _stopMigration: function(owner) {
        try {
            var migrationSysId, migrationStatus;
            var trackerGR = new GlideRecordSecure('sys_attachment_migration_tracker');
            trackerGR.addQuery('active', true);
            trackerGR.query();
            if (trackerGR.next()) {
                migrationSysId = trackerGR.sys_id.toString();
                migrationStatus = this._getMigrationStatus(migrationSysId);
                trackerGR.setValue('active', false);
                trackerGR.setValue('status', migrationStatus);
                trackerGR.update();
            }
            gs.eventQueue('attachment.migration.completed', null, owner, migrationSysId);
        } catch (e) {
            gs.error("Migration Utility | Error encountered while stopping the migration: " + e);
        }
    },

    _getTableName: function(tableSysId) {
        try {
            var tableName;
            var tableGR = new GlideRecordSecure('sys_db_object');
            if (tableGR.get(tableSysId)) {
                tableName = tableGR.getValue('name');
                var targetTableGR = new GlideRecordSecure(tableName);
                if (!targetTableGR.canRead())
                    return false;
            }
            return tableName;
        } catch (e) {
            gs.error("Migration Utility | Error encountered while fetching the table name: " + e);
        }
    },

    _getMigrationStatus: function(migrationSysId) {
        try {
            var migrationStatus;
            var hasSuccess = false;
            var hasFailed = false;
            var agg = new GlideAggregate('sys_attachment_migration_status');
            agg.addQuery('migration_sys_id', migrationSysId);
            agg.groupBy('status');
            agg.query();
            if (!agg.hasNext())
                return 'success';
            while (agg.next()) {
                var status = agg.getValue('status');
                if (status === 'successful')
                    hasSuccess = true;
                else if (status === 'failed')
                    hasFailed = true;
            }
            if (hasFailed && hasSuccess)
                migrationStatus = 'partial_success';
            else if (hasSuccess)
                migrationStatus = 'success';
            else
                migrationStatus = 'failed';
            return migrationStatus;
        } catch (e) {
            gs.error("Migration Utility | Error encountered while getting the final state of migration: " + e);
        }
    },

    type: 'AttachmentMigrationUtil'
});
