var IntentDiscoveryRecordTracking = Class.create();
IntentDiscoveryRecordTracking.prototype = {
    initialize: function() {},
    trackClusterAction: function(clusterSysId, lang, targetIntent) {
        var clusterGlideRecord = this._getRecordIfExists("sn_nlu_discovery_cluster", clusterSysId)
        if (clusterGlideRecord === null) {
            gs.error("Cluster does not exist" + clusterSysId);
            return null;
        }
        return this._trackAction(lang, null, clusterGlideRecord, targetIntent);
    },
    trackIntentAction: function(intentSysId, lang, targetIntent) {
        var intentGlideRecord = this._getRecordIfExists("sn_nlu_discovery_intent", intentSysId);
        if (intentGlideRecord === null) {
            gs.error("Intent does not exist" + intentSysId);
            return null;
        }
        return this._trackAction(lang, intentGlideRecord, null, targetIntent);
    },
    _trackAction: function(lang, reportIntent, reportCluster, targetIntent) {
        var reportTraceRecord = new GlideRecord("sn_nlu_discovery_report_trace");
        reportTraceRecord.initialize();
        reportTraceRecord.setValue("lang", lang);
        if (targetIntent && targetIntent != null) {
            reportTraceRecord.setValue("model_intent", targetIntent);
        }
        if (reportIntent && reportIntent != null) {
            gs.info("setting intent to unique id: " + reportIntent.getUniqueValue());
            reportTraceRecord.setValue("intent", reportIntent.getUniqueValue());
        } else if (reportCluster && reportCluster != null) {
            reportTraceRecord.setValue("cluster", reportCluster.getUniqueValue());
        }
        var insertedActionTraceSysID = reportTraceRecord.insert();
        return insertedActionTraceSysID;
    },
    deleteTrackAction: function(lang, reportIntentSysId, reportClusterSysId, targetIntent) {
        var reportTraceRecord = new GlideRecord("sn_nlu_discovery_report_trace");
        if (targetIntent && targetIntent != null) {
            reportTraceRecord.addQuery("model_intent", targetIntent);
        }
        if (lang && lang != null) {
            reportTraceRecord.addQuery("lang", targetIntent);
        }
        if (reportIntentSysId && reportIntentSysId != null) {
            reportTraceRecord.addQuery("intent", reportIntentSysId);
        } else if (reportClusterSysId && reportClusterSysId != null) {
            reportTraceRecord.addQuery("cluster", reportClusterSysId);
        } else {
            gs.error("Must pass intent or cluster to delete");
            return null;
        }
        //check to be safe.
        if ((!reportIntentSysId || reportIntentSysId === null) && (!reportClusterSysId || reportClusterSysId === null)) {
            return null;
        }
        reportTraceRecord.query();
        var count = 0;
        while (reportTraceRecord.next()) {
            // if targetIntent is null don't delete records with targetIntent
            if (targetIntent === null && reportTraceRecord.model_intent) {
                gs.debug("[DISC] Not deleting tracking record for " + reportTraceRecord.getUniqueValue());
                continue;
            } else if (targetIntent != null && reportTraceRecord.model_intent === null) {
                gs.debug("[DISC] Not deleting tracking record for " + reportTraceRecord.getUniqueValue());
                continue;
            }
            if (reportTraceRecord.deleteRecord()) {
                count = count + 1;
            }
        }
        return count;
    },
    _getRecordIfExists: function(recordType, sysId) {
        var g = new GlideRecord(recordType);
        var glideRecord = g.get(sysId);
        if (!glideRecord || glideRecord === undefined || glideRecord === null) {
            return null;
        }
        return g;
    },

    type: 'IntentDiscoveryRecordTracking'
};
