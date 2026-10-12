var BatchCommandUtilScript = Class.create();
BatchCommandUtilScript.prototype = {
    initialize: function() {
        this.batchUtil = SNC.BatchCommandsUtil && GlidePluginManager.isActive('com.snc.discovery') ? new SNC.BatchCommandsUtil() : new SNC.CommonBatchUtil();
    },

    batchUpdateMultiple: function(json, tableName, domainId) {
        if (json && tableName)
            this.batchUtil.batchUpdateMultiple(json, tableName, domainId);
    },

    batchInsertMultiple: function(json, tableName, domainId) {
        if (json && tableName)
            this.batchUtil.batchInsertMultiple(json, tableName, domainId);
    },

    batchInsertSingleField: function(field, commaDelimitedValues, tableName, domainId) {
        if (field && commaDelimitedValues && tableName)
            this.batchUtil.batchInsertSingleField(field, commaDelimitedValues, tableName, domainId);
    },

    batchInsert: function(field, commaDelimitedValues, booleanField, bValue, tableName, domainId) {
        if (field && commaDelimitedValues && booleanField && bValue && tableName)
            this.batchUtil.batchInsert(field, commaDelimitedValues, booleanField, bValue, tableName, domainId);

    },
    batchInsertMultipleFields: function(field, commaDelimitedValues, stringField, sValue, booleanField, bValue, tableName, domainId) {
        this.batchUtil.batchInsertMultipleFields(field, commaDelimitedValues, stringField, sValue, booleanField, bValue, tableName, domainId);
    },
    type: 'BatchCommandUtilScript'
};
