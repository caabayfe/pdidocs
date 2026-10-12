/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {

    let tabKeyName = '';
    let tabLabel = '';
    let apiOutput;
    switch (event.elementId) {
        case "write_with_now_assist_application_usage":
            tabKeyName = 'configurationTab';
            tabLabel = 'Configurations';
            break;
        case "fetch_available_skills":
            tabKeyName = 'availableTab';
            tabLabel = 'Skills';
            break;
    }
    apiOutput = api.data?.[event.elementId]?.output || {};
    const keyForTabConfig = tabKeyName + 'Config';
    const keyForColumnDefinition = tabKeyName + 'ColumnDefinitions';
    const keyForRowDefinition = tabKeyName + 'RowDefinitions';
    const keyForTabCount = tabKeyName + 'Count';
    const tabConfig = api.state[keyForTabConfig];
    const isFetchAPICalled = apiOutput?.isFetchAPICalled;

    if (isFetchAPICalled && apiOutput) {
        let isWWNAEnabled = api.state.wwwnaEnabled;
        if (!isWWNAEnabled && apiOutput?.hasOwnProperty('wwwnaEnabled')) {
            const wwwnaEnabled = apiOutput?.wwwnaEnabled;
            api.setState('wwwnaEnabled', wwwnaEnabled);
        }

        const totalCount = apiOutput?.totalCount;
        var rowDefinitionObject = {
            "customCellEmittedActions": ["NOW_DROPDOWN#ITEM_CLICKED"],
            "selectionEnabled": false,
            "actions": {
                "position": "end",
                "numActionIcons": 0,
                "actionsItems": []
            },
            "rows": apiOutput?.rowDefinitions || []
        };

        if(tabConfig.originalCount == 0) {
            tabConfig.originalCount = totalCount;
        }

        api.setState(keyForColumnDefinition, apiOutput?.columnDefinitions || {});
        api.setState(keyForRowDefinition, rowDefinitionObject);
        var translatedTabLabel = await helpers.translate(tabLabel);
        var tabData = [{
            label: translatedTabLabel,
            count: totalCount
        }];

        api.setState(tabKeyName, tabData);
        api.setState(keyForTabCount, totalCount);
        tabConfig.isFetchAPICalled = false;
        tabConfig.isLoading = false;
        api.setState(keyForTabConfig, { ...tabConfig });
    } else if (tabConfig.isLoading) {
        tabConfig.isFetchAPICalled = false;
        tabConfig.isLoading = false;
        api.setState(keyForTabConfig, { ...tabConfig });
    }

}
