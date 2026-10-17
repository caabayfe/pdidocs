var LicenseDetailMetricHistoryDAO = Class.create();
LicenseDetailMetricHistoryDAO.prototype = {
    initialize: function() {
        this._licenseDetailMetricHistoryTable = "license_detail_metric_history";
        /**
         * (0,2,3 - user) : (1 - capacity) : (4- PA-Indicator) : (5- Display) : (99 - others) 
         * User, Unrestricted User, Unlimited User, PA-Indicator are user product 
         */
        this._licenseType = {
            0: "User",
            1: "Quota",
            2: "User",
            3: "User",
            4: "User",
            5: "Display",
            99: "others",
        };
    },

    /**
     * @returns {array} An array contains list of product code that have allotment history
     */
    getProductCodesThatHaveAllotmentHistoryLog: function() {
        const count = new GlideAggregate(this._licenseDetailMetricHistoryTable);
        count.addAggregate('COUNT', 'license_detail');
        count.query();

        let product_code = [];
        while (count.next()) {
            var licenseGr = new GlideRecord('license_details');
            licenseGr.get(count.getValue('license_detail'));
            if (licenseGr.isValid() && !global.LicensingScriptUtil.nil(licenseGr.getValue('product_code')))
                product_code.push(licenseGr.getValue('product_code'));
        }
        return product_code;
    },

    /**
     * @param {productCodeToSubscriptionSysIdMap} this to look up ems subscription sysId for a product code
     * 
     * @returns {array} An array contains allotment history
     */
    getEntitlementAllotmentHistory: function(productCodeToSubscriptionSysIdMap) {
        let subscriptionAllotmentLog = [];
        for (const productCode of Object.keys(productCodeToSubscriptionSysIdMap)) {
            const allotmentLogGr = new GlideRecord(this._licenseDetailMetricHistoryTable);
            allotmentLogGr.addQuery('name', '!=', 'unmapped');
            allotmentLogGr.addQuery('sys_created_on', '>', gs.monthsAgo(3));
			allotmentLogGr.addQuery('license_detail.product_code', productCode);
            allotmentLogGr.query();
            while (allotmentLogGr.next()) {
                const name = String(allotmentLogGr.getValue('name'));
                const license_type = this._licenseType[String(allotmentLogGr.getElement('license_detail.license_type'))];
                const smv1SubscriptionSysID = String(allotmentLogGr.getElement('license_detail.sys_id'));

                //fields for user product
                let allocated_user_count;
                let available_user_count;

                //fields for custom table(s)
                let allocated_custom_table_count;
                let available_custom_table_count;

                //fields for quota product
                let allocated_quota_count;
                let available_quota_count;

                if (license_type == 'Display' || license_type === 'others')
                    continue;

                //populate user product allocation history column
                if (license_type === 'User') {
                    if (name == 'allocated' || name === 'over_allocated')
                        allocated_user_count = Number(allotmentLogGr.getValue('value')) || 0;

                    if (name == 'available')
                        available_user_count = Number(allotmentLogGr.getValue('value')) || 0;
                }

                //populate quota product allocation history column
                if (license_type === 'Quota') {
                    if (name == 'allocated' || name === 'over_allocated')
                        allocated_quota_count = Number(allotmentLogGr.getValue('value')) || 0;

                    if (name === 'available')
                        available_quota_count = Number(allotmentLogGr.getValue('value')) || 0;
                }

                if (name === 'tables_used')
                    allocated_custom_table_count = Number(allotmentLogGr.getValue('value')) || 0;

                if (name === 'tables_available')
                    available_custom_table_count = Number(allotmentLogGr.getValue('value')) || 0;

                let subscriptionLogObject = {
                    migrated_state: String(allotmentLogGr.getValue('name')),
                    allocated_user_count: allocated_user_count,
                    available_user_count: available_user_count,
                    subscription: String(productCodeToSubscriptionSysIdMap[String(allotmentLogGr.getElement('license_detail.product_code'))]),
					calculated_on: allotmentLogGr.getValue('date'),
                    available_custom_table_count: available_custom_table_count,
                    allocated_custom_table_count: allocated_custom_table_count,
                    license: smv1SubscriptionSysID,
                    allocated_quota_count: allocated_quota_count,
                    available_quota_count: available_quota_count,
                    processing_complete: true,
                    is_latest: false
                };
                subscriptionAllotmentLog.push(subscriptionLogObject);
            }
        }

        return subscriptionAllotmentLog;
    },

    type: 'LicenseDetailMetricHistoryDAO'
};
