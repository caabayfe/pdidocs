/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { state} = api;
    var props = state.props;
    var tabDef = state[props.tabName];
    var baseUserId = api.context.props.baseUserId;
    var modelUserId = api.context.props.modelUserId;

    if(event.elementId === 'aaCommonDB') {
        let output = api.data.aaCommonDB.output;
        if (output.request.action === 'getSysUserFields') {
            onUserMetadataFetched(output.response);
        }
        return;
    }

    var glideQuery = api.data.dataSource.output.data.GlideRecord_Query;
    const methods = {
        sys_user: onUserDataFetched,
        sys_user_has_role: populateList,
        sys_user_grmember: populateList
    };

    /**
     * Getting tableName from response itself
     * Object format : api.data.dataSource.output.data.GlideRecord_Query.sys_user._results
     * sys_user is table name
     */

    var tableName;
    for (var table in glideQuery) {
        if (methods[table]) {
            tableName = table;
            break;
        }
    }
    var tableData = glideQuery[tableName]._results;
    if (baseUserId == modelUserId && tableName != "sys_dictionary") {
        /**
         * Get clone copy of data if we provide same user to compare.
         */
        var modelUserData = createModelUserData();
        modelUserData.forEach(row => tableData.push(row));
    }
    tabDef.loadingState = false;
    methods[tableName]();

    //--------------------------------------------------------------------------------//

    function onUserMetadataFetched(fieldMap) {
        tabDef.fieldList = fieldMap;
        api.setState("tableSource", {
            name: tabDef.table.name,
            fields: Object.keys(fieldMap).join(','),
            condition: tabDef.table.condition.replace("{baseUserId}", baseUserId).replace("{modelUserId}", modelUserId)
        });
    }

    //--------------------------------------------------------------------------------//

    function onUserDataFetched() {
        tabDef.table.fields = null;
        setHeader(tableData);
        populateList();
    }

    //--------------------------------------------------------------------------------//

    function populateList() {
        var comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers).getComparator(tabDef.name, baseUserId, modelUserId);
        if (props.tabIndex == 0) {
            comparator.setFieldList(tabDef.fieldList);
            tabDef.fieldList = null;
        }
        var result = comparator.getComparisonResult(tableData);

        const pListCtrl = imports["sn_access_analyzer.PresentationListController"](api, helpers).getController(tabDef.name);
        pListCtrl.update(result);
        
        if (props.tabIndex != 0) {
            result = pListCtrl.getFilteredData();
        }

        // Clear raw data, since we have generated comparison tableData data and preserve it in sourceData state variable
        glideQuery[tableName]._results = null;

        api.emit("ACE_ACTION_PERFORMED", {
            id: "FILTER_COMPONENT_PREPARE_LIST",
            list: result,
            selected: true
        });

    }

    //--------------------------------------------------------------------------------//

    function setHeader(result) {
        const { setRequestInfo, getUserObject } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);

        var { baseUser, modelUser } = getUserObject(result, row => row._row_data.uniqueValue == api.context.props.baseUserId ? "baseUser" : "modelUser");

        setRequestInfo({
            baseUser: {
                id: baseUser._row_data.uniqueValue,
                name: baseUser.name.displayValue
            },
            modelUser: {
                id: modelUser._row_data.uniqueValue,
                name: modelUser.name.displayValue
            }
        });

        var tabArr = ["user", "role", "group"];
        tabArr.forEach(tabName => {
            state[tabName].colDef.columns[1].label = baseUser.name.displayValue;
            state[tabName].colDef.columns[2].label = modelUser.name.displayValue;
        });

        helpers.translate("Comparing {0} to {1}: user records", baseUser.name.displayValue, modelUser.name.displayValue).then(data => {
            props.title = data;
            var bc = [...state.breadcrumbs];
            bc[0].label = api.state.translatedMessages.overview;
            bc.push({
                label: data
            });
            api.setState("breadcrumbs", bc);
        });
    }

    //--------------------------------------------------------------------------------//

    function createModelUserData() {
        var modelUserData = JSON.parse(JSON.stringify(tableData));
        return modelUserData.map(row => {
            if (props.tabIndex == 0) {
                // For user metadata
                row._row_data.uniqueValue = "1";
            } else {
                // for roles or groups
                row.user.value = "1";
            }
            return row;
        });

    }

    //--------------------------------------------------------------------------------//

}
