var RoleAnalyzerService = Class.create();
RoleAnalyzerService.prototype = {
    // synced to 0.15.3.0a from Adams role analyzer script

    APP_FAMILY_TIMECARD: gs.getProperty('sn_submgmt_roles.apps.timecard', 'time_card_management'),

    ACL_SCOPE_LEVEL: ['table', 'field'],

    ACL_USER_RESTRICTED: 'ur',

    initialize: function(roleInfoService, tableInfoService, aclInfoService, appFamilyInfoService,
        aclAnalyzer, tableAclClassifierSource, roleTypeInferer) {
        this.appFamilyInfoService = appFamilyInfoService ? appFamilyInfoService : new AppFamilyInfoService();
        this.roleInfoService = roleInfoService ? roleInfoService : new RoleInfoService();
        this.tableInfoService = tableInfoService ? tableInfoService : new TableInfoService(this.appFamilyInfoService);
        this.aclInfoService = aclInfoService ? aclInfoService : new AclInfoService();
        this.aclAnalyzer = aclAnalyzer ? aclAnalyzer : new AclAnalyzer();
        this.tableAclClassifierSource = tableAclClassifierSource ? tableAclClassifierSource : function(aclScopeLevels) {
            return new TableAclClassifier(aclScopeLevels);
        };
        this.roleTypeInferer = roleTypeInferer ? roleTypeInferer : new RoleTypeInferer();
        this._customizedOobRoleDetector = new sn_entitlement.CustomizedOobRoleDetector();
        this._userRoleDao = new sn_entitlement.UserRoleDao();

        this.IMPORTANT_OPS = ['write', 'read', 'commentWrite']; //this.getImportantACLOperations(); , 'delete'

        this.OUTPUT_SPACER = '';
        this.verbosity = {};

        this.arrayUtil = new global.LicensingScriptUtil();
    },

    /**
     * Add a verbosity level for output
     * detail - in each section header more information than just id
     * table - add table level information
     * count - return acl counts
     * global_scope - return information about global scope
     * @param {string} name one of [detail, table, count]
     */
    addVerbosity: function(name) {
        this.verbosity[name] = name;
    },

    /**
     * analyzeRoles
     * Given array of role names, analyze the system and return information about what licensing role type
     * should be associated with the role with breakdown by table, application and scope. Roles which are
     * contained within are also included in the analysis and output.
     * If the optional flag aclRolesOnly is passed, limit roles to those used in ACLs
     * @param {array} roleNames names of roles
     * @param {array} tableNames names of tables
     * @param {boolean} includeNoRoleACLs
     * @param {boolean} aclRolesOnly
     * @returns {object} the least verbose version returns
     * app_detail -> "role" -> app_id -> detectedType,
     * role_detail -> "role" -> acl information, and summary statistics about ACLs.
     * The app_id will be one of package name from license_family or scope id or 'platform' and be used to
     * filter out applications which are not relevant.
     */
    analyzeRoles: function(roleNames, aclRolesOnly) {
        var output = {
            'app_detail': {},
            'role_detail': {}
        };
        var statsList = [];
        var filterAclOps = aclRolesOnly ? this.IMPORTANT_OPS : null;

        var roles = this.roleInfoService.getRolesByName(roleNames, filterAclOps);

        var analysisResult;
        for (var r in roles) {
            var role = roles[r];
            analysisResult = this._analyzeRoleById(role.id);

            this._addResult(output, role.id, role.name, analysisResult);

            statsList.push(analysisResult.acls);
        }

        output.summary_stats = this._computeSummaryStats(roles, statsList);

        return output;
    },

    /**
     * Obtain custom roles, return information about what licensing role type should be associated with the role with breakdown
     * by table, application and scope. Roles which are contained within are also included in the analysis and output.
     * @returns {object} the least verbose version returns
     * app_detail -> "role" -> app_id -> detectedType,
     * role_detail -> "role" -> acl information, and summary statistics about ACLs.
     * The app_id will be one of package name from license_family or scope id or 'platform' and be used to
     * filter out applications which are not relevant.
     */
    analyzeCustomRoles: function() {
        var output = {
            'app_detail': {},
            'role_detail': {}
        };

        var statsList = [];

        var roles = this.roleInfoService.getCustomRoles();

        for (var r in roles) {
            var role = roles[r];
            var analysisResult = this._analyzeRoleById(role.id);
            this._addResult(output, role.id, role.name, analysisResult);
            statsList.push(analysisResult.acls);
        }

        output.stats = this._computeSummaryStats(roles, statsList);

        return output;
    },

    /**
     * Analyze any roles marked as OOB that have had an ACL related change since the provided timestamp
     * 
     * @param {GlideDateTime} filterTimestamp starting point for the analysis. If null, it looks back at all history
     */
    analyzeCustomizedOutOfTheBoxRoles: function(filterTimestamp) {
        const roleIdsModified = this._customizedOobRoleDetector.getCustomizedOobRoleIdsSinceTimestamp(filterTimestamp);
        const roleNamesModified = this._userRoleDao.getUserRoleNamesByUserRoleIds(roleIdsModified);
        return this.analyzeRoles(roleNamesModified, false);
    },

    _addResult: function(output, roleId, roleName, analysisResult) {
        output.app_detail[roleName] = analysisResult.appDetail;
        // any scope details
        if (Object.keys(analysisResult.scopeDetail).length > 0) {
            if (!output.scope_detail)
                output.scope_detail = {};
            output.scope_detail[roleName] = analysisResult.scopeDetail;
        }
        if (this.verbosity['table']) {
            if (!output.table_detail)
                output.table_detail = {};
            output.table_detail[roleName] = analysisResult.tableDetail;
        }

        if (this.verbosity['detail'] && roleId)
            output.role_detail[roleName] = this.roleInfoService.getRoleInfo(roleId);
        else
            output.role_detail[roleName] = {};
        output.role_detail[roleName].acls = analysisResult.acls;
    },

    _getFieldType: function(tableName, fieldName) {
        var table = new GlideRecord(tableName);
        if (tableName == '*') {
            return false;
        }
        if (!table.isValid()) {
            gs.warn('ACL on invalid table: ' + tableName);
            return false;
        }
        if (!table.isValidField(fieldName)) {
            gs.warn('ACL on invalid field: ' + tableName + '.' + fieldName);
            return false;
        }
        var field = table.getElement(fieldName);
        var fieldEd = field.getED();
        return fieldEd.getInternalType();
    },

    _initACLCounts: function() {
        return {
            'total': 0,
            'write': 0,
            'read': 0,
            'commentWrite': 0
        }; // , 'skip': {'write': 0}, 'delete': 0 // removed delete form important ops;
    },


    _getDetectedTypePerApp: function(appId, tableDetail) {
        var detectedType = this.roleTypeInferer.getDefaultDetectedType();
        for (var t in tableDetail) {
            if (appId == tableDetail[t].tableInfo.subscriptionAppId) {
                //gs.info(JSON.stringify(['getAppPredictedType', t, appId, tableDetail[t].tableInfo.subscriptionAppId, tableDetail[t].detectedType.roleType]));
                detectedType = this.roleTypeInferer.mergeDetectedTypes(detectedType, tableDetail[t].detectedType);
            }
        }
        // manual override Time Card requestors to Time Card Users
        if (appId == this.APP_FAMILY_TIMECARD)
            detectedType = this.roleTypeInferer.fixTimeCardDetectedType(detectedType);

        return detectedType;
    },

    _getDetectedTypePerScope: function(scopeId, tableDetail) {
        var detectedType = this.roleTypeInferer.getDefaultDetectedType();
        for (var t in tableDetail) {
            if (scopeId == tableDetail[t].tableInfo.scope) {
                //gs.info(JSON.stringify(['getScopePredictedType', t, scopeId, tableDetail[t].tableInfo.scope, tableDetail[t].roleType]));
                detectedType = this.roleTypeInferer.mergeDetectedTypes(detectedType, tableDetail[t].detectedType);
            }
        }

        return detectedType;
    },

    _analyzeRoleById: function(roleId) {
        var ignoredTables = this.tableInfoService.getIgnoredTables();
        var aclRecordIterator = this.aclInfoService.getAllByRole(roleId, this.IMPORTANT_OPS, ignoredTables);
        return this._analyzeRole(aclRecordIterator, this.IMPORTANT_OPS, ignoredTables);
    },

    _analyzeNonRoleAcls: function() {
        var customTables = this.tableInfoService.getCustomTableList();
        var ignoredTables = this.tableInfoService.getIgnoredTables();
        var aclRecordIterator = this.aclInfoService.getNonRoleAclsByTables(customTables, this.IMPORTANT_OPS, ignoredTables);
        return this._analyzeRole(aclRecordIterator, this.IMPORTANT_OPS, ignoredTables);
    },

    _analyzeRole: function(aclRecords, filterAclOps, ignoredTables) {
        var tableDetail = {};
        var appDetail = {};
        var scopeDetail = {};

        var aclStats = this._processAcls(aclRecords, tableDetail);

        this._decorateReadAcls(tableDetail, filterAclOps, ignoredTables);

        var aclCountClassifierPerApp = {};
        var aclCountClassifierPerScope = {};

        this._processTables(tableDetail, appDetail, scopeDetail, aclCountClassifierPerApp, aclCountClassifierPerScope);
        this._processApps(tableDetail, appDetail, aclCountClassifierPerApp, aclCountClassifierPerScope);
        this._processScopes(tableDetail, scopeDetail, aclCountClassifierPerScope);

        // clean up table detail if not needed
        if (this.verbosity['table']) {
            if (!this.verbosity['detail'] || !this.verbosity['count']) {
                for (var t in tableDetail) {
                    if (!this.verbosity['detail']) {
                        delete tableDetail[t].tableInfo;
                        delete tableDetail[t].tableType;
                    }
                    if (!this.verbosity['count'])
                        delete tableDetail[t].acls;
                }
            }
        }

        var output = {
            'acls': aclStats,
            'appDetail': appDetail,
            'scopeDetail': scopeDetail
        };
        if (this.verbosity['table'])
            output.tableDetail = tableDetail;

        return output;
    },

    _processAcls: function(aclRecordIterator, tableDetail) {
        var stats = {
            'count': 0,
            'list': {
                'table': [],
                'field': []
            }
        };

        while (aclRecordIterator.next()) {
            stats.count++;

            // acl operation can change, keep local copy
            var aclOp = aclRecordIterator.getOperation();

            var aclScopeLevel;
            var aclName = aclRecordIterator.getName();
            var tableName = aclName;
            if (tableName.contains('.')) {
                tableName = tableName.split('.')[0];
                aclScopeLevel = 'field';
            } else {
                aclScopeLevel = 'table';
            }

            // check if we handle table
            if (!this._ensureTableDetail(tableDetail, tableName))
                continue;

            if (aclName.contains('.')) {
                var aclParts = aclName.split('.');
                if (aclParts[1] != '*') {
                    var fieldType = this._getFieldType(aclParts[0], aclParts[1]);
                    if (fieldType == 'journal_input') {
                        aclOp = 'commentWrite';
                        // skip any field level journaled field writes
                        //gs.debug('Field level: ' + aclRecord.name + ' type: ' + fieldType);
                        //continue;
                    }
                }

            }

            stats.list[aclScopeLevel].push(aclRecordIterator.getId());

            var aclType = this.aclAnalyzer.getACLType(aclRecordIterator);
            this._addTableAclCount(tableDetail[tableName].acls, aclScopeLevel, aclType, aclOp);

            var aclAttributes = this.aclAnalyzer.getACLScriptAttributes(aclRecordIterator);
            this._mergeAclAttributes(aclAttributes, tableDetail[tableName].acls.attr);
        }

        return stats;
    },

    /**
     * For tables where there's no read access, try to walk up hierarchy and check
     */
    _decorateReadAcls: function(tableDetail, filterAclOps, ignoredTables) {
        var checkTableNames = {};
        for (var tableName in tableDetail) {
            // for write ACLs at the field level, don't worry about it if there a user restricted ACL on to restrict reading
            if (this._hasNoReadAcls(tableDetail[tableName].acls)) {
                //gs.info('No read ACLs found for ' + tableName + ' checking parent tables');
                var tableHierarchy = this.tableInfoService.getTableAncestors(tableName);
                for (var t in tableHierarchy)
                    checkTableNames[tableHierarchy[t]] = tableHierarchy[t];
            }
        }

        var tableNames = Object.keys(checkTableNames);
        if (tableNames.length == 0)
            return;

        var newTableDetail = {};
        var aclRecordIterator = this.aclInfoService.getAllAclsByTables(tableNames, filterAclOps, ignoredTables);
        this._processAcls(aclRecordIterator, newTableDetail);

        for (var tt in tableDetail) {
            if (this._hasNoReadAcls(tableDetail[tt].acls)) {
                // check read access in hierarchy
                var addURACL = this._findReadAclsInHierarchy(tt, newTableDetail);
                // add to ACL count because we effectively found one
                if (addURACL)
                    this._addTableAclCount(tableDetail[tt].acls, 'table', this.ACL_USER_RESTRICTED, 'read');
            }
        }
    },

    _processTables: function(tableDetail, appDetail, scopeDetail, aclCountClassifierPerApp, aclCountClassifierPerScope) {
        for (var t in tableDetail) {
            // don't include exempt tables in the roll up or database views
            //if (tableDetail[t].tableInfo.isExempt)
            //continue;

            var appId = tableDetail[t].tableInfo.appId;
            var appName = tableDetail[t].tableInfo.appName;
            var scopeName = tableDetail[t].tableInfo.scope;

            if (!Object.prototype.hasOwnProperty.call(appDetail, appId)) {
                appDetail[appId] = this._createAppDetail(appId, appName, tableDetail[t]);
                if (this.verbosity['count'])
                    aclCountClassifierPerApp[appId] = this.tableAclClassifierSource.call(this, this.ACL_SCOPE_LEVEL);
            }

            if (this.verbosity['detail'])
                appDetail[appId].source.all = this.arrayUtil.union(tableDetail[t].tableInfo.source, appDetail[appId].source.all);


            // need only create scope detail for global scope. Other scopes are captured in appDetail
            if (this.verbosity['global_scope'] && scopeName == 'global') {
                if (!Object.prototype.hasOwnProperty.call(scopeDetail, scopeName)) {
                    scopeDetail[scopeName] = this._createScopeDetail(scopeName, appId);
                    if (this.verbosity['count'])
                        aclCountClassifierPerScope[scopeName] = this.tableAclClassifierSource.call(this, this.ACL_SCOPE_LEVEL);
                }
            }

            var aclTypes = this.aclAnalyzer.getAclTypes();

            var aclCountClassifierPerTable = this.tableAclClassifierSource.call(this, this.ACL_SCOPE_LEVEL);
            aclCountClassifierPerTable.addAll(aclTypes, this.IMPORTANT_OPS, tableDetail[t].tableType, tableDetail[t].acls);

            if (aclCountClassifierPerApp[appId])
                aclCountClassifierPerApp[appId].addAll(aclTypes, this.IMPORTANT_OPS, tableDetail[t].tableType, tableDetail[t].acls);

            if (aclCountClassifierPerScope[scopeName])
                aclCountClassifierPerScope[scopeName].addAll(aclTypes, this.IMPORTANT_OPS, tableDetail[t].tableType, tableDetail[t].acls);

            if (this.verbosity['detail']) {
                var aclsPerTableClass = aclCountClassifierPerTable.getAclsPerClass();
                for (var l in this.ACL_SCOPE_LEVEL) {
                    var asl = this.ACL_SCOPE_LEVEL[l];
                    if (aclsPerTableClass[asl].total > 0) {
                        appDetail[appId].tables[asl].tables.push(t);
                        if (Object.prototype.hasOwnProperty.call(scopeDetail, scopeName))
                            scopeDetail[scopeName].tables[asl].tables.push(t);
                    }
                }
            }

            this._cleanupAclCounts(tableDetail[t].acls);

            tableDetail[t].detectedType = this.roleTypeInferer.getDetectedType(tableDetail[t].tableInfo, aclCountClassifierPerTable.getAclsPerClass());
        }
    },

    _processApps: function(tableDetail, appDetail, aclCountClassifierPerApp) {
        for (var appId in appDetail) {
            if (this.verbosity['count'])
                appDetail[appId].acls = this._cleanupAclCounts(aclCountClassifierPerApp[appId].getAclsPerClass());
            if (this.verbosity['detail']) {
                appDetail[appId].tables.table.tables = this.arrayUtil.unique(appDetail[appId].tables.table.tables);
                appDetail[appId].tables.field.tables = this.arrayUtil.unique(appDetail[appId].tables.field.tables);
            }

            //gs.info('appDetail: ' + JSON.stringify(appId, null, rau.OUTPUT_SPACER));
            var detectedType = this._getDetectedTypePerApp(appId, tableDetail);

            appDetail[appId].detectedType = detectedType;

            //gs.info('appDetail: ' + JSON.stringify(appDetail[appId], null, rau.OUTPUT_SPACER));
        }
    },

    _processScopes: function(tableDetail, scopeDetail, aclCountClassifierPerScope) {
        for (var scopeName in scopeDetail) {
            if (this.verbosity['count'])
                scopeDetail[scopeName].acls = this._cleanupAclCounts(aclCountClassifierPerScope[scopeName].getAclsPerClass());
            if (this.verbosity['detail']) {
                scopeDetail[scopeName].tables.table.tables = this.arrayUtil.unique(scopeDetail[scopeName].tables.table.tables);
                scopeDetail[scopeName].tables.field.tables = this.arrayUtil.unique(scopeDetail[scopeName].tables.field.tables);
            }

            var detectedType = this._getDetectedTypePerScope(scopeName, tableDetail);

            scopeDetail[scopeName].detectedType = detectedType;
        }
    },

    _ensureTableDetail: function(tableDetail, tableName) {
        if (Object.prototype.hasOwnProperty.call(tableDetail, tableName))
            return true;

        var ti = this.tableInfoService.getTableInfo(tableName);
        if (ti == null) {
            // skip non-tables
            // gs.info("Skipping non table " + tableName);
            return false;
        }

        if (ti.isRemoteTable) {
            // skip remote tables
            return false;
        }

        // identify the type of table for the summary
        var tableAclClassifier = this.tableAclClassifierSource.call(this, this.ACL_SCOPE_LEVEL);
        var tableType = tableAclClassifier.getTableType(ti);

        tableDetail[tableName] = {
            'tableInfo': ti,
            'tableType': tableType,
            'detectedType': null,
            'acls': this._createTableAclCounts()
        };
        return true;
    },

    _mergeAclAttributes: function(aclAttributes, attrs) {
        for (var a in aclAttributes) {
            if (aclAttributes[a]) {
                if (Object.prototype.hasOwnProperty.call(attrs, a))
                    attrs[a]++;
                else
                    attrs[a] = 1;
            }
        }
    },

    _hasNoReadAcls: function(acls) {
        return (acls.table.u.read == 0 && acls.table.r.read == 0 && acls.table.a.read == 0 && acls.table.ur.read == 0);
    },

    _findReadAclsInHierarchy: function(tableName, newTableDetail) {
        var foundACL = false;
        var tableHierarchy = this.tableInfoService.getTableAncestors(tableName);
        for (var t in tableHierarchy) {
            // table has matching user restircted ACL for this role
            if (newTableDetail[tableHierarchy[t]].acls.table.ur.read > 0) {
                //gs.info('Found a user restricted ACL on ' + tableHierarchy[t] + ' when looking for one on ' + tableName);
                //gs.info(roleName + ' on ' + aclRecord.name + ' -- Has personalized read ACL was found for the parent table (' + tableName + ')');
                foundACL = true;
                break;
            }
            // table has ANY read ACLs, we stop looking for others
            if (newTableDetail[tableHierarchy[t]].acls.table.u.read > 0 ||
                newTableDetail[tableHierarchy[t]].acls.table.r.read > 0 ||
                newTableDetail[tableHierarchy[t]].acls.table.a.read > 0) {
                //gs.info('Read ACLs found on ' + tableHierarchy[t] + ', stop looking at ' + tableName + ' base tables');
                break;
            }
        }

        //if (!foundACL)
        //gs.info('No matching personalized read ACL was found for the table so recording the ACL for: ' + roleName + ' on ' + aclRecord.name);

        return foundACL;
    },

    _cleanupAclCounts: function(acls) {
        for (var l in this.ACL_SCOPE_LEVEL) {
            var asl = this.ACL_SCOPE_LEVEL[l];
            if (acls[asl].total == 0) {
                delete acls[asl];
                continue;
            }
            for (var aclType in acls[asl]) {
                if (acls[asl][aclType].total == 0)
                    delete acls[asl][aclType];
                //else {
                //    for (var o in this.IMPORTANT_OPS) {
                //        if (acls[asl][tt][o] == 0)
                //            delete acls[asl][tt][o];
                //    }
                //}
            }
        }
        return acls;
    },

    // return an ACL count structure which looks the same as TableAclClassifier
    // and can be used for common cleanup
    _createTableAclCounts: function() {
        var acls = {
            'table': {},
            'field': {},
            'attr': {}
        }

        var aclTypes = this.aclAnalyzer.getAclTypes();
        for (var l in this.ACL_SCOPE_LEVEL) {
            var asl = this.ACL_SCOPE_LEVEL[l];
            for (var i = 0; i < aclTypes.length; ++i) {
                acls[asl][aclTypes[i]] = this._initACLCounts();
                acls[asl].total = 0;
            }
        }

        return acls;
    },

    _addTableAclCount: function(acls, aclScopeLevel, aclType, aclOp) {
        acls[aclScopeLevel][aclType][aclOp]++;
        acls[aclScopeLevel][aclType].total++;
        acls[aclScopeLevel].total++;
    },

    _createAppDetail: function(appId, appName, tableDetail) {
        var appDetail = {
            'appName': null,
            'appId': null,
            'detectedType': null,
            // optional information
            'scope': null,
            'source': {
                'primary': null
            }
            /*
            'acls': {},
            'tables': {
                'table': {
                    'tables': []
                },
                'field': {
                    'tables': []
                }
            },
            'perUser': null
            */
        };

        appDetail.appName = appName;
        appDetail.scope = tableDetail.tableInfo.scope;
        appDetail.source.primary = tableDetail.tableInfo.source;
        appDetail.appId = tableDetail.tableInfo.appId;

        if (this.verbosity['detail']) {
            appDetail.acls = {};
            appDetail.tables = {
                'table': {
                    'tables': []
                },
                'field': {
                    'tables': []
                }
            };

            // perUser and source all info is not being used for current scenario, hide for now
            // appDetail.perUser = this.appFamilyInfoService.isPerUserApp(appId);
            // if (appDetail.source.all.length) {
            //    appDetail.source.all = this.arrayUtil.union(tableDetail.tableInfo.source, appDetail.source.all);
            // } else {
            //    appDetail.source.all = [tableDetail.tableInfo.source];
            // }
        }

        return appDetail;
    },

    _createScopeDetail: function(scopeName, appId) {
        var scopeDetail = {
            'scopeName': scopeName,
            'detectedType': null,
            // optional information
            /*
            'acls': {},
            'tables': {
                'table': {
                    'tables': []
                },
                'field': {
                    'tables': []
                }
            },
            'perUser': this.appFamilyInfoService.isPerUserApp(appId),
            */
        };

        if (this.verbosity['detail']) {
            scopeDetail.acls = {};
            scopeDetail.tables = {
                'table': {
                    'tables': []
                },
                'field': {
                    'tables': []
                }
            };
            // scopeDetail.perUser = this.appFamilyInfoService.isPerUserApp(appId);
        }

        return scopeDetail;
    },

    _computeSummaryStats: function(roles, statsList) {
        var stats = {
            'roles': 0,
            'acls': {
                'table': 0,
                'field': 0
            }
        };
        var tableAclsList = [];
        var fieldAclsList = [];
        stats.roles = roles.length;
        for (var i = 0; i < statsList.length; ++i) {
            tableAclsList = [... new Set([...tableAclsList, ...statsList[i].list.table])];
            fieldAclsList = [... new Set([...fieldAclsList, ...statsList[i].list.field])];
        }
        stats.acls.table = tableAclsList.length;
        stats.acls.field = fieldAclsList.length;

        return stats;
    },

    type: 'RoleAnalyzerService'
};
