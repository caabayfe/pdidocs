var EMLicensingUtilWrapper = Class.create();
EMLicensingUtilWrapper.prototype = {
    initialize: function() {
        this.classModel = SNC.ClassModel;
        this.alertManager = new SNC.AlertManager();
        this.eventManagementUtils = new SNC.EventManagementScriptableApis();
        this.oiInsertedRecords = SNC.MetricScriptableApis;
		this.batchUtil = new SNC.BatchCommandsUtil();
    },

    classModel_isInstanceOf: function(derived, base) {
        return this.classModel.isInstanceOf(derived, base);
    },

    alertManager_setStepTopic: function(topicName) {
        this.alertManager.setStepTopic(topicName);
    },

    alertManager_addStep: function(stepName) {
        this.alertManager.addStep(stepName);

    },

    alertManager_stepReport: function() {
        this.alertManager.stepReport();
    },

    eMUtils_getUniqueNodesAndCIs: function(fromTime, toTime, alertRecordLimit, shortName2Node, nodesMap, alertsCis, allNodes) {
        return this.eventManagementUtils.getUniqueNodesAndCIs(fromTime, toTime, alertRecordLimit, shortName2Node, nodesMap, alertsCis, allNodes);
    },

    eMUtils_getDistinctNodesFromAlerts: function(fromTime, toTime, alertRecordLimit, shortName2Node, nodesMap, allNodes) {
        return this.eventManagementUtils.getDistinctNodesFromAlerts(fromTime, toTime, alertRecordLimit, shortName2Node, nodesMap, allNodes);
    },

    populateLicenseCIs: function() {
        return this.oiInsertedRecords.populateLicenseCIs();
    },

    batchInsertMultipleFields: function(field, commaDelimitedValues, stringField, sValue, booleanField, bValue, tableName, domainId) {
        this.batchUtil.batchInsertMultipleFields(field, commaDelimitedValues, stringField, sValue, booleanField, bValue, tableName, domainId);
    },

    batchInsertMultiple: function(json, tableName, domainId) {
        if (json && tableName)
            this.batchUtil.batchInsertMultiple(json, tableName, '');
    },

    type: 'EMLicensingUtilWrapper'
};
  EMLicensingUtilWrapper.getCount = function() {
    MetricLicensingUtil.getCount();
};
