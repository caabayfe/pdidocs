var MifTrustConfigDAO = Class.create();
MifTrustConfigDAO.prototype = {
    initialize: function() {
        this.LICENSING_APP_ID = 'bcadabf277f311109c62f5f3cb5a992a';
        this.CLOUD_STORAGE_APP_ID = '9641d1d043110210243f9cd82ab8f2ab';
    },

    /**
     * Return the MIF TrustConfigRecord associated with Licesning for given instance.
     */
    getMifTrustConfigRecordByInstanceId: function(instanceId, forCloudEntitlement = false) {
        return this.getMifTrustConfigRecordsForInstanceIds([instanceId], forCloudEntitlement).get(instanceId);
    },

    getMifTrustConfigRecordsForInstanceIds: function(instanceIds, forCloudEntitlement = false) {
        const resultMap = new Map();

        const currInstanceId = gs.getProperty('instance_id');
        if (instanceIds.includes(currInstanceId)) {
            resultMap.set(currInstanceId, {
                instance_id: currInstanceId,
                is_granting_access: 'true'
            });
        }

        const otherInstanceIds = Array.from(instanceIds.filter(id => currInstanceId != id));
        if (otherInstanceIds.length === 0)
            return resultMap;

        const mifConfigGr = new GlideRecord('sn_mif_trust_config');
        if (forCloudEntitlement) {
            mifConfigGr.addQuery('application', this.CLOUD_STORAGE_APP_ID);
        } else {
            mifConfigGr.addQuery('application', this.LICENSING_APP_ID);
        }
        mifConfigGr.addQuery('instance_id', "IN", otherInstanceIds);
        mifConfigGr.query();
        while (mifConfigGr.next()) {
            const result = {};
            result.instance_id = mifConfigGr.instance_id.toString();
            result.is_granting_access = mifConfigGr.is_granting_access.toString();
            resultMap.set(mifConfigGr.getValue("instance_id"), result);
        }
        return resultMap;
    },

    type: 'MifTrustConfigDAO'
};
