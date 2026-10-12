var CMDBWorkspaceUtil = Class.create();
CMDBWorkspaceUtil.prototype = Object.extendsObject(CMDBWsConstants, {
    initialize: function() {
        this.log = new global.GSLog("com.snc.sn_cmdb_ws.log.level", this.type);
    },

    /**
     * Helper function that prepends reference field alias to all fields specified in a query
     *
     * @param {String} query         query supplied by a condition builder
     * @param {String} tableAlias    tableAlias that's prepended to each field in a query
     *
     * @example
     * this.appendTableName("operational_status=1^nameSTARTSWITHPS", "ci_item")
     * // returns ci_item.operational_status=1^ci_item.nameSTARTSWITHPS
     *
     * @return {String} Returns a query with field names that are prepended with tableAlias specified
     */
    appendRefAlias: function(query, tableAlias) {
        if (!query)
            return "";

        //first replace any ^OR or ^NQ at the end of the string with ##OR or ##NQ
        query = query.replace(/\^OR$/g, "##OR");
        query = query.replace(/\^NQ$/g, "##NQ");
        query = query.replace(/\^EQ$/g, "##EQ");

        //first replace ^ORs with ##OR - intentionally padding them with ##
        query = query.replace(/\^OR/g, "##OR" + tableAlias + ".");

        //next replace ^NQs
        query = query.replace(/\^NQ/g, "##NQ" + tableAlias + ".");

        //next replace ^EQs
        query = query.replace(/\^EQ/g, "##EQ" + tableAlias + ".");

        //next replace just ^s with the tableAlias dot
        query = query.replace(/\^/g, "^" + tableAlias + ".");

        //lastly replace ##ORs with ^OR and replace ##NQs with ^NQ
        query = query.replace(/##OR/g, '^OR');
        query = query.replace(/##NQ/g, '^NQ');
        query = query.replace(/##EQ/g, '^EQ');
        var encodedQuery = gs.nil(query) ? "" : tableAlias + "." + query;

        return encodedQuery;
    },

    transformUnderscoreStrToFirstLetterUpperCase: function(value) {
        if (global.JSUtil.nil(value)) {
            return '';
        }
        value = value.toLowerCase();
        value = value.replaceAll('_', ' ');
        value = value.charAt(0).toUpperCase() + value.slice(1);
        return value;
    },


    /*
     * Iterates thru all the encoded queries within each CMDB Group
     * and gets counts for each which are written to sn_cmdb_ws_group_query_metadata.
     * Also adds up all the count for the group as a whole.
     *   Note: the group count is only for encoded queries
     *   and doesn't include manually selected or QueryBuilder queries.
     * The counts are the number of matching CIs for the encoded queries and the group as a whole.
     */

    populateNoOfMatchingCIsForEncQrys: function() {
        var logMsgs = false;
        var gr = new GlideRecord(this.TABLES.CMDB_GROUP);
        gr.addQuery(this.COLS.GROUP_TYPE, this.WORKSPACE_PARAM);
        gr.query();

        if (logMsgs) {
            this.log.info('Total Group Count: ' + gr.getRowCount());
        }

        while (gr.next()) {
            if (logMsgs) {
                this.log.info('Current group name: ' + gr.group_name);
            }
            var countForGroup = 0;
            countForGroup += this.getNoOfMatchingCIsOnEncQrys(gr.sys_id);
            this.insUpdCntGrpMetadata(gr.sys_id, countForGroup);
        }

        //remove orphaned group metadata records not picked up by cascade delete
        this.remOrphanedGrpRecords();
        //remove orphaned group query metadata records not picked up by cascade delete
        this.remOrphanedGrpQryRecords();
    },

    /**
     * Helper function that counts the number of matching CIs on Encoded Queries and
     * inserts/update count into the sn_cmdb_ws_group_query_metadata table
     * @param {String} groupSysId
     *
     * @return {Number} Returns the count of Matching CIs on encoded queries for a group
     */
    getNoOfMatchingCIsOnEncQrys: function(groupSysId) {

        var tableDisplayNames = {};
        var shouldUseSimpleCondition = this.isSimpleConditionEnabled();
        var gr = new GlideRecord(this.TABLES.CMDB_GROUP_CONTAINS_ENCODED_QUERY);
        gr.addQuery(this.COLS.GROUP, groupSysId);
        gr.query();
        var countForGroup = 0;

        while (gr.next()) {
            var className = gr.getValue(this.COLS.CLASS);
            var condition = gr.getValue(this.COLS.CONDITION);
            if (shouldUseSimpleCondition) {
                condition = gr.getValue(this.COLS.SIMPLE_CONDITION);
            }

            if (gs.tableExists(className)) {
                var ga = new GlideAggregate(className);
                var numCIs = 0;
                ga.addAggregate(this.COUNT_AGGREGATE);

                if (condition)
                    ga.addEncodedQuery(condition, this.BOOLEAN.TRUE);
                ga.query();

                if (ga.next())
                    numCIs = parseInt(ga.getAggregate(this.COUNT_AGGREGATE));

                countForGroup += numCIs;

                if (!tableDisplayNames[className]) {
                    tableDisplayNames[className] = new GlideRecord(className).getClassDisplayValue();
                }
                this.insUpdCntGrpQryMetadata(gr.sys_id, numCIs, tableDisplayNames[className]);
            }

        }
        return countForGroup;
    },

    isSimpleConditionEnabled: function() {
        return this.getSystemProperty(this.SYS_PROPERTIES_NAME.SHOULD_USE_SIMPLE_CONDITION, this.DATATYPE.BOOLEAN);
    },

    /**
     * Helper function to update/insert count of CIs in sn_cmdb_ws_group_query_metadata table
     * @params {String} sysId
     * @params {Number} countCIs
     * @params {String} tableDisplayName
     */
    insUpdCntGrpQryMetadata: function(sysId, countCIs, tableDisplayName) {

        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_GROUP_QUERY_METADATA);
        var foundQuery = gr.get(this.COLS.ENCODED_QUERY, sysId);

        if (foundQuery) {
            gr.setValue(this.COLS.CI_COUNT, countCIs);
            gr.setValue(this.COLS.NAME, tableDisplayName);
            gr.update();
        } else {
            gr.initialize();
            gr.setValue(this.COLS.ENCODED_QUERY, sysId);
            gr.setValue(this.COLS.CI_COUNT, countCIs);
            gr.setValue(this.COLS.NAME, tableDisplayName);
            gr.insert();
        }
    },

    /**
     * Helper function to update/insert count of CIs in sn_cmdb_ws_group_query_metadata table
     * @params {String} sysId
     * @params {Number} countForGroup
     */
    insUpdCntGrpMetadata: function(sysId, countForGroup) {

        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_GROUP_METADATA);
        gr.addQuery(this.COLS.GROUP, sysId);
        gr.query();

        if(gr.next()){
            if(gr.getRowCount() > 1){
                gr.deleteMultiple();

                var groupMetadataGr = new GlideRecord(this.TABLES.SN_CMDB_WS_GROUP_METADATA);
                groupMetadataGr.initialize();
                groupMetadataGr.setValue(this.COLS.GROUP, sysId);
                groupMetadataGr.setValue(this.COLS.CI_COUNT, countForGroup);
                groupMetadataGr.insert();
            } else {
                gr.setValue(this.COLS.CI_COUNT, countForGroup);
                gr.update();
            }
        } else {
            gr.initialize();
            gr.setValue(this.COLS.GROUP, sysId);
            gr.setValue(this.COLS.CI_COUNT, countForGroup);
            gr.insert();
        }
    },


    /**
     * Helper function to removed orphaned records from sn_cmdb_ws_group_metadata table
     *
     */
    remOrphanedGrpRecords: function() {
        var grGrpMeta = new GlideRecord(this.TABLES.SN_CMDB_WS_GROUP_METADATA);
        grGrpMeta.query();

        while (grGrpMeta.next()) {
            var grGrp = new GlideRecord(this.TABLES.CMDB_GROUP);
            var hasGroupMatch = grGrp.get(grGrpMeta.group);
            if (!hasGroupMatch) {
                grGrpMeta.deleteRecord();
            }
        }
    },

    /**
     * Helper function to removed orphaned records from sn_cmdb_ws_group_metadata table
     *
     */
    remOrphanedGrpQryRecords: function() {
        var grGrpQry = new GlideRecord(this.TABLES.SN_CMDB_WS_GROUP_QUERY_METADATA);
        grGrpQry.query();

        while (grGrpQry.next()) {
            var grEncQry = new GlideRecord(this.TABLES.CMDB_GROUP_CONTAINS_ENCODED_QUERY);
            var hasGroupMatch = grEncQry.get(grGrpQry.encoded_query);
            if (!hasGroupMatch) {
                grGrpQry.deleteRecord();
            }
        }
    },

    populateManagementAggregates: function() {
        //only aggregating rejected CIs for now
        this._populateRejectedCIs();
    },

    _populateRejectedCIs: function() {
        var rejectedCis = this.getRowCount(this.TABLES.CMDB_CI, 'attestation_status=Rejected', null, this.BOOLEAN.FALSE);

        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.CATEGORY.REJECTED_CIS);
        this.populateBaseAggData(this.CATEGORY.REJECTED_CIS, null, rejectedCis, this.STATES.DRAFT);

        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.CATEGORY.REJECTED_CIS);
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.CATEGORY.REJECTED_CIS);
    },

    getManagementLinkGroups: function() {
        var legacyDM = {
            type: this.LINK_TYPES.EXTERNAL,
            href: 'nav_to.do?uri=$ci_lifecycle.do',
            openNewWindow: true,
            label: gs.getMessage('Data Manager')
        };

        var uibDM = {
            type: this.LINK_TYPES.ROUTE,
            href: this.HREF_FOR_ROUTE_TYPE,
            openNewWindow: false,
            label: gs.getMessage('Data Manager'),
            route: {
                route: 'data-manager'
            }
        };

        var dmLink = uibDM; //entry point to new Data Manager, for now. Delete this line and uncomment the following line when feature support sys_property is updated to include data_manager
        //var dmLink = new sn_cmdb_ws.CMDBWsFeatureSupportUtil().supportsFeature('data_manager') ? uibDM : legacyDM; 

        var optimizeGroupLinks = [{
                type: this.LINK_TYPES.ROUTE,
                href: this.HREF_FOR_ROUTE_TYPE,
                openNewWindow: false,
                label: gs.getMessage('CMDB Health'),
                route: {
                    route: 'health-dashboard'
                }
            }, {
                type: this.LINK_TYPES.EXTERNAL,
                href: GlidePluginManager.isActive('com.snc.cmdb.getwell') ?
                    '/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/2e740da85b1372651129c580866219b2' : 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/5c0b68e35300101032b7ddeeff7b1231',
                openNewWindow: true,
                label: gs.getMessage('CMDB Data Foundations Dashboard')
            }, {
                type: this.LINK_TYPES.EXTERNAL,
                href: GlidePluginManager.isActive('com.snc.cmdb.getwell') ?
                    '/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/3201f505186fdf01ef3ee1a0cc7aa9c2' : 'https://store.servicenow.com/sn_appstore_store.do#!/store/application/5c0b68e35300101032b7ddeeff7b1231',
                openNewWindow: true,
                label: gs.getMessage('CSDM Data Foundations Dashboard')
            }, {
                type: this.LINK_TYPES.ROUTE,
                href: this.HREF_FOR_ROUTE_TYPE,
                openNewWindow: false,
                route: {
                    route: this.LIST_ROUTE,
                    fields: {
                        table: 'task'
                    },
                    params: {
                        listTitle: gs.getMessage('De-Duplication Tasks'),
                        query: 'sys_class_name=reconcile_duplicate_task^active=true'
                    }
                },
                label: gs.getMessage('De-Duplication Tasks')
            }, {
                type: this.LINK_TYPES.ROUTE,
                href: this.HREF_FOR_ROUTE_TYPE,
                openNewWindow: false,
                route: {
                    route: this.LIST_ROUTE,
                    fields: {
                        table: 'remediation_rule'
                    },
                    params: {
                        listTitle: gs.getMessage('CMDB Remediation Rules')
                    }
                },
                label: gs.getMessage('CMDB Remediation Rules')
            }];

        //Append CMDB Advisor Link
        if(sn_cmdb_ws.CMDBWsAdvisorUtil.showManagementPageEntryPoint()){
            optimizeGroupLinks.unshift(sn_cmdb_ws.CMDBWsAdvisorUtil.getManagementPageEntryPointLink());
        }

        var linkGroups = [{
            groupHeader: gs.getMessage('Manage'),
            links: [{
                    type: this.LINK_TYPES.EXTERNAL,
                    href: 'nav_to.do?uri=$ciModel.do',
                    openNewWindow: true,
                    label: gs.getMessage('CI Class Manager')
                }, dmLink,
                {
                    type: this.LINK_TYPES.ROUTE,
                    href: this.HREF_FOR_ROUTE_TYPE,
                    openNewWindow: false,
                    label: gs.getMessage('CMDB Groups'),
                    route: {
                        route: this.LIST_ROUTE,
                        fields: {
                            table: 'cmdb_group'
                        },
                        params: {
                            listTitle: gs.getMessage('CMDB Groups'),
                        }
                    }
                }, {
                    type: this.LINK_TYPES.ROUTE,
                    href: this.HREF_FOR_ROUTE_TYPE,
                    openNewWindow: false,
                    route: {
                        route: this.LIST_ROUTE,
                        fields: {
                            table: 'cmdb_ci_query_based_service'
                        },
                        params: {
                            listTitle: gs.getMessage('Dynamic CI Groups')
                        }
                    },
                    label: gs.getMessage('Dynamic CI Groups')
                }, {
                    type: this.LINK_TYPES.ROUTE,
                    href: this.HREF_FOR_ROUTE_TYPE,
                    openNewWindow: false,
                    label: gs.getMessage('De-duplication Template Library'),
                    route: {
                        route: 'de-duplication-template-library'
                    }
                }, {
                    type: this.LINK_TYPES.ROUTE,
                    href: this.HREF_FOR_ROUTE_TYPE,
                    openNewWindow: false,
                    label: gs.getMessage('De-duplication Dashboard'),
                    route: {
                        route: 'deduplication-dashboard'
                    }
                }
            ]
        }, {
            groupHeader: gs.getMessage('Optimize'),
            links: optimizeGroupLinks
        }, {
            groupHeader: gs.getMessage('Visualize'),
            links: [{
                type: this.LINK_TYPES.EXTERNAL,
                href: 'nav_to.do?uri=$ngbsm.do',
                openNewWindow: true,
                label: gs.getMessage('Dependency View')
            }, {
                type: this.LINK_TYPES.EXTERNAL,
                href: '$queryBuilder.do',
                openNewWindow: true,
                label: gs.getMessage('Query Builder')
            }, {
                type: this.LINK_TYPES.ROUTE,
                href: '/now/cmdb/management/sub/unifiedmap',
                openNewWindow: false,
                label: gs.getMessage('Unified Map')
            }]
        }, {
            groupHeader: gs.getMessage('Create'),
            links: [{
                type: this.LINK_TYPES.EXTERNAL,
                href: 'nav_to.do?uri=$csdm_app_service.do',
                openNewWindow: true,
                label: gs.getMessage('Create an Application Service')
            }, {
                type: this.LINK_TYPES.EXTERNAL,
                href: 'nav_to.do?uri=cmdb_ci_business_app.do?sysparm_view=business_applications',
                openNewWindow: true,
                label: gs.getMessage('New Business Application')
            }, {
                type: this.LINK_TYPES.EXTERNAL,
                href: 'nav_to.do?uri=cmdb_ci_service_technical.do',
                openNewWindow: true,
                label: gs.getMessage('New Technical Service')
            }]
        }];

        return linkGroups;
    },

    /**
     * Helper function to check if CIs Managed By Me should be included on landing page
     * @return {Boolean}
     */
    showCIsManagedByMe: function() {
        var propEnabled = this.getSystemProperty(this.SYS_PROPERTIES_NAME.CIS_MANAGED_BY_ME, this.DATATYPE.BOOLEAN);
        var hasMinimumRole = this.userHasRole(this.ROLES.SN_CMDB_EDITOR);

        return propEnabled && hasMinimumRole;
    },

    /**
     * Helper function to check if Total CIs should be included on landing page
     * @return {Boolean}
     */
    showTotalCIs: function() {
        var propEnabled = this.getSystemProperty(this.SYS_PROPERTIES_NAME.ENABLE_TOTAL_CIS, this.DATATYPE.BOOLEAN, 'true');
        return propEnabled;
    },

    /**
     * Helper function to check if Important Actions should be included on the landing page
     * @return {Boolean}
     */
    showImportantActions: function() {
        var isMaint = this.isUserMaint();
        var isCMDBAdmin = this.userHasRole(this.ROLES.SN_CMDB_ADMIN);
        var isCMDBEditor = this.userHasRole(this.ROLES.SN_CMDB_EDITOR);

        return (isMaint || isCMDBAdmin || isCMDBEditor);
    },

    /**
     * Helper function to check the user is permitted to use Edit Mode on the Unified Map
     * @return {Boolean}
     */
    userCanPerformUMEdits: function() {
        var isMaint = this.isUserMaint();
        var isCMDBAdmin = this.userHasRole(this.ROLES.SN_CMDB_ADMIN);
        var isCMDBEditor = this.userHasRole(this.ROLES.SN_CMDB_EDITOR);
        return (isMaint || isCMDBAdmin || isCMDBEditor);
    },

     /**
     * Helper function to check the user is permitted to manage shared presets
     * @return {Boolean}
     */
     userCanManageSharedPreset: function() {
        var isMaint = this.isUserMaint();
        var isConfigEditor = this.userHasRole(this.ROLES.SN_CMDB_WS_CONFIG_EDITOR);
        var isConfigAdmin = this.userHasRole(this.ROLES.SN_CMDB_WS_CONFIG_ADMIN);
        return (isMaint || isConfigEditor || isConfigAdmin);
    },
    
    /**
     * Parse a string to a boolean
     * @params {String}
     * @return {boolean}
     */
    parseBooleanString: function(booleanString) {
        if (booleanString)
            return booleanString === 'true' ? true : false;
        return false;
    },

    /**
     * Parse a string to a number
     * @params {String}
     * @return {Number}
     */
    parseNumericString: function(numericString) {
        if (numericString) {
            var val = Number(numericString);
            return isNaN(val) ? null : val;
        }
        return;
    },

    /**
     * Helper function to check if current user has given role
     * @return {Boolean}
     */
    userHasRole: function(role) {
        return gs.hasRole(role);
    },

    /**
     * Helper function to check if current user is maint
     * @return {Boolean}
     */
    isUserMaint: function() {
        return this.userHasRole(this.ROLES.MAINT);
    },

    /**
     * Helper function to check if the given table has any action config that we have set
     * @return {Boolean}
     */
    tableHasActionConfig: function(table) {
        return this.hasRecord(this.TABLES.M2M_ACTION_ASSIGNMENT_ACTION_CONFIG, null, {
            'action_configuration': this.CMDB_WORKSPACE_ACTION_CONFIG_ID,
            'action_assignment.table': table
        }, this.BOOLEAN.FALSE);
    },

    /**
     * Helper function to get if the given table and query result in at least one valid record
     * @params {String} table
     * @params {String} encodedQuery
     * @params {Object} query
     * @return {boolean} whether the table has at least one record that satifies the queries
     */
    hasRecord: function(table, encodedQuery, query, aclCheck) {
        var gr = new GlideRecord(table);
        this.addQueryConditions(gr, encodedQuery, query, aclCheck);

        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /**
     * Helper function to get the row count on the given table with given queries
     * @params {String} table
     * @params {String} encodedQuery
     * @params {Object} query
     * @return {number} row count that satisfies the query condition
     */
    getRowCount: function(table, encodedQuery, query, aclCheck, rrCategory) {
        if (gs.tableExists(table)) {
            var ga = new GlideAggregate(table);
            this.addQueryConditions(ga, encodedQuery, query, aclCheck);
            ga.addAggregate(this.COUNT_AGGREGATE);
            if (rrCategory == true || rrCategory == "true") {
                ga.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
            }
            ga.query();
            if (ga.next()) {
                return ga.getAggregate(this.COUNT_AGGREGATE);
            }
        }

        return 0;
    },

    /**
	 * Return the row count with limit for a given table and encodedQuery/filter up to a max of given maxCount or 100K
	 * @param {String} table
	 * @param {String} encodedQuery
	 * @param {Number} maxCount
	 * @returns {String} rowCount or maxCount+
	 **/
	getRowCountWithLimit: function(table, encodedQuery, enforceACL, maxCount) {
        var DM = new CMDBWsDMConstants();
		maxCount = maxCount || 100000;
			
		var ga = new GlideAggregate(table);
		if (!ga.isValid())
			throw new CMDBWsError({
                code: DM.ERROR_CODES.DM_INVALID_TABLE,
                action: DM.ACTIONS.DM_GET_TABLE_ROW_COUNT,
                source: DM.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Error - Invalid table"),
                details: DM.ERROR_CODES.DM_INVALID_TABLE,
                logError: false
            });

		ga.addAggregate('COUNT');
		ga.setAggregateWindow(0, (maxCount + 1));
		if (encodedQuery)
			ga.addEncodedQuery(encodedQuery, enforceACL);
		ga.query();

		if (ga.next()) {
			return Number(ga.getAggregate('COUNT'));
		}
		
		throw new CMDBWsError({
			code: DM.ERROR_CODES.DM_INVALID_RECORD,
			action: DM.ACTIONS.DM_GET_TABLE_ROW_COUNT,
			source: DM.DM_ERROR_SOURCE,
			message: sn_i18n.Message.getMessage("sn_cmdb_ws", DM.ERROR_CODES.DM_INVALID_RECORD),
			details: DM.ERROR_CODES.DM_INVALID_RECORD,
			logError: false
		});
	},

    addQueryConditions: function(gr, encodedQuery, query, aclCheck) {
        var enforceACL = (aclCheck === this.BOOLEAN.TRUE || aclCheck === "true" || global.JSUtil.nil(aclCheck)) ? this.BOOLEAN.TRUE : this.BOOLEAN.FALSE;
        if (encodedQuery) {
            gr.addEncodedQuery(encodedQuery, enforceACL);
        }
        if (query) {
            var fields = Object.keys(query);
            for (var i = 0; i < fields.length; i++) {
                gr.addQuery(fields[i], query[fields[i]]);
            }
        }
    },

    /**
     * Helper function to get GA object on given table with given queries and group by
     * @params {String} table
     * @params {String} encodedQuery
     * @params {Object} query
     * @params {String} groupBy
     * @return {GlideAggregate} Queried groups with counts from given table with query condition
     */
    getRowCountByGroup: function(table, encodedQuery, query, groupBy, aclCheck) {
        var ga = new GlideAggregate(table);
        this.addQueryConditions(ga, encodedQuery, query, aclCheck);
        ga.addAggregate(this.COUNT_AGGREGATE);
        ga.groupBy(groupBy);
        ga.query();

        return ga;
    },

    /**
     * Helper function to check if a plugin is active
     * @params {String} pluginId
     * @return {boolean} whether the given plugin is active or not
     */
    isPluginActive: function(pluginId) {
        return new GlidePluginManager().isActive(pluginId);
    },

    /**
     * Helper function to get the value for the given sys_property
     * @params {String} key
     * @params {DATATYPE} datatype
     * @params {any} defaultValue
     * @return {Object} value 
     */
    getSystemProperty: function(key, dataType, defaultValue) {
        var val = gs.getProperty(key, defaultValue);
        switch (dataType) {
            case this.DATATYPE.BOOLEAN:
                return this.parseBooleanString(val);
            case this.DATATYPE.NUMBER:
                return this.parseNumericString(val);
            default:
                return val;
        }
    },

    /**
     * Helper function to check if license is active for given appId
     * @params {String} appId
     * @return {Object} whether the license is active or not 
     */
    hasActiveLicense: function(appId) {
        return new sn_lef.GlideLicenseAPI().hasLicenseForFeature("app_id", appId);
    },

    populateBaseAggData: function(chart, groupby, count, state, groupbyTable, dynamicGroupby) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        gr.initialize();
        gr.setValue(this.COLS.CHART, chart);
        if (groupby)
            gr.setValue(this.COLS.GROUP_BY, groupby);
        if (groupbyTable)
            gr.setValue(this.COLS.GROUP_BY_TABLE, groupbyTable);
        if (dynamicGroupby)
            gr.setValue(this.COLS.DYNAMIC_GROUP_BY, dynamicGroupby);
        gr.setValue(this.COLS.COUNT, count);
        gr.setValue(this.COLS.STATE, state);
        gr.insert();
    },

    updateBaseAggDataState: function(sourceState, targetState, chart, groupby, dynamicGroupby) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        if (chart)
            gr.addQuery(this.COLS.CHART, chart);
        if (groupby)
            gr.addQuery(this.COLS.GROUP_BY, groupby);
        if (dynamicGroupby)
            gr.addQuery(this.COLS.DYNAMIC_GROUP_BY, dynamicGroupby);
        gr.addQuery(this.COLS.STATE, sourceState);
        gr.setValue(this.COLS.STATE, targetState);
        gr.updateMultiple();
    },

    deleteFeatureCategoryAggregate: function(featureId, state, groupby) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        gr.addQuery(this.COLS.CHART, featureId);
        if (global.JSUtil.notNil(state)) {
            gr.addQuery(this.COLS.STATE, state);
        }
        if (global.JSUtil.notNil(groupby)) {
            gr.addQuery(this.COLS.GROUP_BY, groupby);
        }
        gr.query();
        while (gr.next()) {
            gr.deleteRecord();
        }
    },

    updateDraftFeatureCategoryAggregate: function(featureId, state, count, groupby) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        gr.addQuery(this.COLS.CHART, featureId);
        gr.addQuery(this.COLS.STATE, this.STATES.DRAFT);
        if (global.JSUtil.notNil(groupby)) {
            gr.addQuery(this.COLS.GROUP_BY, groupby);
        }
        gr.query();
        while (gr.next()) {
            if (global.JSUtil.notNil(state)) {
                gr.setValue(this.COLS.STATE, state);
            }
            if (global.JSUtil.notNil(count)) {
                gr.setValue(this.COLS.COUNT, count);
            }
            gr.update();
        }
    },

    getAggregateData: function(featureId, groupByFilter, stateFilter) {
        var result = [];
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        gr.addQuery(this.COLS.CHART, featureId);
        if (groupByFilter) {
            gr.addQuery(this.COLS.GROUP_BY, groupByFilter);
        }
        if (stateFilter) {
            gr.addQuery(this.COLS.STATE, stateFilter);
        }
        gr.query();

        while (gr.next()) {
            result.push({
                chart: gr.getValue(this.COLS.CHART),
                groupBy: gr.getValue(this.COLS.GROUP_BY),
                count: +gr.getValue(this.COLS.COUNT),
                updatedDt: gr.getValue(this.COLS.SYS_UPDATED_ON)
            });
        }

        return result;
    },

    isJson: function(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    },

    getRelative24hrEncodedQuery: function(column) {
        return column + "RELATIVEGT@hour@ago@24";
    },

    /**
     * Generic method to make outbound REST API call.
     * @params {String} url
     * @return {Object} response with status and body
     */
    httpGet: function(url) {
        var response;
        try {
            var sm = new sn_ws.RESTMessageV2();
            sm.setEndpoint(url);
            sm.setHttpMethod('get');
            response = sm.execute();
            var responseBody = response.haveError() ? response.getErrorMessage() : JSON.parse(response.getBody());
            response = {
                status: response.getStatusCode(),
                body: responseBody
            };
        } catch (ex) {
            var errorMessage = ex.getMessage ? ex.getMessage() : "Error fetching data";
            response = {
                status: 500,
                body: errorMessage
            };
        }
        return response;
    },

    /**
     * Gets AppStore url.
     * @return {String} appstore url
     */
    getAppStoreBaseUrl: function() {
        return this.getSystemProperty(this.SYS_PROPERTIES_NAME.APPSTORE_BASE_URL, this.DATATYPE.STRING, "https://store.service-now.com/");
    },

    /**
     * Given relative path for appstore, this returns the absolute url relevant for this instance
     */
    buildAppStoreUrl: function(relativePath) {
        var baseUrl = this.getAppStoreBaseUrl();
        baseUrl = baseUrl.replace(/\/+$/, "");
        var relPath = relativePath.replace(/^\/+/, "");
        return baseUrl + "/" + relPath;
    },

    invokePAJob: function(paJobId, jobName) {
        var paJobRecord = new GlideRecord(this.TABLES.SYSAUTO_PA);
        if (paJobRecord.get(paJobId)) {
            var paJobName = paJobRecord.getValue(this.COLS.NAME);
            gs.debug("Invoking job : '{0}' to calculate trends for aggregated charts", paJobName);
            var paTriggerId = gs.executeNow(paJobRecord);
            gs.info("Triggered job : '{0} ' with trigger id : {1} ", paJobName, paTriggerId);
        } else {
            gs.error("Failed to find PA job with sys Id {0} and cannot execute the {1} job", paJobId, jobName);
        }
    },

    invokeWsAggregatesMonthlyPAJob: function() {
        this.invokePAJob(this.SCHEDULED_JOBS.CMDB_WS_AGGREGATES_MONTHLY_PA_JOB, "CMDB Workspace Monthly Collection");
    },

    invokeWsAggregatesDailyPAJob: function() {
        this.invokePAJob(this.SCHEDULED_JOBS.CMDB_WS_AGGREGATES_DAILY_PA_JOB, "CMDB Workspace Aggregates Collection");
    },

    invokeWsOnDemandPAJobWithLookback: function() {
        this.invokePAJob(this.SCHEDULED_JOBS.CMDB_WS_COLLECTION_ON_DEMAND_WITH_LOOKBACK, "CMDB Workspace Collection On Demand With Lookback");
    },

    invokeScriptJob: function(scriptJobId, jobName) {
        var scriptJobRecord = new GlideRecord(this.TABLES.SYSAUTO_SCRIPT);
        if (scriptJobRecord.get(scriptJobId)) {
            var scriptJobName = scriptJobRecord.getValue(this.COLS.NAME);
            gs.debug("Invoking job : '{0}'", scriptJobName);
            var scriptTriggerId = gs.executeNow(scriptJobRecord);
            gs.info("Triggered job : '{0} ' with trigger id : {1} ", scriptJobName, scriptTriggerId);
        } else {
            gs.error("Failed to find script job with sys_id {0} and cannot execute the {1} job", scriptJobId, jobName);
        }
    },

    invokeWsPopulateAggregatesDailyScriptJob: function() {
        this.invokeScriptJob(this.SCHEDULED_JOBS.CMDB_WS_POPULATE_AGGREGATES_DAILY, "CMDB Workspace - Populate aggregates Daily");
    },

    invokeWsPopulateAggregatesMonthlyScriptJob: function() {
        this.invokeScriptJob(this.SCHEDULED_JOBS.CMDB_WS_POPULATE_AGGREGATES_MONTHLY, "CMDB Workspace - Populate aggregates Monthly");
    },

    /**
     * Abbreviates a number
     * @params {Number} num
     * @return {String} abbreviated number
     */
    abbreviateNumber: function(num) {
        if (global.JSUtil.nil(num)) return null;

        var formatNumStr = function(numberStr, suffix) {
            if (numberStr.endsWith('.0')) {
                return numberStr.slice(0, -2) + suffix;
            }
            return numberStr + suffix;
        };

        if (num < 1e3) {
            return num.toString();
        }

        if (num >= 1e3 && num < 1e6) {
            return formatNumStr((num / 1e3).toFixed(1), 'K');
        }

        if (num >= 1e6 && num < 1e9) {
            return formatNumStr((num / 1e6).toFixed(1), 'M');
        }

        return formatNumStr((num / 1e9).toFixed(1), 'B');
    },

    getJobLastCompletedInfo: function(jobId) {
        var completedDateTime = gs.getMessage("N/A");
        var gr = new GlideRecord(this.TABLES.PA_JOB_LOGS);
        gr.addQuery(this.COLS.JOB, jobId);
        gr.addQuery(this.COLS.STATE, this.PA_JOB_LOGS_STATE.COLLECTED_OK);
        gr.setLimit(1);
        gr.orderByDesc(this.COLS.SYS_CREATED_ON);
        gr.query();
        if (gr.next()) {
            completedDateTime = gr.getDisplayValue(this.COLS.COMPLETED);
        }
        return completedDateTime;
    },

    getCMDBWsPAJobsLastCompletedInfo: function() {
        var result = {};
        var jobs = {};
        jobs[this.SCHEDULED_JOB_RUN_TYPE.AGGREGATES_DAILY_JOB] = this.SCHEDULED_JOBS.CMDB_WS_AGGREGATES_DAILY_PA_JOB;
        jobs[this.SCHEDULED_JOB_RUN_TYPE.AGGREGATES_MONTHLY_JOB] = this.SCHEDULED_JOBS.CMDB_WS_AGGREGATES_MONTHLY_PA_JOB;

        for (var runType in jobs) {
            var dateTime = this.getJobLastCompletedInfo(jobs[runType]);
            result[runType] = gs.getMessage("Last updated: {0}", dateTime);
        }
        return result;
    },

    /**
     * Gets scores and details for given indicator, breakdown and breakdownElements
     * @params {String} indicatorId
     * @params {String} breakdownId
     * @params {Array} breakdownElementId
     * @params {Number} periodInDays - Number of days to fetch the data for
     * @params {Object} dataConfigOverride - override the default dataConfigurations for ScriptableParDataAPI
     * @return {Object}
     */
    getIndicatorDetails: function(indicatorId, breakdownId, breakdownElementId, periodInDays, dataConfigOverride) {
        var result;
        var uuid = {
            indicator: indicatorId
        };

        if (!global.JSUtil.nil(breakdownId)) {
            uuid.breakdowns = [{
                sysId: breakdownId
            }];

            if (!global.JSUtil.nil(breakdownElementId)) {
                uuid.breakdowns[0].elementSysIds = [breakdownElementId];
            }
        }

        if (global.JSUtil.nil(periodInDays)) {
            periodInDays = 30;
        }

        var defaultDataConfiguration = {
            sortBy: null,
            sortOrder: null,
            sourceType: "indicator",
            dataCategory: "trend",
            order: 0,
            aggregateBy: 4,
            includeLiveScore: null,
            trendBy: "anything",
            trendInterval: "date",
            trendMinuteInterval: null,
            includeChange: null,
            includeChangePercentage: null,
            includeGlobalTargets: false,
            includePersonalTargets: false,
            includeForecast: false,
            includeForecastRange: false,
            includeTrend: false,
            includeBand: false,
            includeGapPercentage: null,
            includeSparkline: null,
            includeComments: false,
            includeGlobalThresholds: false,
            includePersonalThresholds: false,
            startTime: "P" + periodInDays + "D",
            endTime: null
        };

        var defaultConfig = {
            dataConfigurations: []
        };

        // merge the default configuration with the config object passed as argument
        var dataConfiguration = this.mergeObjects(defaultDataConfiguration, dataConfigOverride || {}, {
            uuid: uuid
        });

        var config = {
            dataConfigurations: [dataConfiguration]
        };

        try {
            var api = new ScriptableParDataAPI(JSON.stringify(config));
            var _rawData = api.getData();
            result = JSON.parse(api.getData())[0].response;
            // ScriptableParDataAPI returns data as array of array like [['value'], [1], [2]], converting that to array of object like [{value: 1}, {value: 2}]
            var _data = result.data;
            if (!global.JSUtil.nil(_data)) {
                var _dataFields = _data[0];
                var _mappedData = [];
                for (var i = 1; i < _data.length; i++) {
                    var elm = {};
                    for (var j = 0; j < _dataFields.length; j++) {
                        elm[_dataFields[j]] = Number(_data[i][j]);
                    }
                    // convert timestamp integer into date
                    if (elm.timestamp) {
                        elm.timestamp = this.epochTimestampToDate(elm.timestamp);
                    }
                    _mappedData.push(elm);
                }
                result.dataObjArr = _mappedData;
            } else {
                result.data = [];
                result.dataObjArr = [];
            }
        } catch (e) {
            gs.error("Error fetching indicator details: IndicatorId - {0}, BreakdownId - {1}, BreakdownElementId - {2}. Error {3}", [indicatorId, breakdownId, breakdownElementId, e]);
            result = {};
        }
        return result;
    },

    /**
     * Checks if at least one score is greater than given value
     */
    atLeastOneScoreGreaterThan: function(scores, gtValue) {
        if (global.JSUtil.nil(scores)) {
            return false;
        }
        var val = global.JSUtil.nil(gtValue) ? 0 : gtValue;
        for (var idx in scores) {
            if (scores[idx].value > val) return true;
        }
        return false;
    },

    getSysChoiceId: function(encodedQuery, query, aclCheck) {
        var gr = new GlideRecord(this.TABLES.SYS_CHOICE);
        this.addQueryConditions(gr, encodedQuery, query, aclCheck);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr.getUniqueValue() : '';
    },

    getTableSysId: function(tableName) {
        var dbo = new GlideRecord(this.TABLES.SYS_DB_OBJECT);
        dbo.addQuery(this.COLS.NAME, tableName);
        dbo.setLimit(1);
        dbo.query();

        return dbo.next() ? dbo.getUniqueValue() : '';
    },

    buildCustomEncodedQuery: function(fields, operator, value, booleanOperator) {
        var defBooleanOperator = this.OPERATORS.OR;
        var encodedQuery = "";
        for (var i = 0; i < fields.length; i++) {
            if (i != 0) {
                encodedQuery += booleanOperator ? booleanOperator : defBooleanOperator;
            }

            encodedQuery += value ? fields[i] + operator + value : fields[i] + operator;
        }
        return encodedQuery;
    },

    addBaseAggDataGroupByTableDetails: function(chart, tablesFromQuery) {
        var tableSysIds = Object.keys(tablesFromQuery);
        var grBaseAggData = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        grBaseAggData.addQuery(this.COLS.CHART, chart);
        grBaseAggData.addQuery(this.COLS.STATE, this.STATES.READY);
        grBaseAggData.addQuery(this.COLS.GROUP_BY_TABLE, this.COLS.IN, tableSysIds);
        grBaseAggData.query();
        while (grBaseAggData.next()) {
            var tableObj = tablesFromQuery[grBaseAggData.getValue(this.COLS.GROUP_BY_TABLE)];
            tableObj.label = grBaseAggData.getDisplayValue(this.COLS.GROUP_BY_TABLE);
            tableObj.name = grBaseAggData.getDisplayValue(this.COLS.GROUP_BY_TABLE + this.COLS.DOT + this.COLS.NAME);
        }
    },

    getCMDBRelatedEntryRefFields: function(tableName) {
        var relEntryObj = {};
        var refFields = [];

        var grRelEntry = new GlideRecord(this.TABLES.CMDB_RELATED_ENTRY);
        grRelEntry.addActiveQuery();
        if (tableName) {
            grRelEntry.addQuery(this.COLS.TABLE, tableName);
        } else {
            grRelEntry.orderBy(this.COLS.TABLE);
        }
        grRelEntry.query();
        while (grRelEntry.next()) {
            refFields = [];
            tableName = grRelEntry.getValue(this.COLS.TABLE);

            if (relEntryObj[tableName]) {
                refFields = relEntryObj[tableName];
            }

            var refField = grRelEntry.getValue(this.COLS.REFERENCED_FIELD);
            if (refFields.indexOf(refField) == -1) {
                refFields.push(refField);
            }

            relEntryObj[tableName] = refFields;
        }

        return relEntryObj;
    },

    /**
     * Helper function to check if Service Graph connectors tab should be included on the CMDB Performance page
     * @return {Boolean}
     */
    showPerformanceInsightSGCTab: function() {
        var isMaint = this.isUserMaint();
        var isCMDBInstAdmin = this.userHasRole(this.ROLES.CMDB_INST_ADMIN);
        var hasIntegrationData = this.getRowCount(this.TABLES.CMDB_INST_APPLICATION, this.COLS.NAME + this.OPERATORS.NOTLIKE + this.IH_ETL_DEMODATA_PREFIX, null, this.BOOLEAN.FALSE) > 0;

        return (isMaint || isCMDBInstAdmin) && hasIntegrationData;
    },

    /**
     * Helper function to check if CMDB Performance should be displayed
     * @return {Boolean}
     */
    showCmdbPerformance: function() {
        var isMaint = this.isUserMaint();
        var isCMDBAdmin = this.userHasRole(this.ROLES.SN_CMDB_ADMIN);

        return (isMaint || isCMDBAdmin);
    },

    /**
     * Returns decimal number with given scale. If scale is not passed, default value i.e 2 is considered.
     */
    getDecimalNumberWithGivenScale: function(number, scale) {
        var defaultScale = 2;
        return (number.indexOf(".") > -1) ? String(number.slice(0, (number.indexOf(".")) + (scale ? (scale + 1) : (defaultScale + 1)))) : number;
    },

    populateAggregatesByTable: function(groupGa, groupedTableCol, chart) {
        var count = 0;
        var tableName = '';
        var hasResults = false;
        
        while (groupGa.next()) {
            hasResults = true;
            count = groupGa.getAggregate(this.COUNT_AGGREGATE);
            tableName = groupGa.getValue(groupedTableCol);
            this.populateBaseAggData(chart, null, count, this.STATES.DRAFT, this.getTableSysId(tableName));
        }
        
        // If there are no results (0 rows), still populate with count=0
        if (!hasResults) {
            this.populateBaseAggData(chart, null, 0, this.STATES.DRAFT);
        }

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, chart);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, chart);
    },

    parseBaseAggEncodedQuery: function(query) {
        var chartId;
        var tablesFromQuery = {};
        var queryBlocks = query.split('^');
        for (var i = 0; i < queryBlocks.length; i++) {
            var currentQueryBlock = queryBlocks[i];
            var parts = currentQueryBlock.split(/(=|!=)/);
            var field = parts[0];
            var operator = parts[1];
            var value = parts[2];
            if (field == this.COLS.CHART && operator == this.OPERATORS.EQUAL) {
                chartId = value;
            } else if (field == this.COLS.GROUP_BY_TABLE) {
                tablesFromQuery[value] = {
                    operator: operator
                };
            }
        }

        return {
            chartId: chartId,
            tablesFromQuery: tablesFromQuery
        };
    },

    rebuildTableCondition: function(tableCol, nameOperatorObj) {
        var transformedQuery = [];
        for (var key in nameOperatorObj) {
            var obj = nameOperatorObj[key];
            transformedQuery.push(tableCol + obj.operator + obj.name);
        }

        return transformedQuery.join('^');
    },

    /**
     * Merges objects passed as arguments and returns the merged object
     */
    mergeObjects: function() {
        var merged = {};
        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    merged[key] = obj[key];
                }
            }
        }
        return merged;
    },

    /**
     * Find elements in first array, that are not present in 2nd array
     * @param {Array} : arr1
     * @param {Array} : arr2
     * @returns {Array}: array of elements present in arr1, but not in arr2
     */
    findDiffs: function(arr1, arr2) {
        var difference = arr1.reduce(function(result, element) {
            if (arr2.indexOf(element) === -1) {
                result.push(element);
            }
            return result;
        }, []);

        return difference;
    },

    epochTimestampToDate: function(timestamp) {
        var dt = new GlideDateTime();
        dt.setValue(timestamp);
        return dt.getDate().getValue();
    },

    lookupIndicatorId: function(indicator) {
        var id = null;
        var gr = new GlideRecord(this.TABLES.PA_INDICATORS);
        if (gr.get(indicator)) {
            id = gr.getValue(this.COLS.ID);
        }
        return id;
    },

    /* Helper function to copy scores from one indicator to another,
     * @params {String} sourceIndicator
     * @params {String} targetIndicator
     * @return null - nothing to be returned, scores from sourceIndicator should be inserted to the pa_scores_l1 table, as scores for targetIndicator
     *
     */
    migratePaIndicatorScores: function(sourceIndicator, targetIndicator) {
        //first, look up 'id' of each indicator, because pa_scores_l1 takes in indicator id, and not the sys_id. Not sure why
        var sourceIndicatorId = this.lookupIndicatorId(sourceIndicator);
        var targetIndicatorId = this.lookupIndicatorId(targetIndicator);
        //grab the earliest date of the pa scores for new indicator
        var earliestScoreDate = null;
        var gr = new GlideRecord(this.TABLES.PA_SCORES_L1);
        gr.addQuery(this.COLS.INDICATOR, targetIndicatorId);
        gr.orderBy(this.COLS.START_AT);
        gr.setLimit(1);
        gr.query();

        //get scores before earliest date for old indicator
        var earliestDate = null;
        if (gr.next()) {
            earliestDate = gr.getValue(this.COLS.START_AT);
        }

        //grab all pa_scores_l1 records for sourceIndicator, before the earliest score date of new indicator
        //for each of the scores, create another score entry with the same scores and dates, for the new indicator
        gr = new GlideRecord(this.TABLES.PA_SCORES_L1);
        gr.addQuery(this.COLS.INDICATOR, sourceIndicatorId);
        if (earliestDate) {
            gr.addQuery(this.COLS.START_AT, this.OPERATORS.LESSTHAN, earliestDate);
        }

        gr.query();
        while (gr.next()) {
            var scoreDate = gr.getValue(this.COLS.START_AT);
            var scoreValue = gr.getValue(this.COLS.VALUE);
            //create new scores for the new indicator.
            var newGr = new GlideRecord(this.TABLES.PA_SCORES_L1);
            newGr.initialize();
            newGr.setValue(this.COLS.INDICATOR, targetIndicatorId); //new indicator id
            newGr.setValue(this.COLS.START_AT, scoreDate);
            newGr.setValue(this.COLS.VALUE, scoreValue);
            newGr.insert();
        }

    },

    migrateDeprecatedIndicatorScores: function() {
        var oldTotalCiIndicator = 'b6dd71e077511110ee0d0cc2fa5a990e';
        var newTotalCiIndicator = 'b1fb06f0ef572110785294c1ed97d705';
        this.migratePaIndicatorScores(oldTotalCiIndicator, newTotalCiIndicator);

        var oldStaleCiIndicator = 'b193c12f53d911108726ddeeff7b1266';
        var newStaleCiIndicator = 'cf7956b6533e6110ba6cddeeff7b122d';
        this.migratePaIndicatorScores(oldStaleCiIndicator, newStaleCiIndicator);

        var oldDupeCiIndicator = 'ec434a5e53c6201032b7ddeeff7b1223';
        var newDupeCiIndicator = '15a4982053c36110ba6cddeeff7b12c3';
        this.migratePaIndicatorScores(oldDupeCiIndicator, newDupeCiIndicator);
    },

    /**
     * Generic method to insert into any extention of sn_cmdb_ws_base_aggregate table
     * @params {String} sys_id from sn_cmdb_ws_feature_category table
     * @params {String} table name of the table extended from sn_cmdb_ws_base_aggregate table
     * @params {JSON} dataJSON in {'colName1':'colvalue1', 'colName2':'colvalue2'}  format to be inserted into sn_cmdb_ws_feature_category table
     **/
    insertIntoAggExtTable: function(chart, table, dataJSON) {
        var DM = new CMDBWsDMConstants();
        var gr = new GlideRecord(table);
        if (!gr.isValid()) {
            throw new CMDBWsError({
                code: DM.ERROR_CODES.DM_INVALID_TABLE,
                action: DM.ACTIONS.DM_INSERT_WORKLOAD_AGG_TABLE,
                source: DM.DM_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Error - Invalid table"),
                details: DM.ERROR_CODES.DM_INVALID_TABLE,
                logError: false
            });
        }
        gr.initialize();
        gr.setValue(this.COLS.STATE, this.STATES.DRAFT);
        gr.setValue(this.COLS.CHART, chart);
        for (var data in dataJSON) {
            if (dataJSON.hasOwnProperty(data)) {
                gr.setValue(data, dataJSON[data]);
            }
        }
        gr.insert();
    },

    /**
     * This method will return all the distinct values for eligible tables from related entry table
     * @returns {Array} relatedEntryTables
     **/
    getRelatedEntryTables: function() {
        var relatedEntryTables = [];
        var tableArray = [];

        var relEntryGr = new GlideAggregate(this.TABLES.CMDB_RELATED_ENTRY);
        relEntryGr.addQuery(this.COLS.ACTIVE, true);
        relEntryGr.groupBy(this.COLS.TABLE);
        relEntryGr.query();

        while (relEntryGr.next()) {
            var table = relEntryGr.getValue(this.COLS.TABLE);
            tableArray.push(table);
        }
        var encodedQuery = "nameIN" + tableArray.join(",");
        var tableGr = new GlideRecord(this.TABLES.SYS_DB_OBJECT);
        tableGr.addEncodedQuery(encodedQuery, this.BOOLEAN.FALSE); //no need to enforce ACL check, as there's no user input on this encodedQuery
        tableGr.query();

        while (tableGr.next()) {
            relatedEntryTables.push({
                "id": tableGr.getValue(this.COLS.NAME),
                "label": tableGr.getValue(this.COLS.LABEL),
                "sublabel": tableGr.getValue(this.COLS.NAME)
            });
        }

        relatedEntryTables.sort(function(left, right) {
            return left.id === right.id ? 0 : (left.id > right.id ? 1 : -1);
        });
        return relatedEntryTables;
    },

	transformRelatedEntryTables: function(items) {
		var entries = [];
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (gs.nil(item)) {
				continue;
			}
			var gr = new GlideRecord(item.tableName);
			if (gr.isValid() && gr.canRead()) {
				entries.push({
					id: item.tableName,
					label: item.tableLabel,
					sublabel: item.tableName
				});
			}
		}
		return entries;
	},

    /**
     * This method will return all the distinct values for eligible tables from cmdb_ci hierarchy
     * @returns {Array} relatedEntryTables
     **/
    getCmdbTables: function() {
        var relatedEntryTables = [];

        var table = new GlideTableHierarchy(this.TABLES.CMDB_CI);
        var tables = table.getAllExtensions();

        var tableList = tables.join(",");
        var encodedQuery = 'nameIN' + tableList;

        var tableGr = new GlideRecord(this.TABLES.SYS_DB_OBJECT);
        tableGr.addEncodedQuery(encodedQuery, this.BOOLEAN.FALSE); //no need to enforce ACL check, as there's no user input on this encodedQuery
        tableGr.query();

        var cmdbTable = {};
        while (tableGr.next()) {
            if (tableGr.getValue(this.COLS.NAME) === 'cmdb_ci') {
                cmdbTable = {
                    "id": tableGr.getValue(this.COLS.NAME),
                    "label": tableGr.getValue(this.COLS.LABEL),
                    "sublabel": tableGr.getValue(this.COLS.NAME)
                };
            } else {
                relatedEntryTables.push({
                    "id": tableGr.getValue(this.COLS.NAME),
                    "label": tableGr.getValue(this.COLS.LABEL),
                    "sublabel": tableGr.getValue(this.COLS.NAME)
                });
            }
        }

        relatedEntryTables.sort(function(left, right) {
            return left.id === right.id ? 0 : (left.id > right.id ? 1 : -1);
        });

        relatedEntryTables.unshift(cmdbTable);

        return relatedEntryTables;
    },

    isCMDBTable: function(table) {
        if (gs.nil(table))
            new Error(gs.getMessage("Empty table value"));

        var root = new GlideTableHierarchy(table).getRoot();
        return root == "cmdb";
    },

	isCMDBArchiveRuleChunk: function(chunkId) {
		var gr = new GlideRecord(this.TABLES.SYS_ARCHIVE_RUN_CHUNK);
		if (gr.get(chunkId)) {
			var ruleId = gr.getValue(this.COLS.RULE_ID);
			return ruleId == this.ARCHIVE_RULES.ARCHIVE_CONFIGURATION_ITEMS;
		} else {
			return false;
		}
	},

	updateFeatureRuntimeAttribute: function() {
		var updatedCategoryMap = {};
		updatedCategoryMap[this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE] = false;
		updatedCategoryMap[this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE] = false;
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		var qc = gr.addQuery(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		qc.addOrCondition(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE);
		gr.query();
		while (gr.next()) {
			var fullScan = gr.getDisplayValue(this.COLS.QUERY_ALL_DATA);
			if (fullScan == this.BOOLEAN.FALSE) {
				gr.setValue(this.COLS.QUERY_ALL_DATA, this.BOOLEAN.TRUE);
				gr.update();
			}
			var updatedCategory = gr.getValue(this.COLS.FEATURE_CATEGORY);
			if (updatedCategoryMap.hasOwnProperty(updatedCategory)) {
				updatedCategoryMap[updatedCategory] = true;
			}
		}
		var categories = Object.keys(updatedCategoryMap);
		for (var i = 0; i < categories.length; i++) {
			var category = categories[i];
			if (!updatedCategoryMap[category]) {
				gr.initialize();
				gr.setValue(this.COLS.FEATURE_CATEGORY, category);
				gr.setValue(this.COLS.QUERY_ALL_DATA, this.BOOLEAN.TRUE);
				gr.insert();
			}
		}
	},

	// Default callback to provide batch query GlideRecord
	_getDefaultBatchGr: function(jobCtx, batchSize) {
		var batchGr = new GlideRecord(jobCtx.batchTable);
		if (global.JSUtil.notNil(jobCtx.batchFixedQuery)) {
			batchGr.addEncodedQuery(jobCtx.batchFixedQuery, this.BOOLEAN.FALSE); //no need to enforce ACL check, as there's no user input on this encodedQuery
		}
		if (global.JSUtil.notNil(jobCtx.batchDynamicQuery)) {
			batchGr.addEncodedQuery(jobCtx.batchDynamicQuery, this.BOOLEAN.TRUE);
		}
		if (global.JSUtil.notNil(jobCtx.lastSysId)) {
			if (global.JSUtil.notNil(jobCtx.batchOrderByColumnComparator)) {
				batchGr.addQuery(jobCtx.batchOrderByColumn, jobCtx.batchOrderByColumnComparator, jobCtx.lastSysId);
			} else {
				batchGr.addQuery(jobCtx.batchOrderByColumn, ">", jobCtx.lastSysId);
			}
		}
		if (global.JSUtil.notNil(jobCtx.batchDbCategory)) {
			batchGr.setCategory(jobCtx.batchDbCategory);
		}
		batchGr.setLimit(batchSize);
		batchGr.orderBy(jobCtx.batchOrderByColumn);
		batchGr.query();
		return batchGr;
	},

	/*
	categoryDetail: should contains report/metric sys_id, runtime threshold, fail time threshold
	getJobCtxJsonFn: this callback should return a job context object, which contains batchTable etc.
	advanceBatchFn: when this callback is not null, entire batch query will be controled by this callback,
					this bypass getBatchGrFn, onBatchFn
	getBatchGrFn: callback return the batch GlideRecord query, can use provided default _getDefaultBatchGr callback
	onBatchFn: callback which use the batch gr to loop through records in batch and process them

	For further detail, please refer to the batching API design document
	*/
	_batchProcess: function(categoryDetail, getJobCtxJsonFn, advanceBatchFn, getBatchGrFn, onBatchFn, onAfterBatchFn, testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson) {
		if (!categoryDetail.active) { //only calculate the metric aggregate if it's active
			return;
		}

		var jobCtx = this._getRuntimeAttributeJSONValue(categoryDetail.sys_id);
		var jobTotalTimeSpent = '';
		if (!global.JSUtil.nil(jobCtx)) {
			if (jobCtx.allBatchCompleted) {
				return;
			}
			if (!global.JSUtil.nil(jobCtx.statsId)) {
				jobTotalTimeSpent = this._getJobTimeSpent(jobCtx.statsId);
				var runtimeCheckThreshold = testRuntimeThreshold ? testRuntimeThreshold : categoryDetail.runtime_threshold;
				if (jobTotalTimeSpent >= runtimeCheckThreshold) {
					this._updateExecutionStatsRuntimeAndStatus(jobCtx.statsId, jobTotalTimeSpent, categoryDetail.runtime_threshold);
					jobCtx.allBatchCompleted = true;
					this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
					return;
				}
			}
		} else {
			var canRun = this._canRunMetricAndDetermineActivation(categoryDetail.sys_id, categoryDetail.fail_count_threshold, categoryDetail.runtime_threshold);
			if (!canRun) {
				return;
			}
			jobCtx = getJobCtxJsonFn();
			this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
		}

		var statsId = global.JSUtil.nil(jobCtx.statsId) ? this._initializeExecutionStatsWithMetric(categoryDetail.sys_id) : jobCtx.statsId;
		jobCtx.statsId = statsId;

		gs.info(jobCtx.identifier + ' batch process triggered on ' + new GlideDateTime().getDisplayValue());
		var startTime = new GlideDateTime().getNumericValue();
		jobCtx.startTime = startTime;
		var allBatchCompleted = false;
		var batchSize = this.BATCH_DEFAULT_SIZE;
		if (global.JSUtil.notNil(testBatchSize)) {
			batchSize = testBatchSize;
		} else if (global.JSUtil.notNil(jobCtx.batchSize)) {
			batchSize = jobCtx.batchSize;
		}
		jobCtx.batchSize = batchSize;
		var maxBatchExecutionTime = testMaxBatchExecutionTime ? testMaxBatchExecutionTime : this.MAX_BATCH_EXECUTION_TIME;
		jobCtx.maxBatchExecutionTime = maxBatchExecutionTime;
		try {
			do {
				if (global.JSUtil.notNil(advanceBatchFn)) {
					allBatchCompleted = advanceBatchFn(jobCtx, categoryDetail);
				} else {
					var batchGr = getBatchGrFn(jobCtx, batchSize);
					var rowCount = batchGr.getRowCount();
					allBatchCompleted = rowCount < batchSize ? true : false;
					onBatchFn(batchGr, jobCtx, categoryDetail);
					if (rowCount > 0) {
						jobCtx.lastSysId = batchGr.getValue(jobCtx.batchOrderByColumn);
					}
				}

				if (!allBatchCompleted && this._getTimeSpent(startTime) >= maxBatchExecutionTime) {
					this._aggregateJobRuntime(startTime, jobCtx);
					gs.info(jobCtx.identifier + ' Max batch execution time exceeded. Current runtime in seconds: ' + jobCtx.runtime);
					this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
					return;
				}
			} while(!allBatchCompleted);
		} catch(e) {
			jobTotalTimeSpent = this._getJobTimeSpent(statsId);
			this._updateExecutionStatsRuntimeAndStatus(statsId, jobTotalTimeSpent, categoryDetail.runtime_threshold, this.EXECUTION_STATUS.ERROR);
			jobCtx.allBatchCompleted = true;
			this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
			throw e;
		}
		if (global.JSUtil.notNil(onAfterBatchFn)) {
			onAfterBatchFn(jobCtx, categoryDetail);
		}
		this._aggregateJobRuntime(startTime, jobCtx);
		jobTotalTimeSpent = this._getJobTimeSpent(statsId);
		this._updateExecutionStatsRuntimeAndStatus(statsId, jobTotalTimeSpent, categoryDetail.runtime_threshold);
		jobCtx.allBatchCompleted = true;
		this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
		if (testDeleteJobCtxJson) {
			this._saveRuntimeAttribute(categoryDetail.sys_id, '');
		}
		if (testDeleteJobCtx) {
			this._deleteRuntimeAttribute(categoryDetail.sys_id);
		}
	},

	_canRunMetricAndDetermineActivation: function(metricId, failCountThreshold, runtimeThreshold, metricTable) {
		var failCount = 0;
		var statsCount = 0;
		var canRun = true;
		var statsIds = [];
		var lastPassedStatIndex = -1;

		var statsGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_EXECUTION_STATS);
		var qc = statsGr.addQuery(this.COLS.FEATURE_CATEGORY, metricId);
		qc.addOrCondition(this.COLS.KEY, metricId);
		statsGr.addQuery(this.COLS.ACTIVE, true);
		statsGr.orderBy(this.COLS.SYS_CREATED_ON);
		statsGr.query();
		while (statsGr.next()) {
			statsIds.push(statsGr.getUniqueValue());
			var runtime = parseInt(statsGr.getValue(this.COLS.RUN_TIME));
			if (runtime <= 0 || global.JSUtil.nil(statsGr.getValue(this.COLS.RUN_TIME))) {
				var metricStartTime = new GlideDateTime(statsGr.getValue(this.COLS.SYS_CREATED_ON)).getNumericValue();
				var currentTime = new GlideDateTime().getNumericValue();
				runtime = Math.ceil((currentTime - metricStartTime) / 1000);
			}
			if (runtime >= runtimeThreshold) {
				failCount += 1;
			} else {
				failCount = 0;
				lastPassedStatIndex = statsCount;
			}
			statsCount += 1;
		}

		if (failCount >= failCountThreshold) {
			canRun = false;
			var metricControlTable = this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY;
			if (global.JSUtil.notNil(metricTable)) {
				metricControlTable = metricTable;
			}
			var metricGr = new GlideRecord(metricControlTable);
			metricGr.setWorkflow(false);
			if (metricGr.get(metricId)) {
				metricGr.setValue(this.COLS.ACTIVE, false);
				metricGr.update();
			}
			var auditInfoJson = {};
			auditInfoJson[this.COLS.RUNTIME_THRESHOLD] = runtimeThreshold;
			auditInfoJson[this.COLS.FAIL_COUNT_THRESHOLD] = failCountThreshold;
			var auditInfo = JSON.stringify(auditInfoJson);
			this._insertOrUpdateActivationAuditRecord(metricId, this.ACTION_TYPE.AUTOMATIC, auditInfo);
			gs.warn('Metric ' + metricGr.getValue(this.COLS.TITLE) + ' has been turned off due to running over allowed threshold ' + runtimeThreshold + ' seconds for consecutive ' + failCountThreshold + ' allowed fail times');
		} else if (statsCount >= failCountThreshold) {
			statsIds.splice(lastPassedStatIndex + 1);
			this._updateExecutionStatsActiveStatus('', false, statsIds);
		}

		return canRun;
	},

	_getCategoryDetails: function(categoryId) {
		var categoryGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY);
		if (categoryGr.get(categoryId)) {
			var sys_id = categoryGr.getUniqueValue();
			var title = categoryGr.getValue(this.COLS.TITLE);
			var active = categoryGr.getValue(this.COLS.ACTIVE) === "1" ? true : false;
			var feature = categoryGr.getValue(this.COLS.FEATURE);
			var category = categoryGr.getValue(this.COLS.CATEGORY);
			var sub_category = categoryGr.getValue(this.COLS.SUB_CATEGORY);

			var aggregate_limit = 0;
			var fail_count_threshold = 1;
			var runtime_threshold = 0;
			var metadataGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_METADATA);
			metadataGr.addQuery(this.COLS.FEATURE_CATEGORY, categoryId);
			metadataGr.query();
			if (metadataGr.next()) {
				aggregate_limit = parseInt(metadataGr.getValue(this.COLS.AGGREGATE_LIMIT));
				if (aggregate_limit <= 0 || global.JSUtil.nil(metadataGr.getValue(this.COLS.AGGREGATE_LIMIT))) {
					aggregate_limit = 0;
				}
				fail_count_threshold = parseInt(metadataGr.getValue(this.COLS.FAIL_COUNT_THRESHOLD));
				if (fail_count_threshold <= 0 || global.JSUtil.nil(metadataGr.getValue(this.COLS.FAIL_COUNT_THRESHOLD))) {
					fail_count_threshold = 1;
				}
				runtime_threshold = parseInt(metadataGr.getValue(this.COLS.RUNTIME_THRESHOLD));
				if (runtime_threshold <= 0 || global.JSUtil.nil(metadataGr.getValue(this.COLS.RUNTIME_THRESHOLD))) {
					runtime_threshold = 0;
				}
			}

			return {
				sys_id: sys_id,
				title: title,
				active: active,
				feature: feature,
				category: category,
				sub_category: sub_category,
				aggregate_limit: aggregate_limit,
				fail_count_threshold: fail_count_threshold,
				runtime_threshold: runtime_threshold
			};
		}
	},

	_getJobTimeSpent: function(statsId) {
		var statsGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_EXECUTION_STATS);
		if (statsGr.get(statsId)) {
			var metricStartTime = new GlideDateTime(statsGr.getValue(this.COLS.SYS_CREATED_ON)).getNumericValue();
			var currentTime = new GlideDateTime().getNumericValue();
			var runtime = Math.ceil((currentTime - metricStartTime) / 1000);
			return runtime;
		} else {
			return '';
		}
	},

	_initializeExecutionStatsWithMetric: function(metricId) {
		var statsGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_EXECUTION_STATS);
		statsGr.initialize();
		statsGr.setValue(this.COLS.FEATURE_CATEGORY, metricId);
		statsGr.setValue(this.COLS.KEY, metricId);
		return statsGr.insert();
	},

	_updateExecutionStatsRuntimeAndStatus: function(execStatsId, runtimeInSeconds, runtimeThreshold, status) {
		var statsGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_EXECUTION_STATS);
		if (!statsGr.get(execStatsId)) {
			return false;
		}
		statsGr.setValue(this.COLS.RUN_TIME, runtimeInSeconds);
		if (global.JSUtil.notNil(status)) {
			statsGr.setValue(this.COLS.EXECUTION_STATUS, status);
		} else {
			if (runtimeInSeconds >= runtimeThreshold) {
				statsGr.setValue(this.COLS.EXECUTION_STATUS, this.EXECUTION_STATUS.EXCEEDED);
			} else {
				statsGr.setValue(this.COLS.EXECUTION_STATUS, this.EXECUTION_STATUS.COMPLETED);
			}
		}
		return statsGr.update();
	},

	_updateExecutionStatsActiveStatus: function(metricId, active, sysIds) {
		var statsGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_EXECUTION_STATS);
		if (global.JSUtil.notNil(metricId)) {
			var qc = statsGr.addQuery(this.COLS.FEATURE_CATEGORY, metricId);
			qc.addOrCondition(this.COLS.KEY, metricId);
		}
		if (global.JSUtil.notNil(sysIds)) {
			statsGr.addQuery(this.COLS.SYS_ID, sysIds);
		}
		statsGr.setValue(this.COLS.ACTIVE, active);
		statsGr.updateMultiple();
	},

	_insertOrUpdateActivationAuditRecord: function(metricId, type, auditInfo) {
		var auditGr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_ACTIVATION_AUDIT);
		var qc = auditGr.addQuery(this.COLS.FEATURE_CATEGORY, metricId);
		qc.addOrCondition(this.COLS.KEY, metricId);
		auditGr.query();
		if (auditGr.next()) {
			auditGr.setValue(this.COLS.ACTION_TYPE, type);
			auditGr.setValue(this.COLS.AUDIT_INFO, auditInfo);
			auditGr.update();
		} else {
			auditGr.initialize();
			auditGr.setValue(this.COLS.FEATURE_CATEGORY, metricId);
			auditGr.setValue(this.COLS.KEY, metricId);
			auditGr.setValue(this.COLS.ACTION_TYPE, type);
			auditGr.setValue(this.COLS.AUDIT_INFO, auditInfo);
			auditGr.insert();
		}
	},

	_createRuntimeAttribute: function(categoryId, jsonValue) {
		var grJobCtx = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		grJobCtx.initialize();
		grJobCtx.setValue(this.COLS.FEATURE_CATEGORY, categoryId);
		grJobCtx.setValue(this.COLS.KEY, categoryId);
		grJobCtx.setValue(this.COLS.JSON, jsonValue);
		grJobCtx.insert();
	},

	_getRuntimeAttribute: function(categoryId) {
		var grJobCtx = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		var qc = grJobCtx.addQuery(this.COLS.FEATURE_CATEGORY, categoryId);
		qc.addOrCondition(this.COLS.KEY, categoryId);
		grJobCtx.query();
		if (grJobCtx.next())
			return grJobCtx;
		return null;
	},

	_getRuntimeAttributeJSONValue: function(categoryId) {
		var grJobCtx = this._getRuntimeAttribute(categoryId);
		if (grJobCtx != null) {
			var value = grJobCtx.getValue(this.COLS.JSON);
			try {
				var valueObj = JSON.parse(value);
				return valueObj;
			} catch(e) {
				return null;
			}
		}
		return null;
	},

	_saveRuntimeAttribute: function(categoryId, jsonValue) {
		var grJobCtx = this._getRuntimeAttribute(categoryId);
		if (grJobCtx == null) {
			this._createRuntimeAttribute(categoryId, jsonValue);
		} else {
			grJobCtx.setValue(this.COLS.JSON, jsonValue);
			grJobCtx.update();
		}
	},

	_deleteRuntimeAttribute: function(categoryId) {
		var grJobCtx = this._getRuntimeAttribute(categoryId);
		if (grJobCtx != null) {
			grJobCtx.deleteRecord();
		}
	},

	_aggregateJobRuntime: function(startTime, jobCtx) {
		var currentRuntimeInSeconds = this._getTimeSpent(startTime);
		if (global.JSUtil.notNil(jobCtx)) {
			jobCtx.runtime = jobCtx.runtime + currentRuntimeInSeconds;
		}
	},

	_getTimeSpent: function(startTime) {
		var endTime = new GlideDateTime().getNumericValue();
		var currentRuntimeInSeconds = (endTime - startTime) / 1000;
		return currentRuntimeInSeconds;
	},

    updateSysProperty : function(propertyName,value) {
        var gr = new GlideRecord(this.TABLES.SYS_PROPERTIES);
        gr.addQuery(this.COLS.NAME, propertyName);
        gr.query();
        
        if(gr.next()) {
            gr.setValue(this.COLS.VALUE, value);
            gr.update();
        }
    },

	preventDefaultConfigModification: function(current) {
		var identifierId = current.getValue('config_identifier_id');
		var gr = new GlideRecord('sn_cmdb_ws_config_identifier');
		if (gr.get(identifierId)) {
			if (gr.getValue('default') == '1' && !gs.hasRole('sn_cmdb_admin')) {
				gs.addErrorMessage(gs.getMessage("Only CMDB admin can modify default configuration"));
				current.setAbortAction(true);
			}
		}
	},

    userCanReadTable : function(tableName) {
        var tableGr = new GlideRecord(tableName);
        return tableGr.canRead();
    },

    isValidField : function(table, field) {
        var tableGr = new GlideRecord(table);
        tableGr.query();
        return tableGr.isValidField(field);
    },
    
    getRecordDisplayValue: function(table, sysId) {
        if (table && sysId) {
            var gr = new GlideRecord(table);
            if (gr.get(sysId)) {
                return gr.getDisplayValue();
            }
        }
        return '';
    },

    getTableLabel: function(table) {
        return new GlideRecord(table).getLabel();
    },

	getTableIcon: function(table) {
		var iconGr = new GlideRecord(this.CLASS_ICONS.MAPPING_TABLE);
		iconGr.addQuery("table_name.name", table);
		iconGr.query();
		if (iconGr.next()) {
			var refRecord = iconGr.icon.getRefRecord();
			return refRecord.getValue(this.CLASS_ICONS.ICON_NAME_COLUMN); 
		}
		else {
			return "configuration-item-outline";
		}
	},

    getDotWalkFieldLabels: function(startTable, dotWalkPath) {
        var labels = [];
        var tableToSearch = startTable;
        var splitPath = dotWalkPath.split('.');
        
        for (var i = 0; i < splitPath.length; i++) {
            var gr = new GlideRecord(tableToSearch);
            var element = gr.getElement(splitPath[i]);
            labels.push(element.getLabel());
            tableToSearch = element.getReferenceTable();
        }

        return labels;
    },

    /**
     * Helper function to get the value of a field from a GlideRecord object. The field can be a dot-walked field.
     * @param {GlideRecord} gr - GlideRecord object
     * @param {String} fieldPath - field path (dot-walked or not)
     */
	getFieldValue: function(gr, fieldPath) {
		if (!gr || !fieldPath) {
			return '';
		}
		var fields = fieldPath.split(".");
		if (fields.length == 1) {
			if (!gs.nil(gr.getValue(fieldPath))) {
				return gr.getValue(fieldPath);
			}
			return '';
		}
		var firstField = fields.shift();
		return this.getFieldValue(gr[firstField], fields.join("."));
	},

	getUserGroupName: function(userGroupSysId){
		if(gs.nil(userGroupSysId))
			return '';
			
		var gr = new GlideRecord(this.TABLES.SYS_USER_GROUP);
		if(gr.get(userGroupSysId)){
			return gr.getValue(this.COLS.NAME);
		}
	},

	isNonEmptyObjectNoArray: function(obj) {
		if (global.JSUtil.nil(obj) || typeof obj != 'object' || Array.isArray(obj)) {
			return false;
		}
		return Object.keys(obj).length > 0;
	},

	isNonEmptyArray: function(obj) {
		return !global.JSUtil.nil(obj) && Array.isArray(obj) && obj.length > 0;
	},

	isNonEmpyString: function(str) {
		return !global.JSUtil.nil(str) && typeof str == 'string';
	},

    type: 'CMDBWorkspaceUtil'
});
