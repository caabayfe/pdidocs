var MifSyncStatusDao = Class.create();
MifSyncStatusDao.prototype = {
    initialize: function() {},

    /**
     * Get sync status by instance id and table name
     */
    getMifSyncStatusByInstanceId: function(instanceId, tableName) {
        return this.getMifSyncStatusForInstanceIds([instanceId], tableName).get(instanceId);
    },

    /**
     * Get sync status by instanceIds and table name
     */
    getMifSyncStatusForInstanceIds: function(instanceIds, tableName) {
        const resultMap = new Map();
        if (instanceIds.length === 0)
            return resultMap;

        const statusGr = new GlideRecord('sn_mif_sync_status');
        statusGr.addQuery('instance_id', "IN", instanceIds);
        statusGr.addQuery('table_name', tableName);
        statusGr.query();

        while (statusGr.next()) {
            const result = {};
            result.last_upload = statusGr.last_upload.getDisplayValue();
            result.last_download = statusGr.last_download.getDisplayValue();
            resultMap.set(statusGr.getValue("instance_id"), result);
        }
        return resultMap;
    },

    /**
     * Get Assists count sync status by instance id
     */
    getAssistsCountsMifSyncStatusByInstanceId: function(instanceId) {
        return this.getMifSyncStatusByInstanceId(instanceId, 'sn_entitlement_genai_assist_counts');
    },

    /**
     * Get Assists count sync status by instance ids
     */
    getAssistsCountsMifSyncStatusForInstanceIds: function(instanceIds) {
        return this.getMifSyncStatusForInstanceIds(instanceIds, 'sn_entitlement_genai_assist_counts');
    },

    type: 'MifSyncStatusDao'
};
