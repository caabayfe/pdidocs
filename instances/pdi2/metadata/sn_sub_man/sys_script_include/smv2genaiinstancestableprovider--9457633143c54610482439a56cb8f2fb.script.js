var SMv2GenAIInstancesTableProvider = Class.create();
SMv2GenAIInstancesTableProvider.prototype = {
    initialize: function(feature) {
        this._mifTrustConfigDAO = new MifTrustConfigDAO();
        this._mifInstanceDAO = new MifInstanceDAO();
        this._genAIAssistsCountDAO = new GenAIAssistsCountDAO();
        this._mifSyncStatusDao = new MifSyncStatusDao();
        this._genAIUserCountDAO = new GenAICreatorUserCountDAO();

        this._mifTrustConfigs = new Map();
        this._mifSyncStatus = new Map();
        this._counts = new Map();

        this.FEATURE = feature;
        this.DATA_SHARING_RESTRICTED = 'Data sharing restricted';
        this.tableName = (this.FEATURE == sn_entitlement.LicensingEngineConstants.ASSIST) ? "sn_entitlement_genai_assist_counts" : "sn_entitlement_genai_creator_user_counts";
		this.isUserAllocationDisplayEnabled = new GroupAllocationService().isUserAllocationDisplayEnabled();
    },

    _preLoad: function(instanceIds) {
        this._addToCacheWithDefaultValues(instanceIds, this._mifSyncStatus, {},
            this._mifSyncStatusDao.getMifSyncStatusForInstanceIds(instanceIds, this.tableName));
        this._addToCacheWithDefaultValues(instanceIds, this._mifTrustConfigs, {},
            this._mifTrustConfigDAO.getMifTrustConfigRecordsForInstanceIds(instanceIds));
        const countsDAO = (this.FEATURE == sn_entitlement.LicensingEngineConstants.ASSIST) ?
            this._genAIAssistsCountDAO : this._genAIUserCountDAO;
        this._addToCacheWithDefaultValues(instanceIds, this._counts, {},
            countsDAO.getCountsForInstanceIds(instanceIds));
    },

    _addToCacheWithDefaultValues: function(instanceIds, cache, defaultValue, resultMap) {
        instanceIds.forEach(id => {
            cache.set(id, resultMap.has(id) ? resultMap.get(id) : defaultValue);
        });
    },

    /**
     * Return Instance based allocation history for Creator or Assit subscription based on this.FEATURE
     */
    getRows: function() {
        const result = this._initializeResult();
        const mifInstances = this._mifInstanceDAO.getMifInstances();
        const instanceIds = Array.from(mifInstances.map(x => x.instance_id));
        this._preLoad(instanceIds);

        mifInstances.forEach(mifInstance => {
            const instance_id = mifInstance.instance_id;
            const mifTrustConfigRecord = this._mifTrustConfigs.get(instance_id);
            mifInstance.is_granting_access = mifTrustConfigRecord.is_granting_access;

            const consumedInfo = this._getConsumedInfo(mifInstance, instance_id);
            const lastUpdated = this._getLastUpdatedDate(instance_id);
            const accrualTime = this._getAccrualTime(instance_id);

            const row = {
                sys_id: mifInstance.sys_id,
                name: mifInstance.instance_name,
                type: mifInstance.instance_type_string,
                last_updated: lastUpdated,
                accrual_time: accrualTime,
                [consumedInfo.column]: consumedInfo.count || '-'
            };

            this._addToResult(result, row, mifInstance);
        });

        this._addOrderField(result);
        return this._flattenResult(result);
    },

    _getConsumedInfo: function(mifInstance, instance_id) {
        let count = (mifInstance.is_granting_access == 'true') ? this._counts.get(instance_id).total_display_value : this.DATA_SHARING_RESTRICTED;

        if (!this.isUserAllocationDisplayEnabled && (this.FEATURE === sn_entitlement.LicensingEngineConstants.CREATOR)) {
			count = "-";
		}
        const column = (this.FEATURE == sn_entitlement.LicensingEngineConstants.ASSIST) ? 'used_assists' : 'allocated_users';
        return {
            count,
            column
        };
    },
    _getLastUpdatedDate: function(instance_id) {
        return this._getDate(this._mifSyncStatus.get(instance_id).last_upload);
    },

    _getAccrualTime: function(instance_id) {
        return this._counts.get(instance_id).accrual_time;
    },

    _addToResult: function(result, row, mifInstance) {
        const bucket = this._getBucket(mifInstance);
        result[bucket].push(row);
    },

    _getBucket: function(mifInstance) {
        if (this._isCurrentInstance(mifInstance)) {
            return 'current_instance';
        } else if (mifInstance.is_prod == 'true') {
            return mifInstance.is_granting_access == 'true' ? 'prod_with_access' : 'prod_without_access';
        } else {
            return mifInstance.is_granting_access == 'true' ? 'sub_prod_with_access' : 'sub_prod_without_access';
        }
    },

    _isCurrentInstance: function(mifInstance) {
        return gs.getProperty('instance_id') == mifInstance.instance_id;
    },

    _initializeResult: function() {
        return {
            current_instance: [],
            prod_with_access: [],
            sub_prod_with_access: [],
            prod_without_access: [],
            sub_prod_without_access: []
        };
    },

    _getDate: function(dateTime) {
        if(gs.nil(dateTime)) {
            return dateTime;
        }

		const dateTimeRecord = new GlideDateTime();
		dateTimeRecord.setDisplayValue(dateTime);

        return dateTimeRecord.getDate().toString();
    },

    _addOrderField: function(result) {
        const sort_order = ['current_instance', 'prod_with_access', 'sub_prod_with_access', 'prod_without_access', 'sub_prod_without_access'];
        let sequence = 1;
        sort_order.forEach(key => {
            if (result.hasOwnProperty(key)) {
                result[key].forEach(row => {
                    row.display_order = sequence++;
                });
            }
        });
    },

    _flattenResult: function(result) {
        return Object.values(result).flat();
    },

    type: 'SMv2GenAIInstancesTableProvider'
};
