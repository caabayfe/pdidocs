var ITOMVisibilityLicenseCounter = Class.create()
ITOMVisibilityLicenseCounter.prototype = {
    initialize: function() {
        this.utils = new sn_itom_license.ITOMLicensingUtils();
		this.batchUtil = new SNC.BatchCommandsUtil();
        this.itomSkuId = this.utils.skuSysId['itom']; 
    },

    calculateUsage: function(isCount) {
        var valueStream = "Visibility";
        if (!this.utils.ignoreITOMDiscovery())
            valueStream = "Discovery";
        // is the new license model in place for this customer ?
        if (!this.utils.isNewLicenseModel())
            return;
        this.maxResult = this.utils.getMaxResultsFor(valueStream);
        var metadata = new sn_itom_license.ITOMLicensingMetaData();
        var counts = this.utils.getCountsJsonTemplate();
        var allAllowedSources = this._getDiscoverySources();
        var excludedStatus = ['7', '8', '100']; // RETIRED, STOLEN, ABSENT
        var dateFilter = 'Last 90 days@javascript:gs.beginningOfLast90Days()@javascript:gs.endOfLast90Days()';
        this.totalListingCount = 0;

        // for each applicable category
        for (var category in counts) {
            // NOTE: special case for enduser_devices where we *ONLY* want to count ACC-Visibility sourced CIs
            // This hard coding will be removed and externalised as part of DEF0201901
            var allowedSources = (category == 'enduser_devices' ? ['ACC-Visibility'] : allAllowedSources);

            // get the list of tables that we need to count
            var tables = metadata.getTables(category);
            var totalCount = 0;
            var domains = {};
            var categoryTotalCIs = [];
            var categoryTotalCIsSysId = [];
            // for each table that's found for a category
            for (var tableIndex in tables) {
                var tableName = tables[tableIndex];
                var includedCIListwithDomain = [];
                var includedCIList = [];

                gs.debug("\tprocessing table : " + tableName);
                var tableCountGr = new GlideRecord(tableName);
                if (!tableCountGr.isValid())
                    continue;

                this._addCountConditions(tableCountGr, excludedStatus, allowedSources, dateFilter);
                tableCountGr.query();
                // Making Record List 
                while (tableCountGr.next()) {
                    var sysId = tableCountGr.getUniqueValue();
                    includedCIListwithDomain.push({
                        'sysId': sysId,
                        'domain': tableCountGr.getValue('sys_domain')
                    });
                    includedCIList.push(sysId);
                }
                gs.debug("\t Selected sysId before exclude : " + JSON.stringify(includedCIList));
                includedCIList = this._excludeMetadata(includedCIList, tableName, valueStream);
                gs.debug("\t Selected sysId after exclude : " + JSON.stringify(includedCIList));
                if (tableName == 'cmdb_ci_vm_instance')
                    includedCIList = this._ecsVMExclude(includedCIList);

                includedCIListwithDomain.forEach(function(ci) {
                    if (includedCIList.indexOf(ci.sysId) != -1)
                        categoryTotalCIs.push(ci);
                });
            }

            if (category == 'Servers') {
                // a VM can be discovered by both cloud discovery and IP based discovery to avoid
                // counting the same node twice, find the CI's that have a Virtualized by::Virtualizes
                // relationship between cmdb_ci_vm_instance and cmdb_ci_server
                // and deduct that from the total count of domain wise
                var relGr = new GlideRecord('cmdb_rel_ci');
                var subDomain = {};
                var excludedSysIDList = [];
                // vm relationship to host can be either Instantiates::Instantiated by or Virtualized by::Virtualizes
                relGr.addQuery('type.name', 'IN', 'Instantiates::Instantiated by, Virtualized by::Virtualizes, Owns::Owned by');
                this._addDeduplicationVmConditions(relGr, excludedStatus, allowedSources, dateFilter);
                relGr.query();

                while (relGr.next())
                    excludedSysIDList.push(relGr.child+'');

                var relNewGr = new GlideRecord('cmdb_rel_ci');
                relNewGr.addQuery('type.name', 'IN', 'Runs on::Runs');
                this._addDeduplicationVirtualServerConditions(relNewGr, excludedStatus, allowedSources, dateFilter);
                relNewGr.query();

                while (relNewGr.next())
                    excludedSysIDList.push(relNewGr.parent+'');

                categoryTotalCIs = categoryTotalCIs.filter(function(obj) {
                    return excludedSysIDList.indexOf(obj.sysId) == -1;
                });
            }
			var catSysId = [];
            categoryTotalCIs.forEach(function(ci) {
				catSysId.push(ci.sysId)	
				domains[ci.domain] = domains.hasOwnProperty(ci.domain) ? domains[ci.domain] + 1 : 1;
			});

            // Adding 0 count with default domain in case of empty object
            counts[category] = (Object.keys(domains).length) ? domains : {
                "global": 0
            };

            // To List the CIs
			if (!isCount) {
				var allowedLen = this.maxResult - this.totalListingCount;
				if(allowedLen > 0 && !this.utils.isVisibilityJobCanceled() && !this.utils.isDiscoveryJobCanceled()) 
					(allowedLen >= catSysId.length) ? this._listResources(catSysId, category, valueStream) : this._listResources(catSysId.splice(0,allowedLen), category, valueStream);
				
            }
        }

        // now persist the counts into the licensing counts table
        if (isCount) {
            var countsGR = new GlideRecord('itom_lu_ci_counts');
            countsGR.setValue('value_stream', valueStream);
            countsGR.setValue('is_aggregated', 'false');

            for (var countedCategory in counts) {
                for (var countedDomain in counts[countedCategory]) {
                    countsGR.setValue('sys_domain', countedDomain)
                    countsGR.setValue('category', countedCategory);
                    countsGR.setValue('sku', this.itomSkuId); // Adding Default SKU
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

    // NOTE: This function is overriden in ITOMVisibilityLicenseCounterWithServices
    _addDeduplicationVmConditions: function(relGr, excludedStatus, allowedSources, dateFilter) {
        // filter first for conditions on parent side ...
        var serverQuery = relGr.addJoinQuery('cmdb_ci_server', 'parent', 'sys_id');
        serverQuery.addCondition('duplicate_of', 'NULL');
        serverQuery.addCondition('install_status', 'NOT IN', excludedStatus.join(","));
        this._addSourceFilter(relGr, 'parent', allowedSources, dateFilter);

        // then filter for conditions on child side ...
        var vmQuery = relGr.addJoinQuery('cmdb_ci_vm_instance', 'child', 'sys_id');
        vmQuery.addCondition('duplicate_of', 'NULL');
        vmQuery.addCondition('install_status', 'NOT IN', excludedStatus.join(","));
        this._addSourceFilter(relGr, 'child', allowedSources, dateFilter);
    },

	_addDeduplicationVirtualServerConditions: function(relGr, excludedStatus, allowedSources, dateFilter) {
		// filter first for conditions on parent side ...
        var virtServerQuery = relGr.addJoinQuery('cmdb_ci_virtualization_server', 'parent', 'sys_id');
        virtServerQuery.addCondition('duplicate_of', 'NULL');
        virtServerQuery.addCondition('install_status', 'NOT IN', excludedStatus.join(","));
        this._addSourceFilter(relGr, 'parent', allowedSources, dateFilter);

        // then filter for conditions on child side ...
        var serverQuery = relGr.addJoinQuery('cmdb_ci_server', 'child', 'sys_id');
        serverQuery.addCondition('duplicate_of', 'NULL');
        serverQuery.addCondition('install_status', 'NOT IN', excludedStatus.join(","));
        this._addSourceFilter(relGr, 'child', allowedSources, dateFilter);
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
        while (licenseDiscoverySourceGr.next()) {
            if (licenseDiscoverySourceGr.getValue('source') != 'AgentClientCollector')
                allowedSources.push(licenseDiscoverySourceGr.getValue('source'));
        }

        return allowedSources;
    },

    // This method will exclude the CIs which satisfies the condition from exclude metadata table

    _excludeMetadata: function(includedCIList, tableName, valueStream) {
        var excludeSysId = [];
        var queryObject = {};
        var gr = new GlideRecord('itom_licensing_exclusion_metadata');
        gr.addQuery('category_table_name', tableName);
        gr.addQuery('value_stream', valueStream).addOrCondition('value_stream', 'All');
        gr.addQuery('active', true);
        gr.query();

        while (gr.next()) {
            var tName = gr.table_name;
            if (queryObject.hasOwnProperty(tName))
                queryObject[tName].push(gr.getValue('condition'));
            else
                queryObject[tName] = [gr.getValue('condition')];
        }
        gs.debug('Query Object' + JSON.stringify(queryObject));
        var queryArr = Object.keys(queryObject);

        for (var i = 0; i < queryArr.length; i++) {
            var querytableName = queryArr[i];
            queryObject[querytableName].forEach(function(query) {
                var tbGr = new GlideRecord(querytableName);
                tbGr.addEncodedQuery(query);
                tbGr.query();
                while (tbGr.next()) {
                    var sysId = tbGr.getUniqueValue();
                    if (excludeSysId.indexOf(sysId) == -1)
                        excludeSysId.push(sysId);
                }
            }, this);
        }

        return this._excludeUtil(excludeSysId, includedCIList);
    },

    // Special Condition to Exclude ECS Cluster VMs
    _ecsVMExclude: function(includedCIList) {
        var excludeSysId = [];
        var countGr = new GlideRecord('cmdb_ci_vm_instance');
        var ecsVMQuery = countGr.addJoinQuery('cmdb_rel_ci', 'sys_id', 'child');
        ecsVMQuery.addCondition('type.name', 'IN', 'Uses::Used by');
        ecsVMQuery.addCondition('parent.sys_class_name', 'cmdb_ci_cloud_ecs_cluster');
        countGr.query();

        while (countGr.next()) {
            var sysId = countGr.getUniqueValue();
            if (excludeSysId.indexOf(sysId) == -1)
                excludeSysId.push(sysId);
        }

        return this._excludeUtil(excludeSysId, includedCIList);
    },

    // Util function to remove the SysId from Included Array
    _excludeUtil: function(excludeArr, includeArr) {
        excludeArr.forEach(function(e) {
            var index = includeArr.indexOf(e);
            if (index > -1)
                includeArr.splice(index, 1);
        });

        return includeArr;
    },

    _listResources: function(CIListForCounting, category, valueStream) {

		var ratio = this.utils.getCategory2Ratio()[category] + ":1";
        var tableName = this.utils._getLicensableCIsTableInfo(valueStream, 'ci_table');
        var encodedQuery = this.utils.getAdditionalFiltersFor(valueStream);

        var gr = new GlideRecord(tableName);
        gr.addQuery('sys_id', 'IN', CIListForCounting.join(','));
        if (encodedQuery)
            gr.addEncodedQuery(encodedQuery);
        gr.query();
		var jsonArr = [];
        while (gr.next() && this.totalListingCount < this.maxResult) {
            jsonCountRecord = {};
            jsonCountRecord.configuration_item = gr.sys_id + '';
            jsonCountRecord.category = category + '';
            jsonCountRecord.value_stream = valueStream + '';
            jsonCountRecord.sku = this.itomSkuId; // Adding Default SKU
            jsonCountRecord.sys_domain = gr.sys_domain + '';
            jsonCountRecord.su_ratio = ratio + '';
            jsonArr.push(jsonCountRecord);
			this.totalListingCount++;
        }
        if(!this.utils.isVisibilityJobCanceled())
		    this.batchUtil.batchInsertMultiple(JSON.stringify(jsonArr), 'itom_lu_licensable_cis', '');
    
    },

    type: 'ITOMVisibilityLicenseCounter'
};
