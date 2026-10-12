var CMDBAttestationSmartDetectionUtil = Class.create();

CMDBAttestationSmartDetectionUtil.prototype = Object.extendsObject(CMDBAttestationUtil, {

    initialize: function() {
        CMDBAttestationUtil.prototype.initialize.call(this);
    },

    isPluginActive: function(pluginName) {
        return GlidePluginManager.isActive(pluginName);
    },

    isEligibleForSmartDetection: function() {
        return this.isPluginActive(this.PLUGINS.DISCOVERY_PLUGIN) || this.isPluginActive(this.PLUGINS.INTEGRATION_COMMONS_PLUGIN);
    },

    isSmartDetectionDisabled: function() {
        return gs.getProperty(this.SYS_PROPS_NAME.DISABLE_SMART_DETECTION) === 'true';
    },

    attestAllEligibleCis: function(taskId) {
        var currentUser = gs.getUserID();
        var taskToCiGr = this.buildSmartDetectionCIGr(taskId);
        taskToCiGr.query();
        var sysIds = [];
        while (taskToCiGr.next()) {
            sysIds.push(taskToCiGr.getValue("sys_id"));
        }
        return this.performAttestationAction(taskId, sysIds, this.ACTIONS_MAPPING.attest.key, "Auto-attested through smart-detection", false, '', null);
    },

    resetTaskUserPref: function(taskId) {
        var taskStateGr = new GlideRecord(this.TABLES.ATTESTATION_TASK_STATE);
        taskStateGr.addQuery(this.TASK_STATE_FIELDS.CMDB_TASK, taskId);
        taskStateGr.query();
        if (taskStateGr.next()) {
            taskStateGr.setValue(this.TASK_STATE_FIELDS.HIDE_POPUP_USER_PREF, false);
            taskStateGr.update();
        }
    },

    getSmartDetectionFilter: function() {
        var discoverySrcExclusion = gs.getProperty(this.SYS_PROPS_NAME.DISCOVERY_SRC_EXCLUSION);
        var discoveryWindow = gs.getProperty(this.SYS_PROPS_NAME.DISCOVERY_WINDOW);
        var filters = {};
        if (discoverySrcExclusion) {
            filters.discoverySrcExclusion = discoverySrcExclusion;
        }
        if (discoveryWindow) {
            var gdt = new GlideDateTime();
            gdt.addDaysUTC(-discoveryWindow);
            filters.lastDiscoveredAfter = gdt.getValue();
        }
        return filters;
    },

    buildSmartDetectionCIGr: function(taskId) {
        var filter = this.getSmartDetectionFilter();
        var discoverySrcExclusion = filter.discoverySrcExclusion;
        var lastDiscoveredAfter = filter.lastDiscoveredAfter;
        var ciGr = new GlideRecord(this.TABLES.TASK_TO_CI_TABLE);
        ciGr.addQuery(this.TASK_TO_CI_FIELDS.CMDB_TASK, taskId);
        ciGr.addQuery(this.TASK_TO_CI_FIELDS.DISCOVERY_SOURCE, this.QUERY_FILTERS.NOT_IN, discoverySrcExclusion);
        ciGr.addQuery(this.TASK_TO_CI_FIELDS.DISCOVERY_SOURCE, this.QUERY_FILTERS.NOT_EQUAL, "");
        ciGr.addQuery(this.TASK_TO_CI_FIELDS.LAST_DISCOVERED, this.QUERY_FILTERS.GTE, lastDiscoveredAfter);
        ciGr.addQuery(this.TASK_TO_CI_FIELDS.ATTESTATION_STATUS, this.ATTESTATION_STATUS.NOT_YET_REVIEWED);
        return ciGr;
    },

    getSmartDetectionEligibleCIsInfo: function(taskId) {
        var ciGr = this.buildSmartDetectionCIGr(taskId);
        ciGr.orderByDesc(this.TASK_TO_CI_FIELDS.LAST_DISCOVERED);
        ciGr.query();
        var rowCount = 0;
        var lastDiscovered = "";
        if (ciGr.next()) {
            rowCount = ciGr.getRowCount();
            var latestDiscoveredCi = ciGr.ci.getRefRecord();
            lastDiscovered = latestDiscoveredCi.getDisplayValue(this.CI_FIELDS.LAST_DISCOVERED);
        }
        return {
            ciCount: rowCount,
            lastDiscovered: lastDiscovered,
            runOn: new GlideDateTime().getDisplayValue(),
        };
    },

	insertOrUpdateSmartDetectionState: function(taskId, smartDetectionAccepted, ciCount, hidePopup) {
		var runOn = new GlideDateTime().getDisplayValue();
		var fieldValues = {};
        fieldValues[this.TASK_STATE_FIELDS.SMART_DETECTION_ACCEPTED] = smartDetectionAccepted;
        fieldValues[this.TASK_STATE_FIELDS.CI_COUNT] = ciCount;
        fieldValues[this.TASK_STATE_FIELDS.SMART_DETECTION_RUN_ON] = runOn;
        fieldValues[this.TASK_STATE_FIELDS.HIDE_POPUP_USER_PREF] = hidePopup;
		this.insertOrUpdateTaskStateFields(taskId, fieldValues);
	},

    reviewSmartDetection: function(taskId, ciCount) {
        this.insertOrUpdateSmartDetectionState(taskId, false, ciCount, false);
    },

    acceptSmartDetection: function(taskId, ciCount) {
        var result = this.attestAllEligibleCis(taskId);
        if (result.successCount > 0) {
            this.insertOrUpdateSmartDetectionState(taskId, true, ciCount, false);
        }
        return result;
    },

    cancelSmartDetection: function(taskId, ciCount, hidePopup) {
        this.insertOrUpdateSmartDetectionState(taskId, false, ciCount, hidePopup);
    },

    type: 'CMDBAttestationSmartDetectionUtil'
});
