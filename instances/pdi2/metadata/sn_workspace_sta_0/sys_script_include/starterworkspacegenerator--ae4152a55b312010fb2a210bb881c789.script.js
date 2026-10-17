var ELEMENT = "ELEMENT".toLowerCase();
var NAME = "NAME".toLowerCase();
var PARENT = "PARENT".toLowerCase();
var POSITION = "POSITION".toLowerCase();
var VIEW = "VIEW".toLowerCase();
var SYS_ID = "SYS_ID".toLowerCase();
var SYS_UI_LIST = "SYS_UI_LIST".toLowerCase();
var SYS_USER = "SYS_USER".toLowerCase();
var VIEW_NAME = "view.name";
var WORKSPACE_VIEW_NAME = "workspace";
var DEFAULT_VIEW_NAME = "Default view";
var LIST_ID = "list_id";
var LIST_ELEMENT = "sys_ui_list_element";
var VIEW_NAME_WS = '';
var EXPECTED_TABLES = [];
var SCORE_CARD_TITLES = {
	unAssignedTasksTitle : "Unassigned Tasks",
	myTasksTitle: "My Tasks",
	criticalTasksTitle: "Critical Tasks",
	myWorkTitle: "My Work"
};

function getColumns(tableName, view) {
    var columns = [];
    if (view == null) {
        view = WORKSPACE_VIEW_NAME;
    }
    var listDef = getListDefinition(tableName, view);
    var elems = getListElementsForTable(listDef);
    while (elems.next())
        columns.push(elems.getValue(ELEMENT));
    return columns;
}

function getListDefinition(tableName, view) {
    var listDefinition = getListDefinition0(tableName, view);
    if (!listDefinition.isValid() || listDefinition.getRowCount() == 0) {
        parent = new GlideTableHierarchy(tableName).getBase();

        if (null != parent && !parent.equals(tableName))
            return getListDefinition(parent, view);
    }
    return listDefinition;
}

function getListDefinition0(tableName, view) {
    var listDefinition = new GlideRecord(SYS_UI_LIST);
    listDefinition.addQuery(NAME, tableName);
    listDefinition.addNullQuery(SYS_USER);
    listDefinition.addQuery(VIEW_NAME, view);
    listDefinition.query();

    if (!listDefinition.hasNext()) {
        listDefinition.initialize();
        listDefinition.addQuery(NAME, tableName);
        listDefinition.addNullQuery(SYS_USER);
        listDefinition.addNullQuery(PARENT);
        listDefinition.addQuery(VIEW, DEFAULT_VIEW_NAME);
        listDefinition.query();
    }
    listDefinition.next();

    return listDefinition;

}

function getListElementsForTable(listDef) {
    var listElem = new GlideRecord(LIST_ELEMENT);
    listElem.addQuery(LIST_ID, listDef.getUniqueValue());
    listElem.orderBy(POSITION);
    listElem.query();

    return listElem;
}

var StarterWorkspaceGenerator = Class.create();
StarterWorkspaceGenerator.prototype = Object.extendsObject(sn_workspace_sta_0.StarterWorkspace, {
    initialize: function() {},
    applicability_sys_id: null,
    execute: function(inputs) {
        var ux_app_record = new GlideRecord("sys_ux_page_registry");
        ux_app_record.addQuery("sys_package", inputs['app_sys_id']);
        ux_app_record.addQuery("path", inputs['ux_experience_url']);
        ux_app_record.query();
        if (ux_app_record.next()) {

            this.WS_EXP_RECORD = ux_app_record;
            this.EXPERIENCE_ID = ux_app_record.sys_id;
            this.APP_SCOPE_ID = ux_app_record.sys_scope.toString();
            this.APP_SCOPE_NAME = ux_app_record.sys_scope.scope.toString();
            this.ARRAY_UTILS = new global.ArrayUtil();

            var tableNames = this.getPrimarySecondaryTables(inputs);
            this.EXPECTED_TABLES = this.checkVariantTable(tableNames);

            this.createAudience(inputs, ux_app_record);
            this.updatePageProperties(ux_app_record, inputs);
            this.updateAcl(inputs);
            this.updateUIBConfig(ux_app_record);
            this.mapCanvasUserToSelectedRole(inputs);
            this.createSearchSources(inputs);
            this.updateProperties(ux_app_record, inputs);
            this.createAISearchSources(inputs);
            this.setSearchId(inputs);
            this.createTableVariants(ux_app_record);
            this.createCopyView(ux_app_record);
            var dashboardSysId = this.createDashboardAPI(inputs);
            this.updateDashboardMacroponent(dashboardSysId);
        }
    },
    mapCanvasUserToSelectedRole: function(inputs) {
        inputs["selected_roles"].forEach(function(item) {
            if (item === "") return;
            var roleTablegr = new GlideRecord("sys_user_role_contains");
            roleTablegr.addQuery('role', item);
            roleTablegr.addQuery('contains', '8536f54bc713330072b211d4d8c26080');
            roleTablegr.query();
            if (!roleTablegr.next()) {
                var roleDetails = {
                    "role": item,
                    "contains": "8536f54bc713330072b211d4d8c26080" //canvas_user role
                };
                new global.UXStarterExperiencePostOperation().insert(roleTablegr, roleDetails);
            }
        });
    },

    getQuery: function(scoreCardTitle, field, activeFieldExist) {
        var _query = '';
        var activeQuery = activeFieldExist + "=true";
        var assignedtoQuery = field + "DYNAMIC90d1921e5f510100a9ad2572f2b477fe";
        var priorityQuery = field + "=1";
        var isAssignedTo = field.indexOf('assigned_to') !== -1 || field.indexOf('u_assigned_to') !== -1;
        var isPriority = field.indexOf('priority') !== -1 || field.indexOf('u_priority') !== -1;

        switch (scoreCardTitle) {
            case SCORE_CARD_TITLES.myTasksTitle:
            case SCORE_CARD_TITLES.myWorkTitle:
                if (activeFieldExist) {
                    _query = isAssignedTo ? activeQuery + "^" + assignedtoQuery : activeQuery;
                } else {
                    _query = isAssignedTo ? assignedtoQuery : '';
                }
                break;

            case SCORE_CARD_TITLES.criticalTasksTitle:
                if (activeFieldExist) {
                    _query = isPriority ? activeQuery + "^" + priorityQuery : activeQuery;
                } else {
                    _query = isPriority ? priorityQuery : '';
                }
                break;

            case SCORE_CARD_TITLES.unAssignedTasksTitle:
                if (isAssignedTo) {
                    _query = activeFieldExist ? field + "ISEMPTY^" + activeQuery : field + "ISEMPTY";
                } else {
                    _query = activeFieldExist ? activeQuery : '';
                }
                break;

            default:
                _query = '';
        }

        return _query;
    },

    checkFieldsExist: function(fieldsArray, type) {
        var fieldsExpected = [];
        var i = 0;
        while (fieldsArray[i]) {
            var gr = new GlideRecord(this.EXPECTED_TABLES[0]);
            if (gr.isValidField(fieldsArray[i])) {
                fieldsExpected.push(fieldsArray[i]);
            }
            i++;
        }
        if (fieldsExpected.length > 0) {
            return fieldsExpected[0];
        } else {
            return '';
        }

    },

	// reusable dashboardScoreCards
	createDashboardScoreCards: function(query, dataSourceID, headerTitle ){
		return {
            "scoreSize": "md",
            "headingPosition": "top",
            "sparklineStyle": "area",
            "showScoreDate": false,
            "useRelativeScoreTime": false,
            "showScoreUpdateTime": true,
            "enableRealTimeUpdate": true,
            "showZero": true,
            "colorConfig": {
                "type": "default"
            },
            "dataSources": [{
                "isDatabaseView": false,
                "allowRealTime": true,
                "label": this.getTableLabel(this.EXPECTED_TABLES[0]),
                "sourceType": "table",
                "tableOrViewName": this.EXPECTED_TABLES[0],
                "filterQuery": query,
                "id": dataSourceID,
                "dataCategories": ["trend", "group", "simple"]
            }],
            "showHeader": true,
            "showTotalAggregate": false,
            "showSubAggregate": false,
            "showFirstGroupAggregate": false,
            "showSecondGroupAggregate": false,
            "wrapTitle": false,
            "showHeaderSeparator": false,
            "headerTitle": headerTitle,
            "showBorder": true,
            "bareBorder": false,
            "showDataPassthrough": false,
            "dataPassthrough": null,
            "metrics": [{
                "dataSource": dataSourceID,
                "id": dataSourceID + new Date().getTime(),
                "aggregateFunction": "COUNT",
                "numberFormat": {
                    "customFormat": false
                },
                "axisId": "primary"
            }],
            "groupBy": null,
            "sortBy": "value",
            "sortByOrder": "desc",
            "trendBy": null,
            "showChange": false,
            "showChangePercentage": false,
            "showTarget": false,
            "showForecast": false,
            "showForecastRange": false,
            "showTrend": false,
            "showConfidenceBand": false,
            "showGapPercentage": false,
            "showSparkline": false,
            "showMetricLabel": false,
            "showThreshold": false,
            "showComment": false,
            "followFilters": true,
            "showFilterIcon": true,
            "enableDrilldown": true,
            "showMaximumRange": false,
            "applyDateRange": false,
            "numberOfPeriods": 3,
            "showAbsolutePeriod": false,
            "scoreType": null,
            "showChangeFrom": false,
            "period": "M",
            "dateFormat": "default",
            "hideMatrixAggregate": false,
            "newReporting": false,
            "filterConfigurations": [],
            "noDebounce": "",
            "contextMenuActions": []
        };

	},

    //PAR Dashboard API 
    createDashboardAPI: function(inputs) {
        var encodedDataSourceId = "table"+this.EXPECTED_TABLES[0]+new Date().getTime();
        var activeFieldExists = this.checkFieldsExist(['active', 'u_active']);
        var assignedToFieldExists = this.checkFieldsExist(['assigned_to', 'u_assigned_to']);
        var priorityFieldExists = this.checkFieldsExist(['priority', 'u_priority']);

        //This will create the layout of Unassigned Task Score card
        var unAssignedTaskQuery = this.getQuery(SCORE_CARD_TITLES.unAssignedTasksTitle, assignedToFieldExists, activeFieldExists);
        var unAssignedTaskScore = this.createDashboardScoreCards(unAssignedTaskQuery, encodedDataSourceId, SCORE_CARD_TITLES.unAssignedTasksTitle);
        //This will create the layout of My Task Score card
        var myTaskOrMyWorkScoreQuery = this.getQuery(SCORE_CARD_TITLES.myTasksTitle, assignedToFieldExists, activeFieldExists);
        var myTaskScore = this.createDashboardScoreCards(myTaskOrMyWorkScoreQuery, encodedDataSourceId, SCORE_CARD_TITLES.myTasksTitle);

        //This will create the layout of Critical Task Score card
        var criticalTaskScoreQuery = this.getQuery(SCORE_CARD_TITLES.criticalTasksTitle, priorityFieldExists, activeFieldExists);
        var criticalTaskScore = this.createDashboardScoreCards(criticalTaskScoreQuery, encodedDataSourceId, SCORE_CARD_TITLES.criticalTasksTitle);

        //This will create the layout of My Work list
        var myWorkList = {
            "table": this.EXPECTED_TABLES[0],
            "fixedQuery": "",
            "listTitle": SCORE_CARD_TITLES.myWorkTitle,
            "columns": "",
            "query": myTaskOrMyWorkScoreQuery,
            "groupByField": "",
            "hideViewAll": false,
            "hideHighlightedValues": false,
            "highlightedValueConfigId": "",
            "hideHighlightContent": false,
            "highlightContent": {
                "patterns": [],
                "color": ""
            },
            "hideLinks": false,
            "wordWrap": false,
            "overrideWordWrapUserPref": false,
            "maxCharLimit": 4000,
            "hideEmptyStateImage": false,
            "hidePersonalization": true,
            "hideDotwalk": true,
            "hideColumnReorder": true,
            "hideRowSelector": false,
            "hideColumnGrouping": true,
            "hideColumnResizing": true,
            "hideColumnFiltering": true,
            "hideColumnSorting": false,
            "hideHeader": false,
            "hideTitle": false,
            "hideTitleRowCount": false,
            "hideLastRefreshedText": false,
            "hideRefreshButton": false,
            "hideInlineEditing": true,
            "noDebounce": "",
            "contextMenuActions": []
        };

        //This is the layout of the dashboard which will be used by PARDashboardUtil
        var dashboarLayout = {
            "name": this.WS_EXP_RECORD.title.toString(),
            "visibility": [{
                "sys_id": this.WS_EXP_RECORD.sys_id.toString()
            }],
            "requested_by_user": {
                "sys_id": null
            },
            "layout": {
                "top_layout": [],
                "tabs": [{
                    "layout": [{
                            "component_props": JSON.stringify(unAssignedTaskScore),
                            "component_id": "d24d53f60350de7a652caf3188a46ed2",
                            "w": 16,
                            "x": 16,
                            "h": 9,
                            "y": 3,
                            "can_edit": true
                        },
                        {
                            "component_props": JSON.stringify(myTaskScore),
                            "component_id": "d24d53f60350de7a652caf3188a46ed2",
                            "w": 16,
                            "x": 0,
                            "h": 9,
                            "y": 3,
                            "can_edit": true
                        },
                        {
                            "component_props": JSON.stringify(myWorkList),
                            "component_id": "2b1c080881e05dc63b917044290b233f",
                            "w": 48,
                            "x": 0,
                            "h": 18,
                            "y": 12,
                            "can_edit": true
                        },
                        {
                            "component_props": JSON.stringify(criticalTaskScore),
                            "component_id": "d24d53f60350de7a652caf3188a46ed2",
                            "w": 16,
                            "x": 32,
                            "h": 9,
                            "y": 3,
                            "can_edit": true
                        },
                        {
                            "component_props": "{\"variant\":\"header-primary\",\"label\":\"Happening Now\",\"wontWrap\":false,\"hasNoMargin\":false,\"level\":\"1\",\"filterConfigurations\":[],\"noDebounce\":\"\",\"contextMenuActions\":[]}",
                            "component_id": "1f6e0643eca7a637e36bd7833549ec9e",
                            "w": 47,
                            "x": 0,
                            "h": 3,
                            "y": 0,
                            "can_edit": true
                        }
                    ],
                    "name": "Tab",
                    "order": 0
                }]
            }
        };

        var dashboardSysId = null;
		try{
			var parUtils = new sn_dashboard_api.PARDashboardUtil();
			var objParUtils = JSON.parse(parUtils.createInlineDashboard(JSON.stringify(dashboarLayout)));
			dashboardSysId = objParUtils.sys_id;
		}
        catch(e){
			return null;
		}

        //create dashboard permissions
        var permissionObj = [];

        inputs["selected_roles"].forEach(function(item) {
            permissionObj.push({
                "sysId": item,
                "permission": "READ",
                "canEdit": true,
                "canDelete": true,
                "type": "role",
                "sublabel": "Role",
                "new": true,
            });
        });
		
        parUtils.upsertSharing(dashboardSysId, JSON.stringify(permissionObj));
        return dashboardSysId;
    },

    // Update dashboard macroponent
    updateDashboardMacroponent: function(dashboardSysId) {
        var admin_panel = this.WS_EXP_RECORD.admin_panel;
        var screenRecord = new GlideRecord("sys_ux_screen");
        screenRecord.addEncodedQuery("name=Home default^app_config=" + admin_panel.sys_id.toString());
        screenRecord.query();
        if (screenRecord.next()) {
            var macroponent = new GlideRecord("sys_ux_macroponent");
            macroponent.addQuery("sys_id", screenRecord.getValue("macroponent"));
            macroponent.query();
            if (macroponent.next()) {
                var compositionObj = {
                    composition: ""
                };
                var composition = JSON.parse(macroponent.composition);
                composition[0].propertyValues.defaultDashboard.value = dashboardSysId;
                composition[0].eventMappings[0].targets[0].event.payload.container.params.container.sysId.value = dashboardSysId;
                compositionObj.composition = JSON.stringify(composition);
                new global.UXStarterExperiencePostOperation().update(macroponent, compositionObj);
            }
        }
    },

    updatePageProperties: function(ux_app_record, inputs) {
        var menu_config = new GlideRecord("sys_ux_list_menu_config");
        menu_config.newRecord();
        var menu_config_fields = {
            name: inputs.ux_experience_name + "_menu_config",
            active: true
        };
        var menu_config_sys_id = new global.UXStarterExperiencePostOperation().insert(menu_config, menu_config_fields);

        var order = 100;

        for (var i = 0; i < this.EXPECTED_TABLES.length; i++) {

            if (this.EXPECTED_TABLES[i])
                this.createCategory(this.EXPECTED_TABLES[i], menu_config_sys_id, order);
            order += 100;
        }
        var page_property = new GlideRecord("sys_ux_page_property");
        page_property.addEncodedQuery("page=" + ux_app_record.sys_id + "^name=listConfigId");
        page_property.query();
        page_property.next();

        new global.UXStarterExperiencePostOperation().update(page_property, {
            "value": menu_config_sys_id
        });
    },

    createAudience: function(inputs, ux_app_record) {
        var roleIds = [];
        inputs["selected_roles"].forEach(function(item) {
            if (item === "") return;
            var userRoleGR = new GlideRecord("sys_user_role");
            userRoleGR.get(item);
            roleIds.push(userRoleGR.getUniqueValue());
        });
        if (roleIds.length > 0) {
            var table_gr = new GlideRecord("sys_ux_applicability");
            table_gr.newRecord();
            var applicability_fields = {
                "active": true,
                "name": "Audience for app " + inputs['ux_experience_url'],
                "roles": roleIds.join(",")
            };
            this.applicability_sys_id = new global.UXStarterExperiencePostOperation().insert(table_gr, applicability_fields);
            var page_property = new GlideRecord("sys_ux_page_property");
            page_property.addEncodedQuery("page=" + ux_app_record.sys_id + "^name=wbApplicabilityConfigId");
            page_property.query();
            page_property.next();

            new global.UXStarterExperiencePostOperation().update(page_property, {
                "value": this.applicability_sys_id
            });
        }
    },

    createCategory: function(tableName, menu_config_sys_id, order) {
        var list_category = new GlideRecord("sys_ux_list_category");
        list_category.newRecord();
        var table_gr = new GlideRecord(tableName);
        var list_category_fields = {
            "title": table_gr.getLabel(),
            "order": order,
            "active": true,
            "configuration": menu_config_sys_id
        };
        var list_category_sys_id = new global.UXStarterExperiencePostOperation().insert(list_category, list_category_fields);

        this.createList(tableName, gs.getMessage("All"), 50, menu_config_sys_id, list_category_sys_id);
        var decendentOfTask = false;
        var primary_tables_hierarchy = new GlideTableHierarchy(tableName).getTables().indexOf("task");
        if (primary_tables_hierarchy >= 0) decendentOfTask = true;
        if (decendentOfTask) {
            this.createList(tableName, gs.getMessage("Closed"), 40, menu_config_sys_id, list_category_sys_id, "active=false^EQ");
            this.createList(tableName, gs.getMessage("Unassigned"), 30, menu_config_sys_id, list_category_sys_id, "active=true^assigned_toISEMPTY^EQ");
            this.createList(tableName, gs.getMessage("Open"), 10, menu_config_sys_id, list_category_sys_id, "active=true^EQ");
        }
    },

    createList: function(tableName, title, order, menu_config_sys_id, list_category_sys_id, condition) {
        var list = new GlideRecord("sys_ux_list");
        list.newRecord();
        var list_fields = {
            "title": title,
            "order": order,
            "active": true,
            "category": list_category_sys_id,
            "configuration": menu_config_sys_id,
            "table": tableName
        };
        list_fields.columns = getColumns(tableName, "Default view").join(",");
        if (condition) {
            list_fields.condition = condition;
        }
        var list_new_id = new global.UXStarterExperiencePostOperation().insert(list, list_fields);
        if (this.applicability_sys_id !== null) {
            var applicability_m2m = new GlideRecord("sys_ux_applicability_m2m_list");
            applicability_m2m.newRecord();
            var applicability_m2m_fields = {
                active: true,
                applicability: this.applicability_sys_id,
                list: list_new_id,
                order: 100,
            };
            new global.UXStarterExperiencePostOperation().insert(applicability_m2m, applicability_m2m_fields);
        }
    },
    getCompanycode: function(url) {
        var urlData = url.split("/");
        var code = "";
        if (urlData[0] != "now" && urlData[0] != "snc" && urlData[0] != "sn") {
            code = urlData[1];
            return code;
        } else {
            return urlData[0];
        }
    },
    updateAcl: function(inputs) {
        var urlVar = inputs["ux_experience_url"];
        var splitParts = urlVar.split("/");
        var acl_route_name = "";
        if (splitParts.length > 0) {
            var exclusions = ["/", "", null, undefined];
            var splitUrlItems = splitParts.filter(function(item) {
                return exclusions.indexOf(item) == -1;
            });
            acl_route_name = splitUrlItems.join(".");
        } else {
            acl_route_name = urlVar;
        }
        var exp = new GlideRecord("sys_ux_page_registry");
        exp.get("path", inputs["ux_experience_url"]);
        var applicationScope = exp.sys_scope.scope;
        var companyCode = this.getCompanycode(UxFrameworkScriptables.getFullPathByRelativeUrl(urlVar, applicationScope));
        var aclRoutePrefix = "x.";
        if (companyCode == "snc" || companyCode == "sn" || companyCode == "now") {
            companyCode = "now";
            aclRoutePrefix = "";
        }
        var routeAclName = aclRoutePrefix + companyCode + "." + acl_route_name + ".*";
        var aclGR = new GlideRecord("sys_security_acl");
        aclGR.addQuery("name", routeAclName);
        aclGR.addQuery("sys_scope", inputs["app_sys_id"]);
        aclGR.orderBy("created");
        aclGR.query();
        aclGR.next();
        if (inputs["selected_roles"]) {
            inputs["selected_roles"].forEach(function(item) {
                if (item === "") return;
                var userRoleGR = new GlideRecord("sys_user_role");
                userRoleGR.get(item);
                var roleId = userRoleGR.getUniqueValue();
                var aclRoleGR = new GlideRecord("sys_security_acl_role");
                aclRoleGR.newRecord();
                new global.UXStarterExperiencePostOperation().insert(aclRoleGR, {
                    "sys_security_acl": aclGR.sys_id,
                    "sys_user_role": roleId
                });
            });
        }
    },

    updateUIBConfig: function(ux_app_record, inputs) {
        var uxAppConfigId = ux_app_record.admin_panel.sys_id;
        var templateRegistryId = "844148e2b78d2010c11cd91591ce7b09";
        var gr = new GlideRecord("sys_ux_page_property");
        gr.addQuery("page", ux_app_record.sys_id);
        gr.addQuery("name", "chrome_header");
        gr.addQuery("route", "");
        gr.query();
        var genericHeaderProperty;
        while (gr.next()) {
            var jsonValue = gr.getValue("value");
            if (jsonValue.contains(templateRegistryId)) {
                genericHeaderProperty = gr;
            }
        }
        if (genericHeaderProperty) {
            var propertyId = genericHeaderProperty.getUniqueValue();
            var jsonValue = genericHeaderProperty.getValue("value");
            var newJsonValue = jsonValue.replace(templateRegistryId, uxAppConfigId);
            var gr = new GlideRecord('sys_ux_page_property');
            gr.get(propertyId);
            new global.UXStarterExperiencePostOperation().update(gr, {
                'value': newJsonValue
            });
        }
    },

    createSearchSources: function(inputs) {
        var sourceTable = this.EXPECTED_TABLES;
        var searchContextId = '';
        var searchContext = new GlideRecord('sys_search_context_config');
        searchContext.addQuery('name', inputs["ux_experience_name"] + " - Workspace Search");
        searchContext.query();
        if (searchContext.next()) {
            searchContextId = searchContext.sys_id;
        }
        var searchCtxOrder = 0;
        for (var table in sourceTable) {
            if (sourceTable[table]) {
                var recordPayload = {
                    "name": inputs["ux_experience_name"] + " - " + sourceTable[table],
                    "source_table": sourceTable[table],
                    "sys_scope": inputs['app_sys_id'],
                    "sys_name": sourceTable[table],
                    "condition": "active=true",
                    "active": "true"
                };
                var srcTable = new GlideRecord('sys_search_source');
                srcTable.newRecord();
                var searchSourceId = new global.UXStarterExperiencePostOperation().insert(srcTable, recordPayload);
                searchCtxOrder += 100;
                var mapSearchContext_source = {
                    'search_context_config': searchContextId,
                    'source': searchSourceId,
                    'sys_scope': inputs['app_sys_id'],
                    'order': searchCtxOrder
                };
                var mapSearchCtx_Src = new GlideRecord('m2m_search_context_config_search_source');
                mapSearchCtx_Src.newRecord();
                new global.UXStarterExperiencePostOperation().insert(mapSearchCtx_Src, mapSearchContext_source);
            }
        }
    },

    getPrimarySecondaryTables: function(inputs) {
        var sourceTables = inputs["secondary_tables"];
        sourceTables.unshift(inputs["primary_table"]);
        sourceTables = new global.ArrayUtil().unique(sourceTables);
        return sourceTables;
    },

    updateProperties: function(ux_app_record, inputs) {
        var tableLabel = '';
        var checkTable = false;
        var tableNames = this.EXPECTED_TABLES;
        var ppGr = new GlideRecord('sys_ux_page_property');
        ppGr.addEncodedQuery('page=' + ux_app_record.sys_id + '^name=chrome_tab');
        ppGr.query();
        if (ppGr.next()) {
            var valueJson = JSON.parse(ppGr.value);
            for (var i = 0; i < tableNames.length; i++) {
                checkTable = this.checkPrimarySecondary(valueJson, tableNames[i]);
                if (!checkTable && global.JSUtil.notNil(tableNames[i])) {
                    tableLabel = this.getTableLabel(tableNames[i]);
                    valueJson.newTabMenu[valueJson.newTabMenu.length] = {
                        "label": {
                            "translatable": true,
                            "message": gs.getMessage("New {0}", tableLabel),
                        },
                        "routeInfo": {
                            "route": "record",
                            "fields": {
                                "table": tableNames[i],
                                "sysId": "-1"
                            },
                            "multiInstField": "sysId"
                        },
                        "condition": {
                            "tableDescription": {
                                "table": tableNames[i],
                                "canCreate": true
                            }
                        }
                    };
                }
            }
            ppGr.value = JSON.stringify(valueJson);
            ppGr.update();
        }
    },

    checkPrimarySecondary: function(valueJson, tableToCheck) {
        var tablePresent = false;
        for (var i = 0; i < valueJson.newTabMenu.length; i++) {
            if (valueJson.newTabMenu[i].routeInfo.fields.table == tableToCheck) {
                tablePresent = true;
                break;
            }
        }
        return tablePresent;
    },

    createAISearchSources: function(inputs) {
        var sourceTables = this.EXPECTED_TABLES;
        for (var i = 0; i < sourceTables.length; i++) {
            if (new sn_ais.AisUtil().isTableIndexable(sourceTables[i]) && global.JSUtil.notNil(sourceTables[i])) {
                var tableLabel = this.getTableLabel(sourceTables[i]);
                var dataSourceGr = new GlideRecord('ais_datasource');
                dataSourceGr.addQuery('source', sourceTables[i]);
                dataSourceGr.query();
                if (dataSourceGr.next()) {
                    var searchSourceGr = new GlideRecord('ais_search_source');
                    searchSourceGr.addEncodedQuery("datasource=" + sourceTables[i]);
                    searchSourceGr.query();
                    if (searchSourceGr.next()) {
                        this.generateProfileSearchSourceM2M(inputs, searchSourceGr.sys_id);
                    } else {
                        var searchSourceID = this.generateSearchSource(sourceTables[i], tableLabel);
                        if (searchSourceID) {
                            this.generateProfileSearchSourceM2M(inputs, searchSourceID);
                        }
                    }
                    this.createTitleTextMappings(sourceTables[i], dataSourceGr.sys_id);
                } else {
                    var isTask = this.isTaskRelated(sourceTables[i]);
                    var indexedSourceSysID = this.generateDataSource(dataSourceGr, sourceTables[i], isTask);
                    if (global.JSUtil.notNil(indexedSourceSysID))
                        var searchSourceId = this.generateSearchSource(sourceTables[i], tableLabel);
                    if (global.JSUtil.notNil(searchSourceId)) {
                        this.generateProfileSearchSourceM2M(inputs, searchSourceId);
                    }
                    this.createTitleTextMappings(sourceTables[i], indexedSourceSysID);
                }
            }

        }
    },

    generateDataSource: function(dataSourceGr, sourceTable, isTask) {
        var dataSourceId;
        if (isTask) {
            dataSourceId = new global.UXStarterExperiencePostOperation().insert(dataSourceGr, {
                'source': sourceTable,
                'name': this.getTableLabel(sourceTable) + ' Table',
                "retention_policy": "04f129e57792f010be280d892c5a99d9"
            });
            new sn_ais.IndexEvent().indexTableNoBlock(sourceTable);
        } else {
            dataSourceId = new global.UXStarterExperiencePostOperation().insert(dataSourceGr, {
                'source': sourceTable,
                'name': this.getTableLabel(sourceTable) + ' Table'
            });
            new sn_ais.IndexEvent().indexTableNoBlock(sourceTable);
        }
        return dataSourceId;
    },

    generateProfileSearchSourceM2M: function(inputs, searchSourceId) {
        var expName = inputs["ux_experience_url"];
        var profileName = expName + " Search Profile";
        var profile = new GlideRecord('ais_search_profile');
        profile.get("label", profileName);
        if (profile.sys_id) {
            var M2M = new GlideRecord('ais_search_profile_ais_search_source_m2m');
            M2M.newRecord();
            M2M.profile = profile.sys_id;
            M2M.search_source = searchSourceId;
            M2M.insert();
        }
    },

    generateSearchSource: function(dataSourceId, sourceTable) {
        var searchSourceGr = new GlideRecord('ais_search_source');
        searchSourceGr.initialize();
        searchSourceGr.name = sourceTable;
        searchSourceGr.datasource = dataSourceId;
        searchSourceGr.insert();
        return searchSourceGr.sys_id;
    },

    isTaskRelated: function(table) {
        var tables = new GlideRecord("sys_db_object");
        tables.addEncodedQuery("name=task^ORsuper_class.name=task^name=" + table);
        tables.query();
        return (tables.getRowCount() > 0) ? true : false;
    },

    setSearchId: function(inputs) {
        var ppGr = new GlideRecord('sys_ux_page_property');
        ppGr.addQuery('name', 'globalSearchDataConfigId');
        ppGr.addQuery('page.title', inputs["ux_experience_name"]);
        ppGr.query();
        if (ppGr.next()) {
            var gr = new GlideRecord('sys_search_context_config');
            if ((global.JSUtil.notNil(gs.getProperty('glide.ui.polaris.ais_ready')) && gs.getProperty('glide.ui.polaris.ais_ready') == 'true') && (global.JSUtil.notNil(gs.getProperty('glide.ui.polaris.experience'))) && gs.getProperty('glide.ui.polaris.experience') == 'true') {
                gr.addQuery('name', inputs["ux_experience_name"] + " AI Search Configuration");
            } else {
                gr.addQuery('name', inputs["ux_experience_name"] + " - Workspace Search");
            }
            gr.query();
            if (gr.next()) {
                ppGr.value = gr.sys_id.toString();
            }
            ppGr.update();
        }
    },

    FALLBACK_FIELD_LIST: ['number', 'u_number', 'name', 'u_name'],
    createTitleTextMappings: function(table, indexedSourceSysID) {
        var titleTextFields = this._getTitleTextFields(table);
        var titleField = titleTextFields[0];
        var textField = titleTextFields[1];
        this._insertFieldMapToAttribute(indexedSourceSysID, table, 'sort_by_date', 'sys_updated_on');
        if (titleField)
            this._insertFieldMapToAttribute(indexedSourceSysID, table, 'title', titleField);
        if (textField)
            this._insertFieldMapToAttribute(indexedSourceSysID, table, 'text', textField);
    },

    _insertFieldMapToAttribute: function(aisIndexSourceId, table, value, field) {
        var aisAttributeGR = new GlideRecord('ais_datasource_field_attribute');
        aisAttributeGR.initialize();
        aisAttributeGR.setValue('attribute', 'f734a634c7320010d1cfd9795cc26094'); // map-to attribute sys_id
        aisAttributeGR.setValue('datasource', aisIndexSourceId);
        aisAttributeGR.setValue('field', field);
        aisAttributeGR.setValue('value', value);
        aisAttributeGR.setValue('source', table);
        aisAttributeGR.insert();
    },

    _getTitleTextFields: function(tableName) {
        var title;
        var text;
        var displayField = this._getDisplayFieldFromDictionary(tableName);
        if (displayField) {
            title = displayField;
        }
        var fieldsFromView = this._getFieldsFromTextSearchView(tableName);
        if (fieldsFromView) {
            if (!title) {
                title = fieldsFromView[0];
                text = fieldsFromView[1];
            } else {
                text = fieldsFromView[0];
            }
        }
        if (title && text) {
            if (title === text)
                text = null;
            else {
                return [title, text];
            }
        }
        var i = 0;
        var gr = new GlideRecord(tableName);
        while (i < this.FALLBACK_FIELD_LIST.length) {
            var fieldName = this.FALLBACK_FIELD_LIST[i];
            i++;
            if (gr.isValidField(fieldName)) {
                if (!title) { // Assign the title first
                    title = fieldName;
                    continue;
                }
                if (!text && fieldName != title) {
                    text = fieldName;
                    break;
                }
            }
        }
        return [title, text];
    },

    _getDisplayFieldFromDictionary: function(tableName) {
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.addQuery('display', true);
        gr.query();
        if (!gr.next())
            return;
        return gr.getValue('element');
    },

    _getFieldsFromTextSearchView: function(tableName) {
        var textSearchListId = this._getTextSearchListId(tableName);
        if (!textSearchListId)
            return;
        return this._getFieldsFromElementList(tableName, textSearchListId);
    },

    _getTextSearchListId: function(tableName) {
        var uiListGr = new GlideRecord('sys_ui_list');
        uiListGr.addQuery('view', '0c029fc00a0a0b2c001aa3d4ed9f69e8'); // text_search view sysId
        uiListGr.addQuery('name', tableName);
        uiListGr.query();
        if (!uiListGr.next())
            return;
        return uiListGr.getUniqueValue();
    },

    _getFieldsFromElementList: function(tableName, textSearchListID) {
        var fields = [];
        var uiListElementsGr = new GlideRecord('sys_ui_list_element');
        uiListElementsGr.addQuery('list_id', textSearchListID);
        uiListElementsGr.orderBy('position');
        uiListElementsGr.query();
        if (!uiListElementsGr.hasNext())
            return;
        while (uiListElementsGr.next())
            fields.push(uiListElementsGr.getValue('element'));
        return fields;
    },

    createTableVariants: function(ux_app_record) {
        this.WS_EXP_RECORD = ux_app_record;
        this.EXPERIENCE_ID = ux_app_record.sys_id;
        this.APP_SCOPE_ID = ux_app_record.sys_scope.toString();
        this.APP_SCOPE_NAME = ux_app_record.sys_scope.scope.toString();
        if (global.JSUtil.notNil(this.EXPECTED_TABLES)) {
            this.createVariants(this.EXPECTED_TABLES);
        }
    },

    createCopyView: function(ux_app_record) {
        this.WS_EXP_RECORD = ux_app_record;
        this.EXPERIENCE_ID = ux_app_record.sys_id;
        this.DEFAULT_VIEW_NAME = "Default view";
        this.APP_SCOPE_ID = ux_app_record.sys_scope.toString();
        this.APP_SCOPE_NAME = ux_app_record.sys_scope.scope.toString();
        this.VIEW_NAME_WS = this.getWorskapceView();
        if (this.EXPECTED_TABLES.length > 0 && this.VIEW_NAME_WS) {
            this.createViewfromDefalutView(this.EXPECTED_TABLES, this.VIEW_NAME_WS);
        }
    },

    type: 'StarterWorkspaceGenerator'
});
