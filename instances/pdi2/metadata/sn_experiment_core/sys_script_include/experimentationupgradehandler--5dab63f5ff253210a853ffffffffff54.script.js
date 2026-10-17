var ExperimentationUpgradeHandler = Class.create();
ExperimentationUpgradeHandler.prototype = {
    initialize: function() {},

    /*
     * Determine whether the current release version differs from the
     * version specified in the server_filter_criteria. A mismatch indicates
     * that an upgrade has occurred. In such cases:
     * Retrieve experiments for the latest release version
     *  - Update the filter criteria with the new version
     *  - Reset the last download time to the epoch
     *  - Mark the upgrade sys_property as true
     *  - Clear the CDS staging table
     *  - Trigger the one-time scheduler
     */
    process: function() {
        var currentVersion = new sn_experiment_core.ReleaseVersionResolver().resolveReleaseVersion();

        var cdsRegistryRecord = this._getCDSRegistryRecord();
        if (!cdsRegistryRecord) {
            return;
        }

        var filterCriteria = cdsRegistryRecord.getValue("server_filter_criteria");
        var prevReleaseVersion = filterCriteria ? this._getPrevReleaseVersion(filterCriteria) : "";
        if (prevReleaseVersion != currentVersion) {
            var newFilterCriteria = this._getNewFilterCriteria(filterCriteria, currentVersion);
            this._updateFilterCriteria(cdsRegistryRecord, newFilterCriteria);
            this._updateCDSScheduleLastDownloadTime();
            gs.setProperty(ExperimentationConstants.UPGRADED_PROPERTY, true);
            this._clearExperimentStagingTable();
            new sn_experiment_core.ExperimentUIService().oneTimeCDSScheduler();
        }

        this._disableJob(); // disable upgrade job
    },

    _getCDSRegistryRecord: function() {
        var record = new GlideRecord("cds_client_registry");
        if (!record.isValid()) {
            gs.info('check table cds_client_registry. failed abort');
        } else {
            if (record.get(ExperimentationConstants.CDS_REGISTRY_SYSID)) {
                return record;
            } else
                gs.info("Record with sys_id " + ExperimentationConstants.CDS_REGISTRY_SYSID + " not found in  cds_client_registry table");
        }
        return "";
    },

    _getPrevReleaseVersion: function(filterCriteria) {
        var match = filterCriteria.match(new RegExp(CDSClientConstants.QUERY_PARAM_RELEASE_VERSION + "=([^\\^]+)"));
        if (match && match[1]) {
            return match[1];
        }
        return "";
    },

    _getNewFilterCriteria: function(filterCriteria, newReleaseVersion) {
        var clause = CDSClientConstants.QUERY_PARAM_RELEASE_VERSION + "=" + newReleaseVersion;

        if (this._isEmpty(filterCriteria)) {
            return clause;
        }

        var regex = new RegExp(CDSClientConstants.QUERY_PARAM_RELEASE_VERSION + "=([^\\^]*)");
        if (regex.test(filterCriteria)) {
            return filterCriteria.replace(regex, clause);
        }

        return filterCriteria + "^" + clause;
    },

    _updateFilterCriteria: function(cdsRegistryRecord, newFilterCriteria) {
        cdsRegistryRecord.setValue('server_filter_criteria', newFilterCriteria);
        cdsRegistryRecord.update();
    },

    _updateCDSScheduleLastDownloadTime: function() {
        var gr = new GlideRecord('cds_client_schedule');
        if (gr.get(ExperimentationConstants.CDS_SCHEDULE_SYSID)) {
            gr.setValue('last_record_timestamp', new GlideDateTime("1970-01-01 00:00:00"));
            gr.update();
        }
    },

    _isEmpty: function(value) {
        return value === null || value === undefined || value === "";
    },

    _clearExperimentStagingTable: function() {
        var gr = new GlideRecord(CDSClientConstants.TABLE_CLIENT_STAGING);
        gr.deleteMultiple();
    },

    _disableJob: function() {
        var grScript = new GlideRecord('sysauto_script');
        grScript.addQuery('sys_id', ExperimentationConstants.UPGRADE_JOB_SYSID);
        grScript.query();
        if (grScript.next()) {
            grScript.setValue('active', false);
            grScript.update();
            gs.info('Download experiments on upgrade job disabled');
        } else {
            gs.warn('Download experiments on upgrade: Record not found in sysauto_script for sys_id: ' + ExperimentationConstants.UPGRADE_JOB_SYSID);
        }
    },

    type: 'ExperimentationUpgradeHandler'
};
