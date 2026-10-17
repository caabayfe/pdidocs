var CloudStorageInstanceConsumptionDAO = Class.create();
CloudStorageInstanceConsumptionDAO.prototype = {
    initialize: function() {},

    getInstanceStorageConsumption: function() {
        const consumptions = new Map();
        const instancesGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.SN_STORAGE_CLOUD_CONSUMPTION);
        instancesGR.query();
        while (instancesGR.next()) {
            consumptions.set(instancesGR.getValue('instance_id'), instancesGR.getValue('total_usage'));
        }
        return consumptions;
    },

    getTotalUsedCapacityCount: function() {
        let totalUsedCapacityCount = 0;
        const grCloudStorageConsumption = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.SN_STORAGE_CLOUD_CONSUMPTION);
        grCloudStorageConsumption.addQuery('aggregation_type', 'Account');
        grCloudStorageConsumption.query();
        if (grCloudStorageConsumption.next()) {
            totalUsedCapacityCount = grCloudStorageConsumption.getValue('total_usage').toString();
        }

        return totalUsedCapacityCount ? totalUsedCapacityCount : 0;
    },

    type: 'CloudStorageInstanceConsumptionDAO'
};
