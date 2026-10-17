var ITOMVisibilityLicenseCounterV2 = Class.create();
ITOMVisibilityLicenseCounterV2.MAX_BATCH_SIZE = 5000;
ITOMVisibilityLicenseCounterV2.prototype = {
    initialize: function() {
        this.utils = new sn_itom_license.ITOMLicensingUtils();
        this.metadata = new sn_itom_license.ITOMLicensingMetaData();
        this.batchUtil = new SNC.BatchCommandsUtil();
        this.skuId = this.utils._getSKUIDs();
        this.arrUtil = new global.ArrayUtil();
    },
    calculateUsage: function(isCount) {
        var gr = new GlideRecord('itom_lu_sku_type');
        gr.query();
        while (gr.next()) {
            this.calculateLicenseUsage(isCount, gr);
        }
    },

    calculateLicenseUsage: function(isCount, skuTypeGr) {
        var skuType = skuTypeGr.getValue('sku');

        // is the new license model in place for this customer ?
        if (!this.utils.isNewLicenseModel())
            return;

        // is Visibility license available for this sku type
        var valueStream = (!this.utils.ignoreITOMDiscovery(skuType)) ? "Discovery" : "Visibility";

        if (valueStream == "Visibility" && !this.utils.isVisibilityPresent(skuType))
            return;
        if (valueStream == "Discovery" && !this.utils.isDiscoveryPresent(skuType))
            return;

        this.maxResult = this.utils.getMaxResultsFor(valueStream, skuType);

        var allAllowedSources = this._getDiscoverySources();
        var excludedStatus = ['7', '8', '100']; // RETIRED, STOLEN, ABSENT
        var dateFilter = 'Last 90 days@javascript:gs.beginningOfLast90Days()@javascript:gs.endOfLast90Days()';
        var CIListForCounting = {};
        this.totalListingCount = 0;

        //Calculate visibility license usage 
        var counts = this.utils.getCountsJsonTemplate(valueStream, skuType);
        var exclusionTable = this.utils.getExclusionTableName(valueStream, skuType);

        for (var category in counts) {
            // NOTE: special case for enduser_devices where we *ONLY* want to count ACC-Visibility sourced CIs
            // This hard coding will be removed and externalised as part of DEF0201901
            var allowedSources = (category == 'enduser_devices' ? ['ACC-Visibility'] : allAllowedSources);

            var tables = this.metadata.getTablesForSku(category, this.skuId[skuType]);
            var totalCount = 0;
            var domains = {};
            var categoryTotalCIs = [];

            // for each table that's found for a category
            for (var tableIndex in tables) {
                var excludedSysIds = {};

                var tableName = tables[tableIndex];
                if (!gs.tableExists(tableName))
                    continue;

                gs.debug("\tprocessing table : " + tableName);
                var tableCountGr = new GlideRecord(tableName);
                this._addCountConditions(tableCountGr, excludedStatus, allowedSources, dateFilter);

                if (tableName == 'cmdb_ci_computer' && category == 'enduser_devices') 
                    tableCountGr.addQuery('sys_class_name', 'cmdb_ci_computer');

                if (skuType == 'itom')
                    tableCountGr.addNullQuery('cmdb_ot_entity');
                if (skuType == 'otm') {
                    tableCountGr.addNotNullQuery('cmdb_ot_entity');

                    if (tableName == 'cmdb_ci_ot' && category == 'Unclassed OT') {

                        //  get all child tables of cmdb_ci_ot
                        var alreadyLicenseCategories = this.arrUtil.convertArray(new TableUtils("cmdb_ci_ot_control").getAllExtensions());
                        alreadyLicenseCategories = alreadyLicenseCategories.concat(this.arrUtil.convertArray(new TableUtils("cmdb_ci_ot_field_device").getAllExtensions()));
                        alreadyLicenseCategories = alreadyLicenseCategories.concat(this.arrUtil.convertArray(new TableUtils("cmdb_ci_ot_supervisory").getAllExtensions()));
                        tableCountGr.addQuery('sys_class_name', 'NOT IN', alreadyLicenseCategories);
                    }
                }    
                
                tableCountGr.query();

                if (tableCountGr.hasNext()) {
                    // get list of all cis that should be excluded from this table
                    var exclusionGr = new GlideRecord(exclusionTable);
                    exclusionGr.addQuery('ci.sys_class_name', 'INSTANCEOF', tableName);
                    exclusionGr.addQuery('exclusion_reason.category', category).addOrCondition('exclusion_reason.category', 'All');
                    exclusionGr.query();
                    while (exclusionGr.next())
                        excludedSysIds[exclusionGr.getValue('ci')] = true;
                }

                // Making Record List 
                while (tableCountGr.next()) {
                    var sysId = tableCountGr.getUniqueValue();
                    if (excludedSysIds[sysId])
                        continue;
                    var ci = {
                        'sysId': sysId,
                        'domain': tableCountGr.getValue('sys_domain')
                    };
                    categoryTotalCIs.push(ci);
                }
            }

            categoryTotalCIs.forEach(function(ci) {
                if (domains.hasOwnProperty(ci.domain))
                    domains[ci.domain]++;
                else
                    domains[ci.domain] = 1;
            });

            // Adding 0 count with default domain in case of empty object
            counts[category] = (Object.keys(domains).length) ? domains : {
                "global": 0
            };

            // To List the CIs
            if (!isCount) {

                if (categoryTotalCIs.length <= ITOMVisibilityLicenseCounterV2.MAX_BATCH_SIZE) {
                    this._listResources(categoryTotalCIs, category, valueStream, skuType);
                    continue;
                } else {
                    var length = categoryTotalCIs.length;
                    var low = 0;
                    var high = ITOMVisibilityLicenseCounterV2.MAX_BATCH_SIZE;
                    while (!this.utils.isVisibilityJobCanceled(skuType) && high <= length) {
                        var trimmedList = categoryTotalCIs.slice(low, high);
                        this._listResources(trimmedList, category, valueStream, skuType);
                        low = high;
                        high += ITOMVisibilityLicenseCounterV2.MAX_BATCH_SIZE;
                    }
                    if (high > length && low < length) {
                        trimmedList = categoryTotalCIs.slice(low, length);
                        this._listResources(trimmedList, category, valueStream, skuType);
                    }
                }
                return;
            }

        }
        // now persist the counts into the licensing counts table
        if (isCount) {
            var countsGR = new GlideRecord('itom_lu_ci_counts');
            countsGR.setValue('value_stream', valueStream);
            countsGR.setValue('is_aggregated', 'false');
            countsGR.setValue('sku', this.skuId[skuType]);

            for (var countedCategory in counts) {
                for (var countedDomain in counts[countedCategory]) {
                    countsGR.setValue('sys_domain', countedDomain)
                    countsGR.setValue('category', countedCategory);
                    countsGR.setValue('count', counts[countedCategory][countedDomain]);
                    countsGR.insert();
                }
            }
        }
    },


    // NOTE: This function is overriden in ITOMVisibilityLicenseCounterWithServices
    _addCountConditions: function(tableCountGr, excludedStatus, allowedSources, dateFilter) {
        tableCountGr.addQuery('duplicate_of', 'NULL');
        tableCountGr.addQuery('install_status', 'NOT IN', excludedStatus);
        this._addSourceFilter(tableCountGr, 'sys_id', allowedSources, dateFilter);
    },

    _addSourceFilter: function(gr, ref, allowedSources, dateFilter) {
        var sourceQuery = gr.addJoinQuery('sys_object_source', ref, 'target_sys_id');
        sourceQuery.addCondition('name', 'IN', allowedSources.join(","));
        sourceQuery.addCondition('last_scan', 'ON', dateFilter);
    },

    _getDiscoverySources: function() {
        var allowedSources = [];
        var licenseDiscoverySourceGr = new GlideRecord('itom_lu_discovery_sources');
        licenseDiscoverySourceGr.query();
        while (licenseDiscoverySourceGr.next())
            allowedSources.push(licenseDiscoverySourceGr.getValue('source'));

        return allowedSources;
    },

    _listResources: function(ciListForCounting, category, valueStream, skuType) {

        if (this.maxResult <= this.totalListingCount)
            return;
        var sysIds = [];
        var ratio = this.utils.getCategory2Ratio()[category] + ":1";
        ciListForCounting.forEach(function(obj) {
            sysIds.push(obj.sysId);
        });

        var tableName = this.utils._getLicensableCIsTableInfo(valueStream, 'ci_table', skuType);
        var encodedQuery = this.utils.getAdditionalFiltersFor(valueStream, skuType);

        var gr = new GlideRecord(tableName);
        gr.addQuery('sys_id', 'IN', sysIds.join(','));
        if (encodedQuery)
            gr.addEncodedQuery(encodedQuery);
        gr.query();

        var jsonArr = [];
        while (gr.next()) {
            jsonCountRecord = {};
            jsonCountRecord.configuration_item = gr.sys_id + '';
            jsonCountRecord.category = category + '';
            jsonCountRecord.value_stream = valueStream + '';
            jsonCountRecord.sys_domain = gr.sys_domain + '';
            jsonCountRecord.su_ratio = ratio + '';
            jsonCountRecord.sku = this.skuId[skuType];

            this.totalListingCount++;
            jsonArr.push(jsonCountRecord);
            if (this.totalListingCount >= this.maxResult) 
                break;
        }

        this.batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), 'itom_lu_licensable_cis', '');
    },

    type: 'ITOMVisibilityLicenseCounterV2'
};
