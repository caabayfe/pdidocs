var SNSubscriptionUtils = Class.create();

SNSubscriptionUtils.prototype = {
    initialize: function() {
        //Properties
        this.SUBSCRIPTION_USED_THRESHOLD = 'subscription.used.thresh';

        //Tables
        this.LICENSE_CUST_ALLOTMENT_TBL = 'license_cust_table_allotment';
        this.CUSTOM_TABLE_INVENTORY = 'ua_custom_table_inventory';

        //Fields
        this.ALLOTMENT_TYPE = 'allotment_type';
        this.SUBSCRIPTION = SNC.UsageAnalyticsScriptUtils.getCTISubscriptionReference();
        this.APPLICATION_NAME = "app_name";

        //Value constants
        this.PLAT_BUNDLE_ALLOT_TYPE = '3';
        this.PLAT_ONLY_ALLOT_TYPE = '1';
        this.GRANDFATHER_ALLOT_TYPE = '2';
        this.GRACE_PERIOD = 90;

        this.NA_COUNT_STR = 'N/A';
        this.UNLIMITED_COUNT_STR = 'Unlimited';

        this.IS_EMPTY = "ISEMPTY";

        this.ALLOCATED = 'allocated';
        this.COUNT = 'count';
        this.DATE = 'date';

        this.PLATFORM_SUBSCRIPTION = "Platform Subscription";
        this.TABLES_USED = 'tables_used';
        this.TABLES_NAME = 'table_name';
        this.TABLE_CREATED_ON = 'table_created_on';
        this.TABLE_COUNT = 'table_count';
        this.NUM_TABLES = 'num_tables';
        this.LIC_MCU = 'LICMCU';
        this.LIC_BCU = 'LICBCU';
        this.LIC_CCU = 'LICCCU';
    },

    isOverAlloc: function(licenseGR) {
        return this.fieldOverCompareTo(licenseGR, this.ALLOCATED, this.COUNT);
    },

    allocExceedsThresh: function(licenseGR) {
        return this.fieldExceedsThresh(licenseGR, this.ALLOCATED, this.COUNT);
    },

    isUnderThresh: function(licenseGR) {
        return this.fieldUnderThresh(licenseGR, this.ALLOCATED, this.COUNT);
    },

    tablesUsedExceedsThresh: function(licenseGR) {
        return this.fieldExceedsThresh(licenseGR, this.TABLES_USED, this.TABLE_COUNT);
    },

    tablesUsedUnderThresh: function(licenseGR) {
        return this.fieldUnderThresh(licenseGR, this.TABLES_USED, this.TABLE_COUNT);
    },

    tablesUsedOverCount: function(licenseGR) {
        return this.fieldOverCompareTo(licenseGR, this.TABLES_USED, this.TABLE_COUNT);
    },

    fieldOverCompareTo: function(licenseGR, comparingField, compareToField) {
        return SNC.UsageAnalyticsScriptUtils.isOverLimit(licenseGR, comparingField, compareToField);
    },

    fieldUnderThresh: function(licenseGR, comparingField, compareToField) {
        return SNC.UsageAnalyticsScriptUtils.isBelowThreshold(licenseGR, comparingField, compareToField);
    },

    fieldExceedsThresh: function(licenseGR, comparingField, compareToField) {
        return SNC.UsageAnalyticsScriptUtils.isAboveThreshold(licenseGR, comparingField, compareToField);
    },

    getTablesUsedForLicense: function(current) {
        var tableUsedCount = '0';

        if (gs.nil(current) || gs.nil(current.sys_id))
            return tableUsedCount;

        tableUsedCount = SNC.UsageAnalyticsScriptUtils.calculateTableMappingCount(current);

        return tableUsedCount;
    },

    getValidTablesByAllotment: function(licenseSysId) {
        if (JSUtil.nil(licenseSysId))
            return null;

        var allotGR = new GlideRecord(this.LICENSE_CUST_ALLOTMENT_TBL);
        allotGR.addQuery(this.SUBSCRIPTION, licenseSysId);
        allotGR.query();

        if (allotGR.next()) {
            var customTables = [];

            var custGA = new GlideRecord(this.CUSTOM_TABLE_INVENTORY);

            custGA.addQuery(this.SUBSCRIPTION, this.IS_EMPTY, "")
                .addOrCondition(this.ALLOTMENT_TYPE, this.PLAT_ONLY_ALLOT_TYPE);
            custGA.query();

            while (custGA.next()) {
                customTables.push(custGA.getUniqueValue());
            }

            return customTables.join();
        } else
            return null;
    },

    getValidCustomAppsByAllotment: function(licenseSysId) {
        if (JSUtil.nil(licenseSysId))
            return null;

        var allotGR = new GlideRecord(this.LICENSE_CUST_ALLOTMENT_TBL);
        allotGR.addQuery(this.SUBSCRIPTION, licenseSysId);
        allotGR.query();

        if (allotGR.next()) {

            var customApps = [];

            var custGA = new GlideAggregate(this.CUSTOM_TABLE_INVENTORY);
            custGA.addQuery(this.SUBSCRIPTION, "ISEMPTY")
                .addOrCondition(this.ALLOTMENT_TYPE, this.PLAT_ONLY_ALLOT_TYPE);
            custGA.groupBy(this.APPLICATION_NAME);
            custGA.query();

            while (custGA.next()) {
                if (custGA.getValue("app_name") != "global")
                    customApps.push(custGA.getValue("app_name"));
            }

            return customApps.join();
        } else
            return null;
    },

    getAllotmentType: function(license) {
        if (JSUtil.nil(licenseSysId))
            return null;

        var allotGR = new GlideRecord(this.LICENSE_CUST_ALLOTMENT_TBL);
        allotGR.addQuery(this.SUBSCRIPTION, licenseSysId);
        allotGR.query();

        if (allotGR.next())
            return allotGR.getValue(this.ALLOTMENT_TYPE);
        else
            return null;
    },

    getValidSubscriptionsForCustTblMapping: function() {
        var validSubscSysIds = [];

        var allotGR = new GlideRecord(this.LICENSE_CUST_ALLOTMENT_TBL);
        allotGR.query();
        while (allotGR.next()) {
            var license = new GlideRecord('license_details');
            license.setWorkflow(false);
            if (license.get(allotGR.getValue('license'))) {

                var endDate = new GlideDateTime(license.end_date);
                endDate.addDays(this.GRACE_PERIOD);
                if (endDate > gs.endOfToday())
                    validSubscSysIds.push(allotGR.getValue(this.SUBSCRIPTION));
            }
        }
        return 'sys_idIN' + validSubscSysIds.toString();

    },

    isSubscriptionValidToMap: function(current, previous) {
        if (previous.allotment_type == this.GRANDFATHER_ALLOT_TYPE) { //of grandfather, then cannot unmap
            if (current.app_name == "Global" && current.app_scope == "global") {
                var errorMessage = gs.getMessage("Once added, tables cannot be removed from a {0} subscription", previous.license.getDisplayValue());
                if (gs.getErrorMessages().indexOf(errorMessage) == -1) // if error message is not already visible
                    gs.addErrorMessage(errorMessage);
                return this._abortAction(current);
            }
            return this._abortAction(current);
        }
        this.mapSubscription(current);
    },

    mapSubscription: function(current) {
        var licenseTableReference = SNC.UsageAnalyticsScriptUtils.canRouteToEMS() ? current.subscription_entitlement : current.license;
        if (gs.nil(licenseTableReference)) {
            current.allotment_type = "";
        } else {
            var allotGR = new GlideRecord(this.LICENSE_CUST_ALLOTMENT_TBL);
            allotGR.addQuery(this.SUBSCRIPTION, licenseTableReference);
            allotGR.query();

            /* 
            Rules to map Grandfather(GF) License (allowed only within purchased limit):
               1. Table(s) in scoped application can be mapped to GF license only via UI action.
               2. Table(s) in global application can be mapped to GF license via map UI action or on the form page by updating license field
               for the table entry in CTI.
               3. Table(s) within the same application can be mapped GF license and only one other non GF subscription.
               4. Table(s) within the same application cannot be mapped to two different non grandfather subscription.
               5. Any Table(s) found in Custom Table Inventory can be mapped to GF license via Map UI action.The action is available in List view and Form View.
               6. Scoped Application(global included) cannot be mapped to Grandfather Subscription.
            */
            if (allotGR.next()) {
                if (allotGR.getValue(this.ALLOTMENT_TYPE) == this.GRANDFATHER_ALLOT_TYPE) {
                    var numTables = allotGR.getValue(this.NUM_TABLES);

                    if (current.app_name == "Global") {
                        var customTableGR = new GlideRecord(this.CUSTOM_TABLE_INVENTORY);
                        customTableGR.addQuery(this.SUBSCRIPTION, allotGR.getValue(this.SUBSCRIPTION));
                        customTableGR.query();
                        var customTablesMapped = customTableGR.getRowCount();

                        if (customTablesMapped >= numTables) {
                            gs.addErrorMessage(gs.getMessage("Additional table cannot be added to {0} once the table limit has been reached", allotGR.getDisplayValue(this.SUBSCRIPTION)));
                            return this._abortAction(current);
                        }
                    }
                }
                current.allotment_type = allotGR.getValue(this.ALLOTMENT_TYPE);
            }
        }
    },

    _abortAction: function(current) {
        current.setAbortAction(true);
    },

    getAllocationOrDate: function(current, type) {
        if (type == this.COUNT)
            return this._getAllocationCount(current);
        else
            return this._getLastCalcDate(current);
    },

    _getAllocationCount: function(current) {
        if (current.license_type == 0) { // per-user
            return SNC.UsageAnalyticsScriptUtils.calculateUserAllocationCount(current);
        } else if (current.license_type == 1 || current.license_type == 2) // capacity or max-user
            return SNC.UsageAnalyticsScriptUtils.calculateAllocation(current.quota_defn_id, current.quota_id);
        else if (current.license_type == 3 || current.license_type == 4 || current.license_type == 5) // un-limited || pa-indicator || display
            return "N/A";
    },

    _getLastCalcDate: function(current) {
        if (current.license_type == 0) { // per-user
            // since this license details table will be modified only during license download and when the allocation count is updated that happens during this call
            return new GlideDateTime();
        } else if (current.license_type == 1 || current.license_type == 2) // capacity or max-user
            return SNC.UsageAnalyticsScriptUtils.calculateLastCalculatedDate(current.quota_defn_id, current.quota_id);

        var isIhType = SNC.UsageAnalyticsScriptUtils.isLicenseIHType(current.license_id);
        if (isIhType)
            return this._getUsageAnalyticsCount(current, this.LIC_MCU, 'sys_created_on');

    },

    _getUsageAnalyticsCount: function(current, usageType, column) {
        var gr = new GlideRecord('usageanalytics_count');
        gr.addQuery('definition_id', usageType + current.license_id);
        gr.orderByDesc('time_stamp');
        gr.query();
        if (gr.next())
            return gr.getValue(column);
        return "Unavailable";
    },

    getSubscriptionMetrics: function() {
        var result = [];

        var gr = new GlideRecord('license_details');
        gr.query();

        var allocated = 0;
        var tablesUsed = 0;
        var licenseDetailSysId = '';

        while (gr.next()) {
            allocated = Number(gr.getValue(this.ALLOCATED)) || 0;
            tablesUsed = Number(gr.getValue(this.TABLES_USED)) || 0;
            licenseDetailSysId = gr.getUniqueValue();

            var count = Number(gr.getValue(this.COUNT)) || 0;
            var tablesCount = Number(gr.getValue(this.TABLE_COUNT)) || 0;
            var available = count - allocated;
            var tablesAvailable = tablesCount - tablesUsed;
            var availableOrOverAllocated = 'available';
            var tablesAvailableOrOverAllocated = 'tables_available';
            var overAllocated = 'over_allocated';
            var subscription = 'subscription_allotment';
            var table = 'table_allotment';

            if (available < 0) {
                allocated = count;
                availableOrOverAllocated = overAllocated;
            }

            result.push(this._createMetricObject(subscription, 'allocated', allocated, licenseDetailSysId),
                this._createMetricObject(subscription, availableOrOverAllocated, Math.abs(available), licenseDetailSysId));

            if (tablesAvailable < 0 && gr.getValue(this.TABLE_COUNT) !== this.UNLIMITED_COUNT_STR) {
                tablesUsed = tablesCount;
                tablesAvailableOrOverAllocated = overAllocated;
            }

            if (gr.getValue(this.TABLE_COUNT) === this.UNLIMITED_COUNT_STR) {
                result.push(this._createMetricObject(table, 'allocated_of_unlimited_available', tablesUsed, licenseDetailSysId));
            } else {
                result.push(
                    this._createMetricObject(table, 'tables_used', tablesUsed, licenseDetailSysId),
                    this._createMetricObject(table, tablesAvailableOrOverAllocated, Math.abs(tablesAvailable), licenseDetailSysId));
            }
        }
        return result;
    },

    getUnmappedTable: function() {
        var type = 'unmapped_subscription';
        var result = [];

        var glideRecord = new GlideRecord("ua_custom_table_inventory");
        glideRecord.addNullQuery(this.SUBSCRIPTION);
        glideRecord.query();
        result.push(this._createMetricObject(type, 'unmapped', glideRecord.getRowCount(), 'Unmapped'));

        return result;
    },

    _createMetricObject: function(type, label, value, licenseDetailSysId) {
        var metric = {};
        metric.name = label;
        metric.value = value;
        metric.license_detail = licenseDetailSysId;
        metric.type = type;
        metric.date = new GlideDateTime();
        metric.sys_id = gs.generateGUID();

        return metric;
    },

    getSubscriptionAllocatedMetrics: function() {
        var SAH = 'subscription_allotment_history';
        var gDateTime = new GlideDateTime();
        var result = [];

        var gr = new GlideRecord('license_details');
        gr.query();

        while (gr.next()) {
            var used = Number(gr.getValue(this.ALLOCATED)) || 0;
            var purchased = Number(gr.getValue(this.COUNT)) || 0;

            var available;
            var allocated;
            var overAllocated;

            if (used <= purchased) {
                available = purchased - used;
                allocated = used;
                overAllocated = 0;
            } else {
                available = 0;
                allocated = purchased;
                overAllocated = used - purchased;
            }

            var detailId = gr.getUniqueValue();

            result.push(this._createMetricObject(SAH, 'available', available, detailId));
            result.push(this._createMetricObject(SAH, 'allocated', allocated, detailId));
            result.push(this._createMetricObject(SAH, 'over_allocated', overAllocated, detailId));
        }

        return result;
    },

    // This method is no longer called from subscription summary job
    syncLicense: function(licenseGR) {
        if (!licenseGR.isValidRecord())
            return;

        var retObj = {};
        if (!SNC.LicenseMutex.isAvailable()) {
            retObj.syncStatus = "nomutex";
            return retObj;
        }

        // only update allocation count for per-user license. For capacity and max-user licenses this field must be updated only after the event trigger after UA Persistor job.
        if (licenseGR.license_type == 0)
            retObj.syncStatus = this.syncSubscriptionUsageCounts(licenseGR, false);
        else
            retObj.syncStatus = this.syncSubscriptionUsageCounts(licenseGR, true);

        return retObj;
    },

    syncSubscriptionUsageCounts: function(licenseGR, skipAllocated) {
        var syncStatus = "noUpdate";
        if (JSUtil.nil(licenseGR))
            return syncStatus;

        var shouldUpdate = false;
        var status = "success";
        var count = 0;
        var currentValue = 0;

        if (!JSUtil.toBoolean(skipAllocated)) {
            count = this.getAllocationOrDate(licenseGR, "count");
            currentValue = licenseGR.getValue('allocated');
            if (JSUtil.notNil(count) && count != currentValue) {
                licenseGR.setValue('allocated', count.toString());
                licenseGR.setValue('allocated_status', this.getAllocatedStatus(licenseGR));
                licenseGR.setValue('last_allocation_cal_on', this.getAllocationOrDate(licenseGR, "date"));
                status += "_allocated";
                shouldUpdate = true;
            }
        }
        count = this.getTablesUsedForLicense(licenseGR);
        currentValue = licenseGR.getValue('tables_used');
        if (JSUtil.notNil(count) && count != currentValue) {
            licenseGR.setValue('tables_used', count.toString());
            licenseGR.setValue('last_tables_used_cal_on', new GlideDateTime());
            status += "_tables_used";
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            licenseGR.update();
            syncStatus = status;
        }

        return syncStatus;
    },

    getAllocatedStatus: function(licenseGR) {
        return SNC.UsageAnalyticsScriptUtils.getAllocatedStatus(licenseGR);
    },

    type: 'SNSubscriptionUtils'
};
