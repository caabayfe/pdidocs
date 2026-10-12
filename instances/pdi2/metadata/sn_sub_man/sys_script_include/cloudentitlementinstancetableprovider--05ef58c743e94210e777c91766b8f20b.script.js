var CloudEntitlementInstanceTableProvider = Class.create();
CloudEntitlementInstanceTableProvider.prototype = {
    initialize: function() {
        this.cloudEntitlementDetailDAO = new CloudEntitlementDetailDAO();
        this._cloudStorageInstanceConsumptionDAO = new CloudStorageInstanceConsumptionDAO();
        this._mifTrustConfigDAO = new MifTrustConfigDAO();
        this._mifInstanceDAO = new MifInstanceDAO();
        this.NOT_AVAILABLE = sn_i18n.Message.getMessage('Subscription Management', 'Not available');
        this.DATA_SHARING_RESTRICTED = sn_i18n.Message.getMessage('Subscription Management', 'Data sharing restricted');
    },

    getRows: function() {
        const result = this._initializeResult();
        const instanceGR = this.cloudEntitlementDetailDAO.getInstancesGR();
        const consumptions = this._cloudStorageInstanceConsumptionDAO.getInstanceStorageConsumption();
        const isSharedCapacityType = this.cloudEntitlementDetailDAO.isSharedCapacityType();
        while (instanceGR.next()) {
            const instanceID = instanceGR.getValue('instance');
            const mifAccess = this._mifTrustConfigDAO.getMifTrustConfigRecordByInstanceId(instanceID, true);
            const isDataNotAvailable = this.cloudEntitlementDetailDAO.isDataNotAvailable(mifAccess, consumptions.get(instanceGR.getValue('instance')));
            const isDataSharingRestricted = this._isDataSharingRestricted(mifAccess);
            bucket = this._getBucket(instanceID, isDataSharingRestricted, instanceGR.getElement('instance.is_prod'), isDataNotAvailable);
            const row = this._insertRow(instanceGR, consumptions.get(instanceGR.getValue('instance')));
            this._addToResult(result, row, bucket);
        }
        this._addOrderField(result);
        return this._flattenResult(result);
    },


    _insertRow: function(instanceGR, mifConsumption) {
        const usedPoolCapacity = this._getUsedPoolCapacity(instanceGR.getValue('instance'), mifConsumption);
        return {
            'instance': instanceGR.getDisplayValue('instance.instance_name'),
            'purpose': instanceGR.getElement('instance.is_prod') == true ? sn_i18n.Message.getMessage('Subscription Management', 'Production') : sn_i18n.Message.getMessage('Subscription Management', 'Subproduction'),
            'type': instanceGR.getDisplayValue('entitlement.hosting_type'),
            'last_updated': instanceGR.getDisplayValue('entitlement.sys_updated_on'),
            'used_pool_capacity': usedPoolCapacity,
            'sys_id': gs.generateGUID()
        };
    },

    _getUsedPoolCapacity: function(instanceID, mifConsumption) {
        const mifAccess = this._mifTrustConfigDAO.getMifTrustConfigRecordByInstanceId(instanceID, true);
        const isDataNotAvailable = this.cloudEntitlementDetailDAO.isDataNotAvailable(mifAccess, mifConsumption);
        const isDataSharingRestricted = this._isDataSharingRestricted(mifAccess);

        if (isDataSharingRestricted == 'true') {
            mifConsumption = this.DATA_SHARING_RESTRICTED;
        } else if (isDataNotAvailable == 'true') {
            mifConsumption = this.NOT_AVAILABLE;
        }
        return mifConsumption;
    },

    _addToResult: function(result, row, bucket) {
        result[bucket].push(row);
    },

    _getBucket: function(instanceID, is_data_restricted, isProd, isNotAvailable) {
        if (is_data_restricted == 'false' && isNotAvailable == 'true') return 'none';
        else if (isProd == true) {
            return is_data_restricted == 'false' ? 'prod_with_access' : 'prod_without_access';
        } else {
            return is_data_restricted == 'false' ? 'sub_prod_with_access' : 'sub_prod_without_access';
        }
    },

    _initializeResult: function() {
        return {
            prod_with_access: [],
            sub_prod_with_access: [],
            prod_without_access: [],
            sub_prod_without_access: [],
            none: [],
        };
    },

    _addOrderField: function(result) {
        const sort_order = ['prod_with_access', 'sub_prod_with_access', 'prod_without_access', 'sub_prod_without_access', 'none'];
        let sequence = 1;
        sort_order.forEach(key => {
            if (result.hasOwnProperty(key)) {
                result[key].sort((a, b) => a.instance.localeCompare(b.instance));
                result[key].forEach(row => {
                    row.display_order = sequence++;
                });
            }
        });
    },

    _flattenResult: function(result) {
        let flattenedResult = [];
        for (const key in result) {
            if (result.hasOwnProperty(key)) {
                flattenedResult = flattenedResult.concat(result[key]);
            }
        }
        return flattenedResult;
    },

    _isDataSharingRestricted: function(mifAccess) {
        if (mifAccess == undefined) return 'false';
        if (mifAccess.hasOwnProperty('is_granting_access') && mifAccess.is_granting_access == 'false') return 'true';
        return 'false';

    },

    type: 'CloudEntitlementInstanceTableProvider'
};
