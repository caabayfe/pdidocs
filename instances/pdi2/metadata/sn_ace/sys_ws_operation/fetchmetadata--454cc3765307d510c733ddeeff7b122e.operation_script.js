(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var REUSABLE_BLOCK_TYPE_ID = '5db4a12153975110c733ddeeff7b1277';

    var getTableData = function(tableName, filter, fieldNames) {
        var result = [];
        var gr = new GlideRecord(tableName);
        gr.addEncodedQuery(filter);
        gr.query();
        while (gr.next()) {
            resultItem = {};
            fieldNames.forEach(function(fieldName, indx) {
                var keyToFieldSplit = fieldName.split(":");
                var fieldValue = '';
                var tempGr = gr;
                if (keyToFieldSplit.length > 1) {
                    var fieldsArr = keyToFieldSplit[1].split('.');
                    fieldsArr.forEach(function(field) {
                        tempGr = tempGr[field];
                    });
                    fieldValue = tempGr + '';
                } else {
                    fieldValue = gr.getValue(keyToFieldSplit[0]);
                }
                resultItem[keyToFieldSplit[0]] = fieldValue;
            });
            result.push(resultItem);
        }
        return result;
    };

    var aceConfigId = request.body.data.aceConfig;
    var result = {
        acePages: [],
        blocks: [],
        reusableBlockProperties: {}
    };
    if (aceConfigId) {
        var acePages = getTableData("sn_ace_page", "ace_app=" + aceConfigId, ["id:sys_id", "ace_app", "app_config_template", "is_template",
            "label:name", "path", "route", "scopeId:sys_scope", "scopeName:sys_scope.scope", "appName:sys_scope.name"
        ]);
        var aceAppConfigs = getTableData("sn_ace_app_config", "sys_id=" + aceConfigId, ["sys_id", "app_config", "name"]);
        var uniqueAppConfigIds = [];
        var aceAppPathMap = {};
        var aceApp2AppConfigMap = {};
        var appConfig2AceAppMap = {};

        aceAppConfigs.forEach(function(aceAppConfig) {
            if (uniqueAppConfigIds.indexOf(aceAppConfig.app_config) == -1) {
                uniqueAppConfigIds.push(aceAppConfig.app_config);
                aceApp2AppConfigMap[aceAppConfig.sys_id] = aceAppConfig.app_config;
                appConfig2AceAppMap[aceAppConfig.app_config] = {
                    aceApp: aceAppConfig.sys_id
                };
            }
        });

        var uxApplications = getTableData("sys_ux_page_registry", "admin_panelIN" + uniqueAppConfigIds.join(","), ["sys_id", "admin_panel", "path"]);

        uxApplications.forEach(function(uxApplicationItem) {
            appConfig2AceAppMap[uxApplicationItem.admin_panel] = appConfig2AceAppMap[uxApplicationItem.admin_panel] || {};
            appConfig2AceAppMap[uxApplicationItem.admin_panel]["path"] = uxApplicationItem["path"];
        });

        var routeMap2AcePage = {};
        var uniqueRouteIds = [];
        acePages.forEach(function(acePageItem) {
            var configId = aceApp2AppConfigMap[acePageItem.ace_app];
            acePageItem.basePath = appConfig2AceAppMap[configId].path;
            routeMap2AcePage[acePageItem.route] = acePageItem.sys_id;
            if (uniqueRouteIds.indexOf(acePageItem.route) == -1) {
                uniqueRouteIds.push(acePageItem.route);
            }
        });


        var appRoutes = getTableData("sys_ux_app_route", "sys_idIN" + uniqueRouteIds.join(","), ["sys_id", "screen_type"]);
        var screenType2Route = {};
        var route2Macroponent = {};
        var uniqueScreenTypes = [];

        appRoutes.forEach(function(appRouteItem) {
            screenType2Route[appRouteItem.screen_type] = appRouteItem.sys_id;
            if (uniqueScreenTypes.indexOf(appRouteItem.screen_type) == -1) {
                uniqueScreenTypes.push(appRouteItem.screen_type);
            }
        });

        var screens = getTableData("sys_ux_screen", "screen_typeIN" + uniqueScreenTypes.join(","), ["sys_id", "screen_type", "macroponent", "macroponent_config"]);
        screens.forEach(function(screenItem) {
            var routeId = screenType2Route[screenItem.screen_type];
            route2Macroponent[routeId] = {
                macroponent: screenItem.macroponent,
                macroponentConfig: screenItem.macroponent_config
            };
        });

        acePages.forEach(function(acePageItem) {
            var macroponentData = route2Macroponent[acePageItem.route];
            acePageItem.macroponent = macroponentData && macroponentData.macroponent;
            acePageItem.macroponentConfig = macroponentData && macroponentData.macroponentConfig;
        });

        result['acePages'] = acePages;

        var blockGr = new GlideRecord('sn_ace_content_block');
        blockGr.addQuery('document_id', aceConfigId);
        blockGr.addQuery('type', REUSABLE_BLOCK_TYPE_ID);
        blockGr.query();

        while (blockGr.next()) {
            result.blocks.push({
                label: blockGr.getValue('name'),
                id: blockGr.getValue('sys_id'),
                scopeId: blockGr.getValue('sys_scope'),
                scopeName: blockGr.sys_scope.scope + '',
                appName: blockGr.sys_scope.name + ''
            });

            result.reusableBlockProperties[blockGr.getUniqueValue()] = {
                id: blockGr.getUniqueValue(),
                label: blockGr.getValue('name'),
                category: 'reusable',
                params: JSON.parse(blockGr.variable["block_variables"])
            };
        }
    }

    result.sessionScope = {};
    result.sessionScope.id = gs.getCurrentApplicationId();
    result.sessionScope.name = gs.getCurrentScopeName();

    response.setBody(result);
})(request, response);
