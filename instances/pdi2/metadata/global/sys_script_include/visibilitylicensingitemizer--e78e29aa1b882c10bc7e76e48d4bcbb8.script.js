var VisibilityLicensingItemizer = Class.create();
VisibilityLicensingItemizer.prototype = {
    initialize: function() {
        this.utils = new sn_itom_license.ITOMLicensingUtils();
    },

    getCIs: function() {
        var valueStream = "Visibility";
        if (!this.utils.ignoreITOMDiscovery())
            valueStream = "Discovery";
        // is the new license model in place for this customer ?
        if (!this.utils.isNewLicenseModel())
            return;

        var metadata = new sn_itom_license.ITOMLicensingMetaData();
        var counts = this.utils.getCountsJsonTemplate();
        var allAllowedSources = this._getDiscoverySources();
        var excludedStatus = ['7', '8', '100']; // RETIRED, STOLEN, ABSENT
        var dateFilter = 'Last 90 days@javascript:gs.beginningOfLast90Days()@javascript:gs.endOfLast90Days()';
        var countedCIs = [];

        // for each applicable category
        for (var category in counts) {
            // NOTE: special case for enduser_devices where we *ONLY* want to count AgentClientCollector sourced CIs
            var allowedSources = (category == 'enduser_devices' ? ['AgentClientCollector'] : allAllowedSources);

            // get the list of tables that we need to count
            var tables = metadata.getTables(category);
            var totalCount = 0;
            var domains = {};
            var categoryTotalCIs = [];
            // for each table that's found for a category
            for (var tableIndex in tables) {
                var tableName = tables[tableIndex];
                var includedCIListwithDomain = [];
                var includedCIList = [];

                //	gs.debug("\tprocessing table : " + tableName);
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
                //	gs.debug("\t Selected sysId before exclude : " + JSON.stringify(includedCIList));
                includedCIList = this._excludeMetadata(includedCIList, tableName, valueStream);
                //	gs.debug("\t Selected sysId after exclude : " + JSON.stringify(includedCIList));						
                if (tableName == 'cmdb_ci_vm_instance')
                    includedCIList = this._ecsVMExclude(includedCIList);

                includedCIListwithDomain.forEach(function(ci) {
                    if (includedCIList.indexOf(ci.sysId) != -1)
                        categoryTotalCIs.push(ci);
                });
            }
            // Counting CI Domain Wise
            categoryTotalCIs.forEach(function(ci) {
                countedCIs.push(ci.sysId);
                if (domains.hasOwnProperty(ci.domain))
                    domains[ci.domain]++;
                else
                    domains[ci.domain] = 1;
            });

            if (category == 'Servers') {
                // a VM can be discovered by both cloud discovery and IP based discovery to avoid
                // counting the same node twice, find the CI's that have a Virtualized by::Virtualizes
                // relationship between cmdb_ci_vm_instance and cmdb_ci_server
                // and deduct that from the total count of domain wise
                var excludeArr = [];
				var relGr = new GlideRecord('cmdb_rel_ci');
                var subDomain = {};
                // vm relationship to host can be either Instantiates::Instantiated by or Virtualized by::Virtualizes
                relGr.addQuery('type.name', 'IN', 'Instantiates::Instantiated by, Virtualized by::Virtualizes, Owns::Owned by');
                this._addDeduplicationVmConditions(relGr, excludedStatus, allowedSources, dateFilter);
                relGr.query();
				
                while (relGr.next()) {
                    // Counting only cmdb_ci_vm_instance
					var parentSysId = relGr.getValue('parent');
					excludeArr.push(parentSysId);
					
					var domain = relGr.parent.sys_domain;
                    if (subDomain.hasOwnProperty(domain))
                        subDomain[domain]++;
                    else
                        subDomain[domain] = 1;
                }
                Object.keys(subDomain).forEach(function(e) {
                    if (domains.hasOwnProperty(e)) {
                        domains[e] -= subDomain[e];
                    }
                });
				countedCIs = this._excludeUtil(excludeArr, countedCIs);
				
            }

            // Adding 0 count with default domain in case of empty object
            counts[category] = (Object.keys(domains).length) ? domains : {
                "global": 0
            };
        }

        return countedCIs;
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
        //	gs.debug('Query Object' + JSON.stringify(queryObject));
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

    printCIClasswiseCount: function() {
        var CIs = this.getCIs();
        if (CIs.length == 0) {
            gs.info("Counted CI list is empty");
            return;
        }
        var gr = new GlideAggregate('cmdb_ci');
        gr.addQuery('sys_id', 'IN', CIs.join(","));
        gr.addAggregate('COUNT', 'sys_class_name');
        gr.orderBy('sys_class_name');
        gr.query();

        while (gr.next()) {
            var tableName = gr.sys_class_name;
            var tableCount = gr.getAggregate('COUNT', 'sys_class_name');
            gs.info("Table Name: " + tableName + ", Count: " + tableCount);
        }
    },

    printCIsGroupedBy: function() {
        var CIs = this.getCIs();
        var len = arguments.length;
        this.column = [];
		this.filters = [];
        if (len == 0) {
            this.gr = new GlideRecord('cmdb_ci');
            this.gr.addQuery('sys_id', 'IN', CIs.join(","));
            this.gr.orderBy('sys_class_name');
            this.column.push('sys_class_name');
        } else {
            this.gr = new GlideRecord('cmdb_ci');
            this.gr.addQuery('sys_id', 'IN', CIs.join(","));
            for (var i = 0; i < len; i++) {
                this.gr.orderBy(arguments[i]);
                this.column.push(arguments[i]);
            }
        }
        return this;
    },

    filterOn: function(param1, param2, param3) {
      
        if (param3)
            this.gr.addQuery(param1, param2, param3);
        else
            this.gr.addQuery(param1, param2);
		if(this.filters.indexOf(param1) == -1)
			this.filters.push(param1);
        return this;
    },

    showFilters: function(val) {
        this.showFilters = val;
        if (val == 'true') {
            for(var i = 0; i < this.filters.length;i++)
				if(this.column.indexOf(this.filters[i]) == -1)
					this.column.push(this.filters[i]);
        }
        return this;
    },

    print: function(top) {

        if (top)
            this.gr.setLimit(top);
        this.gr.query();

        while (this.gr.next()) {
            var str = "sysId: " + this.gr.getValue('sys_id') + ",\t" + "Name: " + this.gr.getValue('name') + ",\t";
            for (var i = 0; i < this.column.length; i++)
                str += this.column[i] + ": " + this.gr.getValue(this.column[i]) + ",\t";
            gs.info(str);
        }
    },

    printCIsforClass: function(tableName) {
        var CIs = this.getCIs();
        var gr = new GlideAggregate('cmdb_ci');
        gr.addQuery('sys_id', 'IN', CIs.join(","));
        gr.addQuery('sys_class_name', tableName);
        gr.query();
        if (gr.hasNext()) {
            gs.info('Below are the counted CIs for Table: ' + tableName);
            while (gr.next())
                gs.info("CI Name: " + gr.getValue('name') + ", Sys ID: " + gr.getValue('sys_id'));
        } else
            gs.info('No counted CIs present in table ' + tableName);
    },


    type: 'VisibilityLicensingItemizer'
};
