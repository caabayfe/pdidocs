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

    const aaUtil = imports["sn_access_analyzer.AccessanalyzerUIUtil"](api, helpers);
    const props = api.state.props;

    function openInsightsModal() {
        let currentUser = api.state[props.selectedTabIndex === 0 ? 'baseUser' : 'modelUser'];
        let insightsData = getFilteredInsights(currentUser.filterMap);
        updateInsightsFullScreen(insightsData);
    }

    function closeInsightsModal() {
        api.setState("fullInsights", {
            visible: false,
            payload: {
                clear: true,
                ts: Date.now()
            }
        });
    }

    function navigateToSettings() {
        aaUtil.navigate({
            external: '/now/access-analyzer/home/params/selected-tab-index/2/setting/access-insights'
        });
    }

    function propertyChandHandler() {
        let payload = event.payload.value;
        let action = payload.action;
        let uri = '';
        aaUtil.log('Event from insights widget action :', action);

        switch (action) {

            case 'simulate':
                navigateToSimulateScreen(payload);
                break;

            case 'insightsLoaded':
                let insightsData = payload.insightsData || [];
                aaUtil.updateState(payload.widgetName === 'baseUserWidget' ? 'baseUser' : 'modelUser', {
                    insightsData: insightsData,
                    showInsightsViewAll: insightsData.length > api.state.insights.maxItems
                });
                break;

            case 'viewGroup':
                uri = 'sys_user_group';
                break;

            case 'viewRole':
                uri = 'sys_user_role';
                break;

            case 'applyFilter':
                applyFilter(payload.filteredList);
                break;

            case 'removeFilter':
                removeFilter();
                break;
        }

        if (uri !== '') {
            aaUtil.log('Navigating url: ', uri);
            let sysId = payload.data.entityId;
            aaUtil.navigate({
                external: `nav_to.do?uri=${uri}?sys_id=${sysId}`
            });
        }
    }

    function navigateToSimulateScreen(payload) {
        aaUtil.updateState('loader', 'visible', true);
        let reqInfo = props.requestInfo;
        let payloadData = payload.data;
        let userType = props.selectedTabIndex === 0 ? 'modelUser' : 'baseUser';
        let data = {
            user: {
                id: reqInfo[userType].id,
                label: reqInfo[userType].name
            },
            table: {
                name: reqInfo.targetTableName,
                label: reqInfo.targetTableLabel
            },
            record: {
                id: reqInfo.targetRecordId,
                label: reqInfo.targetRecordLabel,
            },
            field: {
                name: reqInfo.targetFieldName,
                label: reqInfo.targetFieldLabel
            }
        };
        data[payloadData.entityType] = {
            id: payloadData.entityId,
            label: payloadData.entityName
        };

        let cmd = payloadData.entityType === 'role' ? 'add-role' : 'add-group';

        aaUtil.callAccessInsightsDB('base64Encode', JSON.stringify(data)).then(res => {
            aaUtil.updateState('loader', 'visible', false);
            aaUtil.navigate({
                external: 'now/access-analyzer/simulator/' + cmd + '/' + Date.now() + '/params/resource/' + res.executionResult.output.result
            });
        });
    }

    function updateInsightsFullScreen(insightsData) {

        let insightsUser = props.selectedTabIndex === 0 ? api.state.modelUser : api.state.baseUser;
        let title = api.state.translatedMessages.accessInsightsFor + ' ' + insightsUser.name;
        let insightsCountText = api.state.translatedMessages.insightsCount.replace('{count}', insightsData.length);

        api.setState("fullInsights", {
            visible: true,
            insightsCount: insightsCountText,
            title: title,
            payload: {
                insightsData: insightsData,
                showHeader: false,
                maxItems: 0,
                userName: insightsUser.name,
                ts: Date.now()
            }
        });
    }

    function applyFilter(filteredList) {

        let filterMap = {};
        filteredList.forEach(item => filterMap[item.id] = item.selected);

        let activeUserName = props.selectedTabIndex === 0 ? 'baseUser' : 'modelUser';
        aaUtil.updateState(activeUserName, 'filterMap', filterMap);

        let insightsData = getFilteredInsights(filterMap);
        updateInsightsFullScreen(insightsData);
    }

    function getFilteredInsights(filterMap) {
        return getInsightsDataForActiveTab()
            .filter(insight => filterMap[insight.entityType + insight.level]);
    }

    function getInsightsDataForActiveTab() {
        return api.state[props.selectedTabIndex === 0 ? 'baseUser' : 'modelUser'].insightsData || [];
    }

    function removeFilter() {
        applyFilter(api.state.defaultFilter);
    }

    let fn = {
        btnBaseUserViewAll: openInsightsModal,
        btnModelUserViewAll: openInsightsModal,
        btnCloseInsights: closeInsightsModal,
        closeFullInsights: closeInsightsModal,
        setting: navigateToSettings,
        MACROPONENT_PROPERTY_CHANGED: propertyChandHandler
    };

    let key = event.elementId || event.name;
    if (fn[key])
        fn[key]();
}
