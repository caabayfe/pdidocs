var SOURCE = 'PF_Post_Clone_Cleanup';
var currentStep = 'not started';

function events_pfLogInfo(step, message) {
    gs.info('[' + SOURCE + '] [' + gs.nowDateTime() + '] [' + step + '] ' + message);
}

function events_pfLogWarn(step, message) {
    gs.info('[' + SOURCE + '] [' + gs.nowDateTime() + '] [' + step + '] [WARN] ' + message);
}

function events_pfLogErr(step, message) {
    gs.info('[' + SOURCE + '] [' + gs.nowDateTime() + '] [' + step + '] [ERROR] ' + message);
}


try {
    deleteProcessingFrameworkTriggers();

    dedupeTable('sysevent_queue', ['queue'], '202-Deduplicate-Queues');

    dedupeTable('sysevent_queue_param', ['queue', 'name'], '203-Deduplicate-Params');

    reprovisionQueues();

    events_pfLogInfo('SUMMARY', 'All 4 cleanup steps completed successfully.');

} catch (e) {
    events_pfLogErr(currentStep, 'Cleanup ABORTED: ' + e.message + (e.stack ? ('\n' + e.stack) : ''));
}

// ============================================================
// 201: Delete Processing Framework Triggers
// ============================================================
function deleteProcessingFrameworkTriggers() {
    var step = '201-Delete-Triggers';
    currentStep = step;

    var PF_JOB_ID = {
        SYS_EVENT: 'd43002a443233110114b9c0d7ab8f291',
        NOWMQ: '9dc04ab4eb0212100679ed9c425228cf'
    };

    events_pfLogInfo(step, 'START');
    events_pfLogInfo(step, 'Querying for PF trigger records (job_id IN [SYS_EVENT, NOWMQ])');

    var gr = new GlideRecord('sys_trigger');
    if (gr.isValid()) {
        gr.addQuery('job_id', 'IN', [PF_JOB_ID.SYS_EVENT, PF_JOB_ID.NOWMQ]);
        gr.query();
        var deletedCount = gr.getRowCount();

        events_pfLogInfo(step, 'Found ' + deletedCount + ' trigger record(s) to delete');

        gr.deleteMultiple();
        events_pfLogInfo(step, 'Count of sys_trigger records deleted: ' + deletedCount);
    } else {
        events_pfLogWarn(step, 'sys_trigger table not accessible on this instance - skipping.');
    }
    events_pfLogInfo(step, 'END');
}

// ============================================================
// 202 / 203: Deduplicate Queues / Queue Params Post Clone
// ============================================================
function dedupeTable(table, keyFields, step) {
    currentStep = step;

    events_pfLogInfo(step, 'Starting ' + table + ' post-clone cleanup. Scanning for duplicate records introduced by the clone operation.');

    var gr = new GlideRecord(table);
    if (!gr.isValid()) {
        events_pfLogWarn(step, table + ' table not accessible on this instance - skipping.');
        return;
    }

    gr.query();
    events_pfLogInfo(step, 'Queried ' + table + ' table. Building deduplication map...');

    var recordMap = {};
    while (gr.next()) {
        var keyParts = [];
        var hasNullKeyPart = false;
        for (var k = 0; k < keyFields.length; k++) {
            var val = gr.getValue(keyFields[k]);
            if (!val) {
                hasNullKeyPart = true;
                break;
            }
            keyParts.push(val);
        }
        if (hasNullKeyPart) {
            continue;
        }

        var key = keyParts.join('_');
        if (!recordMap[key]) recordMap[key] = [];
        recordMap[key].push({
            sys_id: gr.getUniqueValue(),
            sys_updated_on: gr.getValue('sys_updated_on')
        });
    }

    var duplicateLog = [];
    var cleanLog = [];
    var toDeleteList = [];

    for (var key in recordMap) {
        var records = recordMap[key];
        if (records.length < 2) {
            cleanLog.push(key + ' (sys_id: ' + records[0].sys_id + ')');
            continue;
        }

        if (records.length > 2) {
            events_pfLogWarn(step, 'key "' + key + '" has ' + records.length + ' duplicates; only the first two encountered are resolved by this script.');
        }

        var r0 = records[0];
        var r1 = records[1];
        var toDeleteSysId = (r0.sys_updated_on <= r1.sys_updated_on) ? r0.sys_id : r1.sys_id;
        var toKeepSysId = (toDeleteSysId === r0.sys_id) ? r1.sys_id : r0.sys_id;

        duplicateLog.push('Key: ' + key + ' | Retaining sys_id: ' + toKeepSysId + ' (most recently updated) | Marking for deletion sys_id: ' + toDeleteSysId + ' (duplicate record from clone)');
        toDeleteList.push({ sys_id: toDeleteSysId, key: key });
    }

    events_pfLogInfo(step, 'Deduplication map built. Identified ' + duplicateLog.length + ' duplicate record(s) for deletion.');

    if (duplicateLog.length > 0) {
        events_pfLogInfo(step, 'The following duplicates were identified. The most recently updated record will be retained and the stale clone record will be removed:\n' + duplicateLog.join('\n'));
    } else {
        events_pfLogInfo(step, 'No duplicate records were found. The instance appears clean with no clone-introduced duplicates.');
    }

    if (cleanLog.length > 0) {
        events_pfLogInfo(step, 'The following records have no duplicates and require no action:\n' + cleanLog.join('\n'));
    }

    var skippedLog = [];
    var deletedLog = [];
    var failedLog = [];

    events_pfLogInfo(step, 'Processing ' + toDeleteList.length + ' duplicate records for deletion...');

    for (var i = 0; i < toDeleteList.length; i++) {
        var target = toDeleteList[i];
        var delGr = new GlideRecord(table);
        if (delGr.get(target.sys_id)) {
            if (!delGr.canDelete()) {
                skippedLog.push('Key: ' + target.key + ' | sys_id: ' + target.sys_id + ' | sys_policy: ' + delGr.getValue('sys_policy'));
                continue;
            }
            if (delGr.deleteRecord()) {
                deletedLog.push('Key: ' + target.key + ' (sys_id: ' + target.sys_id + ')');
            } else {
                failedLog.push('Key: ' + target.key + ' (sys_id: ' + target.sys_id + ')');
            }
        }
    }

    if (deletedLog.length > 0) {
        events_pfLogInfo(step, 'Successfully deleted the following duplicate clone records from ' + table + ':\n' + deletedLog.join('\n'));
    }
    if (failedLog.length > 0) {
        events_pfLogWarn(step, 'Failed to delete the following duplicate clone records from ' + table + ':\n' + failedLog.join('\n'));
    }
    if (skippedLog.length > 0) {
        events_pfLogWarn(step, 'The following records from ' + table + ' were skipped and still have duplicate records on this instance. An administrator must manually delete these duplicate clone records or run this cleanup script in a context with sufficient privileges:\n' + skippedLog.join('\n'));
    }

    events_pfLogInfo(step, table + ' post-clone cleanup completed. ' + deletedLog.length + ' duplicate record(s) successfully deleted, ' + failedLog.length + ' record(s) failed to delete, ' + skippedLog.length + ' record(s) skipped due to protection policy, ' + cleanLog.length + ' record(s) had no duplicates and were left untouched.');
}

// ============================================================
// 204: Re Provision Queues Post Clone
// ============================================================
function reprovisionQueues() {
    var step = '204-Reprovision-Queues';
    currentStep = step;

    events_pfLogInfo(step, 'STARTED REPROVISIONING OF QUEUES POST CLONE');

    var featureEnabled = gs.getProperty('com.glide.processing.framework.enabled', 'true') === 'true';

    events_pfLogInfo(step, 'Processing framework enabled status: ' + featureEnabled);

    if (featureEnabled) {
        events_pfLogInfo(step, 'Checking SNC.ProcessingFrameworkUtil availability...');

        if (typeof SNC !== 'undefined' && SNC.ProcessingFrameworkUtil && typeof SNC.ProcessingFrameworkUtil.toggleProcessingFrameworkFeature === 'function') {
            events_pfLogInfo(step, 'SNC API available. Triggering queue reprovisioning...');
            SNC.ProcessingFrameworkUtil.toggleProcessingFrameworkFeature('queue', true);
            events_pfLogInfo(step, 'ENDED REPROVISIONING OF QUEUES POST CLONE');
        } else {
            events_pfLogWarn(step, 'SNC.ProcessingFrameworkUtil.toggleProcessingFrameworkFeature is not available on this instance - skipping reprovision.');
        }
    } else {
        events_pfLogWarn(step, 'Processing framework is disabled on this instance. Skipped queues reprovisioning post clone.');
    }
}
