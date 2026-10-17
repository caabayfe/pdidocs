var MultisourceUtil = Class.create();
MultisourceUtil.prototype = {
    initialize: function() {},

    MS_PROPERTIES: {
        PROPERTY_REPORT_MAX_LIMIT: "sn_cmdb_ws.ms.report_max_limit",
        PROPERTY_DISCO_SOURCE_NOT_REPORTING_MAX: "sn_cmdb_ws.ms.discovery_source_not_reporting_max_days",
        PROPERTY_MS_ENABLED: "glide.identification_engine.multisource_enabled",
        PROPERTY_EXCLUDE_QUERY_NAME_PREFIX_LIST: "sn_cmdb_ws.ms.exclude_query_name_prefix_list",
        PROPERTY_MS_NON_CMDB_CI_ENABLED: "glide.identification_engine.multisource_non_cmdb_ci_enabled",
        PROPERTY_MS_CALCULATE_CMDB_ONLY: "sn_cmdb_ws.ms.calculate_cmdb_only",
    },

    TABLES: {
        MS_QUERY_TABLE: "cmdb_multisource_query",
        MS_CLASS_METADATA: "sn_cmdb_ws_ms_class_metadata",
        MS_DATA_MISMATCH: "sn_cmdb_ws_ms_data_mismatch_config",
        MS_DENY_CLASS: "cmdb_multisource_deny_class",
        MS_SETTINGS_WEIGHT_TYPE: {
            NAME: "sn_cmdb_ws_ms_settings_weight_type",
            FIELDS: {
                SETTINGS: 'settings',
                WEIGHT_TYPE: 'weight_type'
            }
        },
        REPORT_BUILDER_SCHEDULE: "sysauto_ms_report_builder",
        SYS_PROPERTIES: {
            NAME: "sys_properties",
            FIELDS: {
                NAME: 'name',
                VALUE: 'value'
            }
        }
    },

    ROLES: {
        MAINT: "maint",
        CMDB_MS_ADMIN: "cmdb_ms_admin",
        CMDB_MS_EDITOR: "cmdb_ms_editor",
        CMDB_MS_USER: "cmdb_ms_user"
    },

    PROPERTIES_LIMIT: {
        ABSOLUTE_MAX_LIMIT: 500000,
        ABSOLUTE_MIN_LIMIT: 1,
        ABSOLUTE_MAX_REPORTING_DAYS: 90,
        ABSOLUTE_MIN_REPORTING_DAYS: 1
    },

    SETTINGS: {
        DATA_MISMATCH: 'data_mismatch_settings',
        COVERAGE: 'coverage_settings'
    },

    SETTING_WEIGHT_TYPE: {
        AUTO: 'automatic',
        MANUAL: 'manual'
    },

    MS_QUERY_TYPE: {
        RECORD: 1,
        GAP: 2,
        DIFF: 3
    },

    ATTRIBUTES: {
        SYS_ID: "sys_id",
        NAME: "name",
        DESCRIPTION: "description",
        QUERY_JSON_BLOB: "query_json",
        REPORT_SOURCE: "report_source",
        SYS_UPDATED_ON: "sys_updated_on",
        SYS_UPDATED_BY: "sys_updated_by",
        SYS_CREATED_ON: "sys_created_on",
        SYS_CREATED_BY: "sys_created_by",
        QUERY: "query",
        ACTIVE: "active",
        RUN_TYPE: "run_type",
        RUN_DAY_OF_MONTH: "run_dayofmonth",
        RUN_DAY_OF_WEEK: "run_dayofweek",
        RUN_TIME: "run_time",
		CLASS: 'class',
		CMDB_CI: 'cmdb_ci'
    },

    STATUS: {
        FAILED: "failure",
        SUCCESS: "success"
    },

    SERVICE_TYPE: {
        APPLICATION_SERVICE: "application_services",
        TECHNICAL_SERVICE: "technical_services"
    },

    COVERAGE_CLASS_EXCLUDED_TYPE: {
        NON_CMDB_CI_DISABLED: gs.getMessage("Non-CMDB classes are disabled for this dashboard by property settings"),
        CLASS_IN_DENY_LIST: gs.getMessage("This class is excluded from CMDB 360")
    },

    getMaxRecordsToProcess: function() {
        return gs.getProperty(this.MS_PROPERTIES.PROPERTY_REPORT_MAX_LIMIT);
    },

    setMaxRecordsToProcess: function(value) {
        if (value > this.PROPERTIES_LIMIT.ABSOLUTE_MAX_LIMIT) {
            value = this.PROPERTIES_LIMIT.ABSOLUTE_MAX_LIMIT;
        } else if (value < this.PROPERTIES_LIMIT.ABSOLUTE_MIN_LIMIT) {
            value = this.PROPERTIES_LIMIT.ABSOLUTE_MIN_LIMIT;
        }
        try {
            var updatedProperty = this.updateSysProperty(this.MS_PROPERTIES.PROPERTY_REPORT_MAX_LIMIT, value);
            if (updatedProperty) {
                return this.createSuccessObj("Global settings property successfully updated with new value " + value);
            } else {
                return this.createErrorObj("Global settings property did not get saved");
            }
        } catch (error) {
            return this.createErrorObj("Failed to update global settings max property - error : " + error.toString(), error);
        }

    },

    updateSysProperty: function(propertyName, value) {
        var gr = new GlideRecord(this.TABLES.SYS_PROPERTIES.NAME);
        gr.addQuery(this.TABLES.SYS_PROPERTIES.FIELDS.NAME, propertyName);
        gr.query();
        var updated;

        if (gr.next()) {
            gr.setValue(this.TABLES.SYS_PROPERTIES.FIELDS.VALUE, value);
            updated = gr.update();
        }

        return updated;
    },

    createSuccessObj: function(message) {
        return {
            status: this.STATUS.SUCCESS,
            message: gs.getMessage('{0}', message)
        };
    },

    createErrorObj: function(message, error) {
        return {
            status: this.STATUS.FAILED,
            error: (error) ? error.toString() : "error",
            message: gs.getMessage('{0}', message)
        };
    },

    getDiscoSourceNotReporting: function() {
        return gs.getProperty(this.MS_PROPERTIES.PROPERTY_DISCO_SOURCE_NOT_REPORTING_MAX);
    },

    setDiscoSourceNotReporting: function(value) {
        if (value > this.PROPERTIES_LIMIT.ABSOLUTE_MAX_REPORTING_DAYS) {
            value = this.PROPERTIES_LIMIT.ABSOLUTE_MAX_REPORTING_DAYS;
        } else if (value < this.PROPERTIES_LIMIT.ABSOLUTE_MIN_REPORTING_DAYS) {
            value = this.PROPERTIES_LIMIT.ABSOLUTE_MIN_REPORTING_DAYS;
        }

        try {
            var updatedProperty = this.updateSysProperty(this.MS_PROPERTIES.PROPERTY_DISCO_SOURCE_NOT_REPORTING_MAX, value);
            if (updatedProperty) {
                return this.createSuccessObj("Discovery sources not reporting max property successfully updated with new value " + value);
            } else {
                return this.createErrorObj("Discovery sources not reporting max property did not get saved");
            }
        } catch (error) {
            return this.createErrorObj("Failed to update discovery sources not reporting max property ", error);
        }

    },

    getQueryType: function(jsonObj) {
        if (jsonObj.is_diff) {
            return this.MS_QUERY_TYPE.DIFF;
        } else {
            if (jsonObj.excluded_discovery_source && jsonObj.excluded_discovery_source != "") {
                return this.MS_QUERY_TYPE.GAP;
            } else {
                return this.MS_QUERY_TYPE.RECORD;
            }
        }
    },

    createQuery: function(queryJson) {
        var result = {
            error: null,
            status: 'success',
            message: null
        };

        try {
            var newQuerySysId = sn_cmdb.MultiSourceAnalytics.createQuery(queryJson);
            result.result = newQuerySysId;
            result.message = gs.getMessage("query successfully created");

        } catch (error) {
            result = this.createErrorObj("Failed to create query", error);
        }

        return result;
    },

    updateQuery: function(querySysId, queryJson) {
        var result = {
            error: null,
            status: 'success',
            message: null
        };

        try {
            var updateQuery = sn_cmdb.MultiSourceAnalytics.updateQuery(querySysId, queryJson);
            result.message = gs.getMessage("Query successfully updated");

        } catch (error) {
            result = this.createErrorObj("Failed to update query with id " + querySysId, error);
        }
        return result;
    },

    deleteQuery: function(querySysId) {
        var result = {
            error: null,
            status: 'success',
            message: null
        };

        try {
            var deletedQueries = sn_cmdb.MultiSourceAnalytics.deleteQueries(querySysId);
            //check to see if it's deleted from the table
            var gr = new GlideRecord(this.TABLES.MS_QUERY_TABLE);
            if (gr.get(querySysId)) {
                result.status = 'failure';
                result.error = querySysId + " failed to delete";
            } else {
                result.message = gs.getMessage("query successfully deleted");
            }
        } catch (error) {
            result.status = 'failure';
            result.error = error.toString();
        }

        return result;
    },

    getAndTransformApplicationServices: function() {
        return this.getAndTransformServices(this.SERVICE_TYPE.APPLICATION_SERVICE);
    },

    getAndTransformTechnicalServices: function() {
        return this.getAndTransformServices(this.SERVICE_TYPE.TECHNICAL_SERVICE);
    },

    getAndTransformServices: function(serviceType) {
        try {
            var services = sn_cmdb.MultiSourceAnalytics.getServices();
            var servicesToTransform = [];
            if (serviceType === this.SERVICE_TYPE.APPLICATION_SERVICE) {
                servicesToTransform = services[this.SERVICE_TYPE.APPLICATION_SERVICE];
            } else if (serviceType === this.SERVICE_TYPE.TECHNICAL_SERVICE) {
                servicesToTransform = services[this.SERVICE_TYPE.TECHNICAL_SERVICE];
            }
            var result = [];
            if (servicesToTransform.length > 0) {
                result = servicesToTransform.map(function(o) {
                    return {
                        id: o.sys_id,
                        label: o.name
                    };
                }).sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                });
            }

            return result;

        } catch (error) {
            return this.createErrorObj("Failed to get services from sn_cmdb.MultiSourceAnalytics.getServices ", error);
        }


    },

    getAndTransformCMDBGroups: function() {
        try {
            var cmdbGroups = sn_cmdb.MultiSourceAnalytics.getCMDBGroups();
            var result = [];

            if (cmdbGroups.length > 0) {
                result = cmdbGroups.map(function(o) {
                    return {
                        id: o.sys_id,
                        label: o.group_name
                    };
                }).sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                });
            }

            return result;
        } catch (error) {
            return this.createErrorObj("Failed to get CMDB Groups from sn_cmdb.MultiSourceAnalytics.getCMDBGroups", error);
        }
    },
    transformQueries: function(queries) {
        var results = [];

        if (!queries)
            return results;

        var excludeQueryNamePrefixList = this.getExcludeQueryNamePrefixList();
        for (var i = 0; i < queries.length; i++) {
            var item = queries[i];
            try {
                var queryJsonObj = JSON.parse(item.query_json);
                var queryType = this.getQueryType(queryJsonObj);

                if (queryJsonObj.result_type != "data_sources" && this.checkQueryName(item.name, excludeQueryNamePrefixList)) {
                    var resultObj = {
                        id: item.sys_id,
                        label: item.name,
                        query_type: queryType,
                        sys_updated_on: item.sys_updated_on,
                        heading: {
                            label: item.name,
                            lines: 1,
                            level: 1,
                            size: "md",
                            variant: "secondary"
                        },
                        display_block: [{
                                label: gs.getMessage("Created by"),
                                value: {
                                    type: "string",
                                    value: item.sys_created_by
                                }
                            },
                            {
                                label: gs.getMessage("Updated by"),
                                value: {
                                    type: "string",
                                    value: item.sys_updated_by
                                }
                            },
                            {
                                label: gs.getMessage("Created on"),
                                value: {
                                    type: "string",
                                    value: item.sys_created_on
                                }
                            },
                            {
                                label: gs.getMessage("Updated on"),
                                value: {
                                    type: "string",
                                    value: item.sys_updated_on
                                }
                            }
                        ],
                        display_description: [{
                            label: gs.getMessage("Description"),
                            value: {
                                type: "string",
                                value: item.description
                            }
                        }]
                    };
                    results.push(resultObj);
                }
            } catch (e) {
                gs.error("Failed to process query: " + JSON.stringify(item) + " " + e);
            }
        }
        return results;
    },

    getAndTransformQueries: function(offset, limit) {
        var queries = sn_cmdb.MultiSourceAnalytics.getQueries(offset, limit);
        return this.transformQueries(queries).sort(function(a, b) {
            var date1 = new GlideDateTime();
            date1.setValueUTC(a.sys_updated_on.replace("T", " ").replace("Z", ""), "yyyy-MM-dd HH:mm:ss");
            var date2 = new GlideDateTime();
            date2.setValueUTC(b.sys_updated_on.replace("T", " ").replace("Z", ""), "yyyy-MM-dd HH:mm:ss");
            if (date1.getValue() < date2.getValue())
                return 1;
            if (date1.getValue() > date2.getValue())
                return -1;
            return 0;
        });
    },

    getAndTransformColumns: function(className) {
        if (className) {
            var classMapObj = sn_cmdb.MultiSourceAnalytics.getColumnMap(className);
            var resultArr = [];
            for (var key in classMapObj) {
                var obj = {};
                obj.id = key;
                obj.label = classMapObj[key];
                resultArr.push(obj);
            }

            return resultArr.sort(function(a, b) {
                return a.label.localeCompare(b.label);
            });
        } else {
            return {
                status: "failure",
                message: "invalid className provided " + className
            };
        }
    },

    getAndTransformColumnsForTables: function(classNames) {
        var classFieldsMap = {};
        for (var i = 0; i < classNames.length; i++) {
            var classFields = this.getAndTransformColumns(classNames[i]);
            classFieldsMap[classNames[i]] = classFields;
        }
        return classFieldsMap;
    },


    getAndTransformColumnsWithSelectedAttr: function(className, selectedAttrs) {
        var selectedAttrArr = selectedAttrs.split(',');
        var selectedAttrObjArr = [];
        var resultObj = {};
        if (className) {
            var classMapObj = sn_cmdb.MultiSourceAnalytics.getColumnMap(className);
            var resultArr = [];
            for (var key in classMapObj) {
                var obj = {};
                obj.id = key;
                obj.label = classMapObj[key];

                if (selectedAttrArr.length > 0) {
                    var keyFoundInSelectedAttr = false;
                    for (var i = 0; i < selectedAttrArr.length; i++) {
                        if (key === selectedAttrArr[i]) {
                            keyFoundInSelectedAttr = true;
                            break;
                        }
                    }

                    if (keyFoundInSelectedAttr) {
                        selectedAttrObjArr.push(obj);
                    } else {
                        resultArr.push(obj);
                    }
                } else {
                    resultArr.push(obj);
                }
            }

            resultObj.attributes_list = resultArr.sort(function(a, b) {
                return a.label.localeCompare(b.label);
            });
            resultObj.selected_attrs = selectedAttrObjArr.sort(function(a, b) {
                return a.label.localeCompare(b.label);
            });
            return resultObj;
        } else {
            return {
                status: "failure",
                message: "invalid className provided " + className
            };
        }
    },

    lookupTableLabel: function(tableName) {
        var displayName = tableName;
        var dbo = new GlideRecord('sys_db_object');
        dbo.addQuery('name', tableName);
        dbo.query();

        if (dbo.next()) {
            displayName = dbo.getValue('label');
        }

        return displayName;
    },

    getCoverageClasses: function() {
        var coverageClasses = [];
        var deniedClassList = this.getMultisourceDenyList();
        var gr = new GlideRecord(this.TABLES.MS_CLASS_METADATA);
        gr.query();
        while (gr.next()) {
            var table = gr.table.toString();
            //lookup table label
            var tableLabel = this.lookupTableLabel(table);
            var excludedReasonInfo = this.getClassExclusionReasonInfo(table, deniedClassList);
            coverageClasses.push({
                'table': table,
                'table_label': tableLabel,
                'ci_count_percent': excludedReasonInfo.length > 0 ? '0' : gr.ci_count_percent.toString(),
                'exclude': excludedReasonInfo.length > 0,
                'table_excluded_info': excludedReasonInfo
            });
        }
        return coverageClasses;
    },

    getClassExclusionReasonInfo: function(table, deniedClassList) {
        var excludedReasonInfo = [];
        var non_cmdb_ci_enabled = gs.getProperty(this.MS_PROPERTIES.PROPERTY_MS_NON_CMDB_CI_ENABLED, 'true') == 'true';
        var calculate_cmdb_ci_only = gs.getProperty(this.MS_PROPERTIES.PROPERTY_MS_CALCULATE_CMDB_ONLY, 'false') == 'true';
        if (!this._extendsFromTable(table, this.ATTRIBUTES.CMDB_CI) && (!non_cmdb_ci_enabled || calculate_cmdb_ci_only)) {
            excludedReasonInfo.push(this.COVERAGE_CLASS_EXCLUDED_TYPE.NON_CMDB_CI_DISABLED);
        }
        if (deniedClassList[table]) {
            excludedReasonInfo.push(this.COVERAGE_CLASS_EXCLUDED_TYPE.CLASS_IN_DENY_LIST);
        }
        return excludedReasonInfo;
    },

    _extendsFromTable: function(tableName, parentTableName) {
        var table = new GlideTableHierarchy(tableName);
        var parentTables = table.getTables();
        return parentTables.indexOf(parentTableName) >= 0;
    },

    getMultisourceDenyList: function() {
        var denyClassesMap = {};
        var gr = new GlideRecord(this.TABLES.MS_DENY_CLASS);
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
            var parentClassName = gr.getValue(this.ATTRIBUTES.CLASS);
            var extensions = new GlideTableHierarchy(parentClassName).getAllExtensions();
            for (var i = 0; i < extensions.length; ++i) {
                var className = extensions[i] + "";
                if (!denyClassesMap[className]) {
                    denyClassesMap[className] = true;
                }
            }
        }
        return denyClassesMap;
    },

    saveCoverageClasses: function(classes) {
        var response = [];

        try {
            // Delete all current classes
            var gr = new GlideRecord(this.TABLES.MS_CLASS_METADATA);
            gr.deleteMultiple();
            // Add classes

            for (var i = 0; i < classes.length; i++) {
                var coverageClass = classes[i];
                var validate = this._validateCoverageCiClassHierarchy(coverageClass);
                if (validate.status === this.STATUS.SUCCESS) {
                    gr.initialize();
                    gr.setValue("table", coverageClass.table);
                    gr.setValue("ci_count_percent", coverageClass.ci_count_percent);
                    var newClassSysId = gr.insert();
                    if (newClassSysId) {
                        var successMessage = gs.getMessage(" {0} class successfully added to Coverage config setting", coverageClass.table_label);
                        response.push(this.createSuccessObj(successMessage));
                    } else {
                        var lastError = gr.getLastErrorMessage();
                        var errorMessage = gs.getMessage(" Failed to add class {0} to Coverage config - error : {1}", [coverageClass.table_label, lastError]);
                        response.push(this.createErrorObj(errorMessage));
                    }
                } else {
                    response.push({
                        status: this.STATUS.FAILED,
                        message: validate.message
                    });
                }
            }
        } catch (error) {
            response.push(this.createErrorObj('Failed to save coverage class settings ', error));
        }

        return response;
    },
    getCoverageWeightType: function() {
        return this.getSettingWeightType(this.SETTINGS.COVERAGE);
    },

    saveCoverageWeightType: function(weightType) {
        return this.saveWeightTypeSetting(this.SETTINGS.COVERAGE, weightType);
    },

    convertAttrTypeOptions: function(conditionType) {
        //this is a lenghty workaround because the "selected option" is not working for radio buttons with input binding from repeater items
        var optionTypeArr = [{
            "id": 2,
            "label": gs.getMessage("Show CIs where EVERY attribute doesn't match"),
            "checked": null
        }, {
            "id": 1,
            "label": gs.getMessage("Show CIs where ANY attribute doesn't match"),
            "checked": null
        }];
        for (var i = 0; i < optionTypeArr.length; i++) {
            if (conditionType === optionTypeArr[i].id) {
                optionTypeArr[i].checked = true;
            }
        }

        return optionTypeArr;

    },

    getDataMismatchClasses: function() {
        var dataMismatchClass = [];
        var gr = new GlideRecord(this.TABLES.MS_DATA_MISMATCH);
        gr.query();
        while (gr.next()) {
            var table = gr.table.toString();
            //lookup table label
            var tableLabel = this.lookupTableLabel(table);
            var selected_attrs = gr.attributes.toString();
            if (!selected_attrs) {
                selected_attrs = '';
            }
            var attrListObj = this.getAndTransformColumnsWithSelectedAttr(table, selected_attrs);
            var selectedAttr = attrListObj.selected_attrs;
            var attrListArr = attrListObj.attributes_list;
            var condition_type = parseInt(gr.condition_type);
            var attr_type_options = this.convertAttrTypeOptions(condition_type);

            dataMismatchClass.push({
                'table': table,
                'table_label': tableLabel,
                'ci_count_percent': gr.ci_count_percent.toString(),
                'attributes': selectedAttr,
                'attr_type_options': attr_type_options,
                'condition_type': condition_type,
                'attributes_list': attrListArr,
                'expand_accordion': false
            });
        }
        return dataMismatchClass;
    },

    saveDataMismatchWeightType: function(weightType) {
        return this.saveWeightTypeSetting(this.SETTINGS.DATA_MISMATCH, weightType);
    },

    getDataMismatchWeightType: function() {
        return this.getSettingWeightType(this.SETTINGS.DATA_MISMATCH);
    },

    getSettingWeightType: function(settingInput) {
        var gr = new GlideRecord(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.NAME);
        gr.addQuery(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.FIELDS.SETTINGS, settingInput);
        gr.query();
        var weightType = null;
        if (gr.next()) {
            weightType = gr.getValue(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.FIELDS.WEIGHT_TYPE);
        }

        return weightType;
    },

    saveWeightTypeSetting: function(settingInput, weightType) {
        weightType = weightType.toLowerCase();
        if (weightType != this.SETTING_WEIGHT_TYPE.AUTO && weightType != this.SETTING_WEIGHT_TYPE.MANUAL) {
            return this.createErrorObj('Invalid weight type in the payload ' + weightType + " WeightType needs to be either automatic or manual");
        }
        var gr = new GlideRecord(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.NAME);
        gr.addQuery(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.FIELDS.SETTINGS, settingInput);
        gr.query();
        if (gr.next()) {
            gr.setValue(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.FIELDS.WEIGHT_TYPE, weightType);
            gr.update();
        } else {
            gr.initialize();
            gr.setValue(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.FIELDS.SETTINGS, settingInput);
            gr.setValue(this.TABLES.MS_SETTINGS_WEIGHT_TYPE.FIELDS.WEIGHT_TYPE, weightType);
            gr.insert();
        }

        return this.createSuccessObj('Weight type for ' + settingInput + ' successfully saved');
    },

    saveDataMismatchClasses: function(classes) {
        var response = [];

        try {
            // Delete all current classes
            var gr = new GlideRecord(this.TABLES.MS_DATA_MISMATCH);
            gr.deleteMultiple();

            for (var i = 0; i < classes.length; i++) {
                var dataMismatchClass = classes[i];
                var currTableAttributes = this._convertAttributes(dataMismatchClass.attributes);
                var validate = this._validateDataMismatchCiClassHierarchy(dataMismatchClass, currTableAttributes);

                if (validate.status === this.STATUS.SUCCESS) {
                    gr.initialize();
                    gr.setValue("table", dataMismatchClass.table);
                    gr.setValue("ci_count_percent", dataMismatchClass.ci_count_percent);
                    gr.setValue("attributes", currTableAttributes);
                    gr.setValue("condition_type", dataMismatchClass.condition_type);
                    var newClassSysId = gr.insert();
                    if (newClassSysId) {
                        var successMessage = gs.getMessage(" {0} class successfully added to Data Mismatch config setting", dataMismatchClass.table_label);
                        response.push(this.createSuccessObj(successMessage));
                    } else {
                        var lastError = gr.getLastErrorMessage();
                        var errorMessage = gs.getMessage(" Failed to add class {0} - error : {1}", [dataMismatchClass.table_label, lastError]);
                        response.push(this.createErrorObj(errorMessage));
                    }
                } else {
                    response.push({
                        status: this.STATUS.FAILED,
                        message: validate.message
                    });
                }
            }
        } catch (error) {
            response.push(this.createErrorObj('Failed to save data mismatch class settings ', error));
        }

        return response;
    },

    _validateDataMismatchCiClassHierarchy: function(currTable, currTableAttributes) {
        var flag = false;
        var gr = new GlideRecord(this.TABLES.MS_DATA_MISMATCH);
        gr.query();
        var result = {
            status: this.STATUS.SUCCESS
        };
        while (gr.next()) {

            var au = new global.ArrayUtil();

            // Check if parent class already exists. For example, trying to add server when hardware exists.
            var table = new GlideTableHierarchy(gr.getValue('table'));
            var tables = table.getAllExtensions();
            if (au.indexOf(tables, currTable.table) >= 0)
                // Check if the attributes and condition_type are equal
                if (this._areAttributesEqual(gr.getValue('attributes'), currTableAttributes) && gr.getValue('condition_type') == currTable.condition_type)
                    flag = true;

            // Check if child class already exists. For example, trying to add hardware when server exists.
            table = new GlideTableHierarchy(currTable.table);
            tables = table.getAllExtensions();
            if (au.indexOf(tables, gr.getValue('table')) >= 0)
                // Check if the attributes and condition_type are equal
                if (this._areAttributesEqual(gr.getValue('attributes'), currTableAttributes) && gr.getValue('condition_type') == currTable.condition_type)
                    flag = true;

            if (flag) {
                result = {
                    status: this.STATUS.FAILED,
                    message: gs.getMessage("'{0}' from the same hierarchy with attributes '{1}' and condition type '{2}' already exists. Cannot add '{3}' within the same hierarchy with same attributes and condition type!", [gr.getValue('table'), currTableAttributes, currTable.condition_type, currTable.table_label])
                };
                break;
            }
        }

        return result;
    },

    _areAttributesEqual: function(attributes1, attributes2) {
        var arr1 = this._splitAndTrim(attributes1).sort();
        var arr2 = this._splitAndTrim(attributes2).sort();
        var au = new global.ArrayUtil();

        return au.diff(arr1, arr2).length == 0;
    },

    _splitAndTrim: function(attributes) {
        return attributes.split(",").map(function(value) {
            return value.trim();
        });
    },

    _validateCoverageCiClassHierarchy: function(currTable) {
        var flag = false;
        var result = {
            status: this.STATUS.SUCCESS
        };
        var gr = new GlideRecord(this.TABLES.MS_CLASS_METADATA);
        gr.query();
        while (gr.next()) {
            var au = new global.ArrayUtil();

            // Check if parent class already exists. For example, trying to add server when hardware exists.
            var table = new GlideTableHierarchy(gr.getValue('table'));
            var tables = table.getAllExtensions();
            if (au.indexOf(tables, currTable.table) >= 0)
                flag = true;

            // Check if child class already exists. For example, trying to add hardware when server exists.
            table = new GlideTableHierarchy(currTable.table);
            tables = table.getAllExtensions();
            if (au.indexOf(tables, gr.getValue('table')) >= 0)
                flag = true;

            if (flag) {
                result = {
                    status: this.STATUS.FAILED,
                    message: gs.getMessage("'{0}' from the same hierarchy already exists. Cannot add '{1}' within the same hierarchy!", [gr.getValue('table'), currTable.table])
                };
                break;
            }
        }

        return result;
    },

    _convertAttributes: function(attrArray) {
        //takes attribute array and returns a comma separated string
        var convertedAttrs = attrArray.map(function(item) {
            return item['id'];
        });

        return convertedAttrs.join(',');
    },

    msPropertyEnabled: function() {
        var propEnabled = this._parseBooleanString(gs.getProperty(this.MS_PROPERTIES.PROPERTY_MS_ENABLED));
        return propEnabled;
    },

    getExcludeQueryNamePrefixList: function() {
        return gs.getProperty(this.MS_PROPERTIES.PROPERTY_EXCLUDE_QUERY_NAME_PREFIX_LIST, 'SPC:');
    },

    _parseBooleanString: function(booleanString) {
        if (booleanString)
            return booleanString === 'true' ? true : false;
        return false;
    },

    /**
     * Helper function to check if current user has given role
     * @return {Boolean}
     */
    userHasRole: function(role) {
        return gs.hasRole(role);
    },

    /**
     * Helper function to check if current user is admin or maint
     * @return {Boolean}
     */
    isUserMaint: function() {
        return this.userHasRole(this.ROLES.MAINT);
    },

    showSettings: function() {
        var isMaint = this.isUserMaint();
        var isCmdbMsAdmin = this.userHasRole(this.ROLES.CMDB_MS_ADMIN);
        return (isMaint || isCmdbMsAdmin);
    },

    allowQueryEdit: function() {
        var isMaint = this.isUserMaint();
        var isCmdbMsEditor = this.userHasRole(this.ROLES.CMDB_MS_EDITOR);
        return (isMaint || isCmdbMsEditor);
    },

    getQuery: function(queryId) {
        var result = {};
        var gr = new GlideRecord(this.TABLES.MS_QUERY_TABLE);
        if (gr.get(queryId)) {
            result.sys_id = gr.getValue(this.ATTRIBUTES.SYS_ID);
            result.name = gr.getValue(this.ATTRIBUTES.NAME);
            result.description = gr.getValue(this.ATTRIBUTES.DESCRIPTION);
            result.report_source = gr.getValue(this.ATTRIBUTES.REPORT_SOURCE);
            result.sys_updated_on = gr.getValue(this.ATTRIBUTES.SYS_UPDATED_ON);
            result.sys_updated_by = gr.getValue(this.ATTRIBUTES.SYS_UPDATED_BY);
            result.sys_created_on = gr.getValue(this.ATTRIBUTES.SYS_CREATED_ON);
            result.sys_created_by = gr.getValue(this.ATTRIBUTES.SYS_CREATED_BY);
            result.schedule = this.getQuerySchedule(queryId);
            result.has_schedule = (Object.keys(result.schedule).length !== 0);

            var executionObj = JSON.parse(sn_cmdb.MultiSourceAnalytics.getLastExecution(queryId));
            result.execution_id = executionObj.executionId;

            var queryJsonBlob = gr.getValue(this.ATTRIBUTES.QUERY_JSON_BLOB);
            result.query_json = queryJsonBlob;
            var queryJsonObj = JSON.parse(queryJsonBlob);
            var queryType = this.getQueryType(queryJsonObj);
            result.query_type = queryType;

        }
        return result;
    },

    getQuerySchedule: function(queryId) {
        var result = {};
        var gr = new GlideRecord(this.TABLES.REPORT_BUILDER_SCHEDULE);
        gr.addQuery(this.ATTRIBUTES.QUERY, queryId);
        gr.query();
        if (gr.next()) {
            result.sys_id = gr.getValue(this.ATTRIBUTES.SYS_ID);
            result.active = gr.getValue(this.ATTRIBUTES.ACTIVE) == "1" ? true : false;
            result.run_type = gr.getValue(this.ATTRIBUTES.RUN_TYPE);
            result.run_dayofmonth = gr.getValue(this.ATTRIBUTES.RUN_DAY_OF_MONTH);
            result.run_dayofweek = gr.getValue(this.ATTRIBUTES.RUN_DAY_OF_WEEK);
            result.run_time = gr.getValue(this.ATTRIBUTES.RUN_TIME);
        }
        return result;
    },

    _hasSchedule: function(queryId) {
        var gr = new GlideRecord(this.TABLES.REPORT_BUILDER_SCHEDULE);
        gr.addQuery(this.ATTRIBUTES.QUERY, queryId);
        gr.query();

        return gr.getRowCount() > 0;
    },

    checkQueryName: function(name, prefixes) {
        var prefixArr = prefixes.split(',');
        for (var i = 0; i < prefixArr.length; i++) {
            var prefix = prefixArr[i].trim().toUpperCase();
            if (name.toUpperCase().startsWith(prefix)) {
                return false;
            }
        }
        return true;
    },

    type: 'MultisourceUtil'
};
