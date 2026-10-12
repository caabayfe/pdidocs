var CMDBWsManualCreateCIService = Class.create();
CMDBWsManualCreateCIService.prototype = Object.extendsObject(CMDBWsManualCreateCIConstants, {
    initialize: function() {
        // Rules with these fields will be filtered out
        this.FIELD_EXCLUSION_FILTER = ['product_instance_id'];
        this.GLOBAL_EXCLUDED_CLASSES = 'cmdb_ci_service_auto';
        this.configUtil = new CmdbWsConfigUtils();
        this.wsUtil = new CMDBWorkspaceUtil();
        this.dupTaskUtil = new global.CMDBDuplicateTaskUtils();
        this.ireService = new CMDBWsIREService(this.MCC_ERROR_SOURCE);
        this.ireUtil = new CMDBWsIREUtil(this.MCC_ERROR_SOURCE);
    },

    sendToIRE: function(payload, action, appId, addtlContext) {
        var ireInputPayload = this._buildIrePayload(payload);
        if (action == this.IRE_ACTION.IDENTIFY) {
            return this.identifyCI(ireInputPayload);
        } else if (action == this.IRE_ACTION.INSERT) {
            var nonIRERelations = this._getNonIRERelations(payload);
            return this.insertCI(ireInputPayload, nonIRERelations, appId, addtlContext);
        }
    },

    _getNonIRERelations: function(payload) {
        var nonIRERelations = [];
        if (global.JSUtil.nil(payload) || global.JSUtil.nil(payload.relations)) {
            return nonIRERelations;
        }
        for (var i = 0; i < payload.relations.length; i++) {
            var rel = payload.relations[i];
            if (rel.type === this.TABLES.CMDB_REL_CI) {
                continue;
            }
            nonIRERelations.push(rel);
        }
        return nonIRERelations;
    },

    /**
     * Identifies CI based on the given payload
     */
    identifyCI: function(ireInputPayload) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_IDENTIFY_CI, this._identifyCI, ireInputPayload);
    },

    _identifyCI: function(ireInputPayload) {
        return this.ireService.identifyCI(this.DISCOVERY_SOURCE.MANUAL_VIA_IRE, ireInputPayload, {});
    },

    /**
     * Inserts CI based on the given payload
     */
    insertCI: function(ireInputPayload, nonIRERelations, appId, addtlContext) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_CREATE_CI, this._insertCI, ireInputPayload, nonIRERelations, appId, addtlContext);
    },

    _insertCI: function(ireInputPayload, nonIRERelations, appId, addtlContext) {
        var insertCIOutput = this.ireService.insertCI(this.DISCOVERY_SOURCE.MANUAL_VIA_IRE, ireInputPayload);
        var summary = insertCIOutput.summary;
        var ireOutput = insertCIOutput.ireOutput;
        this._handlePostInsertCI(appId, ireOutput, addtlContext);

        try {
            var personRelGr = new GlideRecord(this.TABLES.CMDB_REL_PERSON);
            var groupRelGr = new GlideRecord(this.TABLES.CMDB_REL_GROUP);
            for (var i = 0; i < nonIRERelations.length; i++) {
                var rel = nonIRERelations[i];
                var summaryItem = {};
                if (rel.type === this.TABLES.CMDB_REL_PERSON) {
                    personRelGr.initialize();
                    personRelGr.setValue(this.COLUMNS.CI, summary[0].sysId);
                    personRelGr.setValue(this.COLUMNS.TYPE, rel.relType);
                    var userId = rel.isParent ? rel.child.value : rel.parent.value;
                    personRelGr.setValue(this.COLUMNS.USER, userId);
                    summaryItem.sysId = personRelGr.insert();
                    summaryItem.className = this.TABLES.CMDB_REL_PERSON;
                    summaryItem.operation = this.IRE_ACTION.INSERT;
                    summary.push(summaryItem);
                } else if (rel.type === this.TABLES.CMDB_REL_GROUP) {
                    groupRelGr.initialize();
                    groupRelGr.setValue(this.COLUMNS.CI, summary[0].sysId);
                    groupRelGr.setValue(this.COLUMNS.TYPE, rel.relType);
                    var groupId = rel.isParent ? rel.child.value : rel.parent.value;
                    groupRelGr.setValue(this.COLUMNS.GROUP, groupId);
                    summaryItem.sysId = groupRelGr.insert();
                    summaryItem.className = this.TABLES.CMDB_REL_GROUP;
                    summaryItem.operation = this.IRE_ACTION.INSERT;
                    summary.push(summaryItem);
                }
            }
        } catch (e) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.MCC_FAILED_CREATE_CI,
                action: this.ACTIONS.MCC_CREATE_CI,
                source: this.MCC_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Error in non-IRE relations insert process"),
                details: "With given non-IRE relation input payload, it throws exception during insert process",
                logError: false,
                originalError: e
            });
        }

        return summary;
    },

    /**
     * Fetches CI classes configured for a given application. If classes are not configured for the given application, it returns default classes
     * @param {String} appId UX appliction sys_id
     * @param {String} [classHierarchyFilter] Optional CI class name to filter results to only include classes in its hierarchy
     * @returns {Array} Array of CI classes
     **/
    getCiClasses: function(appId, classHierarchyFilter) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_GET_CI_CLASSES, this._getCiClasses, appId, classHierarchyFilter);
    },

    _getCiClasses: function(appId, classHierarchyFilter) {
        var classList = this._getCiClassesList(appId);
        var filteredClassList = classList;
        var isFiltered = false;
        var invalidClassHierarchy = false;
        var classHierarchyTableLabel = "";

        // Check if classHierarchyFilter is provided
        if (!global.JSUtil.nil(classHierarchyFilter)) {
            if (!gs.tableExists(classHierarchyFilter)) {
                invalidClassHierarchy = true;
            } else {
                // Get table hierarchy information
                var tableHierarchy = new GlideTableHierarchy(classHierarchyFilter);
                var tables = tableHierarchy.getTables();

                // Check if the table extends from cmdb_ci
                if (!tables.includes('cmdb_ci')) {
                    invalidClassHierarchy = true;
                } else {
                    // Apply filter since table is valid and extends cmdb_ci
                    isFiltered = true;
                    classHierarchyTableLabel = new GlideRecordSecure(classHierarchyFilter).getLabel();
                    var hierarchy = tableHierarchy.getAllExtensions();
                    var hierarchySet = new Set(hierarchy);
                    filteredClassList = classList.filter(function(className) {
                        return hierarchySet.has(className);
                    });
                }
            }
        }

        var disabledRules = [];
        var enabledRules = [];
        var filteredDisabledRules = [];
        var filteredEnabledRules = [];

        classList.map((className) => {
            if (!gs.tableExists(className))
                return;
            var ireRuleObj = this.ireService.getIdentificationRules(className);
            var sublabel = "";
            var resultObj = {
                id: className,
                label: this._getTableLabel(className),
                sublabel: className
            };

            if (global.JSUtil.nil(ireRuleObj)) {
                resultObj.disabled = true;
                disabledRules.push(resultObj);
                
                // Also add to filtered list if it passes the filter
                if (isFiltered && filteredClassList.indexOf(className) !== -1) {
                    filteredDisabledRules.push(resultObj);
                }
            } else {
                //check to see if any of the rules' fields are in the excluded fields
                var currClassRuleCount = 0;
                for (var i = 0; i < ireRuleObj.rules.length; i++) {
                    var rule = ireRuleObj.rules[i];
                    rule.id = i;
                    var filterRule = false;
                    for (var field of this.FIELD_EXCLUSION_FILTER) {
                        if (rule.fields.indexOf(field) !== -1) {
                            filterRule = true;
                            break;
                        }
                    }
                    if (!filterRule) {
                        currClassRuleCount++;
                    }
                }

                if (currClassRuleCount == 0) {
                    resultObj.disabled = true;
                    disabledRules.push(resultObj);
                    
                    // Also add to filtered list if it passes the filter
                    if (isFiltered && filteredClassList.indexOf(className) !== -1) {
                        filteredDisabledRules.push(resultObj);
                    }
                } else {
                    enabledRules.push(resultObj);
                    
                    // Also add to filtered list if it passes the filter
                    if (isFiltered && filteredClassList.indexOf(className) !== -1) {
                        filteredEnabledRules.push(resultObj);
                    }
                }
            }
        });
        enabledRules.sort((a, b) => a.label.localeCompare(b.label));
        disabledRules.sort((a, b) => a.label.localeCompare(b.label));
        filteredEnabledRules.sort((a, b) => a.label.localeCompare(b.label));
        filteredDisabledRules.sort((a, b) => a.label.localeCompare(b.label));
        
        var result = { groups: [] };
        
        // If filtering is applied, add the filtered versions of the groups
        if (isFiltered) {
            result.groups.push({
                id: "",
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Select class")
            });
            
            // Add filtered classes
            result.groups.push({
                id: "classesWithRules",
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Classes"),
                children: filteredEnabledRules
            });
            
            result.groups.push({
                id: "classesWithNoRules",
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Classes without valid identification rule"),
                children: filteredDisabledRules
            });
            result.classHierarchyTableLabel = classHierarchyTableLabel;
            
        } else {
            // Original behavior when no filter is applied
            result.groups.push({
                id: "",
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Select class")
            });
            
            result.groups.push({
                id: "classesWithRules",
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Classes"),
                children: enabledRules
            });
            
            result.groups.push({
                id: "classesWithNoRules",
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Classes without valid identification rule"),
                children: disabledRules
            });
        }
        
        // Add property to indicate if an invalid class hierarchy was provided
        if (invalidClassHierarchy) {
            result.invalidClassHierarchy = true;
        }
        
        return result;
    },

    _getCiClassesList: function(appId) {
        const configGr = this.configUtil.getApplicationConfigTable({
            table: this.CI_CLASS_CONFIG.TABLE,
            appId: appId
        });

        const inclusionList = new Set();
        const exclusionList = new Set();
        const globalExclusionList = this._getGlobalExclusionList();
        globalExclusionList.forEach((item) => {
            exclusionList.add(item);
        });
        const finalList = [];

        while (configGr.next()) {
            const className = configGr.getValue(this.CI_CLASS_CONFIG.CI_CLASS);
            const applyToHierarchy = new CMDBWsServiceUtil().parseBoolean(configGr.getValue(this.CI_CLASS_CONFIG.APPLY_TO_HIERARCHY));
            const visibility = configGr.getValue(this.CI_CLASS_CONFIG.OPERATION);

            const currClasses = applyToHierarchy ? new GlideTableHierarchy(className).getAllExtensions() : [className];

            if (visibility == this.CI_CLASS_CONFIG.OPERATION_OPTIONS.INCLUDE_CLASS) {
                currClasses.forEach((item) => {
                    const gr = new GlideRecordSecure(item);
                    if (gr.canCreate() && gr.canWrite()) {
                        inclusionList.add(item);
                    }
                });
            } else if (visibility == this.CI_CLASS_CONFIG.OPERATION_OPTIONS.EXCLUDE_CLASS) {
                currClasses.forEach((item) => {
                    exclusionList.add(item);
                });
            }
        }

        inclusionList.forEach((item) => {
            if (!exclusionList.has(item)) {
                finalList.push(item);
            }
        });

        return finalList;
    },

    _getTableLabel: function(tableName) {
        if (gs.tableExists(tableName))
            return new GlideRecord(tableName).getLabel();
    },

    _getGlobalExclusionList: function() {
        const exclusionList = new Set();
        var globalExclusionList = this.GLOBAL_EXCLUDED_CLASSES;
        const proplExclusionList = gs.getProperty(this.SYS_PROPERTY.MANUAL_CI_GLOBAL_EXCLUSION, null);
        if (global.JSUtil.notNil(proplExclusionList)) {
            globalExclusionList += "," + proplExclusionList;
        }
        globalExclusionList.split(',').filter(item => item).forEach((item) => {
            const allChild = new GlideTableHierarchy(item).getAllExtensions();
            allChild.forEach((child) => {
                exclusionList.add(child);
            });
        });
        return Array.from(exclusionList);
    },

    getExcludedClasses: function(appId) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_GET_EXCLUDED_CLASSES, this._getExcludedClasses, appId);
    },

    /**
     * Fetches excluded classes for a given appId. This includes globally excluded classes and classes excluded at the app level
     */
    _getExcludedClasses: function(appId) {
        //to run when ci class is updated via URL
        const configGr = this.configUtil.getApplicationConfigTable({
            table: this.CI_CLASS_CONFIG.TABLE,
            appId: appId
        });

        const exclusionList = new Set();
        const globalExclusionList = this._getGlobalExclusionList();
        globalExclusionList.forEach((item) => {
            exclusionList.add(item);
        });

        while (configGr.next()) {
            const className = configGr.getValue(this.CI_CLASS_CONFIG.CI_CLASS);
            const applyToHierarchy = new CMDBWsServiceUtil().parseBoolean(configGr.getValue(this.CI_CLASS_CONFIG.APPLY_TO_HIERARCHY));
            const visibility = configGr.getValue(this.CI_CLASS_CONFIG.OPERATION);

            const currClasses = applyToHierarchy ? new GlideTableHierarchy(className).getAllExtensions() : [className];

            if (visibility == this.CI_CLASS_CONFIG.OPERATION_OPTIONS.EXCLUDE_CLASS) {
                currClasses.forEach((item) => {
                    exclusionList.add(item);
                });
            }
        }
        return Array.from(exclusionList);
    },

    getAdditionalAttributes: function(appId, className) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_GET_ADDITIONAL_ATTRS, this._getAdditionalAttributes, appId, className);
    },

    /**
     * Returns a list of additional attributes configured for a given class in a given UX application
     * If additional attributes are not configured for the given application, it returns attributes configured by Default for the given class
     * @param {String} appId UX appliction sys_id
     * @param {String} className - CI Class for the additional attributes
     * @returns {Array} Array of attribute column names
     */
    _getAdditionalAttributes: function(appId, className) {
        const configGr = this.configUtil.getApplicationConfigTable({
            table: this.CI_ADDITIONAL_ATTR_CONFIG.TABLE,
            appId: appId,
            conditions: [{
                name: this.CI_ADDITIONAL_ATTR_CONFIG.CI_CLASS,
                value: className
            }],
            limit: 1
        });

        var additionalAttrArr = [];

        if (configGr.next()) { //easy happy path. just return the attributes if they have been configured explicitly for given class
            additionalAttrArr = configGr.getValue(this.CI_ADDITIONAL_ATTR_CONFIG.ATTRIBUTES);
        } else {
            //now we have to climb the hierarchy, get all parents of className
            var parents = new GlideTableHierarchy(className).getTables();

            //build attr map
            var attrMap = {};
            const hierarchyGr = this.configUtil.getApplicationConfigTable({
                table: this.CI_ADDITIONAL_ATTR_CONFIG.TABLE,
                appId: appId,
                conditions: [{
                    name: this.CI_ADDITIONAL_ATTR_CONFIG.CI_CLASS,
                    operator: this.wsUtil.OPERATORS.IN,
                    value: parents.join(',')
                }],
                orderBy: this.CI_ADDITIONAL_ATTR_CONFIG.CI_CLASS
            });
            while (hierarchyGr.next()) {
                var currClass = hierarchyGr.getValue(this.CI_ADDITIONAL_ATTR_CONFIG.CI_CLASS);
                var currAttrs = hierarchyGr.getValue(this.CI_ADDITIONAL_ATTR_CONFIG.ATTRIBUTES);
                var applyToHierarchy = new CMDBWsServiceUtil().parseBoolean(hierarchyGr.getValue(this.CI_ADDITIONAL_ATTR_CONFIG.APPLY_TO_HIERARCHY));
                if (!attrMap.hasOwnProperty(currClass) && applyToHierarchy) {
                    attrMap[currClass] = currAttrs;
                }
            }

            //return the attributes set at the closest parent level
            for (var i = 0; i < parents.length; i++) {
                if (attrMap.hasOwnProperty(parents[i])) {
                    additionalAttrArr = attrMap[parents[i]];
                    break;
                }
            }
        }

        if (global.JSUtil.notNil(additionalAttrArr)) {
            const fieldMetadata = this._getFieldMetadata(className, additionalAttrArr);
            return Object.values(fieldMetadata);
        }

        return [];
    },

    processIreRules: function(tableName, identificationRules, dependencies, appId, refQuery) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_PROCESS_IRE_RULES, this._processIreRules, tableName, identificationRules, dependencies, appId, refQuery);
    },

    /**
     * Processes Identification Rules Engine (IRE) rules payload
     * @param {String} tableName - name of ci class to process the IRE rules for
     * @param {Object} identificationRules Identification Rules Engine (IRE) identification rules payload
     * @param {Array} dependencies Array of dependency relations
     * @param {String} appId UX appliction sys_id
     * @param {String} refQuery - reference query
     * @returns {Object} Response object
     */
    _processIreRules: function(tableName, identificationRules, dependencies, appId, refQuery) {
        const _table = tableName;
        const _tableExists = gs.tableExists(tableName);
        const _tableGr = new GlideRecordSecure(tableName);
        const _label = _tableExists ? _tableGr.getLabel() : "";

        const response = {
            identification_rules: this._processIdentificationRules(identificationRules),
            table: identificationRules.table,
            label: _label,
            sectionLabel: sn_i18n.Message.getMessage("sn_cmdb_ws", '{0} fields', {
                0: _label
            }),
            isDependent: !identificationRules.independent,
            mandatory_fields: this._getMandatoryFields(_table),
            additional_attributes: this._getAdditionalAttributes(appId, _table),
            headingText: sn_i18n.Message.getMessage("sn_cmdb_ws", 'New CI for {0}', {
                0: _label
            }),
            canWrite: _tableExists ? _tableGr.canWrite(): false,
            canCreate: _tableExists ? _tableGr.canCreate(): false
        };
        if (!identificationRules.independent) {
            var dependencyArr = this._processDependencyRelations(dependencies);
            if (dependencyArr.length == 1) {
                response.hideNoDependentCIalert = this.wsUtil.hasRecord(dependencyArr[0].name, null, null, false);
            }
            response.dependencies = dependencyArr;
        }
        response.refCiMetadata = this._getRefCiMetadata(refQuery, tableName);
        return response;
    },

    /**
     * Fetches referenced query data, given a query 
     * @param {String} refQuery - format is something like "cmdb_ci=<sys_id>"
     * @param {TableName} tableName - current table having a reference
     * @returns {Object} Object of referenced CI data and its field metadata
     */
    _getRefCiMetadata: function(refQuery, tableName) {
            var refCiMetadata = {};
            if (global.JSUtil.notNil(refQuery)) {
                //refQuery is not null, which means this is a related resource being created
                //we need the field metadata and display value of this referenced CI for this for "review" step
                //TODO: consider making this more generic, rather than just for CI references, in case other references or fields need to be passed in from this param in the future
                var refQueryArr = refQuery.split("=");
                if (refQueryArr.length > 1) {
                    refCiMetadata.fieldMetadata = this._getFieldMetadata(tableName, refQueryArr[0]);
                    //and we need the sys_class_name and dependency info for dependent CI relationship
                    const recordGr = CMDBWsGlideUtils.getGrBySysId(this.TABLES.CMDB_CI, refQueryArr[1]);
                    const recordTable = recordGr.getRecordClassName();
                    refCiMetadata.className = recordTable;
                    refCiMetadata.displayValue = recordGr.getDisplayValue();
                    refCiMetadata.ciSysId = refQueryArr[1];
                }
            }
        return refCiMetadata;
    },

    /**
     * Fetches mandatory fields for a given table
     * @param {String} table Table name
     * @returns {Array} Array of mandatory fields
     */
    _getMandatoryFields: function(table) {
        new CMDBWsServiceUtil().validateRequiredParam(table, {
            action: this.ACTIONS.MCC_GET_MANDATORY_FIELD,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table is required"),
            details: "Table name is missing"
        });
        var result = [];
        if (!table) {
            return result;
        }

        var tableGr = new GlideRecord(table);
        var elements = tableGr.getElements();
        var mandatoryFields = [];
        for (var i = 0; i < elements.length; i++) {
            var elementDescriptor = elements[i].getED();
            var elementName = elements[i].getName();
            if (elements[i].getED().isMandatory() && elementName != this.COLUMNS.SYS_ID) {
                mandatoryFields.push(elementName);
            }
        }

        const mandatoryFieldMetadata = this._getFieldMetadata(table, mandatoryFields);
        return Object.values(mandatoryFieldMetadata);
    },

    /**
     * Processes Identification Rules Engine (IRE) identification rules payload and returns an array of processed rules.
     * It fetches metadata for fields in main table and lookup table and adds it to the rule object
     * @param {Object} rulesPayload Identification Rules Engine (IRE) rules payload
     * @returns {Array} Array of processed rules
     */
    _processIdentificationRules: function(rulesPayload) {
        new CMDBWsServiceUtil().validateRequiredParam(rulesPayload, {
            action: this.ACTIONS.MCC_PROCESS_IDENTIFICATION_RULES,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "IRE identification rules are required"),
            details: "IRE identification rules are required"
        });

        var result = [];
        var _mainTable = rulesPayload.table;
        var _mainTableLabel = rulesPayload.label;
        for (var i = 0; i < rulesPayload.rules.length; i++) {
            var rule = rulesPayload.rules[i];
            rule.id = i;
            var _fieldsLabels = rule.fieldLabels.join(",");
            var _lookupTable = rule.lookupTable;
            var _lookupTableLabel = rule.lookupLabel;
            var filterRule = false;
            for (var field of this.FIELD_EXCLUSION_FILTER) {
                if (rule.fields.indexOf(field) !== -1) {
                    filterRule = true;
                    break;
                }
            }
            if (filterRule) {
                continue;
            }
            var tableFields = this.ireUtil.extractFieldsFromRule(_mainTable, rule);
            rule.tableMetadata = [];
            var isLookup = this.ireUtil.isLookupRule(rule);
            var isHybrid = this.ireUtil.isHybridRule(rule);
            rule.label = isLookup ? sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} (Look up)", { 0: _fieldsLabels}) : (isHybrid ? sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} (Hybrid)", { 0:_fieldsLabels}) : sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} (Standard)", { 0: _fieldsLabels}));
            rule.sublabel = isLookup ? sn_i18n.Message.getMessage("sn_cmdb_ws", "Look up table: {0}", { 0: _lookupTableLabel}) : (isHybrid ? sn_i18n.Message.getMessage("sn_cmdb_ws", "Search on table: {0}, Look up table: {1}", 
			{ 
				0: _mainTableLabel,
				1: _lookupTableLabel
			}) : sn_i18n.Message.getMessage("sn_cmdb_ws", "Search on table: {0}", { 0: _mainTableLabel}));
            rule.lookupRule = isLookup;
            rule.standardRule = !isLookup && !isHybrid;
            if (!isLookup) { // add main table fields for standard and hybrid rules
                var _fields = tableFields[_mainTable];
                rule.tableMetadata.push(this._buildTableMetadata(_mainTable, _mainTableLabel, _fields, false)); //lookup field is false, because this is main table
            }
            if (isLookup || isHybrid) { // add lookup table fields for lookup and hybrid rules
                var _fields = tableFields[_lookupTable];
                rule.tableMetadata.push(this._buildTableMetadata(_lookupTable, _lookupTableLabel, _fields, true)); //lookup field is true
            }
            result.push(rule);
        }
        return result;
    },

    _processDependencyRelations: function(dependencies) {
        const relTypes = this._getCmdbRelTypes(this.CMDB_REL_TYPE.NAME);
        return (dependencies || []).map(dependency => {
            const relType = relTypes[dependency.relationship];
            return {
                ...dependency,
                relTypeSysId: relType ? relType.sysId : "",
            };
        });
    },

    _buildIrePayload: function(payload, action) {
        new CMDBWsServiceUtil().validateRequiredParam(payload, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Input payload is required"),
            details: "Input payload missing attributes"
        });

        new CMDBWsServiceUtil().validateRequiredParam(payload.attributes, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Value required for at least one field"),
            details: "Input payload missing attributes"
        });

        const irePayload = {
            items: [{
                className: "",
                values: {},
                lookup: []
            }], // main table item will be at index 0
            relations: []
        };

        for (const table in payload.attributes) {
            const _tableAttributes = payload.attributes[table];
            const lookup = _tableAttributes.lookup;
            const fields = _tableAttributes.fields;
            if (lookup) {
                const lookups = fields.map(item => ({
                    className: table,
                    values: item
                }));
                irePayload.items[0].lookup.push(...lookups);
            } else {
                irePayload.items[0] = Object.assign(irePayload.items[0], {
                    className: table,
                    values: fields
                }, {});
            }
        }

        const relTypes = this._getCmdbRelTypes();

        // add relationships
        (payload.relations || [])
        .filter(rel => rel.type === "cmdb_rel_ci") // only cmdb_rel_ci relationships are supported by IRE
            .forEach(relation => {
                // add item for the related CIs
                irePayload.items.push({
                    className: relation.className || 'cmdb_ci',
                    values: {
                        sys_id: relation.sysId
                    }
                });

                const currItemIdx = irePayload.items.length - 1;
                const parentIdx = relation.isParent ? 0 : currItemIdx;
                const childIdx = relation.isParent ? currItemIdx : 0;

                if (!relTypes[relation.relType]) {
                    throw new CMDBWsError({
                        code: this.ERROR_CODES.MCC_FAILED_IDENTIFY_CI,
                        action: action,
                        source: this.MCC_ERROR_SOURCE,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Relationship type not found"),
                        details: "Relationship type not found in cmdb_rel_type table"
                    });
                }
                irePayload.relations.push({
                    parent: parentIdx,
                    child: childIdx,
                    type: relTypes[relation.relType].name,
                });
            });
        return irePayload;
    },

    /**
     * Fetches metadata for fields in a table and returns an object with field name as key and field metadata as value
     * @param {String} table Table name
     * @param {Array} fields Array of field names
     * @returns {Object} Field metadata object
     */
    _getFieldMetadata: function(table, fields) {
        if (!table || !fields || fields.length === 0) {
            return {};
        }

        if(typeof fields === "string")
            fields = fields.split(",");

        const fieldMetadata = CMDBWsGlideUtils.getFieldMetadata(table, null, fields);
        var result = {};

        for (var fieldPath in fieldMetadata) {
            var fieldMeta = fieldMetadata[fieldPath];
            var transformedMeta = {
                element: fieldMeta.name,
                type: fieldMeta.type,
                label: fieldMeta.label,
                mandatory: fieldMeta.mandatory,
                maxLength: fieldMeta.maxLength,
                defaultValue: fieldMeta.defaultValue
            };

            if (fieldMeta.choices) {
                var choices = [];
                for (var i = 0; i < fieldMeta.choices.length; i++) {
                    var choice = fieldMeta.choices[i];
                    if (global.JSUtil.notNil(fieldMeta.defaultValue) && choice.value == fieldMeta.defaultValue) {
                        transformedMeta.defaultValueLabel = choice.displayValue;
                    }
                    choices.push({
                        id: choice.value,
                        label: choice.displayValue
                    });
                }
                transformedMeta.type = this.SYS_DICTIONARY.CHOICE; // overwrite the type to 'choice'
                transformedMeta.choices = choices;
            }

            if (fieldMeta.type == this.SYS_DICTIONARY.COLUMN_TYPE.REFERENCE) {
                transformedMeta.referenceTable = fieldMeta.reference;
                transformedMeta.referenceQualifier = fieldMeta.referenceQualifier;
                transformedMeta.referenceKey = fieldMeta.referenceKey;
            }

            result[fieldPath] = transformedMeta;
        }

        return result;
    },

    /**
     * Builds table metadata object with field metadata
     * @param {String} tableName Table name
     * @param {String} tableLabel Table label
     * @param {Array} fields Array of field names
     * @returns {Object} Table metadata object
     */
    _buildTableMetadata: function(tableName, tableLabel, fields, isLookup) {
        var ruleFields = fields.ruleFields || [];
        var filterFields = fields.filterFields || [];
        var _tableMetadata = {
            table: tableName,
            label: tableLabel,
            lookup: isLookup,
            sectionLabel: sn_i18n.Message.getMessage("sn_cmdb_ws", "{0} fields", { 0: tableLabel }),
            fields: []
        };
        if (isLookup) {
            _tableMetadata.addLookUpButtonLabel = sn_i18n.Message.getMessage("sn_cmdb_ws", "Add {0} lookup", { 0: tableLabel });
            _tableMetadata.removeLookUpButtonLabel = sn_i18n.Message.getMessage("sn_cmdb_ws", "Remove {0} lookup", { 0: tableLabel });
        }
        var _allFields = ruleFields.concat(filterFields);
        var _fieldMetadata = this._getFieldMetadata(tableName, _allFields);
        for (var f of _allFields) {
            var _metadata = _fieldMetadata[f];
            if (filterFields.indexOf(f) !== -1) {
                _metadata.filterField = true;
            }
            _tableMetadata.fields.push(_metadata);
        }
        if (isLookup) {
            var mandatoryFields = this._getMandatoryFields(tableName);
            _tableMetadata.fields = _tableMetadata.fields.concat(mandatoryFields);
        }
        if (filterFields && filterFields.length > 0) {
            _tableMetadata.filterFieldInfo = sn_i18n.Message.getMessage("sn_cmdb_ws", "Select the values for the following attributes to ensure that the appropriate IRE rules are matched.");
        }
        return _tableMetadata;
    },


    /**
     * Looks up and returns display column name of a table
     * @param {String} table - Table name
     * @returns {String} Display field of the table, null if not valid
     */
    _getDisplayValueColumn: function(table) {
        var displayCol = null;
        var gr = new GlideRecord(this.SYS_DICTIONARY.TABLE);
        gr.addQuery(this.SYS_DICTIONARY.NAME, table);
        gr.addQuery(this.SYS_DICTIONARY.DISPLAY, true);
        gr.query();
        if (gr.next()) {
            displayCol = gr.getValue(this.SYS_DICTIONARY.ELEMENT);
        } else {
            //if there's no display column in the table
            gr = new GlideRecord(this.SYS_DICTIONARY.TABLE);
            gr.addQuery(this.SYS_DICTIONARY.NAME, table);
            gr.addQuery(this.SYS_DICTIONARY.ELEMENT, this.SYS_DICTIONARY.NAME);
            gr.query();
            if (gr.next()) {
                displayCol = this.SYS_DICTIONARY.NAME;
            } else {
                displayCol = this.COLUMNS.SYS_CREATED_ON;
            }
        }
        return displayCol;
    },

    /**
    * Performs typeahead search on given table, field and searchText
    * Results limited to 30 for performance, unless a different value is passsed in
    * @param {String} table name of table to perform typeahead search on - mandatory
    * @param {String} searchText - search text to query - mandatory
    * @param {String} searchType - type of search to perform on. If no searchType is passed in, it will use STARTSWITH by default
    * @param {String} encodedQuery - optional encoded query string
    * @param {String} field - optional field to search on. If passed in, no need to look up display field
    * @param {Integer} max - max results to return, by default 30. 
    * @param {String} referenceKey - reference key value for the reference field. If passed returns reference key values
    * @returns {Object} Result object, containing the reference 
    * 
    */
    searchRefTable: function(table, searchText, searchType, encodedQuery, field, max, referenceKey) {
        var result = {
            name: '',
            max: parseInt(max) || 30,
            matches: 0,
            records: []
        };

        new CMDBWsServiceUtil().validateRequiredParam(table, {
            action: this.ACTIONS.MCC_SEARCH_REF_TABLE,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table input is required"),
            details: "Table input is required in searchRefTable util",
            logError: true
        });

        //if searchField is not passed in use 'name' field
        if (global.JSUtil.nil(field)) {
            //find display value column. If there's not display value column for this table, use 'name' 
            field = this._getDisplayValueColumn(table);
        }

        if (global.JSUtil.nil(searchType)) {
            searchType = this.SEARCH_TYPES.STARTSWITH;
        }

        if (global.JSUtil.nil(searchText)) {
            searchText = "";
        }
		var isScript = !!(encodedQuery && encodedQuery.trim().toLowerCase().startsWith("javascript:"));

        var finalQuery = field + searchType + searchText;
        if (global.JSUtil.notNil(encodedQuery) && !isScript) { //TODO: execute advanced ref qualifier script to generate encoded query) {
            finalQuery += "^" + encodedQuery;
        }

        var isCmdb = new GlideTableHierarchy(table).getRoot() == this.TABLES.CMDB;

        try {
            var gr = new GlideRecordSecure(table);
            gr.addEncodedQuery(finalQuery, true); //enforce ACL should be true here
            //add orderBy only if table is not a CMDB table OR table is not "cmdb_ci"
            //querying on child classes of cmdb_ci adds filtering on sys_class_path on SQL layer
            //with orderBy(field), which is usually "name" field for CI records, makes the query ignore the name index because it has to filter on sys_class_path and then sort, which cause perf issues reported on DEF0622711 because it's not using an index
            //this would be solved by an index combination of 'sys_class_path,name', which doesn't exist yet.
            //when this index is added to cmdb_ci, we can orderBy name again, on child classes of cmdb_ci
            if (!isCmdb || table == this.TABLES.CMDB_CI) {
                gr.orderBy(field);
            }
            gr.setLimit(result.max);
            gr.query();
            while (gr.next()) {
                result.matches++;
                var displayValue = gr.getDisplayValue();
                var obj = {
                    id: global.JSUtil.nil(referenceKey) ? gr.getUniqueValue() : gr.getValue(referenceKey),
                    label: global.JSUtil.nil(displayValue) ? sn_i18n.Message.getMessage("sn_cmdb_ws", "(empty)") : displayValue,
                    'class': gr.getRecordClassName()
                };

                if (isCmdb) {
                    obj.sublabel = gr.getClassDisplayValue();
                }
                result.records.push(obj);
            }

        } catch (e) {
            throw new CMDBWsError({
                code: "FAILED reference search", //TODO; add a new error code
                action: this.ACTIONS.MCC_SEARCH_REF_TABLE,
                source: this.MCC_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Error on reference table search"),
                details: "Querying the table for reference typeahead search failed",
                logError: false,
                originalError: e
            });
        }
        return result;
    },

    _getCmdbRelTypes: function(keyField) {
        const gr = new GlideRecord(this.CMDB_REL_TYPE.TABLE);
        gr.query();
        const result = {};
        while (gr.next()) {
            const keyValue = keyField ? gr.getValue(keyField) : gr.getUniqueValue();
            result[keyValue] = {
                sysId: gr.getUniqueValue(),
                name: gr.getValue(this.CMDB_REL_TYPE.NAME),
                childDescriptor: gr.getValue(this.CMDB_REL_TYPE.CHILD_DESCRIPTOR),
                parentDescriptor: gr.getValue(this.CMDB_REL_TYPE.PARENT_DESCRIPTOR),
            };
        }
        return result;
    },

    /**
     * Fetches Operational statuses for give table name
     * @returns {Array} Array of Operational status
     **/
    getOperationalStatuses: function(tableName) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_GET_OPERTATIONAL_STATUSES, this._getOperationalStatuses, tableName);
    },

    _getOperationalStatuses: function(tableName) {
        if (gs.nil(tableName)) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.MCC_FAILED_GET_OPERTATIONAL_STATUSES,
                action: this.ACTIONS.MCC_GET_OPERTATIONAL_STATUSES,
                source: this.MCC_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table name is missing"),
                details: "Required parameter : Table name is missing to get Operational statuses",
                logError: true
            });
        }

        var tableGr = new GlideRecord(tableName);
        if (!tableGr.isValid()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.MCC_FAILED_GET_OPERTATIONAL_STATUSES,
                action: this.ACTIONS.MCC_GET_OPERTATIONAL_STATUSES,
                source: this.MCC_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid Table name"),
                details: "Invalid table name is passed to get Operational statuses",
                logError: true
            });
        }

        var results = [];
        var choiceList = GlideChoiceList.getChoiceList(tableName, this.OPERATIONAL_STATUS, false);
        for (var i = 0; i < choiceList.getSize(); i++) {
            var choice = choiceList.getChoice(i);
            var operationalStatus = {
                label: choice.getLabel(),
                value: choice.getValue()
            };
            results.push(operationalStatus);
        }
        return results;
    },

    /**
    * Checks if the given table has valid IRE rules or if it is excluded
    * @param {String} appId UX appliction sys_id
    * @param {String} className table_name
    * @returns {boolean} 
    **/
    classHasValidIdentificationRules: function(appId, className) {
        return new CMDBWsServiceUtil().execute.call(this, this.ACTIONS.MCC_CHECK_CLASS_HAS_IDENTIFICATION_RULES, this._classHasValidIdentificationRules, appId, className);
    },

    _classHasValidIdentificationRules: function(appId, className) {
        var classList = this._getCiClassesList(appId);
        if(classList.indexOf(className) == -1) {
            return false;
        }
        
        var ireRuleObj = this.ireService.getIdentificationRules(className);
        if (global.JSUtil.nil(ireRuleObj)) {
            return false;
        } else {
            //check to see if any of the rules' fields are in the excluded fields
            var currClassRuleCount = 0;
            for (var i = 0; i < ireRuleObj.rules.length; i++) {
                var rule = ireRuleObj.rules[i];
                rule.id = i;
                var filterRule = false;
                for (var field of this.FIELD_EXCLUSION_FILTER) {
                    if (rule.fields.indexOf(field) !== -1) {
                        filterRule = true;
                        break;
                    }
                }
                if (!filterRule) {
                    currClassRuleCount++;
                }
            }
            if (currClassRuleCount == 0) {
                return false;
            } else {
                return true;
            }
        }
    },

    _handlePostInsertCI: function(appId, ireOutput, addtlContext) {
        let availableExtPoints = new GlideScriptedExtensionPoint().getExtensions("sn_cmdb_ws.ManualCreateCIExtPoint");
        let validExtPoints = availableExtPoints.filter((extPoint) => {
            if (typeof extPoint.getAppId !== 'function') return false;
            try {
                return extPoint.getAppId() === appId;
            } catch (e) {}
            return false;
        });
        let api = validExtPoints.length > 0 ? validExtPoints[0] : {};
        if (typeof api.postInsertCI === 'function') {
            try {
                api.postInsertCI(ireOutput, addtlContext);
            } catch (e) {}
        }
    },
    
    filterLifeCycleStage: function(className, searchText) {
        var filter = 'sys_idIN';
        var ids = [];
        var result = [];
        
        new CMDBWsServiceUtil().validateRequiredParam(className, {
            action: this.ACTIONS.MCC_GET_LIFE_CYCLE_STAGE_OPTIONS,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "className input is required"),
            details: "className input parameter is required to filter lify cylcle stage options",
            logError: true
        });
        
        var tables = new GlideTableHierarchy(className).getTables();
        tables.push(className);
        var gr = new GlideRecord('life_cycle_control');
        gr.addEncodedQuery('table.nameIN' + tables.join(), true);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            if (gr.life_cycle_stage == this.TO_BE_DETERMINED)
                continue;
            ids.push(gr.life_cycle_stage.getRefRecord().getUniqueValue());
        }
        ids = ids.filter((item, index) => ids.indexOf(item) === index);
        filter += ids.join();

        if (global.JSUtil.nil(searchText)) {
            searchText = "";
        }
        
        var finalQuery = 'name'+this.SEARCH_TYPES.STARTSWITH+searchText;
        if(global.JSUtil.notNil(filter))
            finalQuery += "^" + filter;

        var lifeCycleStageGr = new GlideRecordSecure('life_cycle_stage');
        lifeCycleStageGr.addEncodedQuery(finalQuery, true);
        lifeCycleStageGr.query();
        while(lifeCycleStageGr.next()) {
            var displayValue = lifeCycleStageGr.getDisplayValue();
            var obj = {
                id:  lifeCycleStageGr.getValue('name') ,
                label: global.JSUtil.nil(displayValue) ? sn_i18n.Message.getMessage("sn_cmdb_ws", "(empty)") : displayValue,
                'class': lifeCycleStageGr.getRecordClassName()
            };
            result.push(obj);
        }
        return {result: result, encodedQuery: finalQuery};
	},

    filterLifeCycleStageStatus: function(className, lifeCycleStage, searchText) {
        var filter = 'sys_idIN';
        var ids = [];
        var result = [];
        
        new CMDBWsServiceUtil().validateRequiredParam(className, {
            action: this.ACTIONS.MCC_GET_LIFE_CYCLE_STATUS_OPTIONS,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "className input is required"),
            details: "className input parameter is required to filter lify cylcle status options",
            logError: true
        });
        
        var tables = new GlideTableHierarchy(className).getTables();
        tables.push(className);
        
        var gr = new GlideRecord('life_cycle_control');
        gr.addEncodedQuery('table.nameIN' + tables.join() + '^life_cycle_stage.name='+lifeCycleStage, true);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            ids.push(gr.life_cycle_stage_status.getRefRecord().getUniqueValue());
        }
        
        ids = ids.filter((item, index) => ids.indexOf(item) === index);
        filter += ids.join();
        if (global.JSUtil.nil(searchText)) {
            searchText = "";
        }
        
        var finalQuery = 'name'+this.SEARCH_TYPES.STARTSWITH+searchText;
        if(global.JSUtil.notNil(filter))
            finalQuery += "^" + filter;
        
        var lifeCycleStageStatusGr = new GlideRecordSecure('life_cycle_stage_status');
        lifeCycleStageStatusGr.addEncodedQuery(finalQuery, true);
        lifeCycleStageStatusGr.query();
        while(lifeCycleStageStatusGr.next()) {
            var displayValue = lifeCycleStageStatusGr.getDisplayValue();
            var obj = {
                id:  lifeCycleStageStatusGr.getValue('name') ,
                label: global.JSUtil.nil(displayValue) ? sn_i18n.Message.getMessage("sn_cmdb_ws", "(empty)") : displayValue,
                'class': lifeCycleStageStatusGr.getRecordClassName()
            };
            result.push(obj);
        }
        
        return {result: result, encodedQuery: finalQuery};
    },

    type: 'CMDBWsManualCreateCIService'
});
